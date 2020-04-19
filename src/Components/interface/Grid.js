import React, {Component} from 'react';
import io from '../../Utils/Sockets';
import PropTypes from 'prop-types';
import _ from 'lodash';
import hitImg from './bateaux/hit.png';
import deadImg from './bateaux/dead.png';
import Square from "./Square";

export default class Grid extends Component {

    constructor(props) {
        super(props);

        this.state = {
            missedPos: [],
        };
        this.matrix = [];
    }

    static get propTypes() {
        return {
            noMissed: PropTypes.bool,
            size: PropTypes.number,
            disabled: PropTypes.bool,
            squarePx: PropTypes.number,
            ships: PropTypes.array.isRequired,
            addShip: PropTypes.func,
            playerShoot: PropTypes.func,
            hitPos: PropTypes.array,
            shipDown: PropTypes.array,
        };
    }

    static get defaultProps() {
        return {
            size: 10,
            squarePx: 50,
            noMissed: false,
            disabled: false,
            ships: [],
            hitPos: [],
            shipDown: []
        };
    }

    UNSAFE_componentWillMount() {
        this.boardBuild();
    }

    componentDidMount() {
        io.on('trackingGame', (data) => {
            if (data.missedPos) {
                const missedPos = _.uniqBy([...this.state.missedPos, data.missedPos]);
                if (!this.props.noMissed)
                    this.setState({
                        missedPos: missedPos
                    });
            }
        });
    }

    boardBuild() {
        let index = 0;
        this.matrix = [];

        for (let i = 0; i < this.props.size; i++) {
            const cell = [];

            for (let j = 0; j < this.props.size; j++) {
                cell.push({
                    x: i,
                    y: j,
                    idx: index
                });
                index++;
            }
            this.matrix.push(cell);
        }
    }

    render() {
        return (
            <div
                style={{
                    position: 'relative',
                    // 'backgroundColor': '#55ACEE',
                    width: `${this.props.size * this.props.squarePx}px`,
                    height: `${this.props.size * this.props.squarePx}px`
                }}>

                {this.props.ships.map((ship, key) => {
                    return (
                        <div key={key}>
                            {ship}
                        </div>
                    );
                })}

                {/* Render the target image if Good Shot in Shooting Grid */}

                {this.props.hitPos.map((shinkPos, key) => {
                    let dead = false;
                    if (this.props.shipDown)
                        this.props.shipDown.forEach(value => {
                            if (value.type === shinkPos.type) dead = true
                        });
                    return (<img className="animated zoomIn" key={key} style={{
                        width: `${this.props.squarePx}px`,
                        height: `${this.props.squarePx}px`,
                        position: 'absolute',
                        left: `${this.props.squarePx * shinkPos.x}px`,
                        top: `${this.props.squarePx * shinkPos.y}px`,
                        zIndex: '2'
                    }} src={dead ? deadImg : hitImg}
                                 alt={''}/>);
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

                {this.matrix.map(cell => {
                    return (cell.map(square => {
                        return (
                            <Square
                                key={square.idx}
                                disabled={this.props.disabled}
                                Xposition={square.x}
                                Yposition={square.y}
                                size={this.props.squarePx}
                                index={square.idx}
                                currentShip={this.props.currentShip}
                                addShip={this.props.addShip}
                                shipAdded={this.props.shipAdded}
                                playerShoot={this.props.playerShoot}
                            />
                        );
                    }));
                })}
            </div>
        );
    }
}
