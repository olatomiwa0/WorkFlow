import React from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Main from './components/main';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import Reset from './components/reset';
import Calendar from './pages/calendar';
import Assignments from './pages/assignments';
import Exams from './pages/exams';
import Subjects from './pages/subjects';
import Settings from './pages/settings';
import withAuthentication from "./components/session/withAuthentication";
import {AcademicYearContext} from "./components/session";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            academicYear: new Date().getFullYear(),
            setAcademicYear: this.setAcademicYear,
        };
    }

    setAcademicYear = academicYear => {
        this.setState({ academicYear });
    };

    render() {
        return (
            <AcademicYearContext.Provider value = {this.state}>
                <Router>
                    <Main/>
                    <Switch>
                        <Route path="/login" component={Login}/>
                        <Route path="/register" component={Register}/>
                        <Route path="/reset-password" component={Reset}/>
                        <Route exact path='/' component={Calendar}/>
                        <Route path='/calendar' component={Calendar}/>
                        <Route path='/assignments' component={Assignments}/>
                        <Route path='/exams' component={Exams}/>
                        <Route path='/subjects' component={Subjects}/>
                        <Route path='/settings' component={Settings}/>
                    </Switch>
                </Router>
            </AcademicYearContext.Provider>
        );
    }
}

export default (withAuthentication)(App);