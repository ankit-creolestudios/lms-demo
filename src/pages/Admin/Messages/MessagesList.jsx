import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, Button, Card } from 'react-bootstrap';
import apiCall from '../../../helpers/apiCall';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';

class MessagesList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: null,
        };
    }

    async componentDidMount() {
        await this.loadDocs();
    }

    loadDocs = async (callback = null) => {
        const { success, response, message } = await apiCall('GET', '/notifications');
        if (success) {
            this.setState(
                {
                    messages: response,
                },
                () => {
                    if (callback) {
                        callback();
                    }
                }
            );
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    deleteMessage = async (id) => {
        const { success, message } = await apiCall('DELETE', '/notifications/' + id);

        if (success) {
            await this.loadDocs(() => {
                this.props.setGlobalAlert({ type: 'success', message });
            });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    render() {
        return (
            <div>
                <div className='page-controls'>
                    <div className='page-controls__buttons'>
                        <Link className='btn bp btn--small' to='/admin/messages/new'>
                            New template
                        </Link>
                    </div>
                </div>
                <div className='messages-list'>
                    {this.state.messages &&
                        this.state.messages.docs.map((doc) => {
                            const { sendingTime } = doc;
                            let sendingSchedule = 'Scheduled';
                            if (sendingTime >= 86400) {
                                sendingSchedule += ` ${Math.ceil(sendingTime / 86400)} days`;
                            } else if (sendingTime >= 3600) {
                                sendingSchedule += ` ${Math.ceil(sendingTime / 3600)} hours`;
                            } else if (sendingTime >= 60) {
                                sendingSchedule += ` ${Math.ceil(sendingTime / 60)} minutes`;
                            } else if (sendingTime > 0) {
                                sendingSchedule += ` ${Math.ceil(sendingTime)} seconds`;
                            } else {
                                sendingSchedule += ' instantly';
                            }
                            sendingSchedule +=
                                ' ' +
                                doc.sendingTimeCondition +
                                ' ' +
                                this.props.sendingConditions[doc.sendingCondition].text.toLocaleLowerCase();

                            return (
                                <Accordion key={doc._id}>
                                    <Card>
                                        <Accordion.Toggle eventKey={doc._id} as={Card.Header}>
                                            <div className='card-title'>{doc.subject}</div>
                                            <div className='card-controls'>
                                                <Link
                                                    className='btn btn--small'
                                                    as={Link}
                                                    to={'/admin/messages/' + doc._id}>
                                                    <Fa icon={faEdit} />
                                                </Link>
                                                <button
                                                    className='btn btn--small'
                                                    size='sm'
                                                    onClick={async (e) => {
                                                        e.stopPropagation();

                                                        await this.deleteMessage(doc._id);
                                                    }}>
                                                    <Fa icon={faTrash} />
                                                </button>
                                            </div>
                                        </Accordion.Toggle>
                                        <Accordion.Collapse eventKey={doc._id}>
                                            <Card.Body className='padding'>
                                                <p className='color--light'>{sendingSchedule}</p>
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: doc.message,
                                                    }}
                                                />
                                            </Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                </Accordion>
                            );
                        })}
                </div>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(MessagesList);
