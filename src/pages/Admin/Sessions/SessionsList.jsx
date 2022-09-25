import React, { Component } from 'react';
import { ApiTable } from '../../../components/ApiTable';
import { Badge, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faDesktop, faMobileAlt, faUserAltSlash } from '@fortawesome/free-solid-svg-icons';
import apiCall from '../../../helpers/apiCall';
import { connect } from 'react-redux';

class SessionsList extends Component {
    render() {
        return (
            <ApiTable
                apiCall={{
                    method: 'GET',
                    path: '/users/sessions',
                }}
                columns={[
                    {
                        text: 'Device',
                        field: (row) => (
                            <OverlayTrigger
                                placement='top'
                                overlay={
                                    <Tooltip id={`tooltip-${row._id}-deviceType)}`}>
                                        {row.isMobile ? 'Mobile' : 'Desktop'}
                                    </Tooltip>
                                }>
                                <Fa icon={row.isMobile ? faMobileAlt : faDesktop} />
                            </OverlayTrigger>
                        ),
                        maxWidth: '7%',
                        className: 'col--center',
                        headClassName: 'col--center',
                    },
                    {
                        text: 'User',
                        field: 'name',
                        sortKey: 'name',
                        maxWidth: '17%',
                    },
                    {
                        text: 'Session start',
                        field: (row) => new Date(row.startedAt).toLocaleString('en-US'),
                        sortKey: 'startedAt',
                        maxWidth: '17%',
                    },
                    {
                        text: 'Last interaction',
                        field: (row) => {
                            const lastInteraction = row.interactions[row.interactions.length - 1],
                                lastInteractionAt = new Date(lastInteraction?.interactedAt).toLocaleString('en-US');
                            return !!lastInteraction ? (
                                <OverlayTrigger
                                    placement='right'
                                    overlay={
                                        <Popover id={`popover-${row._id}-interaction)}`}>
                                            <Popover.Title as='h3'>{lastInteractionAt}</Popover.Title>
                                            <Popover.Content>{lastInteraction.interaction}</Popover.Content>
                                        </Popover>
                                    }>
                                    <span>{lastInteractionAt}</span>
                                </OverlayTrigger>
                            ) : (
                                '-'
                            );
                        },
                        maxWidth: '17%',
                    },
                    {
                        text: 'Current course',
                        field: 'currentCourse',
                        maxWidth: '17%',
                    },
                    {
                        text: 'Current lesson',
                        field: 'currentLesson',
                        maxWidth: '17%',
                    },
                    {
                        text: 'Status',
                        field: (row) => {
                            const statusMap = {
                                ACTIVE: 'success',
                                IDLE: 'warning',
                                OFFLINE: 'dark',
                            };

                            return (
                                <Badge pill variant={statusMap[row.status]}>
                                    {row.status}
                                </Badge>
                            );
                        },
                        sortKey: 'status',
                        maxWidth: '7rem',
                        className: 'col--center',
                        headClassName: 'col--center',
                    },
                ]}
                rowButtons={[
                    {
                        text: 'Invalidate session',
                        icon: faUserAltSlash,
                        clickCallback: async (e, row, reloadTable) => {
                            e.preventDefault();

                            const { success, message } = await apiCall('POST', '/users/sessions/invalidate/' + row._id);

                            if (success) {
                                this.props.setGlobalAlert({
                                    type: 'success',
                                    message: message ?? 'User session was invalidated!',
                                });
                                reloadTable();
                            } else {
                                this.props.setGlobalAlert({
                                    type: 'error',
                                    message,
                                });
                            }
                        },
                        condition: (row) => {
                            return ['CANC', 'PAID'].indexOf(row.status) === -1;
                        },
                    },
                ]}
            />
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(SessionsList);
