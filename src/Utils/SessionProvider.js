import React from "react";
import {getSessionCookie} from "./Cookies";

export const SessionContext = React.createContext(getSessionCookie());