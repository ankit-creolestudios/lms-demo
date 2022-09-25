import React, { Component, FC } from 'react';
import { connect } from 'react-redux';
import { Button, ListGroup, useAccordionToggle } from 'react-bootstrap';
import './PermissionList.scss';
import { PermLists } from '../Permissions';
import { ContextType } from '../PermissionsContext';

interface IProps {
    permissionLists: PermLists[];
    permissionContext: ContextType;
}

interface IState {
    id: string;
}
class PermissionList extends Component<IProps, unknown> {
    constructor(props: any) {
        super(props);
    }

    scrollToPermission = (id: string) => {
        const selectedPermissionType = document.getElementById(`permission-toggle-${id}`);
        if (!document.getElementById(`permission-collapse-${id}`)?.classList.contains('show')) {
            selectedPermissionType?.click();
        }
        selectedPermissionType?.scrollIntoView({
            behavior: 'smooth',
        });
        this.props.permissionContext.setSelectedPermissionType(id);
    };

    render() {
        return (
            <div className='permission-list'>
                <h3>Permissions</h3>
                <div className='permission-list-container'>
                    {this.props.permissionContext.selectedPermissionGroup !== '' &&
                        this.props.permissionLists.map((list) => (
                            <p
                                style={{
                                    textTransform: 'capitalize',
                                    fontWeight:
                                        list._id === this.props.permissionContext.selectedPermissionType ? 700 : 400,
                                }}
                                key={list._id}
                                onClick={() => this.scrollToPermission(list._id)}
                            >
                                {list?.module}
                            </p>
                        ))}
                </div>
            </div>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload: any) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload: any) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(PermissionList);
