import React from 'react';
import BaseCard from '../BaseCard';
import { AsyncPreviewFileUpload } from '../../../../../../components/FileUpload';
import uuid from 'react-uuid';
import HotspotMapPopup from './HotspotMapPopup';
import ThemeOptions from '../ThemeOptions';
import TextInput from '../../../../../../components/inputs/TextInput';
import { Accordion } from 'react-bootstrap';
import Editor from '../../../../../../components/Editor';
import './HotspotMapCard.scss';

export default class HotspotMapCard extends BaseCard {
    state = {
        info: this.props.info ?? '',
        theme: this.props.theme ?? '',
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        sourceImage: this.props.sourceImage ?? undefined,
        nodes: this.props.nodes ?? [],
        nodesTheme: this.props.nodesTheme ?? 'navy',
        isPopupVisible: false,
        allowSkipNodes: this.props.allowSkipNodes ?? false,
    };

    handleFileChange = (e, file) => {
        const input = e.target;

        this.setState(
            {
                [input.name]: file,
            },
            this.dispatchLessonChange
        );
    };

    updateNodes = (nodes) => {
        this.setState({ nodes }, this.dispatchLessonChange);
        this.toggleNodesPopup();
    };

    toggleNodesPopup = () => {
        this.setState({
            isPopupVisible: !this.state.isPopupVisible,
        });
    };

    render() {
        const {
            state: { heading, subHeading, sourceImage, nodes, isPopupVisible, theme, nodesTheme, allowSkipNodes, info },
            props: { orderIndex },
        } = this;

        return (
            <div className='hotspot-map-card'>
                <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
                <div>
                    <label htmlFor={`heading-${orderIndex}`}>Heading</label>
                    <TextInput
                        type='text'
                        name='heading'
                        id={`heading-${orderIndex}`}
                        defaultValue={heading}
                        onChange={this.handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor={`subHeading-${orderIndex}`}>Subheading</label>
                    <TextInput
                        type='text'
                        name='subHeading'
                        id={`subHeading-${orderIndex}`}
                        defaultValue={subHeading}
                        onChange={this.handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor={`allowSkipNodes-${orderIndex}`}>
                        Allow students to progress without viewing all the nodes?&nbsp;&nbsp;&nbsp;
                        <input
                            type='checkbox'
                            name='allowSkipNodes'
                            id={`allowSkipNodes-${orderIndex}`}
                            checked={allowSkipNodes}
                            onChange={this.handleCheckboxClick}
                        />
                    </label>
                </div>
                <div>
                    <AsyncPreviewFileUpload
                        label='Option image'
                        type='image'
                        name='sourceImage'
                        id={`question-image-${uuid()}`}
                        file={sourceImage}
                        onChange={this.handleFileChange}
                    />
                    <small>
                        <p>Recommended sizes to prevent panning</p>
                        <ul>
                            <li>800x400 - without heading and subheading</li>
                            <li>800x341 - just heading</li>
                            <li>800x312 - with both heading and subheading</li>
                        </ul>
                    </small>
                </div>
                <div>
                    <label htmlFor={`nodesTheme-${orderIndex}`}>Nodes color theme</label>
                    <select
                        name='nodesTheme'
                        id={`nodesTheme-${orderIndex}`}
                        value={nodesTheme}
                        onChange={this.handleInputChange}>
                        <option value='navy'>Navy</option>
                        <option value='green'>Green</option>
                    </select>
                </div>
                <button className='set-hotspots' onClick={this.toggleNodesPopup}>
                    Set hotspots
                </button>
                <HotspotMapPopup
                    onClose={this.toggleNodesPopup}
                    onSave={this.updateNodes}
                    sourceImage={sourceImage}
                    nodes={nodes}
                    isVisible={isPopupVisible}
                />
                <Accordion as='footer' className='lesson-cards__item__extras'>
                    <Accordion.Toggle as='button' className='bd' eventKey='0'>
                        Extras
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey='0'>
                        <main>
                            <label htmlFor={`info-${orderIndex}`}>Info</label>
                            <Editor
                                defaultValue={info}
                                name='info'
                                id={`info-${orderIndex}`}
                                onChange={this.handleInputChange}
                            />
                        </main>
                    </Accordion.Collapse>
                </Accordion>
            </div>
        );
    }
}
