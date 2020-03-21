import React,{Component} from "react";
import Logo from "./logo.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Link} from "react-router-dom";
import Axios from "axios";
export default class  Login extends Component{
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            errors: [{
                'email': [
                    {isActive: false, type: 'emailNotBlank', message: 'L\'email ne doit pas être vide.'},
                    {isActive: false, type: 'emailValid', message: 'L\'email n\'est pas valide.'}
                ],
                'password': [
                    {isActive: false, type: 'passNotBlank', message: 'Le mot de passe ne doit pas être vide.'},
                    {isActive: false, type: 'passMin', message: 'Le champ mot de passe ne peut être inférieur à 8.'}
                ],
                'badCredential': [
                    {isActive: false, type: 'badcredential', message: 'Email ou mot de passe invalide.'}
                ]
            }]
        };
    }
    render() {
         const {errors,email,password} = this.state;
        return(
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mx-auto card">
                        <div className="card-header text-center bg-transparent">
                            <img src={Logo} className="img" alt="logo" width="256" height="128"/>
                        </div>
                        {errors[0].badCredential.isActive && <div className="alert alert-danger">
                            {errors[0].badCredential.message}
                        </div>}
                        {errors[0].email.map((item,index) => {
                            if (item.isActive)
                                return <div key={index} className="alert alert-danger">{item.message}</div>;
                            return ''
                        })}
                        {errors[0].password.map((item,index) => {
                            if (item.isActive)
                                return <div key={index} className="alert alert-danger">{item.message}</div>;
                            return ''
                        })}
                        {this.props.location.state.regSucc && <div className="alert alert-success">
                           Votre compte a bien été enregister.
                        </div>}
                        {this.props.location.state.logoutSucc && <div className="alert alert-info" >
                            You have been logged out.
                        </div>}
                        <div className="card-body">
                            <form className="form-group" onSubmit={this.submitAction}>
                                <div className="form-group">
                                    <label className="sr-only" htmlFor="email">Username\Email</label>
                                    <FontAwesomeIcon icon={['fas', 'user-alt']} className="input-icon"/>
                                    <input required autoFocus name="email" type="text"
                                           value={email} onChange={this.handleChangeInput}
                                           className="padded-form-input form-control" id="email"
                                           aria-describedby="emailHelp"  placeholder={"Votre email"}/>
                                        <label className="sr-only" htmlFor="password" >Password</label>
                                    <FontAwesomeIcon icon={['fas', 'lock']} className="input-icon"/>
                                        <input required name="password" type="password"
                                               value={password} onChange={this.handleChangeInput}
                                               className="padded-form-input form-control" id="password"
                                               placeholder={"mot de passe"}/>
                                        </div>

                                <div className="d-flex justify-content-around">
                                    <div>
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="Check1"/>
                                                <label className="form-check-label" htmlFor="Check1">Se souvenir de moi</label>
                                        </div>
                                    </div>

                                </div>
                                <input type="submit" className="btn btn-outline-primary btn-rounded btn-block my-2" value="Connexion"/>
                                <p>Not a member?
                                    <Link className="btn btn-outline-success btn-rounded btn-block"
                                       to={'/register'}>Créer un compte</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    handleChangeInput = (event) =>{
        event.preventDefault();
        const target = event.target;
        //const value = target.name === 'nom' ? target.checked : target.value;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value

        });
    };

    submitAction = async (event)=> {
        event.preventDefault();
        const validEmailRegex =
            // eslint-disable-next-line no-useless-escape
            RegExp(/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);

        const {email, password} = this.state;
        this.setState(prevState => {
            return ({
                errors: [
                    {
                        email: [
                            {isActive: email.trim()==="", type: 'emailNotBlank', message: prevState.errors[0].email[0].message},
                            {isActive: !validEmailRegex.test(email), type: 'emailValid', message: prevState.errors[0].email[1].message}
                        ],
                        password:[
                            {isActive: password.trim()==="", type: 'passNotBlank', message: prevState.errors[0].password[0].message},
                            {isActive: password.length < 8, type: 'passMin', message: prevState.errors[0].password[1].message}
                        ],
                        badCredential:prevState.errors[0].badCredential
                    }
                ]
            });

        });
        console.log(this.state);
        const isLogged = await Axios.get('http://localhost/api/login?email='+email+'&password='+password);
        isLogged
            .then(res=>{if (res.status === 200) console.log("connexion ok")})
            .catch(error=>{console.log(error)})
    };
}