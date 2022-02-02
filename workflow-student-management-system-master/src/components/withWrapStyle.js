import React from "react";

const withWrapStyle = Component => props => (
    <div className="auth-wrapper">
        <div className="auth-inner">
            <Component {...props}/>
        </div>
    </div>
);
export default withWrapStyle;