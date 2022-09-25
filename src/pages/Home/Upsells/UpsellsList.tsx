import React, { Component } from 'react';
import { Api } from 'src/helpers/new';
import UpsellCard, { IUpsell } from './UpsellCard';
import './UpsellsList.scss';

interface IProps {
    userId: string;
}

interface IState {
    upsells: IUpsell[];
}

export default class UpsellsList extends Component<IProps, IState> {
    state = {
        upsells: [],
    };
    componentDidMount() {
        this.loadUpsells();
    }

    loadUpsells = async (): Promise<void> => {
        const { success, response } = await Api.call('GET', `users/upsells`, null, { location: 'dashboard' });
        if (success) {
            this.setState({
                upsells: response,
            });
        }
    };

    render() {
        const { upsells } = this.state;
        return (
            <div className='upsells-list'>
                <h2>Our Recommendations</h2>
                {upsells.map((upsell: IUpsell) => {
                    return <UpsellCard upsell={upsell} key={upsell._id} />;
                })}
            </div>
        );
    }
}
