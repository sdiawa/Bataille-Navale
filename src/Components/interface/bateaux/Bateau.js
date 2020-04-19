import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Bateau extends Component {
    static get propTypes() {
        return {
            orientation: PropTypes.string,
            size: PropTypes.number,
            Xposition: PropTypes.number,
            Yposition: PropTypes.number
        };
    }

    static get defaultProps() {
        return {
            orientation: 'VERTICAL',
            size: 50
        };
    }

    genererBateau() {
        return [];
    }

    render() {
        const styles = {
            liVertical: {
                width: `${this.props.size}px`,
                height: `${this.props.size}px`
            },

            liHorizontal: {
                display: 'inline',
                listStyleType: 'none',
                width: `${this.props.size}px`,
                height: `${this.props.size}px`
            },

            imgVertical: {
                width: `${this.props.size}px`,
                height: `${this.props.size}px`,
                WebkitTransform: 'rotate(90deg)',
                MozTransform: 'rotate(90deg)',
                OTransform: 'rotate(90deg)',
                MsTransform: 'rotate(90deg)',
                transform: 'rotate(90deg)',
                // backgroundColor: '#55ACEE'
            },

            imgHorizontal: {
                width: `${this.props.size}px`,
                height: `${this.props.size}px`
            }
        };

        const orientation = this.props.orientation;
        const style = {};
        const liStyle = orientation === 'VERTICAL' ? styles.liVertical : styles.liHorizontal;
        const imgStyle = orientation === 'VERTICAL' ? styles.imgVertical : styles.imgHorizontal;

        if (this.props.Xposition) {
            style.left = `${this.props.Xposition * this.props.size}px`;
        }

        if (this.props.Yposition) {
            style.top = `${this.props.Yposition * this.props.size}px`;
        }

        return (
            <div className={'bateau'}>
                <ul style={style}>
                    {this.genererBateau().map((item, key) => {
                        return (
                            <li key={key} style={liStyle}>
                                <img style={imgStyle} src={item} alt={key}/>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
}
