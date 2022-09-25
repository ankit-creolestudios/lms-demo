import React, { Component } from 'react';
import '../Admin/Messages/Messages.scss';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Accordion, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';

export default class Notification extends Component {
    render() {
        const { doc } = this.props;
        return (
            <Accordion>
                <Card>
                    <Card.Header>
                        <Accordion.Toggle as='div' className='card-title' eventKey={doc._id}>
                            {doc.subject}
                        </Accordion.Toggle>
                        <div className='card-controls float-right'>
                            <span style={{ marginRight: '10px' }}>
                                Send Date & Time: {moment(doc.sentAt).format('DD/MM/YYYY, hh:mm A')}
                            </span>
                            {!doc.readAt && (
                                <OverlayTrigger
                                    placement='left'
                                    overlay={
                                        <Tooltip id={`notification-${doc._id}__tooltip__courses`}>Mark as read</Tooltip>
                                    }
                                >
                                    <span className='btn btn--small btn--link' onClick={this.props.markAsRead}>
                                        <Fa icon={faEye} />
                                    </span>
                                </OverlayTrigger>
                            )}
                        </div>
                    </Card.Header>
                    <Accordion.Collapse eventKey={doc._id}>
                        <Card.Body>
                            {doc.emailSentAt && <p className='color--light'>Email sent at {doc.emailSentAt}</p>}
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
    }
}
