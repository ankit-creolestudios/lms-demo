import React, { Component } from 'react';
import { setState } from 'src/helpers/localStorage';
import { Api } from 'src/helpers/new';
import './ShareButton.scss';

interface IProps {
    packageId: string;
}

interface IState {
    allowSharing: boolean;
    couponCode?: string;
}

export default class ShareButton extends Component<IProps, IState> {
    state: IState = {
        allowSharing: false,
    };

    async componentDidMount() {
        const { packageId } = this.props;
        const { success, response } = await Api.call('get', `discounts/codes/packages/${packageId}`);

        if (success && response.allowed) {
            this.setState({
                allowSharing: true,
                couponCode: response.code,
            });
        }
    }

    copyAffiliateLink = async () => {
        const { packageId } = this.props;
        const { couponCode } = this.state;
        await navigator.clipboard.writeText(`${process.env.REACT_APP_URL}/checkout?couponCode=${couponCode}`);
        setState('cartPackageId', packageId);
    };

    render() {
        const { allowSharing } = this.state;
        if (!allowSharing) return null;

        return (
            <button className='home-share-button' onClick={this.copyAffiliateLink}>
                <i className='fa fa-share-alt' />
            </button>
        );
    }
}
