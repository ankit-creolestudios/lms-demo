import React, { Component } from 'react';
import { EventBus } from 'src/helpers/new';
import usStates from 'src/helpers/usStates';
import CheckoutContext from '../../CheckoutContext';
import Next from '../../Next';

interface IBilling {
    streetLines: string[];
    town: string;
    state: string;
    zipCode: string;
    firstName: string;
    lastName: string;
}

interface IState {
    billing: IBilling;
    validation: {
        addressLineMessage: string;
        townMessage: string;
        zipCodeMessage: string;
        firstNameMessage: string;
        lastNameMessage: string;
    };
}

export default class Billing extends Component<unknown, IState> {
    static contextType = CheckoutContext;

    constructor(props: unknown, context: any) {
        super(props);
        this.state = {
            billing: context.billingAddress,
            validation: {
                addressLineMessage: '',
                townMessage: '',
                zipCodeMessage: '',
                firstNameMessage: '',
                lastNameMessage: '',
            },
        };
    }

    componentDidMount() {
        EventBus.on('validate-billing-tab', this.validateInputs);
    }

    componentWillUnmount() {
        EventBus.remove('validate-billing-tab', this.validateInputs);
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const billing = { ...this.state.billing };
        //@ts-ignore
        billing[e.target.name] = e.target.value;
        this.setState({ billing });
    };

    handleStreetLineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const billing = { ...this.state.billing };
        billing.streetLines[parseInt(e.target.name)] = e.target.value;

        this.setState({ billing });
    };

    validateInputs = async () => {
        let proceed = true;
        const messages = { ...this.state.validation };
        const { streetLines, town, zipCode, firstName, lastName } = this.state.billing;

        if (!firstName) {
            messages.firstNameMessage = 'First Name cannot be empty.';
            proceed = false;
        }
        if (!lastName) {
            messages.lastNameMessage = 'Last Name cannot be empty.';
            proceed = false;
        }
        if (streetLines[0].length === 0) {
            messages.addressLineMessage = 'Address Line cannot be empty';
            proceed = false;
        }
        if (!town) {
            messages.townMessage = 'City cannot be empty';
            proceed = false;
        }
        if (!zipCode) {
            messages.zipCodeMessage = 'Zip code cannot be empty';
            proceed = false;
        }

        if (proceed) {
            await this.context.updateCart({ billingAddress: this.state.billing });
            this.context.switchTab(4, true);
        } else {
            this.setState({
                validation: messages,
            });
        }
    };

    render() {
        const { streetLines, town, state, zipCode, firstName, lastName } = this.state.billing;
        const { firstNameMessage, lastNameMessage, townMessage, zipCodeMessage, addressLineMessage } =
            this.state.validation;

        return (
            <>
                <div className='checkout-billing'>
                    <h1>Billing address</h1>
                    <h3>Who should we send the bill?</h3>
                    <div className='checkout-form'>
                        <div>
                            <label htmlFor='aFirstName'>First Name *</label>
                            <input
                                type='text'
                                name='firstName'
                                value={firstName ?? ''}
                                id='aFirstName'
                                onChange={this.handleInputChange}
                            />
                            <p>{firstNameMessage}</p>
                        </div>
                        <div>
                            <label htmlFor='aLastName'>Last Name *</label>
                            <input
                                type='text'
                                name='lastName'
                                value={lastName ?? ''}
                                id='aLastName'
                                onChange={this.handleInputChange}
                            />
                            <p>{lastNameMessage}</p>
                        </div>
                        <div>
                            <label htmlFor='aTown'>City *</label>
                            <input
                                type='text'
                                name='town'
                                value={town ?? ''}
                                id='aTown'
                                onChange={this.handleInputChange}
                            />
                            <p>{townMessage}</p>
                        </div>
                        <div>
                            <label htmlFor='aState'>State *</label>
                            <select name='state' id='aState' value={state} onChange={this.handleInputChange}>
                                {usStates.map(({ key, value }) => (
                                    <option value={key} key={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor='aZipCode'>Zip code *</label>
                            <input
                                style={{
                                    background: '#fff',
                                    border: 0,
                                    borderRadius: 0,
                                    padding: '20px 25px',
                                }}
                                type='number'
                                name='zipCode'
                                value={zipCode ?? ''}
                                id='aZipCode'
                                onChange={this.handleInputChange}
                            />
                            <p>{zipCodeMessage}</p>
                        </div>
                        <div>
                            <label htmlFor='aAddressLine0'>Address line *</label>
                            <input
                                type='text'
                                id='aAddressLine0'
                                value={streetLines[0] ?? ''}
                                name='0'
                                onChange={this.handleStreetLineInputChange}
                            />
                            <p>{addressLineMessage}</p>
                        </div>
                    </div>
                </div>
                <Next onClick={this.validateInputs} />
            </>
        );
    }
}
