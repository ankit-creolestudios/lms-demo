import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import { GlobalHandlers } from './GlobalHandlers';
import './scss/index.scss';
import {store} from './store';

global.USCurrency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

Number.prototype.cleanRound = function (dp) {
    return Math.round((this + Number.EPSILON) * 10 ** dp) / 10 ** dp;
};

// this is the actual start

ReactDOM.render(
    <Provider store={store}>
        <GlobalHandlers />
        <App />
    </Provider>,
    document.getElementById('root')
);
