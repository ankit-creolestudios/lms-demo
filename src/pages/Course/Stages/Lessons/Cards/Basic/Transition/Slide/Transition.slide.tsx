import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import './Transition.slide.scss';

export interface IProps {
    sourceImage?: string;
    sourceIcon: string;
    content?: string;
    iconPosition: string;
    theme?: string;
}

interface IState {}

export default class TransitionCard extends Component<IProps> {
    render() {
        const { sourceImage, sourceIcon, content, iconPosition = 'TOP' } = this.props;

        return (
            <div
                className={`${iconPosition.toLowerCase()} ${
                    sourceImage ? 'transition-card-with-background-image' : ''
                }`}
            >
                {sourceImage && <FileImage fileId={sourceImage} />}
                {sourceIcon && (
                    <div className='icon'>
                        <FileImage fileId={sourceIcon} />
                    </div>
                )}
                <div className='content' dangerouslySetInnerHTML={{ __html: content ?? '' }} />
            </div>
        );
    }
}
