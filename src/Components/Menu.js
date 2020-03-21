import React,{Component} from "react";

import Register from "./Register";
import Profile from "./Profile";
import Home from "./Home";
import Login from "./Login";
import HeaderImg from "./header.jpg"
export default class  Menu extends Component{
    render() {
        return(
            <BrowserRouter>
                        <figure>
                            <img src={HeaderImg} alt={'header'} height={400} className="w-100"/>
                        </figure>
                <div
                    className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm">
                    <h5 className="my-0 mr-md-auto font-weight-normal">Bataille navale</h5>
                    <nav className="my-2 my-md-0 mr-md-3">
                        <Link className="p-2 text-dark" to={'/'}>Accueil</Link>
                        <Link className="p-2 text-dark" to={'/profile'}>Profile</Link>
                        <Link className="p-2 text-dark" to={{
                            pathname: '/login',
                            state: {
                                regSucc: false,
                                logoutSucc:false
                            }
                        }}>Login</Link>
                    </nav>
                    <Link className="btn btn-outline-primary" to={'/register'}>Inscription</Link>
                </div>
                <Switch>
                    <Route exact={true} path='/' component={Home}/>
                    <Route exact={true} path='/login' component={Login}/>
                    <Route exact={true} path='/profile' component={Profile}/>
                    <Route exact={true} path='/register' component={Register}/>
                </Switch>
            </BrowserRouter>

        )
    }

}