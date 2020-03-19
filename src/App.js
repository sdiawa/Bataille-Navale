import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import {faUserAlt, faLock} from '@fortawesome/free-solid-svg-icons'
import Menu from "./Components/Menu";

function App() {
  library.add( faUserAlt, faLock);
  return (<Menu/>);
}

export default App;
