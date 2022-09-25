import React, { Component } from 'react';
import { connect } from 'react-redux';
import UpsellLocationsConditions from './UpsellLocationsConditions';
import UpsellPackages from './UpsellPackages';
import './Taxes.scss';
import { ApiTable } from 'src/components/ApiTable';
import { Table } from 'src/components/Table';
import PackageContext from '../PackageContext';
import { Api } from 'src/helpers/new';

class Taxes extends Component {
    static contextType = PackageContext;

    state = {
        taxes: [],
        isLoaded: false,
    }

    async componentDidMount() {
        this.props.createFormActions({
            save: false,
            cancel: false,
            id: 'taxesTab',
        });

        console.log(this.context.packageData);

        this.setState({
            taxes: this.context.packageData.taxes ?? [],
            isLoaded: true,
        })
    }

    async handleTaxClassChange(newClass, index) {
        let taxes = Array.from(this.state.taxes);

        
        taxes[index].taxClass = newClass;
        let state = taxes[index];

        this.setState({
            taxes
        });

        Api.call('put', `packages/${this.context.packageData._id}/${state._id}`, {state})
        
    }

    render() {

        if(!this.state.isLoaded) return null;

        return (
            <div className='admin-package-taxes pt-4'>
                <Table
                    rows={this.state.taxes}
                    columns={[
                        {
                            text: 'State',
                            field: 'state',
                            maxWidth: '30%',
                        },
                        {
                            text: 'Tax Class',
                            field: (row, index) => {
                                return (
                                    <select 
                                        key={index}
                                        onChange={(e) => {
                                            this.handleTaxClassChange(e.target.value, index)
                                        }}
                                        value={row.taxClass}
                                    >
                                        <option value='exempt'>Exempt</option>
                                        <option value='eservice'>E-Service</option>
                                    </select>
                                )
                            },
                            maxWidth: '50%'
                        },
                        {
                            text: 'Last Modified',
                            field: (row) => new Date(row.updatedAt).toLocaleString('en-US'),
                            maxWidth: '20%'
                        }
                    ]}

                />
            </div>
        );
    }
}

export default connect(null, {
    createFormActions: (payload) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
})(Taxes);
