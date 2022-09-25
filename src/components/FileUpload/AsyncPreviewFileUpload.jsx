import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { FileUpload } from '.';
import apiCall from '../../helpers/apiCall';
import apiFile from '../../helpers/apiFile';
import './AsyncPreviewFileUpload.scss';

export default class AsyncPreviewFileUpload extends Component {
    state = {
        fileUrl: '',
        deletedAt: null,
    };

    async componentDidMount() {
        const { file } = this.props;
        let fileUrl = file;

        if (file && typeof file === 'string' && file.substr(0, 4) !== 'blob') {
            fileUrl = await apiFile(file);
        }

        this.setState({
            fileUrl,
        });
    }

    updateFileUrl = (fileUrl) => {
        this.setState({
            fileUrl,
        });
    };

    deleteFileHandle = async () => {
        const { file } = this.props;

        if (file && typeof file === 'string' && file.substr(0, 4) !== 'blob') {
            await apiCall('DELETE', `/files/${file}`);
        }

        this.setState({ fileUrl: '', deletedAt: new Date().getTime() }, () => {
            this.setState({
                deletedAt: null,
            });
        });
    };

    render() {
        const {
            props: { file, ...rest },
            state: { fileUrl, deletedAt },
        } = this;

        return (
            <div className='asyncpreview-fileupload'>
                <FileUpload
                    {...rest}
                    deletedAt={deletedAt}
                    url={fileUrl}
                    updatePreviewUrl={this.updateFileUrl}
                    deleteFileHandle={this.deleteFileHandle}
                />
            </div>
        );
    }
}
