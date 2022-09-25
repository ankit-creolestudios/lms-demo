import React, { Component } from 'react';
import apiFile from '../../helpers/apiFile';

export default class FileIFrame extends Component {
    state = {
        fileUrl: '',
    };

    async componentDidMount() {
        const { fileId } = this.props;

        if (fileId instanceof File) {
            this.setState({
                fileUrl: URL.createObjectURL(fileId),
            });
        } else {
            this.setState({
                fileUrl: await apiFile(fileId),
            });
        }
    }

    render() {
        const { fileUrl } = this.state;

        return fileUrl ? <iframe ref={this.onIframeRef} src={fileUrl}></iframe> : <></>;
    }
}
