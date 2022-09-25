import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import ConditionalWrapper from 'src/components/ConditionalWrapper';
import apiFile from 'src/helpers/apiFile';
import { Header } from '../../../Components';

export interface IProps {
    heading?: string;
    subHeading?: string;
    content?: string;
    sourceImage?: any;
    imagePosition?: string;
    imageUrl?: string;
    theme?: string;
    imageImportance?: boolean;
}

interface IState {
    fileUrl: string | any;
}

export default class ImagePage extends Component<IProps, IState> {
    state = {
        fileUrl: null,
    };

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

    async componentDidMount() {
        await this.setFileUrl();
    }

    render() {
        const { heading, subHeading, content, sourceImage, imagePosition, imageUrl, imageImportance } = this.props;
        const { fileUrl } = this.state;

        return (
            <div className={imagePosition !== 'BG' && imagePosition !== 'TOP' ? 'padding' : ''}>
                <ConditionalWrapper
                    condition={!!imageUrl}
                    wrapper={(children: any) => (
                        <a href={imageUrl} target='_blank' rel='noopener nofollow noreferrer'>
                            {children}
                        </a>
                    )}
                >
                    {imagePosition === 'BG' ? (
                        <>
                            <div
                                className={`background-image`}
                                style={{
                                    backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.9) 45%, rgba(255, 255, 255, 0.5) 100%), url(${
                                        typeof fileUrl === 'string' ? fileUrl : fileUrl?.[1]
                                    }) `,
                                }}
                            ></div>
                            <div className={`content content--bg`}>
                                {(heading || subHeading) && <Header heading={heading} subHeading={subHeading} />}
                                <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
                            </div>
                        </>
                    ) : sourceImage ? (
                        <FileImage
                            fileId={sourceImage}
                            imageposition={imagePosition}
                            imageImportance={imageImportance}
                        />
                    ) : (
                        <></>
                    )}
                </ConditionalWrapper>

                {imagePosition !== 'BG' && (
                    <div className={`content ${imagePosition === 'TOP' ? 'content--top' : ''}`}>
                        {(heading || subHeading) && <Header heading={heading} subHeading={subHeading} />}
                        <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
                    </div>
                )}
            </div>
        );
    }
}
