import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import './ImageModal.scss';

interface IProps {
    imageId: string;
}

export default class ImageModal extends Component<IProps> {
    render() {
        const { imageId } = this.props;
        return (
            <div className='image-modal'>
                <FileImage fileId={imageId} />
            </div>
        );
    }
}
