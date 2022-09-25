import React, { Component } from 'react';
import { FaDesktop, FaMobileAlt } from 'react-icons/fa';
import './PreviewWrapper.scss';

export default class PreviewWrapper extends Component {
    state = {
        isMobile: false,
    };

    toggleIsMobile = () => {
        this.setState({
            isMobile: !this.state.isMobile,
        });
    };

    render() {
        const { isMobile } = this.state;

        return (
            <div className={`preview-wrapper${isMobile ? ' preview-wrapper--mobile' : ''}`}>
                <div className='preview-wrapper__toggle' onClick={this.toggleIsMobile}>
                    <FaDesktop className={!isMobile ? 'active' : ''} />
                    <FaMobileAlt className={isMobile ? 'active' : ''} />
                </div>
                <div className='preview-wrapper__container'>{this.props.children}</div>
            </div>
        );
    }
}
