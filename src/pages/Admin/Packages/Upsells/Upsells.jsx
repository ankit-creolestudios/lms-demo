import React, { Component } from 'react';
import { connect } from 'react-redux';
import UpsellLocationsConditions from './UpsellLocationsConditions';
import UpsellPackages from './UpsellPackages';
import './Upsells.scss';

class Upsells extends Component {
    async componentDidMount() {
        this.props.createFormActions({
            save: false,
            cancel: false,
            id: 'bundlesTab',
        });
    }

    render() {
        return (
            <div className='admin-package-upsells pt-4'>
                <UpsellLocationsConditions />
                <UpsellPackages />
            </div>
        );
    }
}

export default connect(null, {
    createFormActions: (payload) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
})(Upsells);
