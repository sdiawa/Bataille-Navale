import {Component} from "react";
import {withRouter} from "react-router-dom";
import {withSessionContext} from "../Utils/SessionProvider";
import io from "../Utils/Sockets";
class Logout extends Component{

    componentDidMount() {
        this.props.context.removeSession();
        io.disconnect();
        this.props.history.push("/login",{logoutSucc:true})
    }
    render() {
        return ""
    }
}
export default withRouter(withSessionContext(Logout))