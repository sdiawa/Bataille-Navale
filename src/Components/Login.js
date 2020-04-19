import React, {Component} from "react";
import Logo from "./logo.jpg";
import {withSessionContext} from "../Utils/SessionProvider";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Link, Redirect, withRouter} from "react-router-dom";
import Axios from "axios";
import io from "../Utils/Sockets";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            regSucc: this.props.location.state ? this.props.location.state.regSucc : false,
            logoutSucc: this.props.location.state ? this.props.location.state.logoutSucc : false,
            errors: [{

                'isLoading': false,
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
                ],
                internalError: [
                    {
                        isActive: false,
                        type: 'internError',
                        message: 'Erreur interne du serveur. Contactez l\'administrateur. '
                    },
                ]
            }]
        };
    }

    render() {
        if (this.props.context.isLogged)
            return <Redirect to={{pathname: '/'}}/>;
        const {errors, email, password, regSucc, logoutSucc} = this.state;
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mx-auto card">
                        <div className="card-header text-center bg-transparent">
                            <img src={Logo} className="img" alt="logo" width="256" height="128"/>
                        </div>
                        {errors[0].isLoading &&
                        <FontAwesomeIcon color={'#336699'} className="mx-auto" spin={true} size={'6x'}
                                         icon={['fas', 'spinner']}/>}
                        {errors[0].badCredential[0].isActive && <div className="alert alert-danger">
                            {errors[0].badCredential[0].message}
                        </div>}
                        {errors[0].internalError[0].isActive && <div className="alert alert-danger">
                            {errors[0].internalError[0].message}
                        </div>}
                        {errors[0].email.map((item, index) => {
                            if (item.isActive)
                                return <div key={index} className="alert alert-danger">{item.message}</div>;
                            return ''
                        })}
                        {errors[0].password.map((item, index) => {
                            if (item.isActive)
                                return <div key={index} className="alert alert-danger">{item.message}</div>;
                            return ''
                        })}
                        {regSucc && <div className="alert alert-success">
                            Votre compte a bien été enregister.
                        </div>}
                        {logoutSucc && <div className="alert alert-info">
                            Vous avez bien été déconnecter.
                        </div>}
                        <div className="card-body">
                            <form className="form-group" onSubmit={this.submitAction}>
                                <div className="form-group">
                                    <label className="sr-only" htmlFor="email">Username\Email</label>
                                    <FontAwesomeIcon icon={['fas', 'user-alt']} className="input-icon"/>
                                    <input required autoFocus name="email" type="text"
                                           value={email} onChange={this.handleChangeInput}
                                           className="padded-form-input form-control" id="email"
                                           aria-describedby="emailHelp" placeholder={"Votre email"}/>
                                    <label className="sr-only" htmlFor="password">Password</label>
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
                                            <label className="form-check-label" htmlFor="Check1">Se souvenir de
                                                moi</label>
                                        </div>
                                    </div>

                                </div>
                                <input type="submit" className="btn btn-outline-primary btn-rounded btn-block my-2"
                                       value="Connexion"/>
                                <p>Not a member?
                                    <Link className="btn btn-outline-success btn-rounded btn-block"
                                          to={'/register'}>Créer un compte</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    handleChangeInput = (event) => {
        event.preventDefault();
        const target = event.target;
        //const value = target.name === 'nom' ? target.checked : target.value;
        const value = target.value;
        const name = target.name;
        this.setState({
            regSucc: false,
            logoutSucc: false,
            [name]: value

        });
    };

    submitAction = async (event) => {
        event.preventDefault();
        const myHistory = this.props.history;
        const {context} = this.props;
        const validEmailRegex =
            // eslint-disable-next-line no-useless-escape
            RegExp(/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);

        const {email, password} = this.state;
        let isError = false;
        await this.setState(prevState => {
            return ({
                errors: prevState.errors.map(
                    item => {
                        item.isLoading = true;
                        item.email[0].isActive = email.trim() === "";
                        item.email[1].isActive = !validEmailRegex.test(email);
                        item.email.forEach(value => {
                            if (value.isActive) isError = true
                        });
                        item.badCredential[0].isActive = false;
                        item.internalError[0].isActive = false;
                        item.password[0].isActive = password.trim() === "";
                        item.password[1].isActive = password.length < 8;
                        item.password.forEach(value => {
                            if (value.isActive) isError = true
                        });
                        return item;
                    }
                )
            });

        });
        if (!isError) {
            //http://localhost:8000/api/login?email=
            await Axios.get('https://uvsq-bataille-navale-back.herokuapp.com/api/login?email=' + email + '&password=' + password,
                {headers: {'Access-Control-Allow-Origin': '*'}}
            )
                .then(res => {
                    if (res.status === 200) {
                        const data = res.data;
                        context.updateSession(data);
                        io.connect();
                        io.emit('newPlayer', {email: this.props.context.session.email});
                        return myHistory.push("/");
                    }
                })
                .catch(res => {
                    /*
                    * Erreur La réquête est passée mais l'email et le mp ne concorde pas
                    *  Status = 409
                    */
                    if (res.response && res.response.status === 409)
                        return this.setState(async (prevState) => {
                            return (
                                {
                                    errors: await prevState.errors.map(value => {
                                        value.badCredential[0].isActive = true;
                                        value.isLoading = false;
                                        return value;
                                    })
                                }
                            );
                        });
                    /*
                    * Erreur interne La réquête n'est pas passée
                    *  Status = 400 ou 304
                    */
                    this.setState(async (prevState) => {
                        return (
                            {
                                errors: await prevState.errors.map(value => {
                                    value.internalError[0].isActive = true;
                                    value.isLoading = false;
                                    return value;
                                })
                            }
                        );
                    });
                })
        } else {
            this.setState(async (prevState) => {
                return (
                    {
                        errors: await prevState.errors.map(value => value.isLoading = false)
                    }
                );
            });
        }
    };
}

export default withRouter(withSessionContext(Login));
