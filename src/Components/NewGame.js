import React, {Component} from "react";
import {withSessionContext} from "../Utils/SessionProvider";
import {withRouter} from "react-router-dom";
import io from '../Utils/Sockets';
import _ from "lodash";
import Grid from "./interface/Grid";
import Board from "./interface/Board";
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
            gameOverModal: false
        };
    }
    componentDidMount() {
        const {inLobby} = this.state;
        if (!this.props.context.isLogged){
            return this.props.history.push('/login',{regSucc:false,logoutSucc:false});
        }
        // found player
        io.on('newGame', async data => {
            console.log(io.id)
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
        // Listen from server whenever all ships is added (Ourself);
        io.on('gameReady', (data) => {
            this.setState({
                gameReady: data
            });
            console.log('gameReady', data);
        });
        io.on('leave',()=>this.setState({gameReady:false,gameStarted:false,message:'Connection perdue avec l\'invité'}));
        // When the other player added all ships

        io.on('opponentReady', (data) => {
            console.log('Player 2 is ready: ', data);
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
                    // hitPos: the good shot position (hit a ship)
                    hitPos: data.hitPos
                });
            }else {
                if (data.missedPos) {
                    this.setState({
                        // hitPos: the good shot position (hit a ship)
                        missedPos: data.missedPos
                    });
                }
            }

        });

        io.on('gameOver', (data) => {
            this.setState({
                gameOverModal: true
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


    closeGameOver=()=>{
        this.setState({
            gameOverModal: false,
            gameStart: false,
            roomId: '',
            roomCreated: '',
            hitPos: [],
            allShotPosition: [],
            myTurn: false,
            player2Ready: false,
            gameReady: false
        });
    };
    render() {
        const {
            message,
            inLobby,
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
            <div>
                {(gameReady && opponentReady) ? <Grid
                    key={2}
                    squarePx={this._size}
                    playerShoot={this.playerShoot}
                    hitPos={hitPos} missedPos={missedPos} ships={[]} /> : <div>
                    <h5 style={{
                    'textAlign': 'center'
                }}>Placer vos bateaux</h5>

                </div>}
            </div>
        );
        const game=(
        <div className="container">
            <div className="row">
                <div className="col-sm-6">
                    <Board
                        key={1}
                        squarePx={this._size}
                        roomId={roomId}
                        disabled={gameReady}
                        receivedShot={receivedShot}/>
                </div>

                <div className="col-sm-6">
                    {tableau}
                    {gameReady && opponentReady ?
                        <h5>{'Select and click above to fire to '}<strong>Opponent</strong>{' territory'}</h5> : null}
                    {gameReady && myTurn && opponentReady ? <h4 className="animated zoomIn">Your Turn</h4> : null}
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
        /*const customStyles = {
            content: {
                position: 'fixed',
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                wordWrap: 'break-word',
                width: '65%',
                background: '#eee',
                display: 'inline-block'
            }
        };*/

        return(
            <div>
                {gameStarted ? game : lobby}

                {/* Modal pop up at the end to show result */}
                {/* <Modals
                    isOpen={this.state.gameOverModal}
                    shouldCloseOnOverlayClick={false}
                    style={customStyles}>
                    {hitPos.length === 22 ? <h2>Opponent's ships were destroyed! You won!</h2> : <h2>All your ships were sinked! You lost</h2>}
                    <Button
                        style={{
                            display: 'block',
                            marginLeft: '40%',
                            marginTop: '20px'
                        }}
                        onClick={this.closeGameOver}>Close</Button>
                </Modals>*/}
            </div>
        );
    }

    cancelSearch =(event)=> {
        event.preventDefault();
        io.disconnect();
        this.setState({inLobby:false,message:''});
    };
    newSearch = (event)=> {
        event.preventDefault();
        io.connect();
        io.emit('newPlayer',{email:this.props.context.session.email});
        this.setState({inLobby:true,message:'Recherche de joueurs...'});
    }
}
export default withRouter(withSessionContext(NewGame));