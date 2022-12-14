import React from 'react';
import { Prompt } from 'react-router-dom';
import { ConfirmationModal } from '../ConfirmationModal';

export default class RouteLeavingGuard extends React.Component {
    state = {
        modalVisible: false,
        lastLocation: null,
        confirmedNavigation: false,
    };

    showModal = (location) =>
        this.setState({
            modalVisible: true,
            lastLocation: location,
        });

    closeModal = (callback) => {
        this.setState({
            modalVisible: false,
        });
    };

    handleBlockedNavigation = (nextLocation) => {
        const { confirmedNavigation } = this.state;
        const { shouldBlockNavigation } = this.props;
        if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
            this.showModal(nextLocation);
            return false;
        }

        return true;
    };

    handleConfirmNavigationClick = () => {
        const { navigate } = this.props;
        const { lastLocation } = this.state;

        if (lastLocation) {
            this.setState(
                {
                    confirmedNavigation: true,
                },
                () => {
                    navigate(lastLocation.pathname + lastLocation.search);
                }
            );
        }
    };

    render() {
        const { when } = this.props;
        const { modalVisible } = this.state;
        return (
            <>
                <Prompt when={when} message={this.handleBlockedNavigation} />
                <ConfirmationModal
                    show={modalVisible}
                    hideModal={this.closeModal}
                    confirmAction={this.handleConfirmNavigationClick}
                    titleText='Leave site?'
                    bodyText='Changes you made will not be saved.'
                    confirmButtonText='Leave'
                />
            </>
        );
    }
}