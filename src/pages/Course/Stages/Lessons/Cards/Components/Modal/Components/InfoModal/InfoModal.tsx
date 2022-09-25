import React, { Component } from 'react';
import './InfoModal.scss';

interface IProps {
    info: string;
}

export default class InfoModal extends Component<IProps, unknown> {
    render() {
        const { info } = this.props;
        return (
            <div className='info-modal'>
                <div className='info' dangerouslySetInnerHTML={{ __html: info }}></div>
            </div>
        );
    }
}
