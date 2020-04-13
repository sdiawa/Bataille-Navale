import React, {Component,Fragment} from "react";
import {withSessionContext} from "../Utils/SessionProvider";
import {withRouter,Prompt} from "react-router-dom";
import io from '../Utils/Sockets';
import _ from "lodash";
import Grid from "./interface/Grid";
import Board from "./interface/Board";
import {Modal} from "react-bootstrap";
class NewGame extends Component{
    constructor(props) {
        super(props);
        this._size = 40;
        this.state = {
            inLobby:true,
            message:'Recherche de joueurs...',
            grid:[],
            gameReady: false,
            roomId: '',
            gameStarted: false,
            shipSunk: [],
            opponentReady: false,
            receivedShot: null,
            myTurn: false,
            allShotPosition: [],
            hitPos: [],
            missedPos: [],
            gameOver: false
        };
    }
    componentDidMount() {
        io.disconnect();
        io.connect();
        const {inLobby} = this.state;
        if (!this.props.context.isLogged){
            return this.props.history.push('/login',{regSucc:false,logoutSucc:false});
        }
        // joueur trouvé
        io.on('newGame', async data => {
            await this.setState(
                {
                    inLobby:false,
                    gameStarted:true,
                    roomId:data.room.id,
                    myTurn: io.id === data.room.id,
                    message: data.message,
                    grid:data.room.player1.grid,
                }
                )
        });
        if (inLobby)
            io.emit('newPlayer',{email:this.props.context.session.email});
        // Vérifie si tous les bateaux sont ajoutés;
        io.on('gameReady', (data) => {
            this.setState({
                gameReady: data
            });
            console.log('gameReady', data);
        });
        io.on('leave',()=>this.setState({gameReady:false,gameStarted:false,message:'Connection perdue avec l\'invité'}));

        // Opposant prêt
        io.on('opponentReady', (data) => {
            this.setState({
                opponentReady: data
            });
        });

        io.on('receivedShot', (shotPosition) => {
            this.setState({
                receivedShot: shotPosition
            });
        });

        io.on('turnChange', (data) => {
            this.setState({
                myTurn: data.myTurn
            });
        });

        io.on('trackingGame', (data) => {
            if (data.hitPos) {
                this.setState({
                    hitPos: data.hitPos
                });
            }else {
                if (data.missedPos) {
                    this.setState({
                        missedPos: data.missedPos
                    });
                }
            }

        });

        io.on('gameOver', (data) => {
            this.setState({
                gameOver: true
            });
        });

    }
    // Player make a shot

    playerShoot =(shotPosition) =>{
        // Check if it is my turn or not
        if (this.state.myTurn) {
            // Check if this place is fired already
            if (this.checkShotPosition(this.state.allShotPosition, shotPosition)) {
                //Materialize.toast('You already shot this place', 2000);
            } else {
                this.setState({
                    // allShotPosition: position that were fired
                    allShotPosition: [...this.state.allShotPosition, shotPosition],
                    myTurn: false
                });

                // Notify server for the other player

                io.emit('playerShoot', {shotPosition: shotPosition, roomId: this.state.roomId, myTurn: true});
                console.log('shotPosition: ', shotPosition);
            }
        } else {
            //Materialize.toast('The other player\'s turn', 2000);
        }
    };

    checkShotPosition =(allShotPosition, shotPosition) =>{
        return _.find(this.state.allShotPosition, (pos) => {
            return pos.x === shotPosition.x && pos.y === shotPosition.y;
        });
    };


    nouvellePartie=(event)=>{
        event.preventDefault();
        io.disconnect();
        io.connect();
        io.emit('newPlayer',{email:this.props.context.session.email});
        this.setState({
            gameOver: false,
            message:'Recherche de joueurs...',
            gameStarted: false,
            inLobby:true,
            roomId: '',
            hitPos: [],
            allShotPosition: [],
            myTurn: false,
            opponentReady: false,
            gameReady: false
        });
    };
    render() {
        const {
            message,
            inLobby,
            gameOver,
            gameStarted,
            gameReady,
            opponentReady,
            hitPos,
            missedPos,
            roomId,
            receivedShot,
            myTurn,
        } = this.state;
        const tableau = (
            (gameOver) ?
                    <Modal show={gameOver}
                           centered aria-labelledby="gameOver">
                        <Modal.Header>
                            <Modal.Title id="gameOver"
                                         className={hitPos.length >= 15 ? ' mx-auto text-success' : 'mx-auto text-danger'}>
                                {hitPos.length >= 15 ? 'Vous avez gagné' : 'Vous avez perdu'}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Footer>
                            <button className={'btn btn-primary'} onClick={this.nouvellePartie}>Nouvelle partie</button>
                            <button className={'btn btn-secondary'}
                                    onClick={this.fermerGameOver}>Fermer
                            </button>
                        </Modal.Footer>
                    </Modal>
                    :
                    <div>

                        {(gameReady && opponentReady) ? <div><div className={'text-danger h2'}>Ennemie</div><Grid
                            key={2}
                            squarePx={this._size}
                            playerShoot={this.playerShoot}
                            hitPos={hitPos} missedPos={missedPos} ships={[]}/></div> :
                            opponentReady ? <div className="h4 text-center alert alert-info">
                            Votre adversaire est prêt
                        </div>: gameReady?<div className="h4 text-center alert alert-secondary">
                                Attente de l'adversaire
                            </div>:<div className="h4 text-center alert alert-secondary">
                                Placer vos bateaux
                            </div>
                        }
                    </div>
        );
        const game=(
        <div className="container">
            <div className="row">
                <div className="col-md-4 mx-auto">
                    {gameReady && myTurn && opponentReady ? <div className="h4 alert alert-success">Votre tours</div> :
                        gameReady && !myTurn && opponentReady && <div className="h4 alert alert-info">L'adversaire joue</div>}
                </div>
            </div>
            <div className="row">
                <div className="col-sm-6">
                    <div className={'text-info h2'}>Ma carte</div>
                    <Board
                        key={1}
                        squarePx={this._size}
                        gameReady={gameReady}
                        roomId={roomId}
                        disabled={gameReady}
                        receivedShot={receivedShot}/>
                </div>

                <div className="col-sm-6">
                    {tableau}
                    {gameReady && opponentReady ?
                        <h5>{'Détruisez les navires ennemies pour gagner '}</h5> : null}
                </div>
            </div>
        </div>
    );
        const lobby = (
            <div className="container">
                <div className="row">
                    <div className={'col-md-6 mx-auto'}>
                        <h1>Bataille Navale</h1>
                        {message}
                        {inLobby && <div className="progress">
                            <div className="indeterminate"/>
                        </div>}
                        {inLobby && <button className="btn btn-danger" onClick={this.cancelSearch}>
                            annuler
                        </button>
                        }
                        {!inLobby && <button className="btn btn-primary" onClick={this.newSearch}>
                            Rechercher un joueur
                        </button>
                        }
                    </div>
                </div>
            </div>
        );
        return(
            <Fragment>
                <Prompt message={"Voulez-vous vraiment quiter?"}/>
                <Fragment>
                    {gameStarted ? game : lobby}

                </Fragment>
            </Fragment>
        );
    }

    cancelSearch =(event)=> {
        event.preventDefault();
        io.disconnect();
        this.setState({inLobby:false,message:''});
    };
    newSearch = (event)=> {
        event.preventDefault();
        io.disconnect();
        io.connect();
        io.emit('newPlayer',{email:this.props.context.session.email});
        this.setState({inLobby:true,message:'Recherche de joueurs...'});
    };
    fermerGameOver = (event)=>{
        event.preventDefault();
        this.props.history.push("/");
    }
}
export default withRouter(withSessionContext(NewGame));