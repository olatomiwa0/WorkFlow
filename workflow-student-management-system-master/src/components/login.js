import React, {Component} from "react";
import '../styling/common.css';
import logo from "../assets/logo.png";
import withWrapStyle from "./withWrapStyle";
import withFormHOC from "./hookForm/withFormHOC";
import {withFirebase} from "./firebase";
import {compose} from "recompose";

class Login extends Component {
    // submit form
    onSubmit(data) {
        this.props.firebase
            .doSignInWithEmailAndPassword(data.email, data.password)
            .then(() => {
                window.location.href = "/";
            })
            .catch(error => {
                alert(error);
            });
    };

    render() {
        const {register, formState: {errors}, handleSubmit} = this.props.form;
        return (
            <form onSubmit={handleSubmit((data) => { this.onSubmit(data)})}>
                <img src={logo} alt="WorkFlow Logo" style={{width: 128, height: 128}}/>

                <h1>Sign In</h1>

                <div className="form-group">
                    <label>Email Address</label>
                    <input {...register("email", {required: true})} type="email" className="form-control"
                           placeholder="Enter email..."/>
                    <span className="warning-color">{errors.email?.type === 'required' && ("Email is required")}</span>
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input {...register("password", {required: true})} type="password" className="form-control"
                           placeholder="Enter password..."/>
                    {errors.password?.type === 'required' && (<span className="warning-color">Password is required</span>)}
                </div>

                <p className="forgot-password">
                    Forgot <a href="/reset-password">password?</a>
                </p>
                <div style={{textAlign: "center"}}>
                    <button type="submit" className="btn btn-primary btn-block">Log In</button>
                </div>


                <p className="not-registered">
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </form>
        );
    }
}

export default compose(withWrapStyle, withFormHOC, withFirebase)(Login);
