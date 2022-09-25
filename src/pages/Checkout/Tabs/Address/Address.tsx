import React, { Component } from 'react';
import usStates from '../../../../helpers/usStates';
import { EventBus } from 'src/helpers/new';
import CheckoutContext from '../../CheckoutContext';
import Next from '../../Next';

interface IAddress {
    streetLines: string[];
    town: string;
    state: string;
    zipCode: string;
}

interface IState {
    address: IAddress;
    validation: {
        streetLinesMessage: string;
        townMessage: string;
        zipCodeMessage: string;
    };
}

export default class Address extends Component<unknown, IState> {
    static contextType = CheckoutContext;

    constructor(props: unknown, context: any) {
        super(props);
        this.state = {
            address: context.residentialAddress,
            validation: {
                streetLinesMessage: '',
                townMessage: '',
                zipCodeMessage: '',
            },
        };
    }

    componentDidMount() {
        EventBus.on('validate-address-tab', this.validateInputs);
    }

    componentWillUnmount() {
        EventBus.remove('validate-address-tab', this.validateInputs);
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const address = { ...this.state.address };
        //@ts-ignore
        address[e.target.name] = e.target.value;
        this.setState({ address });
    };

    handleStreetLineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const address = { ...this.state.address };
        address.streetLines[parseInt(e.target.name)] = e.target.value;

        this.setState({ address });
    };

    validateInputs = async () => {
        let proceed = true;
        const messages = { ...this.state.validation };
        const { streetLines, town, state, zipCode } = this.state.address;

        if (streetLines[0].length === 0) {
            messages.streetLinesMessage = 'Address line cannot be empty';
            proceed = false;
        } else if (streetLines[0].length < 4) {
            messages.streetLinesMessage = 'Address line too short';
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
            await this.context.updateCart({ residentialAddress: this.state.address });
            this.context.switchTab(3, true);
        } else {
            this.setState({
                validation: messages,
            });
        }
    };

    render() {
        const { streetLines, town, state, zipCode } = this.state.address;
        const { townMessage, zipCodeMessage, streetLinesMessage } = this.state.validation;

        return (
            <>
                <div className='checkout-address'>
                    <h1>Residential address</h1>
                    <h3>Where will you be taking this course from?</h3>
                    <div className='checkout-form'>
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
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
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
                            <p>{streetLinesMessage}</p>
                        </div>
                    </div>
                </div>
                <Next onClick={this.validateInputs} />
            </>
        );
    }
}
