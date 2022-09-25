import React, { Component, ReactNode } from 'react';
import { Api } from 'src/helpers/new';
import { FaTimes } from 'react-icons/fa';
import './Banner.scss';

interface IState {
    showBanner: boolean;
    bannerData: string;
}

interface IProps {}
export default class Banner extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            showBanner: false,
            bannerData: '',
        };
    }

    componentDidMount = async () => {
        const { success, response } = await Api.call('GET', '/user-announcements');
        if (success) {
            if (response.length > 0) {
                this.setState({
                    bannerData: response[0]?.announcementTitle,
                    showBanner: true,
                });
            }
        }
    };

    render(): ReactNode {
        const { bannerData, showBanner } = this.state;

        return (
            showBanner && (
                <div className='package-banner'>
                    <FaTimes
                        className='package-banner-close'
                        onClick={() =>
                            this.setState({
                                showBanner: false,
                            })
                        }
                    />
                    <span className='banner-span' dangerouslySetInnerHTML={{ __html: bannerData }}></span>
                </div>
            )
        );
    }
}
