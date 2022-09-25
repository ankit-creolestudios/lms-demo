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
    email: string;
};

export default class UsersEmailFilter extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            email: this.props.filterForm.email ?? '',
        };
    }

    componentDidUpdate = (prevProps: IProps) => {
        if (prevProps.filterForm.email !== this.props.filterForm.email) {
            this.setState({
                email: this.props.filterForm.email,
            });
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            email: e.target.value,
        });
    };

    handleClickApply = () => {
        this.props.setFilterForm({ email: this.state.email });
    };

    render() {
        const { email } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='search'>
                    <b>Email</b>
                    <input value={email} onChange={this.handleInputChange} type='text' name='email' />
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
