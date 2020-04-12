import React, {Component} from 'react';
import _ from 'lodash';
import io from '../../Utils/Sockets';
import hitImg from './bateaux/hit.png';
import Torpilleur from "./bateaux/1/Torpilleur";
import Patrouilleur from "./bateaux/2/Patrouilleur";
import Croiseur from "./bateaux/3/Croiseur";
import PorteAvion from "./bateaux/4/PorteAvion";
import SousMarin from "./bateaux/5/SousMarin";
import Grid from "./Grid";
import PropTypes from 'prop-types';

const TYPE_BATEAU = {
    TORPILLEUR: 'torpilleur',
    PATROUILLEUR: 'patrouilleur',
    CROISEUR: 'croiseur',
    PORTE_AVION: 'porteavion',
    SOUS_MARIN: 'sousmarin'
};

const TAILLE_BATEAU = {
    TORPILLEUR: 1,
    PATROUILLEUR: 2,
    CROISEUR: 3,
    PORTE_AVION: 4,
    SOUS_MARIN: 5
};

const ORIENTATION_BATEAU = {
    VERTICAL: 'VERTICAL',
    HORIZONTAL: 'HORIZONTAL',
    isVertical: true
};

export default class Board extends Component {

    static get propTypes() {
        return {
            size: PropTypes.number,
            squarePx: PropTypes.number,
            disabled:PropTypes.bool,
            receivedShot: PropTypes.object,
            roomId: PropTypes.string
        };
    }

    static get defaultProps() {
        return {
            size: 10,
            squarePx: 40,
            disabled:false
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            bateaux: [],
            isVertical: ORIENTATION_BATEAU.isVertical,
            shipAdded: true,
            gameReady: false,
            listChoixBateaux :[TYPE_BATEAU.TORPILLEUR,TYPE_BATEAU.PATROUILLEUR,TYPE_BATEAU.CROISEUR,
                TYPE_BATEAU.PORTE_AVION,TYPE_BATEAU.SOUS_MARIN],
            currentShip:TYPE_BATEAU.TORPILLEUR,
            hitPos: [],
            missedPos: []
        };

        this.bateaux = [];
    }

    componentDidMount() {
        io.on('gameOver', (data) => {
            this.setState({
                hitPos: [],
                bateaux: [],
                listChoixBateaux :[TYPE_BATEAU.TORPILLEUR,TYPE_BATEAU.PATROUILLEUR,TYPE_BATEAU.CROISEUR,
                    TYPE_BATEAU.PORTE_AVION,TYPE_BATEAU.SOUS_MARIN],
                missedPos: [],
                gameReady: false
            });
            console.log('GameOver', data.hitPos.length);
        });

       // Materialize.toast('Adding Ships to your board', 4000);
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext){
        if (nextProps.receivedShot !== null) {
            const shotPos = {
                x: nextProps.receivedShot.x,
                y: nextProps.receivedShot.y
            };
            console.log('Shot Position update: ', shotPos);
            this.shipSinked(null, shotPos);
        }
    }

    // Handle Game

    changeOrientation = ()=> {
        this.setState(prevState=> {
            return {isVertical:!prevState.isVertical}
        });
    };

    sizeShip = (TYPE) =>{
        switch (TYPE) {
            case TYPE_BATEAU.TORPILLEUR:
                return TAILLE_BATEAU.TORPILLEUR;
            case TYPE_BATEAU.PATROUILLEUR:
                return TAILLE_BATEAU.PATROUILLEUR;
            case TYPE_BATEAU.CROISEUR:
                return TAILLE_BATEAU.CROISEUR;
            case TYPE_BATEAU.PORTE_AVION:
                return TAILLE_BATEAU.PORTE_AVION;
            case TYPE_BATEAU.SOUS_MARIN:
                return TAILLE_BATEAU.SOUS_MARIN;
            default:
                return 0;
        }
    };
    genererBateau = (ship, key)=> {
        switch (ship.type) {
            case TYPE_BATEAU.TORPILLEUR:
                return (
                    <Torpilleur
                        key={key}
                        size={this.props.squarePx}
                        Xposition={ship.x}
                        Yposition={ship.y}
                        orientation={ship.orientation}
                    />
                );

            case TYPE_BATEAU.PATROUILLEUR:
                return (
                    <Patrouilleur
                        key={key}
                        size={this.props.squarePx}
                        Xposition={ship.x}
                        Yposition={ship.y}
                        orientation={ship.orientation}
                    />
                );

            case TYPE_BATEAU.CROISEUR:
                return (
                    <Croiseur
                        key={key}
                        size={this.props.squarePx}
                        Xposition={ship.x}
                        Yposition={ship.y}
                        orientation={ship.orientation}
                    />
                );

            case TYPE_BATEAU.PORTE_AVION:
                return (
                    <PorteAvion
                        key={key}
                        size={this.props.squarePx}
                        Xposition={ship.x}
                        Yposition={ship.y}
                        orientation={ship.orientation}
                    />
                );

            case TYPE_BATEAU.SOUS_MARIN:
                return (
                    <SousMarin
                        key={key}
                        size={this.props.squarePx}
                        Xposition={ship.x}
                        Yposition={ship.y}
                        orientation={ship.orientation}
                    />
                );

            default:
                return null;
        }
    };
    // randomPosition(min, max) {
    //     return Math.floor(Math.random() * (max - min + 1) + min);
    //   }

    createShipWithPos = (TYPE, x, y, orientation = this.state.isVertical)=> {
        const shipSize = this.sizeShip(TYPE);

        if (orientation) {
            return {
                orientation: ORIENTATION_BATEAU.VERTICAL,
                x: x,
                y: y,
                type: TYPE,
                size: shipSize
            };
        }

        return {
            orientation: ORIENTATION_BATEAU.HORIZONTAL,
            x: x,
            y: y,
            type: TYPE,
            size: shipSize
        };
    };

    // Check the position for full Ship size

    positionsShip =(ship) =>{
        const positions = [];

        if (ship.orientation === ORIENTATION_BATEAU.VERTICAL) {
            let currentIndex = ship.y;

            for (let i = 1; i <= ship.size; i++) {
                positions.push({
                    x: ship.x,
                    y: currentIndex++,
                    shipType: ship.type
                });
            }
        } else {
            let currentIndex = ship.x;

            for (let i = 1; i <= ship.size; i++) {
                positions.push({
                    x: currentIndex++,
                    y: ship.y,
                    shipType: ship.type
                });
            }
        }

        return positions;
    };

    addShip = (TYPE, x, y, orientation, ships = this.bateaux) =>{
        const newShip = this.createShipWithPos(TYPE, x, y, orientation);
        const posNewShip = this.positionsShip(newShip);

        if (this.checkAvailable(x, y, newShip, posNewShip)) {
            ships.push(newShip);

            if (this.state.bateaux.length === 5) {
                io.emit('allShipAdded', {
                    gameReady: true,
                    shipsPosition: this.allShipsPosition(ships),
                    roomId: this.props.roomId
                });

               // Materialize.toast('All Ships Added', 4000);
            }

            return this.setState(prevState=> {
                const newChoix =prevState.listChoixBateaux.filter(value => value !== TYPE);
                return {
                    bateaux: ships,
                    listChoixBateaux: newChoix,
                    currentShip: newChoix.length === 0 ? '':newChoix[0],
                    shipAdded: true
                };

            });
        }

        // Position is not available to place a ship
        return this.setState({
            shipAdded: false
        });
    };

    // Check if the pos is available
    checkAvailable=(x, y, newShip, posNewShip) =>{
        const currentShips = _.flatten(this.allShipsPosition(this.bateaux));

        // Check to see if any overlap ?
        const overlapPos = _.find(currentShips, (ship) => {
            return _.find(posNewShip, (pos) => {
                return pos.x === ship.x && pos.y === ship.y;
            });
        });

        return !(overlapPos || !this.checkRange(x, y, newShip));
    };

    allShipsPosition =(ships)=> {
        return ships.map(ship=> {
            return this.positionsShip(ship);
        });
    };

    // Check to see if that is out of range for a boat's size

    checkRange = (x, y, ship) =>{
        if (ship.orientation === ORIENTATION_BATEAU.VERTICAL) {
            if (y <= this.props.size - ship.size) {
                return true;
            }
        } else {
            if (x <= this.props.size - ship.size) {
                return true;
            }
        }

        return false;
    };
    shipSinked=(e, shotPosition) =>{
        let missedTime = 0;
        let trackShip;


        _.find(this.bateaux, (ship) => {
            const allPos = this.positionsShip(ship);
            trackShip = ship;

            _.find(allPos, (shipPos) => {
                const isHit = shipPos.x === shotPosition.x &&  shipPos.y === shotPosition.y;

                if (isHit) {
                    if (!this.checkIfHit(this.state.hitPos, shotPosition)) {
                        console.log('HIT');
                        const hitPos = _.uniq([...this.state.hitPos, Object.assign({}, ship, shotPosition)]);
                        this.setState({
                            hitPos: hitPos
                        });
                        const data = {
                            hitPos: hitPos,
                            shotPosition: shotPosition,
                            roomId: this.props.roomId
                        };

                        io.emit('trackingGame', data);
                    } else {
                        console.log('Ship was hit already');
                    }
                } else {
                    missedTime++;

                    if (missedTime === 15) {
                        const missedPos = _.uniq([...this.state.missedPos, Object.assign({}, trackShip, shotPosition)]);
                        this.setState({
                            missedPos: missedPos
                        });
                        io.emit('trackingGame', {roomId: this.props.roomId, missedPos: shotPosition});
                    }
                }

                return isHit;
            });
        });
    };

    checkIfHit=(hitPos, shotPosition)=> {
        return hitPos.find(hit =>  hit.x === shotPosition.x && hit.y === shotPosition.y);
    };

    render() {
        const affichageBateaux = [];
        const {listChoixBateaux,gameReady,currentShip,bateaux,isVertical,shipAdded} = this.state;
        // Build the ship image
        const choixBateaux =listChoixBateaux.map((value,key) => {
            return (

                    <div key={key} className="input-group>">
                        <label>
                            <input type="radio" value={value}
                                   checked={currentShip === value}
                                   onChange={this.handleOptionChange}/>
                                   {value.toUpperCase() + '('+this.sizeShip(value)+')'}
                        </label>
                    </div>
            )
        });
        bateaux.forEach((item,index)=>affichageBateaux.push(this.genererBateau(item, index)));
        return (
            <div style={{
                position: 'relative',
                'width': `${this.props.squarePx * this.props.size}px`,
                'height': `${this.props.squarePx * this.props.size}px`,
                'marginBottom': '60px'
            }}>

                {/* Render the target image if Good Shot in the other player's Board */}

                {this.state.hitPos.map((shinkPos, key) => {
                    return (
                        <img className="animated zoomIn" key={key} style={{
                            width: `${this.props.squarePx}px`,
                            height: `${this.props.squarePx}px`,
                            position: 'absolute',
                            left: `${this.props.squarePx * shinkPos.x}px`,
                            top: `${this.props.squarePx * shinkPos.y}px`,
                            zIndex: '2'
                        }} src={hitImg}
                         alt={''}/>
                    );
                })}

                {this.state.missedPos.map((missed, key) => {
                    return (
                        <div className="animated zoomIn" key={key} style={{
                            width: `${this.props.squarePx}px`,
                            height: `${this.props.squarePx}px`,
                            position: 'absolute',
                            left: `${this.props.squarePx * missed.x}px`,
                            top: `${this.props.squarePx * missed.y}px`,
                            zIndex: '2',
                            border: '1px solid #A9A9A9',
                            borderRadius: '5%',
                            backgroundColor: '#336699'
                        }}
                        />
                    );
                })}

                <Grid
                    size={this.props.size}
                    noMissed={true}
                    squarePx = {this.props.squarePx}
                    ships={affichageBateaux}
                    disabled={this.props.disabled}
                    currentShip={currentShip}
                    addShip={this.addShip}
                    shipAdded={shipAdded}
                />
                {!gameReady && <div className={'form-group'}>{choixBateaux}</div>}
                {!gameReady && <div>
                    <button className={'btn btn-info' } style={{
                        margin: '10px'
                    }} onClick={this.changeOrientation}>{isVertical ? ORIENTATION_BATEAU.VERTICAL : ORIENTATION_BATEAU.HORIZONTAL}</button>
                </div>}
            </div>

        );
    }

    handleOptionChange= (changeEvent) =>{
        this.setState({
            currentShip: changeEvent.target.value
        });
    };

}
