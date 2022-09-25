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
};

type IState = {
    fullname: string;
};

export default class UsersFullnameFilter extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            fullname: this.props.filterForm.fullname ?? '',
        };
    }

    componentDidUpdate = (prevProps: IProps) => {
        if (prevProps.filterForm.fullname !== this.props.filterForm.fullname) {
            this.setState({
                fullname: this.props.filterForm.fullname,
            });
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            fullname: e.target.value,
        });
    };

    handleClickApply = () => {
        this.props.setFilterForm({ fullname: this.state.fullname });
    };

    render() {
        const { fullname } = this.state;
        return (
            <div className='table__filter-form'>
                <label htmlFor='search'>
                    <b>Full Name</b>
                    <input value={fullname} onChange={this.handleInputChange} type='text' name='fullname' />
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
