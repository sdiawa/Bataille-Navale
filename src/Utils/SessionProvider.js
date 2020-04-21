import React, {Component, createContext} from "react";
import * as Cookies from "js-cookie";
import io from "./Sockets";
import Axios from "axios";

/**
 * `createContext` contient 2 propriétés :
 * `Provider` et `Consumer`. Nous les rendons accessibles
 * via la constante `UserContext` et on initialise une
 * propriété par défaut "name" qui sera une chaîne vide.
 * On exporte ce contexte afin qu'il soit exploitable par
 * d'autres composants par la suite via le `Consumer`
 */
export const SessionContext = createContext('session');

export function withSessionContext(Component) {
    return function WrapperComponent(props) {
        return (
            <SessionContext.Consumer>
                {value => <Component {...props} context={value}/>}
            </SessionContext.Consumer>
        );
    };
}

/**
 * la classe UserProvider fera office de... Provider (!)
 * en englobant son enfant direct
 * dans le composant éponyme. De cette façon, ses values
 * seront accessibles de manière globale via le `Consumer`
 */
class SessionProvider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            session: {},
            isLogged: false,
            updateSession: (session) => this.updateSession(session),
            removeSession: () => this.removeSession()
        };
    }

    componentDidMount = async () => {
        //socket connect
        io.connect();
        // session courante
        let session = await this.getSession();
        // Si user est connecté ? true : false
        let isLogged = JSON.stringify(session) !== "{}";
        //
        await io.emit('newPlayer', {email: session.email});
        await io.on('onlineUsers', data => this.setState({users: data}));

        this.setState(prevState => {
            return ({
                session: session,
                isLogged: isLogged
            })
        });

    };

    /**
     *
     * @desc mettre à jour la session
     * @param session
     * @return {Promise<void>}
     */
    updateSession = async (session) => {
        Cookies.remove("bn-access_token");
        Cookies.set("bn-access_token", {token: session.token}, {expires: 1 /*,httpOnly: true, secure: true*/});
        await this.setState(prevState => {
            return {
                isLogged: true,
                session: session
            }
        });
    };

    /**
     *
     * @desc Récuperer la session (cookie)
     * @return {Promise<{}|AxiosResponse<T>|{}>}
     */
    getSession = async () => {
        const sessionCookie = Cookies.get("bn-access_token");
        if (sessionCookie === undefined || sessionCookie === null) {
            return {};
        } else {
            let val = JSON.parse(sessionCookie);
            return await this.checkSession(val.token);
        }
    };

    /**
     * @desc supprimer la session (Cookies)
     */
    removeSession = () => {
        Cookies.remove("bn-access_token");
        this.setState(prevState => {
            return {
                isLogged: false,
                session: {}
            }
        })
    };

    render() {
        return (
            /**
             * la propriété value est très importante ici, elle rend
             * le contenu du state disponible aux `Consumers` de l'application
             */
            <SessionContext.Provider value={{...this.state}}>
                {this.props.children}
            </SessionContext.Provider>
        );
    }

    /**
     *
     * @desc Vérifier la validité du token de la session
     * @param token
     * @return {Promise<AxiosResponse<T>|{}>}
     */
    checkSession = async (token) => {
        return await Axios.get("https://uvsq-bataille-navale-back.herokuapp.com/api/checkSession", {
            headers: {Authorization: token, withCredentials: true, "x-access-token": token}
        }).then(res => {
            if (res.status === 200)
                return res.data;
        }).catch(er => {
            console.log(er);
            return {}
        })
    };
}

export default SessionProvider;
