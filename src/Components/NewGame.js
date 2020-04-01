import React, {Component} from "react";
import {withSessionContext} from "../Utils/SessionProvider";
import {withRouter} from "react-router-dom";
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:8000');
class NewGame extends Component{
    constructor(props) {
        super(props);
        this.state = {
            connected:false,
            canceled:true,
            message:'Recherche de joueurs...'
        }
    }
    componentDidMount() {
        if (!this.props.context.isLogged){
            return this.props.history.push('/login',{regSucc:false,logoutSucc:false});
        }
        socket.on('newGame', data => this.setState({connected:true, message: data }));
        socket.emit('newGame', 3000);
    }
    render() {
        const {message ,canceled,connected} = this.state;

        return(
            <div className="container">
                <div className="row">
                    <div className={'col-md-6 mx-auto'}>
                        <h1>Bataille Navale</h1>
                        {message}
                        {canceled && <button className="btn btn-danger" onClick={this.disconnect}>
                            {connected ? 'quitter':'annuler'}
                        </button>
                        }
                        {!canceled && <button className="btn btn-primary" onClick={()=>{
                            socket.emit('newGame', 3000);
                            socket.on('newGame', data => this.setState({connected:true, message: data }));
                        }}>{connected ? 'Quitter cette session':'Nouvelle partie'}</button>
                        }
                    </div>
                </div>

                </div>

        )
    }

    disconnect =(event)=> {
        event.preventDefault();
        socket.disconnect();
        this.setState({canceled:false,connected:false,message:''});
    }
}
export default withRouter(withSessionContext(NewGame));