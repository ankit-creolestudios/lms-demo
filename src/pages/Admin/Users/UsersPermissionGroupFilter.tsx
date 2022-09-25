import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PermGroups } from '../Permissions/Permissions';

type IProps = RouteComponentProps & {
    filterForm: {
        permissionGroupId: string;
        fullname: string;
        email: string;
    };
    setFilterForm: (obj: any) => void;
    allPermissionGroups: PermGroups[] | [];
};

type IState = {
    permissionGroupId: string;
};

export default class UsersPermissionGroupFilter extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            permissionGroupId: this.props.filterForm.permissionGroupId ?? '',
        };
    }

    findGroup = (id: string) => {
        return this.props.allPermissionGroups.find((grp) => grp._id === id);
    };

    handleInputChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const groupName = this.findGroup(e.target.value)?.groupName;
        this.props.setFilterForm({
            permissionGroupId: e.target.value,
            permissionGroupName: groupName,
        });
        this.setState({
            permissionGroupId: e.target.value,
        });
    };

    render() {
        const { permissionGroupId } = this.state;
        const localUser: any = localStorage.getItem('user');
        return (
            <div className='table__filter-form'>
                <label htmlFor='packageIds'>
                    <b>Permission Group Filter</b>
                    <select
                        name='permissionGroupId'
                        defaultValue={''}
                        value={permissionGroupId}
                        onChange={this.handleInputChange}
                    >
                        <option value=''>None</option>
                        {localUser &&
                            this.props.allPermissionGroups.map((grp) => (
                                <option key={grp._id} value={grp._id} disabled={!grp.userCount}>
                                    {grp.groupName} ({grp.userCount})
                                </option>
                            ))}
                    </select>
                </label>
            </div>
        );
    }
}
