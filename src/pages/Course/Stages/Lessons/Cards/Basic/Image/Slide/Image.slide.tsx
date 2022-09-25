import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import ConditionalWrapper from 'src/components/ConditionalWrapper';
import CardButtons from 'src/components/CardButtons';
import apiFile from 'src/helpers/apiFile';
// import { Api, EventBus } from 'src/helpers/new';
import './Image.slide.scss';

export interface IProps {
    heading?: string;
    subHeading?: string;
    content?: string;
    sourceImage?: any;
    imagePosition?: string;
    imageUrl?: string;
    theme?: string;
    imageImportance?: boolean;
    imageId?: any;
    cardId?: string;
    allowEnlargeImage?: boolean;
}
interface IState {
    imgBtn?: boolean;
    imgOpen?: boolean;
    fileUrl?: string | any;
}

export default class ImageSlide extends Component<IProps, IState> {
    state: IState = {
        imgBtn: true,
        imgOpen: false,
        fileUrl: null,
    };

    async componentDidMount() {
        await this.setFileUrl();
    }

    async componentDidUpdate(prevProps: any) {
        if (this.props.cardId !== prevProps.cardId) {
            if (this.state.imgOpen) {
                this.setState({ imgOpen: false });
            }

            await this.setFileUrl();
        }
    }

    async setFileUrl() {
        const { sourceImage: fileId } = this.props;
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
        const newState: IState = { imgOpen: !this.state.imgOpen };

        this.setState(newState);
    };

    render() {
        const { imagePosition, heading, subHeading, content, imageUrl, imageImportance, allowEnlargeImage } =
                this.props,
            { fileUrl } = this.state;

        return (
            <div
                className={`image-type image-type--${imagePosition?.toLowerCase()} ${
                    imageImportance ? ' preserve-sizing' : ''
                }`}
            >
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
                <ConditionalWrapper
                    condition={!!imageUrl}
                    wrapper={(children: any) => (
                        <a href={imageUrl} target='_blank' rel='noopener nofollow noreferrer'>
                            {children}
                        </a>
                    )}
                >
                    <div
                        className='image-type__image'
                        style={{ backgroundImage: `url(${typeof fileUrl === 'string' ? fileUrl : fileUrl?.[1]})` }}
                    />
                </ConditionalWrapper>

                {(content || heading || subHeading) && (
                    <div className='image-type__content'>
                        <header>
                            {heading && <h1>{heading}</h1>}
                            {subHeading && <h3>{subHeading}</h3>}
                        </header>
                        <div
                            className='image-type__content--text'
                            dangerouslySetInnerHTML={{ __html: content ?? '' }}
                        />
                    </div>
                )}
            </div>
        );
    }
}
