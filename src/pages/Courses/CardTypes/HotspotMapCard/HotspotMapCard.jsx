import React, { Component } from 'react';
import apiFile from '../../../../helpers/apiFile';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import apiCall from '../../../../helpers/apiCall';
import { withRouter } from 'react-router-dom';
import { LessonContext } from '../../LessonContext';
import Canvas from './Canvas';
import CardButtons from '../../../../components/CardButtons';
import './HotspotMapCard.scss';

class HotspotMapCard extends Component {
    static contextType = LessonContext;

    state = {
        fileUrl: null,
        title: '',
        message: '',
        activeNodeIndex: null,
        viewedNodes: this.context?.hotspotsCardsViewedNodes?.[this.props.cardId] ?? [],
        ready: false,
        infoOpen: false,
    };

    canvasRef = {
        current: null,
    };

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    canvasRefCallback = (e) => {
        if (e !== null) {
            this.canvasRef = {
                current: e,
            };
            this.setState({ ready: true });
        }
    };

    async componentDidMount() {
        if (!this.props.allowSkipNodes) {
            this.context?.setIsBlockedByNodes?.(true);
        }
        this.setState({ fileUrl: await this.fetchFileUrl() });
    }

    async componentDidUpdate(prevProps, prevState) {
        const newState = {};

        if (prevProps.sourceImage !== this.props.sourceImage) {
            newState.fileUrl = await this.fetchFileUrl();
        }

        if (prevProps.cardId !== this.props.cardId) {
            newState.viewedNodes = this.context?.hotspotsCardsViewedNodes?.[this.props.cardId] ?? [];
        }

        if (!this.props.allowSkipNodes && this.state?.viewedNodes?.length !== this.props?.nodes?.length) {
            if (this.context?.isBlockedByNodes !== true) {
                this.context?.setIsBlockedByNodes?.(true);
            }
        } else {
            if (this.context?.isBlockedByNodes !== false) {
                this.context?.setIsBlockedByNodes?.(false);
                this.context?.setViewedNodes?.(this.props.cardId, this.state?.viewedNodes);
            }
        }

        if (Object.keys(newState).length !== 0) {
            this.setState(newState);
        }
    }

    fetchFileUrl = async () => {
        const { sourceImage } = this.props;
        let fileUrl;

        if (sourceImage && typeof sourceImage === 'string' && sourceImage.substr(0, 4) !== 'blob') {
            fileUrl = await apiFile(sourceImage);
        }

        if (sourceImage instanceof File) {
            fileUrl = URL.createObjectURL(sourceImage);
        }

        if (Array.isArray(sourceImage)) {
            fileUrl = sourceImage[1];
        }

        return fileUrl;
    };

    handleNodeClick = (i) => async (e) => {
        e.stopPropagation();

        const viewedNodes = [...this.state.viewedNodes];
        let { activeNodeIndex } = this.state,
            { title, message } = this.props.nodes[i],
            newActiveNodeIndex = i;

        if (activeNodeIndex !== null && !viewedNodes.includes(activeNodeIndex)) {
            const { cardId } = this.props,
                { lessonId } = this.props.match.params,
                { success } = await apiCall(
                    'POST',
                    `/users/lessons/${lessonId}/cards/${cardId}/hotspots/${activeNodeIndex}/viewed`
                );

            if (success) {
                viewedNodes.push(activeNodeIndex);
            }
        }

        if (activeNodeIndex === i) {
            newActiveNodeIndex = null;
            title = '';
            message = '';
        }

        this.setState({
            viewedNodes,
            title,
            message,
            activeNodeIndex: newActiveNodeIndex,
        });
    };

    handleWrapperClick = async () => {
        const { activeNodeIndex } = this.state;

        if (activeNodeIndex !== null) {
            const viewedNodes = [...this.state.viewedNodes];

            if (activeNodeIndex !== null && !viewedNodes.includes(activeNodeIndex)) {
                const { cardId } = this.props,
                    { lessonId } = this.props.match.params,
                    { success } = await apiCall(
                        'POST',
                        `/users/lessons/${lessonId}/cards/${cardId}/hotspots/${activeNodeIndex}/viewed`
                    );

                if (success) {
                    viewedNodes.push(activeNodeIndex);
                }
            }

            this.setState({
                viewedNodes,
                activeNodeIndex: null,
                title: '',
                message: '',
            });
        }
    };

    render() {
        const { heading, subHeading, nodes, nodesTheme, info } = this.props,
            { fileUrl, viewedNodes, activeNodeIndex, title, message, ready } = this.state;
        return (
            <div className='lesson-cards__hotspot-map-type'>
                {info && <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={this.state.infoOpen} />}
                <header>
                    {heading && <h1>{heading}</h1>}
                    {subHeading && <h3>{subHeading}</h3>}
                </header>
                {fileUrl && (
                    <div
                        ref={this.canvasRefCallback}
                        className={`lesson-cards__hotspot-map-type__canvas lesson-cards__hotspot-map-type__canvas--${nodesTheme}${
                            activeNodeIndex !== null ? ' lesson-cards__hotspot-map-type__canvas--active' : ''
                        }`}
                        onClick={this.handleWrapperClick}>
                        {ready && (
                            <Canvas
                                fileUrl={fileUrl}
                                canvasRef={this.canvasRef}
                                handleNodeClick={this.handleNodeClick}
                                viewedNodes={viewedNodes}
                                activeNodeIndex={activeNodeIndex}
                                nodes={nodes}
                            />
                        )}
                    </div>
                )}
                {activeNodeIndex !== null && (
                    <div className='lesson-cards__hotspot-map-type__popup'>
                        <span onClick={this.handleWrapperClick}>
                            <Fa icon={faTimes} />
                        </span>
                        <h1>{title}</h1>
                        <div>{message}</div>
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(HotspotMapCard);
