import './scss/App.scss';
import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MainLayout from './layouts/Main/Main';
import { Login, ResetPassword, ChangePassword, Profile, VerifyAccount } from './pages/Account';
import { Home, Course } from './pages';
import { Admin } from './pages/Admin';
import { Notifications } from './pages/Notifications';
import { Policy } from './pages/Policy';
import { NotFound } from './pages/NotFound';
import { Courses } from './pages/Courses';
import Checkout from './pages/Checkout';
import Stripe from './pages/Checkout/Tabs/Payment/Stripe/Stripe';
import Confirmation from './pages/Checkout/Tabs/Payment/Confirmation/Confirmation';
import PublicProfileNotifications from './pages/Account/PublicProfileNotifications/PublicProfileNotifications';

export default class App extends Component {
    render() {
        return (
            <Router>
                <div id='app'>
                    <MainLayout>
                        <Switch>
                            <Route exact path='/' component={Home} />
                            <Route path='/new/courses/:courseId/:courseSection?' component={Course} />
                            <Route path='/courses/:courseId/:courseParam?' component={Courses} />
                            <Route exact path='/login' component={Login} />
                            <Route exact path='/profile/:tab' component={Profile} />
                            <Route exact path='/reset-password' component={ResetPassword} />
                            <Route exact path='/change-password' component={ChangePassword} />
                            <Route exact path='/verify-account' component={VerifyAccount} />
                            <Route path='/admin' component={Admin} />
                            <Route exact path='/notifications' component={Notifications} />
                            <Route exact path='/checkout/' component={Checkout} />
                            <Route exact path='/checkout/payment/card' component={Stripe} />
                            <Route exact path='/checkout/payment/confirmation' component={Confirmation} />
                            <Route path='/terms_of_service'>
                                <Policy keyword='terms_of_service' title='Terms Of Service' />
                            </Route>
                            <Route path='/privacy_policy'>
                                <Policy keyword='privacy_policy' title='Privacy Policy' />
                            </Route>
                            <Route path='/unsubscribe/notifications' component={PublicProfileNotifications}></Route>
                            <Route path='*' component={NotFound} />
                        </Switch>
                    </MainLayout>
                </div>
            </Router>
        );
    }
}
