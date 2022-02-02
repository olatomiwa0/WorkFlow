import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import "./styling/index.css";
import App from "./app";
import "./styling/app.css";
import Firebase, { FirebaseContext } from './components/firebase';

ReactDOM.render(
    <FirebaseContext.Provider value={new Firebase()}>
        <CssBaseline />
        <App />
    </FirebaseContext.Provider>,
  document.getElementById("root")
);
