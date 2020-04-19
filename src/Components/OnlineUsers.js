import React, {Component} from "react";
import {Redirect, withRouter} from "react-router-dom";
import {withSessionContext} from "../Utils/SessionProvider";
import io from "../Utils/Sockets";

class OnlineUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: []
        }
    }

    render() {
        if (!this.props.context.isLogged)
            return <Redirect to={{pathname: '/login', state: {regSucc: false, logoutSucc: false}}}/>;
        const {users} = this.props.context;
        let onlineUsers = users.map(
            (value, index) => value.id !== io.id && (
                <tr key={index}>
                    <td>
                        {value.username}
                    </td>
                    <td>
                        {value.email}
                    </td>
                    <td>
                        {value.win}
                    </td>
                    <td>
                        {value.lose}
                    </td>
                </tr>
            )
        );
        return (
            <div className={'container'}>
                <div className="row">
                    <h2>Utilisateurs en ligne</h2>
                    {users.length > 1 ?
                        <div className="col-md-12 table-responsive-md table-sm">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th scope="col">Nom</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Victoires</th>
                                    <th scope="col">Défaites</th>
                                </tr>
                                </thead>
                                <tbody>
                                {onlineUsers}
                                </tbody>
                            </table>
                        </div> :
                        <div className="col">
                            Aucun autre joueur en ligne
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default withRouter(withSessionContext(OnlineUsers))
