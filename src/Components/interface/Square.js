import React, {Component} from 'react';
import io from '../../Utils/Sockets';
import PropTypes from 'prop-types';
const TYPE_BATEAU = {
    TORPILLEUR: 'torpilleur',
    PATROUILLEUR: 'patrouilleur',
    CROISEUR: 'croiseur',
    PORTE_AVION: 'porteavion',
    SOUS_MARIN: 'sousmarin'
};

const BATEAUX = [
    TYPE_BATEAU.TORPILLEUR,
    TYPE_BATEAU.PATROUILLEUR,
    TYPE_BATEAU.CROISEUR,
    TYPE_BATEAU.PORTE_AVION,
    TYPE_BATEAU.SOUS_MARIN,
];

let CURRENTSHIP = null;
let SHIPS_PROTOTYPE = BATEAUX.slice();

export default class Square extends Component {

    static get propTypes() {
        return {
            Xposition: PropTypes.number.isRequired,
            Yposition: PropTypes.number.isRequired,
            size: PropTypes.number.isRequired,
            index: PropTypes.number.isRequired,
            addShip: PropTypes.func,
            disabled: PropTypes.bool,
            playerShoot: PropTypes.func
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            hover: false
        };
    }

    componentDidMount() {
        io.on('gameOver', (data) => {
            SHIPS_PROTOTYPE = BATEAUX.slice();
        });
    }

    handleClick =(e)=> {
        e.preventDefault();

        if (!CURRENTSHIP) {
            CURRENTSHIP = SHIPS_PROTOTYPE.shift();
        } else if (this.props.shipAdded) {
            CURRENTSHIP = SHIPS_PROTOTYPE.shift();
        }

        if (this.props.addShip) {
            if (this.props.currentShip)
                CURRENTSHIP= this.props.currentShip;
            this.props.addShip(CURRENTSHIP, this.props.Xposition, this.props.Yposition);
        } else if (this.props.playerShoot) {
            const shotPosition = {
                x: this.props.Xposition,
                y: this.props.Yposition
            };
            this.props.playerShoot(shotPosition);
        }
    };

    // Hover CSS
    toggleHover =()=> {
        this.setState({
            hover: !this.state.hover
        });
    };

    render() {
        const squareStyle = {
            position: 'absolute',
            border: '1px solid #d4862b',
            left: `${this.props.Xposition * this.props.size}px`,
            top: `${this.props.Yposition * this.props.size}px`,
            width: `${this.props.size}px`,
            height: `${this.props.size}px`,
            //cursor: 'pointer',
            zIndex: '0'
        };

        if (this.state.hover) {
            if (!this.props.disabled)squareStyle.backgroundColor = 'beige';
        }

        return <button disabled={this.props.disabled} className={`disabled btn points offset ${this.props.index}`} style={squareStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} onClick={this.handleClick} />;
    }
}