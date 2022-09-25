import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Api, EventBus } from 'src/helpers/new';
import { Spinner } from 'src/components/Spinner';
import { Progress, TabContent } from './';
import CheckoutContext from './CheckoutContext';
import OrderSummary from './OrderSummary';
import './Checkout.scss';
import { getState, removeState, setState } from 'src/helpers/localStorage';

class Checkout extends Component {
    state = {
        status: 'LOADING',
        currentTab: 0,
        packages: [],
        upsells: [],
        courses: [],
        contact: {},
        residentialAddress: {
            state: 'AL',
            country: 'US',
            streetLines: [''],
        },
        billingAddress: {
            state: 'AL',
            country: 'US',
            streetLines: [''],
        },
        state: '',
        title: '',
        tabs: [
            { title: 'Your Order', completed: true },
            { title: 'Contact Info', completed: false },
            { title: 'Address', completed: false },
            { title: 'Billing Info', completed: false },
            { title: 'Payment', completed: false },
        ],
        user: {},
        couponCode: null,
    };

    async componentDidMount() {
        const cartId = getState('reuCheckoutCartId');
        const newCartData = this?.props?.location?.state || getState('cartPackageId');
        if (!cartId && newCartData) {
            await this.createCartFromPackage();
        } else {
            await this.loadCartData();
            if (cartId && newCartData) {
                await this.updateCart();
            } else if (!cartId && !newCartData) {
                EventBus.dispatch('toast', {
                    type: 'error',
                    message: 'Your Cart is Empty. Go back and Add something to your Cart.',
                });
                this.props.history.push('/');
            }
        }

        if (this.props.loggedIn.user) {
            await this.loadUserData();
        }

        removeState('cartPackageId');
        window.history.replaceState(null, '');
    }

    getPackageType = (ERArr) => {
        if (ERArr.includes(true) && ERArr.includes(false)) {
            return 'extension_repurchase';
        } else if (ERArr.includes(true) && !ERArr.includes(false)) {
            return 'repurchase';
        } else if (!ERArr.includes(true) && ERArr.includes(false)) {
            return 'extension';
        } else {
            return 'new';
        }
    };

    createCartFromPackage = async () => {
        // pull packageId from query params, aslo sort coupon code as well
        const ERData = this?.props?.location?.state ? Object.values(this?.props?.location?.state) : [];
        const ERArr = [];
        const ERCourses = [];

        if (!!ERData) {
            Object.keys(ERData).map((course) => {
                ERArr.push(ERData?.[course].hasOwnProperty('repurchase'));
                const courseData = {
                    _id: course,
                    days: ERData?.[course]?.days,
                    price: ERData?.[course]?.price,
                    purchaseType: ERData?.[course].hasOwnProperty('repurchase') ? 'repurchase' : 'extension',
                };
                ERData?.[course].hasOwnProperty('repurchase') && delete courseData.days;
                ERCourses.push(courseData);
            });
        }
        const { success, response } = await Api.call('post', `checkout/cart/create/${getState('cartPackageId')}`, {
            packagePurchaseType: this.getPackageType(ERArr) ?? 'new',
            courses: ERData,
        });

        if (success) {
            setState('reuCheckoutCartId', response._id);
            setState('reuCheckoutCurrentTab', 0);

            this.setCartData(response, { status: 'READY' });
        }
    };

    loadCartData = async () => {
        const cartId = getState('reuCheckoutCartId');
        const { response } = await Api.call('get', `checkout/cart/${cartId}`);

        let tabs = Array.from(this.state.tabs);

        tabs[1].completed = !!response?.contact;
        tabs[2].completed = !!response?.residentialAddress;
        tabs[3].completed = !!response?.billingAddress;

        const additional = {
            tabs,
            currentTab: parseInt(localStorage.getItem('reuCheckoutCurrentTab')) || 0,
            status: 'READY',
        };

        this.setCartData(response, additional);
    };

    setCartData = (cartData, additional, callback) => {
        const allCartData = [...cartData.packages, ...cartData.courses];

        this.setState(
            {
                packages: allCartData,
                title: cartData.packages[0]?.title,
                upsells: cartData?.upsells ?? [],
                state: cartData?.state,
                residentialAddress: cartData?.residentialAddress ?? {
                    streetLines: [''],
                },
                billingAddress: cartData?.billingAddress ?? {
                    streetLines: [''],
                },
                contact: cartData?.contact ?? {
                    firstName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                },
                couponCode: cartData?.couponCode ?? null,
                ...additional,
            },
            callback
        );
    };

    loadUserData = async () => {
        const { response } = await Api.call('get', `users/${this.props.loggedIn.user._id}`);

        let contact = {
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            phoneNumber: response.phoneNumber,
        };

        let residentialAddress = {
            state: response.state,
            streetLines: [response.addressLineOne],
            town: response.townCity,
            zipCode: response.zipCode,
            ...this.state.residentialAddress,
        };

        const { country, firstName, lastName, state, streetLines, town, zipCode } = response.billingAddress;

        let stateBillingAddress = Object.assign(this.state.billingAddress);

        if (stateBillingAddress.streetLines[0] === '') {
            delete stateBillingAddress.streetLines;
        }

        let billingAddress = {
            country,
            firstName,
            lastName,
            state,
            town,
            zipCode,
            streetLines,
            ...stateBillingAddress,
        };

        this.setState({
            user: response,
            contact,
            residentialAddress,
            billingAddress,
        });
    };

    updateCart = async (cartData, onError = () => {}, onSuccess = () => {}) => {
        const cartId = getState('reuCheckoutCartId');
        const newData = this?.props?.location?.state;
        let updatedCartData = {
            packages: this.state.packages.filter((pkg) => pkg.hasOwnProperty('packagePurchaseType')),
            courses: this.state.packages.filter((pkg) => pkg.hasOwnProperty('purchaseType')),
            ...cartData,
        };

        if (!cartData) {
            if (newData) {
                const updatedCourses = [...updatedCartData.courses];
                const updatedCoursesIds = updatedCourses.map((course) => course._id);
                const newUpdatedData = Object.values(newData);
                for (let i = 0; i < newUpdatedData.length; i++) {
                    if (updatedCoursesIds.includes(newUpdatedData[i]._id)) {
                        const updatedCourseIndex = updatedCourses.findIndex(
                            (data) => data._id === newUpdatedData[i]._id
                        );
                        updatedCourses.splice(updatedCourseIndex, 1, newUpdatedData[i]);
                    } else {
                        updatedCourses.push(newUpdatedData[i]);
                    }
                }
                updatedCartData.courses = updatedCourses;
            } else {
                if (!updatedCartData.packages.map((data) => data._id).includes(getState('cartPackageId'))) {
                    updatedCartData.packages = [
                        ...updatedCartData.packages,
                        {
                            _id: getState('cartPackageId'),
                            packagePurchaseType: 'new',
                            isUpsell: false,
                            isBundle: false,
                        },
                    ];
                }
            }
        }
        const { success, response, raw } = await Api.call('patch', `checkout/cart/${cartId}`, updatedCartData);

        if (success) {
            this.setCartData(response, { status: 'READY' }, () => onSuccess(raw));
        } else {
            onError(raw);
        }
    };

    switchTab = (tabIndex, complete = false) => {
        const tabs = [...this.state.tabs];
        if (complete) {
            tabs[this.state.currentTab].completed = true;
        }

        localStorage.setItem('reuCheckoutCurrentTab', tabIndex);
        this.setState({ currentTab: tabIndex, tabs });
    };

    render() {
        const { status, state } = this.state;

        return (
            <CheckoutContext.Provider
                value={{
                    ...this.state,
                    updateCart: this.updateCart,
                    switchTab: this.switchTab,
                }}
            >
                <div className='checkout-container'>
                    <h1 className='heading'>
                        The fastest and most affordable way to become a licensed real estate agent in {state}!
                    </h1>
                    <div className='checkout-main'>
                        {status === 'READY' ? (
                            <>
                                <OrderSummary />
                                <Progress />
                                <TabContent />
                            </>
                        ) : (
                            <Spinner />
                        )}
                    </div>
                </div>
            </CheckoutContext.Provider>
        );
    }
}

export default connect((state) => {
    return {
        loggedIn: state.loggedIn,
    };
})(withRouter(Checkout));
