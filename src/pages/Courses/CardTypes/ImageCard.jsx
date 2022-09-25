import React, { Component } from 'react';
import { FileImage } from '../../../components/ApiFile';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import CardButtons from '../../../components/CardButtons';
import apiFile from '../../../helpers/apiFile';
import './ImageCard.scss';

export default class ImageCard extends Component {
    state = {
        infoOpen: false,
        imgBtn: true,
        imgOpen: false,
        fileUrl: null,
    };

    toggleInfo = () => {
        const newState = { infoOpen: !this.state.infoOpen };

        if (this.state.imgOpen) {
            newState.imgOpen = !this.state.imgOpen;
        }

        this.setState(newState);
    };

    async setFileUrl() {
        const { imageId: fileId } = this.props;
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

        this.setState({
            fileUrl: await apiFile(fileId),
        });
    }

    toggleImg = () => {
        const newState = { imgOpen: !this.state.imgOpen };

        if (this.state.infoOpen) {
            newState.infoOpen = !this.state.infoOpen;
        }

        this.setState(newState);
    };

    async componentDidMount() {
        await this.setFileUrl();
    }

    async componentDidUpdate(prevProps) {
        if (this.props.cardId !== prevProps.cardId) {
            if (this.state.infoOpen || this.state.imgOpen) {
                this.setState({ imgOpen: false, infoOpen: false });
            }

            await this.setFileUrl();
        }
    }

    render() {
        const { imagePosition, heading, subHeading, content, imageUrl, imageImportance, info, allowEnlargeImage } =
                this.props,
            { fileUrl } = this.state;

        return (
            <div
                className={`lesson-cards__image-type lesson-cards__image-type--${imagePosition?.toLowerCase()} ${
                    imageImportance ? ' preserve-sizing' : ''
                }`}>
                {/* Adding info and image modal and toggle buttons */}
                {fileUrl && allowEnlargeImage && (
                    <CardButtons
                        imgBtn={this.state.imgBtn}
                        toggleImg={this.toggleImg}
                        imgPosition={imagePosition}
                        imgOpen={this.state.imgOpen}
                        imgId={fileUrl}
                    />
                )}
                {info && (
                    <CardButtons
                        info={info}
                        toggleInfo={this.toggleInfo}
                        infoOpen={this.state.infoOpen}
                        imgPosition={imagePosition}
                    />
                )}
                <ConditionalWrapper
                    condition={!!imageUrl}
                    wrapper={(children) => (
                        <a href={imageUrl} target='_blank' rel='noopener nofollow noreferrer'>
                            {children}
                        </a>
                    )}>
                    <div
                        className='lesson-cards__image-type__image'
                        style={{ backgroundImage: `url(${typeof fileUrl === 'string' ? fileUrl : fileUrl?.[1]})` }}
                    />
                </ConditionalWrapper>

                {(content || heading || subHeading) && (
                    <div className='lesson-cards__image-type__content'>
                        <header>
                            {heading && <h1>{heading}</h1>}
                            {subHeading && <h3>{subHeading}</h3>}
                        </header>
                        <div
                            className='lesson-cards__image-type__content--text'
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                )}
            </div>
        );
    }
}
