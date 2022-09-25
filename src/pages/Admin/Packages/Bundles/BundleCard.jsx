import React, { Component } from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Accordion, Card, Form } from 'react-bootstrap';
import { AiOutlineDelete, AiOutlineDrag } from 'react-icons/ai';
import ToggleTextInput from '../../../../components/inputs/ToggleTextInput';
import BundlesContext from './BundlesContext';
import apiCall from '../../../../helpers/apiCall';
import Select from 'react-select-search';
import './BundleCard.scss';
import BundlePackage from './BundlePackage';

export default class BundleCard extends Component {
    static contextType = BundlesContext;

    state = {
        selectedPackage: null,
    };

    onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }
        const { orderIndex } = this.props.bundle,
            bundles = Array.from(this.context.bundles),
            packages = Array.from(this.props.bundle.packages),
            [removed] = packages.splice(result.source.index, 1);

        packages.splice(result.destination.index, 0, removed);
        bundles[orderIndex].packages = packages;

        this.context.setBundles(bundles);
    };

    handleInputChange = async (e) => {
        const { orderIndex } = this.props.bundle,
            bundles = Array.from(this.context.bundles),
            { name, value } = e.target;

        bundles[orderIndex][name] = value;

        this.context.setBundles(bundles);
    };

    handleInputSave = async (e) => {
        await apiCall('PATCH', `/packages/bundles/${this.props.bundle._id}`, {
            [e.target.name]: e.target.value,
        });
    };

    handlePackageSelection = (_, selectedPackage) => {
        this.setState({
            selectedPackage: {
                packageId: selectedPackage.value,
                title: selectedPackage.name,
                discountType: 'PERCENTAGE',
                discountValue: 0,
            },
        });
    };

    addPackageToBundle = async () => {
        if (this.state.selectedPackage === null) {
            return;
        }

        const { orderIndex, _id } = this.props.bundle,
            bundles = Array.from(this.context.bundles),
            { selectedPackage } = this.state;

        bundles[orderIndex].packages.push(selectedPackage);

        await apiCall('POST', `/packages/bundles/${_id}/package`, selectedPackage);

        this.context.setBundles(bundles);
        this.setState({
            selectedPackage: null,
        });
    };

    handleDeleteBundle = async (e) => {
        e.stopPropagation();

        const { orderIndex, _id } = this.props.bundle,
            bundles = Array.from(this.context.bundles);

        await apiCall('DELETE', `/packages/bundles/${_id}`);
        bundles.splice(orderIndex, 1);

        this.context.setBundles(bundles);
    };

    render() {
        const { _id, title, orderIndex, packages } = this.props.bundle,
            { availablePackages } = this.context;

        return (
            <Draggable draggableId={_id} index={orderIndex}>
                {(provided, snapshot) => (
                    <Card className='bundle-card' ref={provided.innerRef} {...provided.draggableProps}>
                        <Accordion.Toggle as={Card.Header} eventKey={_id} className='d-flex align-items-center'>
                            <div {...provided.dragHandleProps}>
                                <AiOutlineDrag style={{ fontSize: '24px', marginRight: '10px' }} />
                            </div>
                            <ToggleTextInput
                                name='title'
                                value={title}
                                onChange={this.handleInputChange}
                                onSave={this.handleInputSave}
                            />
                            <div
                                onClick={this.handleDeleteBundle}
                                style={{ marginLeft: 'auto', fontSize: '20px', cursor: 'pointer' }}
                            >
                                <AiOutlineDelete />
                            </div>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={_id}>
                            <Card.Body style={{ minHeight: '200px' }}>
                                <header className='d-flex pt-4 mb-3'>
                                    <Select
                                        search
                                        name='selectPackage'
                                        options={availablePackages}
                                        placeholder='Select package...'
                                        onChange={this.handlePackageSelection}
                                    />
                                    <button
                                        className='bp ml-3'
                                        style={{ width: '170px' }}
                                        onClick={this.addPackageToBundle}
                                    >
                                        <strong>Add package</strong>
                                    </button>
                                </header>
                                <DragDropContext onDragEnd={this.onDragEnd}>
                                    <Droppable droppableId='packagesDropZone'>
                                        {(packageProvided, packageSnapshot) => (
                                            <main {...packageProvided.droppableProps} ref={packageProvided.innerRef}>
                                                {packages.map((bundlePackage, packageIndex) => (
                                                    <BundlePackage
                                                        bundlePackage={bundlePackage}
                                                        orderIndex={packageIndex}
                                                        bundleOrderIndex={orderIndex}
                                                        bundleId={_id}
                                                        key={bundlePackage.packageId}
                                                    />
                                                ))}
                                                {packageProvided.placeholder}
                                            </main>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                )}
            </Draggable>
        );
    }
}
