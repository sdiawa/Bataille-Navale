import React, { createContext, Component } from "react";
import * as Cookies from "js-cookie";
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
                {value => <Component {...props} context={value} />}
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
            session:this.getSession(),
            isLogged:JSON.stringify(this.getSession())!=="{}",
            getSession:()=> this.getSession(),
            updateSession:(session) => this.updateSession(session),
            removeSession:()=>this.removeSession()
        };
    }
    componentDidMount = () =>{
                        this.setState({session:this.getSession() ,isLogged:JSON.stringify(this.getSession())!=="{}"});

    };
    updateSession = async (session)=>{
        Cookies.remove("bn-user");
        Cookies.set("bn-user", session, { expires: 14 });
        await this.setState(prevState=>{
            return {
                isLogged: true,
                session:session
            }
        });
    };
    getSession= ()=>{
        const sessionCookie = Cookies.get("bn-user");

        if (sessionCookie === undefined || sessionCookie=== null) {
            return {};
        } else {
            return JSON.parse(sessionCookie);
        }
    };
    removeSession= ()=>{
        Cookies.remove("bn-user");
        this.setState(prevState=>{
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
}

export default SessionProvider;