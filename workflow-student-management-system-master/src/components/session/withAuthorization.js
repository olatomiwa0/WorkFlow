import React from 'react';

import AuthUserContext from './context';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../firebase';

const withAuthorization = condition => Component => {
    class WithAuthorization extends React.Component {
        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {
                    if (!condition(authUser)) {
                        window.location.href = "/login";
                    }
                },
            );
        }

        componentWillUnmount() {
            this.listener();
        }

        render() {
            return (
                <AuthUserContext.Consumer>
                    {authUser =>
                        condition(authUser) ? <Component {...this.props} /> : null
                    }
                </AuthUserContext.Consumer>
            );
        }
    }

    return compose (
        withRouter,
        withFirebase,
    )(WithAuthorization);
};

export default withAuthorization;