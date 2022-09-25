import { Modal, Popover, Overlay, Button } from 'react-bootstrap';
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import FileImage from '../../../../../../components/ApiFile/FileImage';
import TextInput from '../../../../../../components/inputs/TextInput';
import './HotspotMapPopup.scss';

export default class HotspotMapPopup extends Component {
    state = {
        nodes: this.props.nodes ?? [],
        activePopoverIndex: null,
        activeNodeRef: null,
        activeTitle: '',
        activeMessage: '',
    };

    componentDidUpdate(prevProps, prevState) {
        if (
            JSON.stringify(prevProps.nodes) !== JSON.stringify(this.props.nodes) &&
            JSON.stringify(this.state.nodes) !== JSON.stringify(this.props.nodes)
        ) {
            this.setState({ nodes });
        }
    }

    handleMapClick = (e) => {
        if (e.target.classList.contains('hotspot-map__node')) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect(),
            x = ((e.clientX - rect.x - 12) * 100) / rect.width,
            y = ((e.clientY - rect.y - 12) * 100) / rect.height,
            nodes = [...this.state.nodes],
            { activePopoverIndex, activeTitle, activeMessage } = this.state;

        nodes.push({ x, y, title: '', message: '' });

        if (activePopoverIndex !== null) {
            nodes[activePopoverIndex].title = activeTitle;
            nodes[activePopoverIndex].message = activeMessage;
        }

        this.setState({
            nodes,
            activePopoverIndex: nodes.length - 1,
            activeTitle: '',
            activeMessage: '',
        });
    };

    setActiveNodeRef = (el) => {
        if (el !== null) {
            this.setState({ activeNodeRef: el });
        }
    };

    handleNodeClick = (i) => (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { activePopoverIndex } = this.state;

        if (activePopoverIndex === i) {
            this.handleCloseNodePopover(i);
        } else {
            this.handleOpenNodePopover(i);
        }
    };

    handleCloseNodePopover = (i) => {
        const nodes = [...this.state.nodes],
            { activeTitle, activeMessage } = this.state;

        nodes[i] = {
            ...nodes[i],
            title: activeTitle,
            message: activeMessage,
        };

        this.setState({
            nodes,
            activeTitle: '',
            activeMessage: '',
            activePopoverIndex: null,
        });
    };

    handleOpenNodePopover = (i) => {
        const { title: activeTitle, message: activeMessage } = this.state.nodes[i];

        this.setState({
            activePopoverIndex: i,
            activeTitle,
            activeMessage,
        });
    };

    handleNodeRightClick = (i) => (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { activePopoverIndex } = this.state,
            nodes = [...this.state.nodes],
            newState = {};

        if (activePopoverIndex === i) {
            newState.activePopoverIndex = null;
            newState.activeTitle = '';
            newState.activeMessage = '';
        }

        nodes.splice(i, 1);

        newState.nodes = nodes;

        this.setState(newState);
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleSaveNodes = (e) => {
        const { activePopoverIndex } = this.state;

        if (activePopoverIndex === null) {
            this.props.onSave(this.state.nodes);
            return;
        }

        const nodes = [...this.state.nodes],
            { activeTitle, activeMessage } = this.state;

        nodes[activePopoverIndex] = {
            ...nodes[activePopoverIndex],
            title: activeTitle,
            message: activeMessage,
        };

        this.setState(
            {
                nodes,
                activeTitle: '',
                activeMessage: '',
                activePopoverIndex: null,
            },
            () => {
                this.props.onSave(this.state.nodes);
            }
        );
    };

    handleCloseMap = (e) => {
        this.setState(
            {
                activePopoverIndex: null,
            },
            this.props.onClose
        );
    };

    closePopup = () => {
        this.setState({
            activeTitle: '',
            activeMessage: '',
            activePopoverIndex: null,
        });
    };

    render() {
        const { sourceImage, isVisible } = this.props,
            { nodes, activePopoverIndex, activeNodeRef, activeTitle, activeMessage } = this.state;

        return (
            <>
                <Modal className='hotspot-map__modal' show={isVisible} enforceFocus={false}>
                    <Modal.Body>
                        <div onClick={this.handleMapClick} onContextMenu={(e) => e.preventDefault()}>
                            <FileImage draggable='false' fileId={sourceImage} />
                            {nodes.map(({ y, x }, i) => {
                                return (
                                    <div
                                        key={i}
                                        ref={activePopoverIndex === i ? this.setActiveNodeRef : null}
                                        className='hotspot-map__node'
                                        style={{ top: `${y}%`, left: `${x}%` }}
                                        onClick={this.handleNodeClick(i)}
                                        onContextMenu={this.handleNodeRightClick(i)}
                                    />
                                );
                            })}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleSaveNodes}>Save</Button>
                        <Button onClick={this.handleCloseMap}>Close</Button>
                    </Modal.Footer>
                </Modal>
                <Overlay target={activeNodeRef} show={activePopoverIndex !== null} placement='right'>
                    <Popover id='node-popover'>
                        <Popover.Content>
                            <FontAwesomeIcon onClick={this.closePopup} icon={faTimes} />
                            <label htmlFor='node-title'>
                                <b>Title</b>
                                <TextInput
                                    type='text'
                                    name='activeTitle'
                                    id='node-title'
                                    value={activeTitle}
                                    onChange={this.handleInputChange}
                                />
                            </label>
                            <label htmlFor='node-message' className='m-0'>
                                <b>Message</b>
                                <textarea
                                    style={{ resize: 'none' }}
                                    name='activeMessage'
                                    id='node-message'
                                    rows='5'
                                    value={activeMessage}
                                    onChange={this.handleInputChange}
                                />
                            </label>
                            <div className='hotspot-popup-buttons'>
                                <button
                                    className='save-hotspot'
                                    onClick={(e) => {
                                        this.handleNodeClick(activePopoverIndex)(e);
                                    }}>
                                    Save
                                </button>
                                <button
                                    className='delete-hotspot'
                                    onClick={(e) => {
                                        this.handleNodeRightClick(activePopoverIndex)(e);
                                    }}>
                                    Delete
                                </button>
                            </div>
                        </Popover.Content>
                    </Popover>
                </Overlay>
            </>
        );
    }
}

