import React, { Component } from 'react';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUsers, FaUsersSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Api } from 'src/helpers/new';
import { ApiTable } from '../../../../components/ApiTable';

export default class DiscountsList extends Component {
    state = {
        defaultGroupId: null,
        reloadCounter: 0,
    };

    componentDidMount() {
        this.loadDefaultGroup();
    }

    loadDefaultGroup = async (reload = false) => {
        const { success, response } = await Api.call('get', 'settings/values/defaultDiscountGroupId');

        if (success) {
            this.setState({
                defaultGroupId: response.defaultDiscountGroupId ?? null,
                reloadCounter: reload ? this.state.reloadCounter + 1 : this.state.reloadCounter,
            });
        }
    };

    onSetDefaultGroupClick = (groupId: string | null) => async () => {
        await Api.call('post', 'settings/save/defaultDiscountGroupId', {
            value: groupId,
        });

        this.loadDefaultGroup(true);
    };

    render() {
        const { defaultGroupId, reloadCounter } = this.state;

        return (
            <>
                <div className='page-header padding row'>
                    <div className='col'>
                        <h3>Discounts</h3>
                    </div>
                    <div className='page-controls'>
                        <Link to='/admin/discounts/new' className='btn bp'>
                            New discount group
                        </Link>
                    </div>
                </div>
                <ApiTable
                    apiCall={{ method: 'GET', path: '/discounts/groups' }}
                    columns={[
                        {
                            text: '',
                            field: ({ _id }: { _id: string }) => (
                                <OverlayTrigger
                                    placement='top'
                                    overlay={
                                        <Tooltip id={`tooltip-${_id}}`}>
                                            {_id === defaultGroupId
                                                ? 'Unset default discount group'
                                                : 'Set default discount group'}
                                        </Tooltip>
                                    }
                                >
                                    <button
                                        className='btn btn--small'
                                        onClick={this.onSetDefaultGroupClick(_id === defaultGroupId ? null : _id)}
                                    >
                                        {_id === defaultGroupId ? <FaUsersSlash /> : <FaUsers />}
                                    </button>
                                </OverlayTrigger>
                            ),
                            maxWidth: '33px',
                        },
                        {
                            text: 'Name',
                            field: ({ name, _id }: { name: string; _id: string }) => (
                                <Link to={`/admin/discounts/${_id}`}>{name}</Link>
                            ),
                        },
                        {
                            text: 'Created at',
                            field: ({ createdAt }: { createdAt: string }) => new Date(createdAt).toLocaleDateString(),
                        },
                    ]}
                    rowButtons={[
                        {
                            text: 'Edit discount group',
                            icon: faPencilAlt,
                            url: '/admin/discounts/:_id',
                        },
                    ]}
                    reload={reloadCounter}
                />
            </>
        );
    }
}
