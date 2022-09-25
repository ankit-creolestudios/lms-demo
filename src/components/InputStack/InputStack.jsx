import React, { Component } from 'react';
import { BsFillTrashFill, BsPlus } from 'react-icons/bs';
import './InputStack.scss';

export default class InputStack extends Component {
    state = {
        value: Array.isArray(this.props.value) ? this.props.value : [],
    };

    componentDidMount() {
        if (this.state.value.length === 0) {
            this.setState({
                value: [typeof this.props.emptyValue === 'function' ? this.props.emptyValue() : this.props.emptyValue],
            });
        }
    }

    addNewItem = (index) => {
        const {
            state: { value },
            props: { emptyValue },
        } = this;
        let newValue = typeof emptyValue === 'function' ? emptyValue(index) : emptyValue;

        value.splice(index, 0, newValue);

        this.setState({
            value,
        });
    };

    removeItem = (index) => {
        const value = Object.assign(this.state.value);

        value.splice(index, 1);

        this.setState({
            value,
        });

        this.props.onChange(value);
    };

    onChange = (index, inputValue) => {
        const value = [...this.state.value];

        value.splice(index, 1, inputValue);
        this.setState(
            {
                value,
            },
            () => {
                this.props.onChange(this.state.value);
            }
        );
    };

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevProps.value) !== JSON.stringify(this.props.value)) {
            this.setState({
                value: Array.isArray(this.props.value) ? this.props.value : [],
            });
        }
        if (this.state.value.length > this.props.limit) {
            this.setState({
                value: this.state.value.slice(0, this.props.limit),
            });

            return;
        }

        if (
            typeof this.props?.onChange === 'function' &&
            JSON.stringify(prevState.value) !== JSON.stringify(this.state.value) &&
            !(this.state.value.length === 1 && this.state.value[0] === this.props.emptyValue)
        ) {
            this.props.onChange(this.state.value);
        }
    }

    render() {
        const {
            state: { value },
            props: { limit, value: dump, emptyValue: dump2, onChange: dump3, component: Component, ...rest },
        } = this;

        return (
            <div className='input-stack'>
                {value.map((val, key) => {
                    return (
                        <div key={key}>
                            <Component
                                value={val}
                                index={key + 1}
                                onChange={(e, value) => {
                                    this.onChange(key, e?.target?.value ?? value);
                                }}
                                {...rest}
                            />
                            {(!limit || limit > value.length) && (
                                <button
                                    className='bd add'
                                    onClick={() => {
                                        this.addNewItem(key + 1);
                                    }}>
                                    <BsPlus />
                                </button>
                            )}
                            {value.length !== 1 && (
                                <button
                                    className='bd delete'
                                    onClick={() => {
                                        this.removeItem(key);
                                    }}>
                                    <BsFillTrashFill />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
}
