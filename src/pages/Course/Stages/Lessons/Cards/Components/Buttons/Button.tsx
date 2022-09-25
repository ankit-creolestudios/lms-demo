import React, { Component } from 'react';
import { EventBus } from 'src/helpers/new';
import './Button.scss';

export interface IButton {
    cardId: string;
    title: string;
    icon: string;
    component: JSX.Element;
    buttonKey: string;
}

interface IState {
    isActive: boolean;
}

export default class Button extends Component<IButton, IState> {
    constructor(props: IButton) {
        super(props);

        this.state = {
            isActive: false,
        };
    }

    componentDidMount() {
        EventBus.on(`button-modal-opened-${this.props.cardId}`, this.handleModalOpen);
    }

    componentWillUnmount() {
        EventBus.remove(`button-modal-opened-${this.props.cardId}`, this.handleModalOpen);
    }

    handleModalOpen = (event: Event) => {
        const buttonKey = (event as CustomEvent).detail;
        if (this.state.isActive && buttonKey !== this.props.buttonKey) {
            this.setState({ isActive: false });
        }
    };

    toggleModal = () => {
        if (this.state.isActive) {
            EventBus.dispatch(`button-modal-close-${this.props.cardId}`);
        } else {
            EventBus.dispatch(`button-modal-open-${this.props.cardId}`, {
                component: this.props.component,
                buttonKey: this.props.buttonKey,
            });
        }
        this.setState({ isActive: !this.state.isActive });
    };

    render() {
        const { title, icon } = this.props;
        const { isActive } = this.state;

        return (
            <div className='button'>
                <div className='icon' title={title} onClick={this.toggleModal}>
                    <i className={`fas ${isActive ? 'fa-times' : icon}`}></i>
                </div>
            </div>
        );
    }
}
