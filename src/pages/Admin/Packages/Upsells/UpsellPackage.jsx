import React, { Component } from 'react';
import { Accordion, Card, Form, FormGroup } from 'react-bootstrap';
import { packageDivisionsMap } from '../../../../helpers/packageDivisions';
import { AiOutlineSelect, AiOutlineDelete, AiOutlineDrag } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import UpsellsPackagesContext from './UpsellsPackagesContext';
import { Draggable } from 'react-beautiful-dnd';
import { Api } from 'src/helpers/new';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
class UpsellPackage extends Component {
    static contextType = UpsellsPackagesContext;

    handleRemoveUpsell = async (e) => {
        e.stopPropagation();

        const { orderIndex, _id } = this.props.packageData,
            upsells = Array.from(this.context.upsells);

        await Api.call('DELETE', `/packages/upsells/${_id}`);
        upsells.splice(orderIndex, 1);

        this.context.setUpsells(upsells);
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { orderIndex, _id } = this.props.packageData;
        const upsellUpdatedData = this.context.upsells[orderIndex];
        const { success, message } = await Api.call('PATCH', `/packages/upsells/${_id}`, {
            ...upsellUpdatedData,
        });
        if (success) {
            this.props.setGlobalAlert({
                type: 'success',
                message,
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message,
            });
        }
    };

    handleChange = async (e) => {
        const { orderIndex, _id } = this.props.packageData,
            upsells = Array.from(this.context.upsells),
            value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;

        upsells[orderIndex][e.target.name] = value;

        this.context.setUpsells(upsells);
    };

    handleChangeDisplayLocations = async (e) => {
        const { orderIndex, _id } = this.props.packageData,
            upsells = Array.from(this.context.upsells),
            value = {
                ...upsells[orderIndex].displayLocations,
                [e.target.name]: e.target.checked,
            };

        upsells[orderIndex].displayLocations = value;

        this.context.setUpsells(upsells);
    };

    handleChangeDiscountLocations = async (e) => {
        const { orderIndex, _id } = this.props.packageData,
            upsells = Array.from(this.context.upsells),
            value = {
                ...upsells[orderIndex].discountLocations,
                [e.target.name]: e.target.checked,
            };

        upsells[orderIndex].discountLocations = value;

        this.context.setUpsells(upsells);
    };

    stopPropagation = (e) => {
        e.stopPropagation();
    };

    render() {
        const {
            _id,
            upsoldPackageId,
            title,
            division,
            discountType,
            discountValue,
            importance,
            displayLocations,
            discountLocations,
            orderIndex,
        } = this.props.packageData;

        return (
            <Draggable draggableId={_id} index={orderIndex}>
                {(provided, snapshot) => (
                    <Card className='admin-upsell-package-card' ref={provided.innerRef} {...provided.draggableProps}>
                        <Accordion.Toggle as={Card.Header} eventKey={_id} className='d-flex justify-content-between'>
                            <div>
                                <span {...provided.dragHandleProps}>
                                    <AiOutlineDrag
                                        onClick={this.stopPropagation}
                                        style={{ fontSize: '24px', marginRight: '10px' }}
                                    />
                                </span>
                                &nbsp;
                                {title}
                            </div>
                            <div>
                                <b>Division:</b> {packageDivisionsMap[division]}
                            </div>
                            <div className='d-flex'>
                                <Link
                                    onClick={this.stopPropagation}
                                    to={`/admin/packages/edit/${upsoldPackageId}`}
                                    target='_blank'
                                    className='ml-3'
                                >
                                    <AiOutlineSelect style={{ fontSize: '20px' }} />
                                </Link>
                                <div className='ml-3' onClick={this.handleRemoveUpsell}>
                                    <AiOutlineDelete style={{ fontSize: '20px', cursor: 'pointer' }} />
                                </div>
                            </div>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={_id}>
                            <Card.Body>
                                <Form onSubmit={this.handleSubmit}>
                                    <FormGroup>
                                        <Form.Label htmlFor='discountType'>Discount type</Form.Label>
                                        <Form.Control
                                            as='select'
                                            id='discountType'
                                            name='discountType'
                                            value={discountType}
                                            onChange={this.handleChange}
                                        >
                                            <option value='PERCENTAGE'>Percentage</option>
                                            <option value='FIXED'>Fixed</option>
                                        </Form.Control>
                                    </FormGroup>
                                    <FormGroup>
                                        <Form.Label htmlFor='discountValue'>Discount value</Form.Label>
                                        <Form.Control
                                            type='number'
                                            id='discountValue'
                                            name='discountValue'
                                            value={discountValue}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Form.Label htmlFor='importance'>Importance</Form.Label>
                                        <Form.Control
                                            type='number'
                                            min={0}
                                            max={100}
                                            id='importance'
                                            name='importance'
                                            value={importance}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <fieldset>
                                        <legend>Allow display at:</legend>
                                        <label htmlFor='cart'>
                                            <input
                                                type='checkbox'
                                                name='cart'
                                                checked={displayLocations.cart}
                                                onChange={this.handleChangeDisplayLocations}
                                            />
                                            &nbsp;Cart
                                        </label>
                                        <br />
                                        <label htmlFor='suggestion'>
                                            <input
                                                type='checkbox'
                                                name='suggestion'
                                                checked={displayLocations.suggestion}
                                                onChange={this.handleChangeDisplayLocations}
                                            />
                                            &nbsp;Suggestion
                                        </label>
                                        <br />
                                        <label htmlFor='thankYou'>
                                            <input
                                                type='checkbox'
                                                name='thankYou'
                                                checked={displayLocations.thankYou}
                                                onChange={this.handleChangeDisplayLocations}
                                            />
                                            &nbsp;Thank you
                                        </label>
                                        <br />
                                        <label htmlFor='dashboard'>
                                            <input
                                                type='checkbox'
                                                name='dashboard'
                                                checked={displayLocations.dashboard}
                                                onChange={this.handleChangeDisplayLocations}
                                            />
                                            &nbsp;Dashboard
                                        </label>
                                        <br />
                                    </fieldset>
                                    <fieldset>
                                        <legend>Allow discount at:</legend>
                                        <label htmlFor='cart'>
                                            <input
                                                type='checkbox'
                                                name='cart'
                                                checked={discountLocations.cart}
                                                onChange={this.handleChangeDiscountLocations}
                                            />
                                            &nbsp;Cart
                                        </label>
                                        <br />
                                        <label htmlFor='suggestion'>
                                            <input
                                                type='checkbox'
                                                name='suggestion'
                                                checked={discountLocations.suggestion}
                                                onChange={this.handleChangeDiscountLocations}
                                            />
                                            &nbsp;Suggestion
                                        </label>
                                        <br />
                                        <label htmlFor='thankYou'>
                                            <input
                                                type='checkbox'
                                                name='thankYou'
                                                checked={discountLocations.thankYou}
                                                onChange={this.handleChangeDiscountLocations}
                                            />
                                            &nbsp;Thank you
                                        </label>
                                        <br />
                                        <label htmlFor='dashboard'>
                                            <input
                                                type='checkbox'
                                                name='dashboard'
                                                checked={discountLocations.dashboard}
                                                onChange={this.handleChangeDiscountLocations}
                                            />
                                            &nbsp;Dashboard
                                        </label>
                                        <br />
                                    </fieldset>
                                    <div className='form__buttons'>
                                        <button type='submit' className='btn bp mr-1'>
                                            Save
                                        </button>
                                        <button type='button' className='btn bd' onClick={this.props.loadUpsells}>
                                            Cancel
                                        </button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                )}
            </Draggable>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(UpsellPackage));
