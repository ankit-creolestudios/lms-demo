import React, { Component } from 'react';
import { apiFileFullResponse } from 'src/helpers/apiFile';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import './FileImage.scss';


export default class FileImage extends Component {
    state = {
        fileUrl: '',
    };

    async componentDidMount() {
        await this.setFileUrl();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.fileId !== this.props.fileId) {
            await this.setFileUrl();
        }
    }

    async setFileUrl() {
        const { fileId } = this.props;

        if (Array.isArray(fileId) || (typeof fileId === 'string' && fileId.includes('http'))) {
            this.setState({
                fileUrl: fileId,
            });

            return;
        }

        if (fileId instanceof File) {
            this.setState({
                fileUrl: URL.createObjectURL(fileId),
            });

            return;
        }
        const response = await apiFileFullResponse(fileId);
        if(response) this.setState({fileUrl: response.url});
    }

    get className() {
        const { fileUrl } = this.state,
            { className: forwardClassName } = this.props;
        let className = 'file-image';

        if (!fileUrl) {
            className += ' loading';
        }

        if (forwardClassName) {
            className += ` ${forwardClassName}`;
        }

        return className;
    }

    render() {
        const { fileUrl } = this.state,
            { fileId, src, imageImportance, ...rest } = this.props;

        if (!fileUrl) {
            return (
                <div className={this.className}>
                    <Fa icon={faImage} />
                </div>
            );
        }

        let imageClass = '';

        if(imageImportance !== undefined) {
            if(imageImportance) {
                imageClass = 'file-image--contain'
            } else {
                imageClass = 'file-image--cover'
            }
        }

        if (Array.isArray(fileUrl)) {
            return (
                <img
                    className={`${this.className} file-image--${this.props.imageposition} ${imageClass}`}
                    src={fileUrl[2]}
                    srcSet={`${fileUrl[2]} 400w, ${fileUrl[1]} 800w`}
                    {...rest}
                />
            );
        }

        return <img className={this.className} src={fileUrl} {...rest} />;
    }
}
