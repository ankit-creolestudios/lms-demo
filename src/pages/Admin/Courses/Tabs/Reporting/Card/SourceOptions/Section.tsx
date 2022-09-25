//@ts-nocheck
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './Section.scss';

interface IProps {
    label?: string;
}

interface IState {
    isOpen: boolean;
}

export default class Section extends Component<IProps, IState> {
    state: IState = {
        isOpen: false,
    };

    toggleIsOpen = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };

    render() {
        return (
            <div className='reporting-field-section'>
                <div className='section-header' onClick={this.toggleIsOpen}>
                    <FontAwesomeIcon icon={this.state.isOpen ? faChevronDown : faChevronRight} />
                    <span>{this.props.label}</span>
                    <div className='divider'></div>
                </div>
                {this.state.isOpen && <div className='rfs-children'>{this.props.children}</div>}
            </div>
        );
    }
}
