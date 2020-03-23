import React, {Component} from "react";
import Axios from "axios";
import {withRouter} from "react-router-dom";
import {withSessionContext} from "../Utils/SessionProvider";

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nom: "", prenom: "", email: "", password: "", confirmPassword: "",
            errors: [{
                nom: [
                    {isActive: false, type: 'nomNotBlank', message: 'Le nom ne doit pas être vide.'},
                    {isActive: false, type: 'nomMin', message: 'Ce champ ne peut être inférieur à 4.'}
                ],
                prenom: [
                    {isActive: false, type: 'prenomNotBlank', message: 'Le prénom ne doit pas être vide.'},
                    {isActive: false, type: 'prenomMin', message: 'Ce champ ne peut être inférieur à 4.'}
                ], email: [
                    {isActive: false, type: 'emailNotBlank', message: 'L\'email ne doit pas être vide.'},
                    {isActive: false, type: 'emailValid', message: 'L\'email n\'est pas valide.'},
                    {isActive: false, type: 'emailExist', message: 'L\'email existe déjà.'}
                ],
                password: [
                    {isActive: false, type: 'passNotBlank', message: 'Le mot de passe ne doit pas être vide.'},
                    {isActive: false, type: 'passMin', message: 'Ce champ ne peut être inférieur à 8.'}
                ],
                confirmPassword: [
                    {isActive: false, type: 'passConfNotBlank', message: 'Cette valeur ne doit pas être vide.'},
                    {
                        isActive: false,
                        type: 'passConfValidConfirm',
                        message: 'Les mots de passes ne sont pas identiques.'
                    }
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
        this.handleInputChange = this.handleInputChange.bind(this);
    };

    handleInputChange = (event) => {
        event.preventDefault();
        const target = event.target;
        //const value = target.name === 'nom' ? target.checked : target.value;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    };
    submitAction = async (event) => {
        event.preventDefault();
        const myHistory = this.props.history;
        const validEmailRegex =
            // eslint-disable-next-line no-useless-escape
            RegExp(/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);

        const {nom, prenom, email, password, confirmPassword} = this.state;
        let isError = false;
        await this.setState(prevState => {
            return (
                {
                    errors: prevState.errors.map(
                        item => {
                            item.nom[0].isActive = nom.trim() === "";
                            item.nom[1].isActive = nom.length < 4;
                            item.nom.forEach(value => {
                                if (value.isActive) isError = true
                            });
                            item.prenom[0].isActive = prenom.trim() === "";
                            item.prenom[1].isActive = prenom.length < 4;
                            item.prenom.forEach(value => {
                                if (value.isActive) isError = true
                            });
                            item.email[0].isActive = email.trim() === "";
                            item.email[1].isActive = !validEmailRegex.test(email);
                            item.email[2].isActive = false;
                            item.email.forEach(value => {
                                if (value.isActive) isError = true
                            });
                            item.password[0].isActive = password.trim() === "";
                            item.password[1].isActive = password.length < 8;
                            item.password.forEach(value => {
                                if (value.isActive) isError = true
                            });
                            item.confirmPassword[0].isActive = confirmPassword.trim() === "";
                            item.confirmPassword[1].isActive = confirmPassword.trim() !== password.trim() && confirmPassword.trim() !== "";
                            item.confirmPassword.forEach(value => {
                                if (value.isActive) isError = true
                            });
                            item.internalError[0].isActive = false;
                            return item
                        }
                    )
                }
            );
        });
        if (!isError) {
            await Axios.post('http://localhost:8000/api/register', {
                nom,
                prenom,
                email,
                password
            }).then(res => {
                //reponse ok crée utilisateur et rédirige vers login
                if (res.status === 201) {
                    return myHistory.push("/login",{regSucc:true});
                }
            }).catch(async (res) => {
                /*
                * Erreur La réquête est passée mais l'email existe déjà
                *  Status = 409
                */
                if (res.response && res.response.status === 409)
                    return this.setState(async (prevState) => {
                        return (
                            {
                                errors: await prevState.errors.map(value => value.email[2].isActive = true)
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
                            errors: await prevState.errors.map(value => value.internalError[0].isActive = true)
                        }
                    );
                });
            });
        }

    };

    render() {
        const {nom, prenom, email, password, confirmPassword, errors} = this.state;
        console.log(this.props.context.isLogged);
        if (this.props.context.isLogged){
            return ""
        }
        return (
            < div className="container">
                < div className="row">
                    < div className="col-md-4 mx-auto">
                        <h1>Inscription</h1>
                        {errors[0].internalError[0].isActive &&
                        <div key={0} className="alert alert-danger">{errors[0].internalError[0].message}</div>

                        }
                        <form className="form-group" onSubmit={this.submitAction}>
                            <div className="form-group">
                                <label htmlFor="nom">Nom</label>
                                <input required name="nom" type="text" className="form-control"
                                       value={nom} onChange={this.handleInputChange}
                                       id="nom" aria-describedby="nomHelp" placeholder="Entrer votre nom"/>
                                {errors[0].nom.map((item, index) => {
                                    if (item.isActive)
                                        return <p key={index} className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="prenom">Prénom</label>
                                <input required name="prenom" type="text" className="form-control"
                                       value={prenom} onChange={this.handleInputChange}
                                       id="prenom" aria-describedby="prenomHelp" placeholder="Entrer votre prénom"/>
                                {errors[0].prenom.map((item, index) => {
                                    if (item.isActive)
                                        return <p key={index} className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input required name="email" type="email" className="form-control" id="email"
                                       value={email} onChange={this.handleInputChange}
                                       aria-describedby="emailHelp" placeholder="Entrer votre Email"/>
                                {errors[0].email.map((item, index) => {
                                    if (item.isActive)
                                        return <p key={index} className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input required name="password" type="password" className="form-control"
                                       onChange={this.handleInputChange}
                                       value={password} id="password" placeholder="Password"/>
                                {errors[0].password.map((item, index) => {
                                    if (item.isActive)
                                        return <p key={index} className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input placeholder="Confirm Password" required className="form-control"
                                       name="confirmPassword" value={confirmPassword} onChange={this.handleInputChange}
                                       id="confirmPassword" type="password"/>
                                {errors[0].confirmPassword.map((item, index) => {
                                    if (item.isActive)
                                        return <p key={index} className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <button type="submit" className="btn btn-success">Enregistrer</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}
export default withRouter(withSessionContext(Register));