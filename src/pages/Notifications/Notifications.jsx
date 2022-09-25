import React, { Component } from 'react';
import './Notifications.scss';
import Notification from './Notification';
import { Col, Row, Spinner } from 'react-bootstrap';
import { Api } from 'src/helpers/new';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';

export default class Notifications extends Component {
    constructor(props) {
        super(props);

        this.state = {
            unreadCount: 0,
            notificationsList: [],
            loading: false,
            pageNo: 1,
        };
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.pageNo !== this.state.pageNo) {
            this.loadNotifications(this.state.pageNo);
        }
    };

    loadNotifications = async (pageNo) => {
        if (!this.state.loading) {
            this.setState({
                loading: true,
            });
        }

        const { response, success } = await Api.call('GET', `/users/notifications/all?page=${pageNo ? pageNo : 1}`);

        if (success) {
            this.setState({
                unreadCount: response.unreadCount,
                notificationsList: response.docs,
                totalPages: response.totalPages,
            });
        }

        this.setState({
            loading: false,
        });
    };

    markAllRead = async () => {
        const { response, success } = await Api.call('POST', '/users/notifications/read');

        if (success) {
            this.setState({
                unreadCount: 0,
                notificationsList: this.state.notificationsList.map((notification) => ({
                    ...notification,
                    readAt: response,
                })),
            });
        }
    };

    async componentDidMount() {
        await this.loadNotifications();
    }

    markAsRead = async (key) => {
        const { response, success } = await Api.call(
            'POST',
            '/users/notifications/read/' + this.state.notificationsList[key]._id
        );

        if (success) {
            const notificationsList = [...this.state.notificationsList];

            notificationsList[key].readAt = response;

            this.setState({
                unreadCount: this.state.unreadCount - 1,
                notificationsList,
            });
        }
    };

    render() {
        const { notificationsList } = this.state;
        if (this.state.loading) {
            return (
                <div className='center-loading big'>
                    <Spinner animation='border' />
                </div>
            );
        }
        return (
            <>
                {notificationsList.length !== 0 ? (
                    <div id='user-messages'>
                        <Row noGutters className='padding'>
                            <Col>
                                <div>
                                    {this.state.unreadCount} unread&nbsp;
                                    {this.state.unreadCount === 1 ? 'notification' : 'notifications'}
                                </div>
                            </Col>
                            {this.state.unreadCount > 0 && (
                                <Col>
                                    <span className='btn bd float-right' onClick={this.markAllRead}>
                                        Mark all as read
                                    </span>
                                </Col>
                            )}
                        </Row>

                        {notificationsList.map((notification, key) => (
                            <Notification
                                doc={notification}
                                key={notification._id}
                                index={key}
                                markAsRead={async () => {
                                    await this.markAsRead(key);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div>No Messages</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div
                        className='btn btn--small bd m-1'
                        onClick={() =>
                            this.state.pageNo !== 1 &&
                            this.setState({
                                pageNo: this.state.pageNo - 1,
                            })
                        }
                    >
                        <Fa icon={faAngleLeft} />
                    </div>
                    <span className='btn btn--small bp'>{this.state.pageNo}</span>
                    <div
                        className='btn btn--small bd m-1'
                        onClick={() =>
                            this.state.pageNo < this.state.totalPages &&
                            this.setState({
                                pageNo: this.state.pageNo + 1,
                            })
                        }
                    >
                        <Fa icon={faAngleRight} />
                    </div>
                </div>
            </>
        );
    }
}
