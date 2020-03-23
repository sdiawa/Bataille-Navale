import React,{Component} from "react";
import {BrowserRouter, Link, Switch, Route} from 'react-router-dom';
import Register from "./Register";
import {withSessionContext} from "../Utils/SessionProvider";
import Profile from "./Profile";
import Home from "./Home";
import Login from "./Login";
import HeaderImg from "./header.jpg";
import Logout from "./Logout";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
class  Menu extends Component{
    render() {
        const {isLogged} = this.props.context;
        return(
                <BrowserRouter>
                    <figure>
                        <img src={HeaderImg} alt={'header'} height={400} className="w-100"/>
                    </figure>
                    <div
                        className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm">
                        <h5 className="my-0 mr-md-auto font-weight-normal">Bataille navale</h5>
                        <nav className="my-2 my-md-0 mr-md-3">
                            {isLogged && <Link className="p-2 text-dark" to={'/'}>Nouvelle Partie</Link>}
                            {isLogged &&
                            <Link className="p-2 text-dark" to={'/profile'}>Profile</Link>
                            }
                            {!isLogged && <Link className="p-2 text-dark" to={{
                                pathname: '/login',
                                state: {
                                    regSucc: false,
                                    logoutSucc:false
                                }
                            }}>Login</Link>}
                        </nav>
                        {!isLogged && <Link className="btn btn-outline-primary" to={'/register'}>Inscription</Link>}
                        {isLogged && <Link className="btn btn-danger icon-btn" to={'/logout'}>
                            <span>se déconnecter </span>
                            <FontAwesomeIcon icon={['fas', 'sign-out-alt']} className="text-light"/>
                        </Link>}
                    </div>
                    <Switch>
                        <Route exact={true} path='/' component={Home}/>
                        <Route exact={true} path='/login' component={Login}/>
                        <Route exact={true} path='/logout' component={Logout}/>
                        <Route exact={true} path='/profile' component={Profile}/>
                        <Route exact={true} path='/register' component={Register}/>
                    </Switch>
                </BrowserRouter>

        )
    }

}
export default withSessionContext(Menu);