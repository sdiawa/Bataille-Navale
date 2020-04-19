import React, {Component, Fragment} from "react";
import {withSessionContext} from "../Utils/SessionProvider";
import {Prompt, Redirect, withRouter} from "react-router-dom";
import io from '../Utils/Sockets';
import _ from "lodash";
import Grid from "./interface/Grid";
import Board from "./interface/Board";
import {Modal} from "react-bootstrap";

class NewGame extends Component {
    constructor(props) {
        super(props);
        this._size = 40;
        this.winner = false;
        this.state = {
            inLobby: true,
            message: 'Recherche de joueurs...',
            grid: [],
            gameReady: false,
            roomId: '',
            gameStarted: false,
            shipDown: [],
            opponentReady: false,
            receivedShot: null,
            myTurn: false,
            allShotPosition: [],
            hitPos: [],
            missedPos: [],
            gameOver: false
        };
    }

    componentWillUnmount = async () => {

        await io.emit("leaveGame", {email: this.props.context.session.email});
        await io.emit("leaveLobby", {email: this.props.context.session.email});
    };

    componentDidMount = async () => {
        io.connect();
        const {inLobby} = this.state;
        // joueur trouvé
        io.on('newGame', async data => {
            await this.setState(
                {
                    inLobby: false,
                    gameStarted: true,
                    roomId: data.room.id,
                    myTurn: io.id === data.room.id,
                    message: data.message,
                    grid: data.room.player1.grid,
                }
            )
        });
        if (inLobby)
            await io.emit('joinLobby', {email: this.props.context.session.email});

        // Vérifie si tous les bateaux sont ajoutés;
        io.on('gameReady', (data) => {
            this.setState({
                gameReady: data
            });
        });
        io.on('leave', () => {
            this.setState({gameReady: false, gameStarted: false, message: 'Connection perdue avec l\'invité'})
        });

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
        io.on('shipDown', data => {
            if (data) {
                this.setState({shipDown: data})
            }

        });

        io.on('trackingGame', (data) => {
            if (data.hitPos) {
                this.setState({
                    hitPos: data.hitPos,
                    shipDown: data.shipDown
                });
            } else {
                if (data.missedPos) {
                    this.setState({
                        missedPos: data.missedPos
                    });
                }
            }

        });
        io.on('gameOver', () => {
            this.winner = this.state.hitPos.length >= 15;
            this.setState({
                gameOver: true
            });
        });
    };

    // Player make a shot
    playerShoot = (shotPosition) => {
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

            }
        }
    };

    checkShotPosition = (allShotPosition, shotPosition) => {
        return _.find(this.state.allShotPosition, (pos) => {
            return pos.x === shotPosition.x && pos.y === shotPosition.y;
        });
    };

//h
    nouvellePartie = (event) => {
        event.preventDefault();
        io.emit("leaveGame", {email: this.props.context.session.email});
        io.emit("leaveLobby", {email: this.props.context.session.email});
        io.emit('joinLobby', {email: this.props.context.session.email});
        this.winner = false;
        this.setState({
            gameOver: false,
            message: 'Recherche de joueurs...',
            gameStarted: false,
            inLobby: true,
            roomId: '',
            hitPos: [],
            allShotPosition: [],
            myTurn: false,
            opponentReady: false,
            gameReady: false
        });
    };

    render() {
        if (!this.props.context.isLogged)
            return <Redirect to={{pathname: '/login', state: {regSucc: false, logoutSucc: false}}}/>;
        const {
            message,
            inLobby,
            shipDown,
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
                                     className={this.winner ? ' mx-auto text-success' : 'mx-auto text-danger'}>
                            {this.winner ? 'Vous avez gagné' : 'Vous avez perdu'}
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

                    {(gameReady && opponentReady) ? <div>
                            <div className={'text-danger h2'}>Ennemie</div>
                            <Grid
                                key={2}
                                squarePx={this._size}
                                playerShoot={this.playerShoot}
                                hitPos={hitPos} missedPos={missedPos}
                                shipDown={shipDown}
                                ships={[]}/>
                        </div> :
                        opponentReady ? <div className="h4 text-center alert alert-info">
                            Votre adversaire est prêt
                        </div> : gameReady ? <div className="h4 text-center alert alert-secondary">
                            Attente de l'adversaire
                        </div> : <div className="h4 text-center alert alert-secondary">
                            Placer vos bateaux
                        </div>
                    }
                </div>
        );
        const game = (
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mx-auto">
                        {gameReady && myTurn && opponentReady ?
                            <div className="h4 alert alert-success">Votre tours</div> :
                            gameReady && !myTurn && opponentReady &&
                            <div className="h4 alert alert-info">L'adversaire joue</div>}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className={'text-info h2'}>Ma carte</div>
                        <Board
                            key={1}
                            squarePx={this._size}
                            gameReady={gameReady}
                            roomId={roomId}
                            disabled={gameReady}
                            receivedShot={receivedShot}/>
                    </div>

                    <div className="col-md-6">
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
        return (
            <Fragment>
                <Prompt message={"Voulez-vous vraiment quiter?"}/>
                <Fragment>
                    {gameStarted ? game : lobby}

                </Fragment>
            </Fragment>
        );
    }

    cancelSearch = async (event) => {
        event.preventDefault();
        await io.emit("leaveLobby", {email: this.props.context.session.email});
        this.setState({inLobby: false, message: ''});
    };
    newSearch = (event) => {
        event.preventDefault();
        io.emit("leaveGame", {email: this.props.context.session.email});
        io.emit("leaveLobby", {email: this.props.context.session.email});
        io.emit('joinLobby', {email: this.props.context.session.email});
        this.setState({
            inLobby: true, message: 'Recherche de joueurs...',
            gameReady: false,
            roomId: '',
            gameStarted: false,
            opponentReady: false,
            receivedShot: null,
            myTurn: false,
            allShotPosition: [],
            hitPos: [],
            missedPos: [],
            gameOver: false
        });
    };
    fermerGameOver = (event) => {
        event.preventDefault();
        this.props.history.push("/");
    }
}

export default withRouter(withSessionContext(NewGame));
