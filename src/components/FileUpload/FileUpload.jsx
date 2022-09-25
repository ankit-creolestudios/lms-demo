import React, { Component } from 'react';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';

export default class FileUpload extends Component {
    state = {
        fileVal: '',
        fileUrl: '',
        showError: false,
    };

    componentDidUpdate(prevProps, prevState) {
        const newState = {};

        if (this.props.url !== prevState.fileUrl) {
            newState.fileUrl = this.props.url;
        }
        if (this.props.deletedAt !== null && this.props.deletedAt !== prevProps.deletedAt) {
            newState.fileVal = '';

            if (this.props.handleFileChange) {
                this.props.handleFileChange(this.props.type, undefined, undefined);
            }

            if (this.props.onChange) {
                this.props.onChange(
                    {
                        target: {
                            name: this.props.name,
                        },
                    },
                    undefined,
                    undefined
                );
            }
        }

        if (Object.keys(newState).length !== 0) {
            this.setState(newState);
        }
    }

    handleFileChange = (event) => {
        if (event.target.value) {
            const file = event.target.files[0],
                url = URL.createObjectURL(file);
            const extension = '.' + file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);
            if (this.props.accept === undefined || (this.props.accept && this.props.accept.includes(extension))) {
                this.setState({
                    fileVal: event.target.value,
                    fileUrl: url,
                    showError: false,
                });

                if (this.props.handleFileChange) {
                    this.props.handleFileChange(this.props.type, url, file);
                }

                if (this.props.onChange) {
                    this.props.onChange(event, file, url);
                }

                if (this.props.updatePreviewUrl) {
                    this.props.updatePreviewUrl(url);
                }
            } else {
                this.setState({ showError: true });
            }
        }
    };

    render() {
        return (
            <div>
                <label>
                    {this.props.label ?? this.props.type[0].toUpperCase() + this.props.type.substr(1).toLowerCase()}
                    {this.props.deleteFileHandle && (
                        <div className='bd' onClick={this.props.deleteFileHandle}>
                            <Fa icon={faTrashAlt} />
                        </div>
                    )}
                </label>
                <br />
                {!!this.props.description && <small>{this.props.description}</small>}
                <input
                    type='file'
                    className='mb-2'
                    accept={
                        this.props.type === 'image'
                            ? '.png,.jpg,.jpeg,.webp,.svg'
                            : this.props.type === 'audio'
                            ? '.mp3,.wav,.m4a,.mp4,.wma,.aac'
                            : this.props.type === 'video'
                            ? '.mp4,.mov,.wmv,.flv,.avi,.mkv,.webm'
                            : this.props.type === 'document'
                            ? '.doc,.pdf'
                            : this.props.accept
                            ? this.props.accept
                            : ''
                    }
                    value={this.state.fileVal}
                    id={this.props.id}
                    name={this.props.name}
                    onChange={this.handleFileChange}
                    disabled={this.props.disabled}
                    required={this.props.required}
                />
                {this.state.showError && (
                    <div className='text-danger'>Only {this.props.accept.replaceAll('.', '')} files are allowed</div>
                )}
                <br />
                {!!this.state.fileUrl && this.props.type === 'image' && (
                    <img
                        src={Array.isArray(this.state.fileUrl) ? this.state.fileUrl[2] : this.state.fileUrl}
                        style={{ height: '115px', objectFit: 'cover' }}
                    />
                )}

                {!!this.state.fileUrl && this.props.type === 'audio' && (
                    <audio controls='controls' src={this.state.fileUrl} />
                )}

                {!!this.state.fileUrl && this.props.type === 'video' && (
                    <video height='200' width='300' controls='controls' src={this.state.fileUrl} />
                )}

                {!!this.state.fileUrl && this.props.type === 'document' && (
                    <div>
                        <iframe
                            style={{
                                width: '100%',
                                height: '800px',
                            }}
                            src={this.state.fileUrl}
                        ></iframe>
                    </div>
                )}
            </div>
        );
    }
}
