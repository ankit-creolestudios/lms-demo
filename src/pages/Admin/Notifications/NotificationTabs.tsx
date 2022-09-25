import React, { Component } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

interface IProps extends RouteComponentProps {}

class NotificationTabs extends Component<IProps> {
    render() {
        return (
            [
                '/admin/notifications',
                '/admin/notifications/mailingList',
                '/admin/notifications/announcement',
                '/admin/notifications/broadcast',
            ].includes(this.props.location.pathname) && (
                <Nav variant='tabs' activeKey={this.props.location.pathname}>
                    <Nav.Item key='notification'>
                        <Nav.Link as={Link} eventKey={`/admin/notifications`} to={`/admin/notifications`}>
                            Notification
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item key='mailing-list'>
                        <Nav.Link
                            as={Link}
                            eventKey={`/admin/notifications/mailingList`}
                            to={`/admin/notifications/mailingList`}
                        >
                            Mailing List
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item key='announcement'>
                        <Nav.Link
                            as={Link}
                            eventKey={`/admin/notifications/announcement`}
                            to={`/admin/notifications/announcement`}
                        >
                            Announcement
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item key='broadcast'>
                        <Nav.Link
                            as={Link}
                            eventKey={`/admin/notifications/broadcast`}
                            to={`/admin/notifications/broadcast`}
                        >
                            Broadcast
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            )
        );
    }
}

export default withRouter(NotificationTabs);
