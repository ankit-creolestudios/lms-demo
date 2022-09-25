import React, { Component } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Spinner } from 'react-bootstrap';
import { BsCaretDown, BsCaretDownFill, BsCaretUp, BsCaretUpFill } from 'react-icons/bs';
import { HiFilter } from 'react-icons/hi';
import uuid from 'react-uuid';
import MenuPopup from 'src/components/MenuPopup';
import mergeRefs from '../../helpers/mergeRefs';
import './Table.scss';
import TableButton from './TableButton';

export default class Table extends Component {
    highlightedRow = React.createRef();

    columnsRefs = this.props.columns.map((column) => React.createRef());

    state = {
        selectedColumnFilterIndex: null,
    }

    componentDidMount() {
        if (this.highlightedRow.current) {
            this.highlightedRow.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    setColumnFilterIndex = (i) => () => {
        this.setState({
            selectedColumnFilterIndex: i,
        });
    }

    render() {
        const {
            rows,
            columns,
            emptyMessage,
            onSort,
            onSortReset,
            rowButtons,
            sortData,
            loading,
            minTableWidth,
            reloadRows,
        } = this.props;


        const { selectedColumnFilterIndex } = this.state;

        const FilterComponent = selectedColumnFilterIndex !== null ? columns[selectedColumnFilterIndex].filter : React.Fragment;

        if (!rows || !rows.length) {
            return (
                <div className='table color--light padding--double text--center font--medium'>
                    {emptyMessage ?? 'No records'}
                </div>
            );
        }

        return (
            <div
                className='table'
                style={{
                    overflowX: 'auto',
                }}>
                <div
                    className='header'
                    style={{
                        minWidth: minTableWidth || 'auto',
                    }}>
                    {columns.map((column, i) => {
                        return (
                            <div
                                key={column.field}
                                style={{
                                    minWidth: column.minWidth || 'auto',
                                    maxWidth: column.maxWidth || 'auto',
                                }}
                                onClick={
                                    !!column.sortKey && onSort
                                        ? async (e) => {
                                              await onSort(e, column.sortKey);
                                          }
                                        : undefined
                                }
                                onContextMenu={
                                    !!column.sortKey && onSortReset
                                        ? async (e) => {
                                              return await onSortReset(e, column.sortKey);
                                          }
                                        : undefined
                                }
                                className={`col${column.headClassName ? ' ' + column.headClassName : ''}`}>
                                {!!column.sortKey && (
                                    <div className='col--sort'>
                                        {sortData[column.sortKey] === undefined || sortData[column.sortKey] === -1 ? (
                                            <BsCaretUp />
                                        ) : (
                                            <BsCaretUpFill />
                                        )}

                                        {sortData[column.sortKey] === undefined || sortData[column.sortKey] === 1 ? (
                                            <BsCaretDown />
                                        ) : (
                                            <BsCaretDownFill />
                                        )}
                                    </div>
                                )}

                                {column.text}

                                {!!column.filter && (
                                    <div className="col--filter" ref={this.columnsRefs[i]} onClick={this.setColumnFilterIndex(i)}>
                                        <HiFilter />
                                    </div>
                                    
                                )}
                            </div>
                        );
                    })}
                    {rowButtons && rowButtons.length && (
                        <div
                            className='col col--controls'
                            style={{
                                minWidth:
                                    rowButtons.reduce((width, button) => {
                                        if (!button.icon) {
                                            width += button.text.length * 0.9;
                                        } else {
                                            width += 2.06;
                                        }
                                        return width;
                                    }, 0) +
                                    (rowButtons.length - 1) * 0.75 +
                                    1.3 +
                                    'rem',
                            }}
                        />
                    )}
                </div>

                {this.props.draggableId ? (
                    <DragDropContext
                        onDragEnd={(result) => {
                            this.props.handleDragAndDrop(this.props.chapter._id, result);
                        }}>
                        <Droppable droppableId={`droppable-${this.props.droppableId}`}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className='main'
                                    style={{
                                        minWidth: minTableWidth || 'auto',
                                    }}>
                                    <div className={`table-loading ${!loading ? ' hide' : ''}`}>
                                        <Spinner animation='border' />
                                    </div>
                                    {rows.map((doc, i) => {
                                        const highlightRow = this.props.highlightRow(doc);

                                        return (
                                            <Draggable
                                                key={`draggable-${this.props.draggableId}-${doc._id}`}
                                                draggableId={`draggable-${this.props.draggableId}-${doc._id}`}
                                                index={i}>
                                                {(provided) => (
                                                    <div
                                                        key={doc._id}
                                                        className={`row${highlightRow ? ' row--highlight' : ''}`}
                                                        ref={
                                                            highlightRow
                                                                ? mergeRefs(provided.innerRef, this.highlightedRow)
                                                                : provided.innerRef
                                                        }
                                                        {...provided.draggableProps}>
                                                        {columns.map((column, j) => (
                                                            <div
                                                                key={`${doc._id}-${j}`}
                                                                style={{
                                                                    minWidth: column.minWidth || 'auto',
                                                                    maxWidth: column.maxWidth || 'auto',
                                                                }}
                                                                className={`col${
                                                                    column.className ? ` ${column.className}` : ''
                                                                }`}>
                                                                {typeof column.field === 'function'
                                                                    ? column.field({
                                                                          ...doc,
                                                                          provided,
                                                                      })
                                                                    : doc[column.field]}
                                                            </div>
                                                        ))}
                                                        {rowButtons?.length && (
                                                            <div
                                                                className='col col--controls'
                                                                style={{
                                                                    minWidth:
                                                                        rowButtons.reduce((width, button) => {
                                                                            if (!button.icon) {
                                                                                width += button.text.length * 0.9;
                                                                            } else {
                                                                                width += 2.06;
                                                                            }

                                                                            return width;
                                                                        }, 0) +
                                                                        (rowButtons.length - 1) * 0.75 +
                                                                        1.3 +
                                                                        'rem',
                                                                }}>
                                                                {rowButtons.map((button) => (
                                                                    <TableButton
                                                                        {...button}
                                                                        doc={doc}
                                                                        key={`${doc._id}-${uuid()}`}
                                                                        reloadTable={reloadRows}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <div
                        className='main'
                        style={{
                            minWidth: minTableWidth || 'auto',
                        }}>
                        <div className={`table-loading ${!loading ? ' hide' : ''}`}>
                            <Spinner animation='border' />
                        </div>
                        {rows.map((doc, index) => (
                            <div key={doc._id} className='row'>
                                {columns.map((column, i) => (
                                    <div
                                        key={`${doc._id}-${i}`}
                                        style={{
                                            minWidth: column.minWidth || 'auto',
                                            maxWidth: column.maxWidth || 'auto',
                                        }}
                                        className={`col${column.className ? ' ' + column.className : ''}`}>
                                        {typeof column.field === 'function'
                                            ? column.field(doc, index)
                                            : doc[column.field]}
                                    </div>
                                ))}
                                {rowButtons?.length && (
                                    <div
                                        className='col col--controls'
                                        style={{
                                            minWidth:
                                                rowButtons.reduce((width, button) => {
                                                    if (!button.icon) {
                                                        width += button.text.length * 0.9;
                                                    } else {
                                                        width += 2.06;
                                                    }

                                                    return width;
                                                }, 0) +
                                                (rowButtons.length - 1) * 0.75 +
                                                1.3 +
                                                'rem',
                                        }}>
                                        {rowButtons.map((button) => (
                                            <TableButton
                                                {...button}
                                                doc={doc}
                                                key={`${doc._id}-${uuid()}`}
                                                reloadTable={reloadRows}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {selectedColumnFilterIndex !== null && (
                            <MenuPopup className='table__filter-popup' parentRef={this.columnsRefs[selectedColumnFilterIndex]} isOpen={!!selectedColumnFilterIndex}>
                                <FilterComponent />
                            </MenuPopup>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
