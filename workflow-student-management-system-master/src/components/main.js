import React from 'react'
import {compose} from "recompose";
import {Link} from 'react-router-dom';
import { sidebarItems } from "./sidebar.js";
import '../styling/main.css';
import { IconContext } from 'react-icons';
import {withAuthUser} from "./session";
import {withFirebase} from "./firebase";

class Main extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount () {
    }


    componentDidUpdate () {
    }
    render() {
        const {authUser, firebase} = this.props;
        if (!authUser) {
            return null;
        }
        return (
            <IconContext.Provider value={{color: 'aliceblue'}}>
            <div className='navbar'>
                <span style={{marginLeft: "2%", color: "white", width: "48%"}}>Hello, {authUser.email}</span>
                <div style={{width: "50%"}}>
                    <button type="button"
                            onClick={() => {firebase.doSignOut()}}
                            style={{float: "right", color: "white"}}
                            className="btn btn-default">
                        Sign Out
                    </button>
                </div>
            </div>
            <nav className='nav-menu'>
                <ul className='nav-menu-items'>
                    {sidebarItems.map((item, index) => {
                        return (
                            <li key={index} className={item.className}>
                                <Link to={item.path}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            </IconContext.Provider>
        )
    }
}

export default compose(withAuthUser, withFirebase)(Main);
