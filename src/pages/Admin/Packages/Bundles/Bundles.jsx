import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Spinner } from '../../../../components/Spinner';
import apiCall from '../../../../helpers/apiCall';
import BundlesContext from './BundlesContext';
import BundlesList from './BundlesList';

class Bundles extends Component {
    state = {
        title: '',
        status: 'LOADING',
        bundles: [],
        availablePackages: [],
    };

    loadBundles = async () => {
        const { id: packageId } = this.props.match.params,
            { success, response: bundles } = await apiCall('GET', `/packages/${packageId}/bundles`);

        if (success) {
            this.setState({
                status: 'READY',
                bundles,
            });
        } else {
            this.setState({
                status: 'ERROR',
            });
        }
    };

    loadPackages = async () => {
        const { success, response } = await apiCall('GET', `/packages?perPage=all`);

        if (success) {
            this.setState({
                availablePackages: response.docs.map(({ _id: value, title: name }) => ({ value, name })),
            });
        }
    };

    async componentDidMount() {
        await this.loadBundles();
        await this.loadPackages();

        this.props.createFormActions({
            save: false,
            cancel: false,
            id: 'bundlesTab',
        });
    }

    createBundle = async () => {
        const { id: packageId } = this.props.match.params,
            { title } = this.state,
            bundles = Array.from(this.state.bundles),
            { success, response } = await apiCall('POST', '/packages/bundles', {
                packageId,
                title,
                orderIndex: 0,
            });

        if (success) {
            bundles.unshift(response);

            this.setState({
                title: '',
                bundles: bundles.map((bundle, orderIndex) => ({ ...bundle, orderIndex })),
            });
        }
    };

    setBundles = (bundles, callback) => {
        this.setState(
            {
                bundles,
            },
            callback
        );
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    render() {
        const { title, status, bundles, availablePackages } = this.state;

        return (
            <div className='bundles-admin-form'>
                {status === 'LOADING' ? (
                    <Spinner />
                ) : (
                    <>
                        <header className='d-flex pt-4 mb-3'>
                            <Form.Control type='text' name='title' onChange={this.handleInputChange} value={title} />
                            <button className='bp ml-3' onClick={this.createBundle}>
                                <strong>Create</strong>
                            </button>
                        </header>
                        <BundlesContext.Provider
                            value={{
                                bundles,
                                availablePackages,
                                setBundles: this.setBundles,
                            }}>
                            <BundlesList />
                        </BundlesContext.Provider>
                    </>
                )}
            </div>
        );
    }
}

export default connect(null, {
    createFormActions: (payload) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
})(withRouter(Bundles));
