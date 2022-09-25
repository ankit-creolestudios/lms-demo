import React, { Component } from 'react';
import { BiTimer } from 'react-icons/bi';
import { Link } from 'react-router-dom';

export interface IProps {
    _id: string;
    importance: number;
    discountType: string;
    packageId: string;
    upsoldPackageId: string;
    discountValue: number;
    displayLocations: DisplayLocations;
    discountLocations: DiscountLocations;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
    upsoldPackage: UpsoldPackage;
}

export interface DisplayLocations {
    cart: boolean;
    suggestion: boolean;
    thankYou: boolean;
    dashboard: boolean;
}

export interface DiscountLocations {
    cart: boolean;
    suggestion: boolean;
    thankYou: boolean;
    dashboard: boolean;
}

export interface UpsoldPackage {
    _id: string;
    taxType: string;
    taxValue: number;
    upsell: any[];
    title: string;
    description: string;
    image: string[];
    publishDate: string;
    unpublishDate: any;
    price: number;
    courses: Course[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    hideProduct: boolean;
    state: string;
    locationsUpsellsType: LocationsUpsellsType;
    division: string;
}

export interface Course {
    conditionStatement: string;
    courseId: string;
}

export interface LocationsUpsellsType {
    cart: string;
    suggestion: string;
    thankYou: string;
    dashboard: string;
}

export default class Upsell extends Component<IProps> {
    state = {};

    addUpsellToCart = async () => {};

    render() {
        const { title, image, description, price, _id } = this.props.upsoldPackage,
            { discountType, discountValue } = this.props,
            newPrice = price - (discountType === 'FIXED' ? discountValue : (price * discountValue) / 100);

        return (
            <div className='confirmation__upsell'>
                <img src={image[2]} alt={title} />
                <div className='main'>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                <div className='cta'>
                    <Link to={`/checkout`}>
                        <button>Add to Cart</button>
                    </Link>
                    <div>
                        {newPrice !== price && <BiTimer />}
                        <span className='confirmation__upsell-price'>{global.USCurrency.format(newPrice)}</span>
                        {newPrice !== price && (
                            <>
                                <span className='confirmation__upsell-oldprice'>{global.USCurrency.format(price)}</span>
                                <span className='confirmation__upsell-discount'>
                                    {discountType === 'FIXED'
                                        ? global.USCurrency.format(discountValue) + ' off'
                                        : `${discountValue}% off`}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
