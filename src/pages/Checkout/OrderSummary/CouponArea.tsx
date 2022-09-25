import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import CheckoutContext from 'src/pages/Checkout/CheckoutContext';

type IProps = RouteComponentProps & {
    setGlobalAlert: (payload: any) => void;
    packages: any[];
};

interface IState {
    isInputActive: boolean;
    couponCode?: string;
    userCode?: string;
}

class CouponArea extends Component<IProps, IState> {
    static contextType = CheckoutContext;

    state: IState = {
        isInputActive: false,
        couponCode: this.context?.couponCode ?? '',
        userCode: this.context?.couponCode ?? '',
    };

    async componentDidMount() {
        await this.checkAndApplyUrlCoupon();
    }

    preventSpaceInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Space') {
            e.preventDefault();
            return false;
        }
    };

    onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            userCode: (e.target as EventTarget & HTMLInputElement).value,
        });
    };

    showInput = async () => {
        if (this.state.couponCode) {
            await this.removeCouponCode();
        }

        this.setState({
            isInputActive: true,
        });
    };

    checkAndApplyUrlCoupon = async () => {
        const query = new URLSearchParams(this.props.location.search);
        const code = query.get('couponCode');

        if (code && !this.state.couponCode) {
            await this.removeCouponCode();
            this.applyCoupon(code);
        }
    };

    removeCouponCode = async (): Promise<void> => {
        this.context.updateCart({ couponCode: null });
    };

    applyCoupon = async (couponCode: string = this.state.userCode ?? '') => {
        this.context.updateCart({ couponCode }, () => {}, this.applyCouponSuccess);
    };

    applyCouponSuccess = (raw: any) => {
        this.setState({
            isInputActive: false,
            couponCode: raw.data.couponCode,
        });
    };

    render() {
        const { isInputActive, couponCode, userCode } = this.state;

        if (isInputActive) {
            return (
                <div className='coupon-input'>
                    <input
                        type='text'
                        value={userCode}
                        onKeyDown={this.preventSpaceInput}
                        onChange={this.onInputChange}
                    />
                    <button onClick={() => this.applyCoupon()}>Apply</button>
                </div>
            );
        }

        return (
            <span className='coupon-link' onClick={this.showInput}>
                {couponCode ? `Applied coupon: ${couponCode}` : 'Have a coupon?'}
            </span>
        );
    }
}

export default withRouter(CouponArea);
