import React, { Component } from 'react';
import { BiTimer } from 'react-icons/bi';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import CheckoutContext from '../../CheckoutContext';

export interface IUpsell {
    _id: string;
    discountValue: number;
    discountType: string;
    upsoldPackage: {
        price: number;
        title: string;
        image: string;
        description: string;
    };
}

class Upsell extends Component<IUpsell & RouteComponentProps> {
    static contextType = CheckoutContext;

    state = {
        status: 'LOADING',
    };

    addUpsellToCart = async () => {
        const { _id, discountValue, discountType } = this.props;
        const { price, title, image } = this.props.upsoldPackage;
        const discountedPrice = price - (discountType === 'FIXED' ? discountValue : (price * discountValue) / 100);

        const packageData = {
            _id,
            title,
            image,
            price,
            discountedPrice,
            isUpsell: true,
            isBundle: false,
            packagePurchaseType: 'new',
        };

        const packages = Array.from(this.context.packages);
        packages.push(packageData);

        this.context.updateCart({
            packages: [...packages.filter((pkg: any) => pkg.hasOwnProperty('packagePurchaseType'))],
        });
    };

    render() {
        const { title, image, description, price } = this.props.upsoldPackage,
            { discountType, discountValue } = this.props,
            discountedPrice = price - (discountType === 'FIXED' ? discountValue : (price * discountValue) / 100);

        return (
            <div className='checkout-upsells__item'>
                <img src={image[2]} alt={title} />
                <main className='checkout-upsells__itemData'>
                    <h1>{title}</h1>
                    <span>{description}</span>
                </main>
                <div>
                    <button className='sm light-blue' onClick={this.addUpsellToCart}>
                        Add to cart
                    </button>
                    <div>
                        {discountedPrice !== price && <BiTimer />}
                        <span className='checkout-upsells__price'>{global.USCurrency.format(discountedPrice)}</span>
                        {discountedPrice !== price && (
                            <>
                                <span className='checkout-upsells__oldPrice'>{global.USCurrency.format(price)}</span>
                                <span className='checkout-upsells__discount'>
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

export default withRouter(Upsell);
