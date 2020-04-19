import React, {Component} from "react";
import Logo from "./logo.jpg";
import {withSessionContext} from "../Utils/SessionProvider";
import {Redirect, withRouter} from "react-router-dom";

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nom: '', prenom: '', email: '', win: 0, lose: 0
        }
    };

    componentDidMount() {
        const {email, nom, prenom, win, lose} = this.props.context.session;
        this.setState({nom, prenom, email, win, lose});
    };

    render() {
        if (!this.props.context.isLogged)
            return <Redirect to={{pathname: '/login', state: {regSucc: false, logoutSucc: false}}}/>;
        const {nom, prenom, email, win, lose} = this.state;
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1 className="text-center">Mes infos</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mx-auto">
                        <img src={Logo} alt={'Logo'}/>
                    </div>
                    <div className="col-md-6 mx-auto form-group">
                        <div className="input-group">
                            {<h2>Nom :{nom} </h2>}
                        </div>
                        <div className="input-group">
                            {<h2>Prénom :{prenom} </h2>}
                        </div>
                        <div className="input-group">
                            {<h2>Email :{email} </h2>}
                        </div>
                        <div className="input-group">
                            {<h2>Victoires :{win} </h2>}
                        </div>
                        <div className="input-group">
                            {<h2>Défaites :{lose} </h2>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default withRouter(withSessionContext(Profile))
