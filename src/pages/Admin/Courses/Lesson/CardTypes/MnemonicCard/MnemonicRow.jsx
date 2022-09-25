import React, { Component } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import InputStack from '../../../../../../components/InputStack/InputStack';
import MnemonicItem from './MnemonicItem';

export default class MnemonicRow extends Component {
    state = {
        value: this.props.value ?? [],
    };

    emptyMnemonicItem = {
        title: '',
        content: '',
        image: '',
    };

    handleMnmonicRowChange = (value) => {
        this.setState({
            value,
        });
    };

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevProps.value) !== JSON.stringify(this.props.value)) {
            this.setState({
                title: this.props.value.title ?? '',
                content: this.props.value.content ?? '',
                image: this.props.value.image ?? '',
            });
        } else if (JSON.stringify(prevState.value) !== JSON.stringify(this.state.value)) {
            this.props.onChange(null, this.state.value);
        }
    }

    render() {
        const { value, index } = this.props;

        return (
            <Accordion as={Card} className='mnemonic-row'>
                <Accordion.Toggle as={Card.Header} eventKey={`mnemonic-row-${index}`}>
                    Mnemonic row #{index}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={`mnemonic-row-${index}`}>
                    <Card.Body>
                        <InputStack
                            value={value}
                            emptyValue={this.emptyMnemonicItem}
                            component={MnemonicItem}
                            onChange={this.handleMnmonicRowChange}
                        />
                    </Card.Body>
                </Accordion.Collapse>
            </Accordion>
        );
    }
}

