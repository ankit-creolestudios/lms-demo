import { startCase } from 'lodash';
import React, { Component } from 'react';
import { BiTrashAlt } from 'react-icons/bi';
import { Api, EventBus } from 'src/helpers/new';
import CouponArea from 'src/pages/Checkout/OrderSummary/CouponArea';
import CheckoutContext from '../CheckoutContext';
import './OrderSummary.scss';

export default class OrderSummary extends Component {
    static contextType = CheckoutContext;

    state = {
        taxes: 0,
        imageSetCount: 0,
        imageArr: [],
    };

    async componentDidMount() {
        EventBus.on('set-tax-value', this.updateTaxString);

        if (!this.context.packages[0].packagePurchaseType && !Array.isArray(this.context.packages[0].image)) {
            await this.context.packages.map(async (data) => {
                const imgUrl = await this.getImageUrl(data.course[0].image);
                this.setState({
                    imageArr: [...this.state.imageArr, imgUrl],
                });
            });
        }
    }

    componentWillUnmount() {
        EventBus.remove('set-tax-value', this.updateTaxString);
    }

    updateTaxString = (event) => {
        const taxes = event.detail;
        this.setState({
            taxes,
        });
    };

    removePackageFromCart = (packageId) => async () => {
        const filteredPackages = this.context.packages.filter(
            (pkg) => pkg?._id !== packageId && pkg.hasOwnProperty('packagePurchaseType')
        );

        this.context.updateCart({ packages: filteredPackages });
    };

    getImageUrl = async (id) => {
        const { response } = await Api.call('get', `files/${id}`);
        return response.url[2];
    };

    render() {
        const { currentTab, packages } = this.context;
        if (![0, 4].includes(currentTab)) {
            return <></>;
        }

        let totalPrice = 0;

        return (
            <div className='checkout-summary'>
                <h2 className='heading'>Order Summary</h2>
                <div className='products'>
                    {packages.map((pkg, index) => {
                        totalPrice += pkg.discountedPrice ?? pkg.price;
                        return (
                            // old
                            <div key={pkg.packageId ?? pkg._id + pkg?.type ?? 'PACKAGE'} className='product'>
                                <img src={pkg?.image?.[2]} alt={pkg.title} />
                                <div className='details'>
                                    <div className='details-row'>
                                        <div>
                                            <h3 className='name'>{pkg.title}</h3>
                                            {pkg.purchaseType && <p>({startCase(pkg.purchaseType)})</p>}
                                        </div>
                                        <span className='price'>
                                            {pkg.discountedPrice && pkg.discountedPrice !== pkg.price ? (
                                                <>
                                                    {global.USCurrency.format(pkg.discountedPrice)}
                                                    <span className='old'>{global.USCurrency.format(pkg.price)}</span>
                                                </>
                                            ) : (
                                                <>{global.USCurrency.format(pkg.price)}</>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                {pkg.purchaseType === 'extension' ||
                                    pkg.purchaseType === 'repurchase' ||
                                    (index !== 0 && (
                                        <div className='order-package-controls'>
                                            <div className='delete' onClick={this.removePackageFromCart(pkg._id)}>
                                                <BiTrashAlt />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        );
                    })}

                    <div className='total'>
                        <h2 className='label'>
                            Estimated Total&nbsp;
                            {packages[0].packagePurchaseType && (
                                <span className='coupon-wrapper'>
                                    <CouponArea packages={packages} />
                                </span>
                            )}
                        </h2>
                        <h2 className='value'>{global.USCurrency.format(totalPrice)}</h2>
                    </div>
                    <div className='tax-total'>
                        <p className='tax-label'>Taxes (based on billing address)</p>
                        {currentTab !== 0 ? (
                            <p className='tax-value'>
                                {'$'}
                                {this.state.taxes}
                            </p>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
