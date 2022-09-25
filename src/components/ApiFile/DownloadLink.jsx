import React, { Component } from 'react';
import { apiFileFullResponse } from '../../helpers/apiFile';

export default class DownloadLink extends Component {
    state = {
        fileUrl: '',
    };

    async componentDidMount() {
        const res = await apiFileFullResponse(this.props.fileId);

        if (res !== null) {
            this.setState({
                fileUrl: Array.isArray(res.url) ? res.url[0] : res.url,
                fileName: res.fileName,
            });
        }
    }

    render() {
        const {
            props: { children },
            state: { fileUrl, fileName },
        } = this;

        return fileUrl ? (
            <a href={fileUrl} target='_blank' download={fileName} rel='noreferrer' className='text-link'>
                {children}
            </a>
        ) : (
            <></>
        );
    }
}
