import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import {faUserAlt, faLock,faSignOutAlt, faSpinner} from '@fortawesome/free-solid-svg-icons'
import Menu from "./Components/Menu";
import SessionProvider from "./Utils/SessionProvider";

function App() {
  library.add( faUserAlt, faLock, faSignOutAlt, faSpinner);
  return (<SessionProvider>
    <Menu/>
  </SessionProvider>);
}

export default App;
