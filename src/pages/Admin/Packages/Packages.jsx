import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Package from './Package';
import PackageTable from './PackageTable';

export default class Packages extends Component {
    render() {
        return (
            <div id='invoices'>
                <Switch>
                    <Route exact path='/admin/packages' component={PackageTable} />
                    <Route exact path='/admin/packages/create' key='admin-packages-create' component={Package} />
                    <Route exact path='/admin/packages/edit/:id' key='admin-packages-edit' component={Package} />
                </Switch>
            </div>
        );
    }
}
