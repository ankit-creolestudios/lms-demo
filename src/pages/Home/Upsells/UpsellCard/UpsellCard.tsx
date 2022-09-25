import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import './UpsellCard.scss';

export interface IUpsell {
    _id: string;
    packageId: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    image: string;
    importance: number;
    orderIndex: number;
    title: string;
    upsoldPackageId: string;
}

interface IProps {
    upsell: IUpsell;
}

export default class UpsellCard extends Component<IProps> {
    render() {
        const { upsell } = this.props;

        return (
            <div className='upsell-card'>
                <FileImage className='image' fileId={upsell.image} />
                <div className='content'>
                    <h2>{upsell.title}</h2>
                    <div>{upsell.description}</div>
                    <a href='#'>Buy Course</a>
                </div>
            </div>
        );
    }
}
