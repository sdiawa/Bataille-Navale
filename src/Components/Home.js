import React, {Component} from "react";
import {withSessionContext} from "../Utils/SessionProvider";
import {withRouter} from "react-router-dom";
import io from "../Utils/Sockets";
class Home extends Component{
    componentDidMount() {
        io.disconnect();
        if (!this.props.context.isLogged){
            return this.props.history.push('/login',{regSucc:false,logoutSucc:false});
        }
    }

    render() {
        return(
            <div className="container">
                <h1>Bataille Navale</h1>
                <div>
                    La bataille navale, appelée aussi touché-coulé, est un jeu de société dans lequel deux joueurs doivent placer des « navires » sur une grille tenue secrète et tenter de « toucher » les navires adverses. Le gagnant est celui qui parvient à couler tous les navires de l'adversaire avant que tous les siens ne le soient. On dit qu'un navire est coulé si chacune de ses cases a été touchées par un coup de l'adversaire.
                </div>
                <button onClick={this.newGame}>Nouvelle Partie</button>
            </div>

        )
    }

    newGame =(event)=> {
        event.preventDefault();
        return this.props.history.push('/new-game')
    }
}
export default withRouter(withSessionContext(Home));