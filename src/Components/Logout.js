import {Component} from "react";
import {withRouter} from "react-router-dom";
import {withSessionContext} from "../Utils/SessionProvider";

class Logout extends Component{

    componentDidMount() {
        this.props.context.removeSession();
        this.props.history.push("/login",{logoutSucc:true})
    }
    render() {
        return ""
    }
}
export default withRouter(withSessionContext(Logout))