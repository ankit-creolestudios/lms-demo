import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import DiscountsContext, { DiscountsContext as IDiscountsContext } from './DiscountsContext';
import { IParams } from './DiscountsGroupForm';

type IProps = RouteComponentProps<IParams>;

class DetailsTab extends Component<IProps> {
    static contextType: React.Context<IDiscountsContext> = DiscountsContext;

    // context!: React.ContextType<typeof DiscountsContext>;

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value: string | number = e.target.value;

        if (e.target.type === 'number') {
            value = parseInt(value);
        }

        this.context.setDetails({
            [e.target.name]: value,
        });
    };

    get discountGroupId() {
        return this.props.match.params.discountGroupId;
    }

    get isNew() {
        return this.discountGroupId === 'new';
    }

    render() {
        const {
            name,
            defaultDiscountType,
            defaultDiscountValue,
            defaultFixedCode,
            defaultCommissionType,
            defaultCommissionValue,
        } = this.context.details;

        return (
            <div className='form form--two-cols'>
                <div className='form__content pt-4 pb-1'>
                    <form>
                        <Row>
                            <Col>
                                <div className='form__field'>
                                    <label htmlFor='name'>Group name</label>
                                    <input type='text' name='name' value={name} onChange={this.handleInputChange} />
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='defaultDiscountType'>Default discount type</label>
                                    <select
                                        name='defaultDiscountType'
                                        value={defaultDiscountType}
                                        onChange={this.handleInputChange}
                                    >
                                        <option value='PERCENTAGE'>Percentage</option>
                                        <option value='FIXED'>Fixed</option>
                                    </select>
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='defaultDiscountValue'>Default discount value</label>
                                    <input
                                        type='number'
                                        name='defaultDiscountValue'
                                        value={defaultDiscountValue}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='defaultFixedCode'>Default fixed code</label>
                                    <input
                                        type='text'
                                        name='defaultFixedCode'
                                        value={defaultFixedCode}
                                        onChange={this.handleInputChange}
                                        disabled={this.isNew || this.context.codes.length === 0}
                                    />
                                    {(this.isNew || this.context.codes.length === 0) && (
                                        <small>
                                            {this.isNew
                                                ? "You'll be able to set a default code after creating this group and creating a code"
                                                : this.context.codes.length === 0
                                                ? 'You must create a code before being able to use this field'
                                                : ''}
                                        </small>
                                    )}
                                </div>
                            </Col>
                            <Col>
                                <div className='form__field'>
                                    <label htmlFor='asd'>Active affiliate groups</label>
                                    <select name='asd'>
                                        <option value='PERCENTAGE'>Percentage</option>
                                        <option value='FIXED'>Fixed</option>
                                    </select>
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='defaultCommissionType'>Default commission type</label>
                                    <select
                                        name='defaultCommissionType'
                                        value={defaultCommissionType}
                                        onChange={this.handleInputChange}
                                    >
                                        <option value='PERCENTAGE'>Percentage</option>
                                        <option value='FIXED'>Fixed</option>
                                    </select>
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='defaultCommissionValue'>Default commission value</label>
                                    <input
                                        type='number'
                                        name='defaultCommissionValue'
                                        value={defaultCommissionValue}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </form>
                </div>
            </div>
        );
    }
}

export default withRouter(DetailsTab);
