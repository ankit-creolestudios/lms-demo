import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Order from './Order';
import OrderTable from './OrderTable';

export default class Orders extends Component {
    render() {
        return (
            <Switch>
                <Route exact path='/admin/orders' component={OrderTable} />
                <Route path='/admin/orders/:orderId' component={Order} />
            </Switch>
        );
    }
}
