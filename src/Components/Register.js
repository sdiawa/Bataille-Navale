import React, {Component} from "react";
import Axios from "axios";
export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nom: "", prenom: "", email: "", password: "", confirmPassword:"",
            errors:[{'nom': [
                    {isActive: false, type: 'nomNotBlank', message: 'Le nom ne doit pas être vide.'},
                    {isActive: false, type: 'nomMin', message: 'Ce champ ne peut être inférieur à 4.'}
                ],
                'prenom': [
                    {isActive: false, type: 'prenomNotBlank', message: 'Le prénom ne doit pas être vide.'},
                    {isActive: false, type: 'prenomMin', message: 'Ce champ ne peut être inférieur à 4.'}
                ], 'email': [
                    {isActive: false, type: 'emailNotBlank', message: 'L\'email ne doit pas être vide.'},
                    {isActive: false, type: 'emailValid', message: 'L\'email n\'est pas valide.'}
                ],
                'password': [
                    {isActive: false, type: 'passNotBlank', message: 'Le mot de passe ne doit pas être vide.'},
                    {isActive: false, type: 'passMin', message: 'Ce champ ne peut être inférieur à 8.'}
                ],
                'confirmPassword': [
                    {isActive: false, type: 'passConfNotBlank', message: 'Cette valeur ne doit pas être vide.'},
                    {isActive: false, type: 'passConfValidConfirm', message: 'Les mots de passes ne sont pas identiques.'}
                ]}]
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    };
    handleInputChange = (event) =>{
        event.preventDefault();
        const target = event.target;
        //const value = target.name === 'nom' ? target.checked : target.value;
        const value = target.value;
        const name = target.name;
        let error =
        this.setState({
            [name]: value,
            errors:[{'nom': [
                    {isActive: false, type: 'nomNotBlank', message: 'Le nom ne doit pas être vide.'},
                    {isActive: false, type: 'nomMin', message: 'Ce champ ne peut être inférieur à 4.'}
                ],
                'prenom': [
                    {isActive: false, type: 'prenomNotBlank', message: 'Le prénom ne doit pas être vide.'},
                    {isActive: false, type: 'prenomMin', message: 'Ce champ ne peut être inférieur à 4.'}
                ], 'email': [
                    {isActive: false, type: 'emailNotBlank', message: 'L\'email ne doit pas être vide.'},
                    {isActive: false, type: 'emailValid', message: 'L\'email n\'est pas valide.'}
                ],
                'password': [
                    {isActive: false, type: 'passNotBlank', message: 'Le mot de passe ne doit pas être vide.'},
                    {isActive: false, type: 'passMin', message: 'Ce champ ne peut être inférieur à 8.'}
                ],
                'confirmPassword': [
                    {isActive: false, type: 'passConfNotBlank', message: 'Cette valeur ne doit pas être vide.'},
                    {isActive: false, type: 'passConfValidConfirm', message: 'Les mots de passes ne sont pas identiques.'}
                ]}]
        });
    };
    submitAction = async (event)=> {
        event.preventDefault();
        const validEmailRegex =
            RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

        const {nom, prenom, email, password,confirmPassword} = this.state;

            this.setState(prevState =>{
                return (
                    {
                        errors:prevState.errors.map(
                            item =>
                            {
                                if (nom.trim()==="" && item.nom[0].type==="nomNotBlank")
                                    item.nom[0].isActive=true;
                                if (nom.length < 4 && item.nom[1].type==="nomMin")
                                    item.nom[1].isActive=true;
                                if (prenom.trim()==="" && item.prenom[0].type==="prenomNotBlank")
                                    item.prenom[0].isActive=true;
                                if (prenom.length < 4 && item.prenom[1].type==="prenomMin")
                                    item.prenom[1].isActive=true;
                                if (email.trim()==="" && item.email[0].type==="emailNotBlank")
                                    item.email[0].isActive=true;
                                if (!validEmailRegex.test(email) && item.type ==="emailValid")
                                    item.prenom[1].isActive=true;
                                if (password.trim()==="" && item.password[0].type==="passNotBlank")
                                    item.password[0].isActive=true;
                                if (password.length < 8 && item.password[1].type==="passMin")
                                    item.password[1].isActive=true;
                                if (confirmPassword.trim()==="" && item.confirmPassword[0].type==="passConfNotBlank")
                                    item.confirmPassword[0].isActive=true;
                                if (confirmPassword.trim() !== password.trim() && confirmPassword.trim()!=="" && item.confirmPassword[1].type==="passConfValidConfirm")
                                    item.confirmPassword[1].isActive=true;
                                return item
                            }
                            )
                    }
                    );
            });
        const register = await Axios.post('localhost/register',{nom:nom,prenom:prenom,email:email,password});
        register
            .then(res=>{if (res.status === 200) console.log("inscription ok")})
            .catch(error=>{console.log(error)})
    };

    render() {
        const {nom, prenom, email, password, confirmPassword,errors} = this.state;
        return (
            < div className="container">
                < div className="row">
                    < div className="col-md-4 mx-auto">
                        <h1>Inscription</h1>
                        <form className="form-group" onSubmit={this.submitAction}>
                            <div className="form-group">
                                <label htmlFor="nom">Nom</label>
                                <input required name="nom" type="text" className="form-control"
                                       value={nom} onChange={this.handleInputChange}
                                       id="nom" aria-describedby="nomHelp" placeholder="Entrer votre nom"/>
                                {errors[0].nom.map(item => {
                                    if (item.isActive)
                                        return <p className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="prenom">Prénom</label>
                                <input required name="prenom" type="text" className="form-control"
                                       value={prenom} onChange={this.handleInputChange}
                                       id="prenom" aria-describedby="prenomHelp" placeholder="Entrer votre prénom"/>
                                {errors[0].prenom.map(item => {
                                    if (item.isActive)
                                        return <p className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input required name="email" type="email" className="form-control" id="email"
                                       value={email} onChange={this.handleInputChange}
                                       aria-describedby="emailHelp" placeholder="Entrer votre Email"/>
                                {errors[0].email.map(item => {
                                    if (item.isActive)
                                        return <p className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input required name="password" type="password" className="form-control"
                                       onChange={this.handleInputChange}
                                       value={password} id="password" placeholder="Password"/>
                                {errors[0].password.map(item => {
                                    if (item.isActive)
                                        return <p className="alert-danger">{item.message}</p>;
                                    return ''
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input placeholder="Confirm Password" required className="form-control"
                                       name="confirmPassword" value={confirmPassword} onChange={this.handleInputChange}
                                       id="confirmPassword" type="password"/>
                                {errors[0].confirmPassword.map(item => {
                                    if (item.isActive)
                                        return <p className="alert-danger">{item.message}</p>;
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