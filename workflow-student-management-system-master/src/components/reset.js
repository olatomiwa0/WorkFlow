import React, { Component } from "react";
import withWrapStyle from "./withWrapStyle";
import withFormHOC from "./hookForm/withFormHOC";
import {withFirebase} from "./firebase";
import {compose} from "recompose";

class Reset extends Component {
    // submit form
    onSubmit(data) {
        this.props.firebase
            .doPasswordReset(data.email)
            .then(() => {
                alert("Please check your email, we have sent an email for you～");
                window.location.href = "/login";
            })
            .catch(error => {
                alert(error);
            });
    };
    render() {
        const {register, getValues, formState: {errors}, handleSubmit} = this.props.form;
        return (
            <form onSubmit={handleSubmit((data) => { this.onSubmit(data)})}>

                <h1>Reset Your Password</h1>

                <div className="form-group">
                    <label>Email</label>
                    <input {...register("email", {required: true})} type="email" className="form-control"
                           placeholder="Enter email..."/>
                    <span className="warning-color">{errors.email?.type === 'required' && ("Email is required")}</span>
                </div>

                <br/>
                <div style={{textAlign: "center"}}>
                    <button type="button" onClick={() => {window.location.href = "/login"}}
                            className="btn btn-primary btn-block">
                        Cancel
                    </button>
                    <button type="submit" style={{marginLeft: '5%'}}
                            className="btn btn-primary btn-block">
                        Get New Password
                    </button>
                </div>
            </form>
        );
    }
}
export default compose(withWrapStyle, withFormHOC, withFirebase)(Reset);
