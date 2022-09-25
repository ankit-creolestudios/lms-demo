import React, { Component } from 'react';
import BundlesContext from './BundlesContext';
import BundleCard from './BundleCard';
import { Accordion } from 'react-bootstrap';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import apiCall from '../../../../helpers/apiCall';

export default class BundlesList extends Component {
    static contextType = BundlesContext;

    onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const bundles = Array.from(this.context.bundles),
            [removed] = bundles.splice(result.source.index, 1);

        bundles.splice(result.destination.index, 0, removed);

        this.context.setBundles(
            bundles.map((bundle, orderIndex) => ({ ...bundle, orderIndex })),
            async () => {
                await Promise.all(
                    bundles.map(async ({ _id, orderIndex: oldIndex }, orderIndex) => {
                        if (oldIndex !== orderIndex) {
                            await apiCall('PATCH', `/packages/bundles/${_id}`, { orderIndex });
                        }
                    })
                );
            }
        );
    };

    render() {
        const { bundles } = this.context;

        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId='bundlesDropZone'>
                    {(provided, snapshot) => (
                        <Accordion {...provided.droppableProps} ref={provided.innerRef}>
                            {bundles.map((bundle) => (
                                <BundleCard bundle={bundle} key={bundle._id} />
                            ))}
                            {provided.placeholder}
                        </Accordion>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }
}
