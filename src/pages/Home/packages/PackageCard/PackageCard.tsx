import React, { Component, ReactNode } from 'react';
import { FileImage } from 'src/components/ApiFile';
import ShareButton from '../ShareButton';
import Courses from './Courses';
import './PackageCard.scss';

export interface IPackage {
    _id: string;
    packageId: string;
    userId: string;
    course: any | null;
    data: any;
    invoice: any;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface IProps {
    userPackage: IPackage;
}

export default class PackageCard extends Component<IProps> {
    render(): ReactNode {
        const { _id, packageId } = this.props.userPackage;
        const { title, description, image } = this.props.userPackage.data;

        return (
            <div className='package-card'>
                <div className='package-contents'>
                    <FileImage className='image' fileId={image} />
                    <div className='description'>
                        <h3>{title}</h3>
                        <div dangerouslySetInnerHTML={{ __html: description }} />
                    </div>
                </div>
                <Courses packageId={_id} />
                <ShareButton packageId={packageId} />
            </div>
        );
    }
}
