import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import CodesListContext, {
    ICodesListContext,
} from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListContext';
import { IParams } from 'src/pages/Admin/Discounts/DiscountsGroupForm/DiscountsGroupForm';

type IProps = RouteComponentProps<IParams>;

export default class CodesListValidInValidFilter extends Component<IProps> {
    static contextType?: React.Context<ICodesListContext> = CodesListContext;

    context!: React.ContextType<typeof CodesListContext>;

    state = {
        validInvalid: this.context.validInvalid ?? '',
    };

    handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            validInvalid: e.target.value,
        });
    };

    handleClickApply = () => {
        this.context.setFilter({
            validInvalid: this.state.validInvalid,
        });
    };

    render() {
        const { validInvalid } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='validInvalid'>
                    <b>Valid InValid filter</b>
                    <select name='validInvalid' value={validInvalid} onChange={this.handleInputChange}>
                        <option value=''></option>
                        <option value='VALID'>Valid</option>
                        <option value='INVALID'>InValid</option>
                    </select>
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
