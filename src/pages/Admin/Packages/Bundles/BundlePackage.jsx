import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card } from 'react-bootstrap';
import { AiOutlineDelete, AiOutlineDrag, AiOutlineSelect } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import apiCall from '../../../../helpers/apiCall';
import BundlesContext from './BundlesContext';

export default class BundlePackage extends Component {
    static contextType = BundlesContext;

    handleInputChange = async (e) => {
        const { bundleOrderIndex, orderIndex, bundleId } = this.props,
            bundles = Array.from(this.context.bundles),
            value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;

        bundles[bundleOrderIndex].packages[orderIndex][e.target.name] = value;

        apiCall('PATCH', `/packages/bundles/${bundleId}/${orderIndex}`, {
            [e.target.name]: value,
        });

        this.context.setBundles(bundles);
    };

    handleRemovePackage = async () => {
        const { bundleOrderIndex, orderIndex, bundleId } = this.props,
            bundles = Array.from(this.context.bundles);

        await apiCall('DELETE', `/packages/bundles/${bundleId}/${orderIndex}`);

        bundles[bundleOrderIndex].packages.splice(orderIndex, 1);

        this.context.setBundles(bundles);
    };

    render() {
        const { packageId, title, discountType, discountValue } = this.props.bundlePackage;

        return (
            <Draggable draggableId={packageId} index={this.props.orderIndex}>
                {(provided, snapshot) => (
                    <Card className='mb-2' ref={provided.innerRef} {...provided.draggableProps}>
                        <Card.Header className='d-flex align-items-center'>
                            <div {...provided.dragHandleProps}>
                                <AiOutlineDrag style={{ fontSize: '24px', marginRight: '10px' }} />
                            </div>
                            <div className='mr-3' style={{ width: '300px' }}>
                                {title}
                            </div>
                            <div className='d-flex align-items-center'>
                                <label className='font-weight-bold mr-2' htmlFor='discountType'>
                                    Discount type
                                </label>
                                <select
                                    style={{ width: '150px' }}
                                    name='discountType'
                                    id='discountType'
                                    value={discountType}
                                    onChange={this.handleInputChange}
                                >
                                    <option value='PERCENTAGE'>Percentage</option>
                                    <option value='FIXED'>Fixed</option>
                                </select>
                            </div>
                            <div className='d-flex align-items-center ml-3'>
                                <label className='font-weight-bold mr-2' htmlFor='discountValue'>
                                    Discount value
                                </label>
                                <input
                                    style={{ width: '100px' }}
                                    type='number'
                                    name='discountValue'
                                    value={discountValue}
                                    onChange={this.handleInputChange}
                                />
                            </div>
                            <Link to={`/admin/packages/edit/${packageId}`} target='_blank' className='ml-3'>
                                <AiOutlineSelect style={{ fontSize: '20px' }} />
                            </Link>
                            <div className='ml-3' onClick={this.handleRemovePackage}>
                                <AiOutlineDelete style={{ fontSize: '20px', cursor: 'pointer' }} />
                            </div>
                        </Card.Header>
                    </Card>
                )}
            </Draggable>
        );
    }
}
