import React, { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Select from 'react-select-search';
import apiCall from '../../../../helpers/apiCall';
import UpsellPackage from './UpsellPackage';
import UpsellsPackagesContext from './UpsellsPackagesContext';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

class UpsellPackages extends Component {
    state = {
        upsells: [],
        availablePackages: [],
        selectedPackage: null,
    };

    async componentDidMount() {
        await this.loadPackages();
        await this.loadUpsells();
    }

    loadUpsells = async () => {
        const { success, response: upsells } = await apiCall('GET', `/packages/${this.props.match.params.id}/upsells`);

        if (success) {
            this.setState({
                upsells,
            });
        }
    };

    loadPackages = async () => {
        const { success, response } = await apiCall('GET', `/packages?perPage=all`);

        if (success) {
            this.setState({
                availablePackages: response.docs.map(({ _id: value, title: name, division }) => ({
                    value,
                    name,
                    division,
                })),
            });
        }
    };

    handlePackageSelection = (_, selectedPackage) => {
        this.setState({
            selectedPackage: {
                packageId: selectedPackage.value,
                title: selectedPackage.name,
                division: selectedPackage.division,
            },
        });
    };

    addPackageUpsell = async () => {
        if (this.state.selectedPackage === null) {
            return;
        }

        const { id: packageId } = this.props.match.params,
            upsells = Array.from(this.state.upsells),
            { selectedPackage } = this.state,
            packageUpsell = {
                packageId,
                upsoldPackageId: selectedPackage.packageId,
                title: selectedPackage.title,
                division: selectedPackage.division,
                importance: 0,
                discountType: 'PERCENTAGE',
                discountValue: 0,
                displayLocations: {
                    cart: true,
                    suggestion: true,
                    thankYou: true,
                    dashboard: true,
                },
                discountLocations: {
                    cart: true,
                    suggestion: true,
                    thankYou: true,
                    dashboard: true,
                },
                orderIndex: 0,
            };

        const { response } = await apiCall('POST', `/packages/upsells`, packageUpsell);

        upsells.unshift({ ...packageUpsell, _id: response._id });

        this.setState({
            selectedPackage: null,
            upsells: upsells.map((upsell, orderIndex) => ({ ...upsell, orderIndex })),
        });
    };

    setUpsells = (upsells, callback) => {
        this.setState({ upsells }, callback);
    };

    onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const upsells = Array.from(this.state.upsells),
            [removed] = upsells.splice(result.source.index, 1);

        upsells.splice(result.destination.index, 0, removed);

        this.setUpsells(
            upsells.map((bundle, orderIndex) => ({ ...bundle, orderIndex })),
            async () => {
                await Promise.all(
                    upsells.map(async ({ _id, orderIndex: oldIndex }, orderIndex) => {
                        if (oldIndex !== orderIndex) {
                            await apiCall('PATCH', `/packages/upsells/${_id}`, { orderIndex });
                        }
                    })
                );
            }
        );
    };

    render() {
        const { availablePackages, upsells } = this.state;

        return (
            <>
                <div className='d-flex pt-4 mb-3'>
                    <Select
                        search
                        name='selectPackage'
                        options={availablePackages}
                        placeholder='Select package...'
                        onChange={this.handlePackageSelection}
                    />
                    <button className='bp ml-3' style={{ width: '170px' }} onClick={this.addPackageUpsell}>
                        <strong>Add package</strong>
                    </button>
                </div>
                <UpsellsPackagesContext.Provider value={{ upsells, setUpsells: this.setUpsells }}>
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId='bundlesDropZone'>
                            {(provided, snapshot) => (
                                <Accordion {...provided.droppableProps} ref={provided.innerRef}>
                                    {upsells.map((packageData) => (
                                        <UpsellPackage key={packageData._id} packageData={packageData} loadUpsells={this.loadUpsells} />
                                    ))}
                                    {provided.placeholder}
                                </Accordion>
                            )}
                        </Droppable>
                    </DragDropContext>
                </UpsellsPackagesContext.Provider>
            </>
        );
    }
}

export default withRouter(UpsellPackages);
