import React, {Component} from "react";
import '../styling/common.css';
import withWrapStyle from "./withWrapStyle";
import withFormHOC from "./hookForm/withFormHOC";
import {compose} from "recompose";
import {withFirebase} from "./firebase";

class Register extends Component {
    // submit form
    onSubmit(data) {
        this.props.firebase
            .doCreateUserWithEmailAndPassword(data.email, data.password)
            .then(authUser => {
                // Create a user in your Firebase realtime database
                return this.props.firebase
                    .user(authUser.user.uid, data.username, data.email);
            })
            .then(authUser => {
                window.location.href = "/";
            })
            .catch(error => {
                alert(error);
            });
    };

    render() {
        const {register, getValues, formState: {errors}, handleSubmit} = this.props.form;
        return (
            <form onSubmit={handleSubmit((data) => { this.onSubmit(data)})}>

                <h1>Create Account</h1>

                <div className="form-group">
                    <label>User Name</label>
                    <input {...register("username", {required: true})} type="username" className="form-control"
                           placeholder="Enter user name..."/>
                        <span className="warning-color">{errors.username?.type === 'required' && ("User name is required")}</span>
                </div>

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
                    <span className="warning-color">{errors.password?.type === 'required' && ("Password is required")}</span>
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <input {...register("confirmPassword", {
                        required: true, validate: {
                            sameValid: v => getValues('password') === v,
                        }
                    })}
                           type="password" className="form-control" placeholder="Confirm password..."/>
                    <span className="warning-color">{errors.confirmPassword?.type === 'required' && ("Confirm password is required")}</span>
                    <span className="warning-color">{errors.confirmPassword?.type === 'sameValid' && ("Confirm password should be the same")}</span>
                </div>

                <br/>
                <div style={{textAlign: "center"}}>
                    <button type="button" onClick={() => {window.location.href = "/login"}} style={{marginRight: '5%', width: '45%'}}
                            className="btn btn-primary btn-block">Cancel
                    </button>
                    <button type="submit" style={{marginLeft: '5%', width: '45%'}}
                            className="btn btn-primary btn-block">Create Account
                    </button>
                </div>
            </form>
        );
    }
}

export default compose(withWrapStyle, withFormHOC, withFirebase)(Register);
