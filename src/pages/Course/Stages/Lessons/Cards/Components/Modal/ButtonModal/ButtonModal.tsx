import React, { Component } from 'react';
import { EventBus } from 'src/helpers/new';
import './ButtonModal.scss';

interface IProps {
    cardId: string;
}

interface IState {
    activeKey?: string;
    activeComponent?: JSX.Element;
}

export default class ButtonModal extends Component<IProps, IState> {
    state: IState = {};

    componentDidMount() {
        const { cardId } = this.props;
        EventBus.on(`button-modal-open-${cardId}`, this.openModal);
        EventBus.on(`button-modal-close-${cardId}`, this.closeModal);
    }

    componentWillUnmount() {
        const { cardId } = this.props;
        EventBus.remove(`button-modal-open-${cardId}`, this.openModal);
        EventBus.remove(`button-modal-close-${cardId}`, this.closeModal);
    }

    openModal = (event: Event) => {
        const { component, key } = (event as CustomEvent).detail;
        this.setState({ activeComponent: component, activeKey: key });
        EventBus.dispatch(`button-modal-opened-${this.props.cardId}`, key);
    };

    closeModal = () => {
        this.setState({ activeComponent: undefined });
    };

    render() {
        const { activeComponent } = this.state;

        if (activeComponent) {
            return <div className='button-modal'>{activeComponent}</div>;
        }

        return <></>;
    }
}
