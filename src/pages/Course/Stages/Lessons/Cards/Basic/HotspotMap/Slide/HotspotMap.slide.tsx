import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import apiFile from 'src/helpers/apiFile';
import Api from 'src/helpers/new/Api';
import LessonContext from '../../../../LessonContext';
import Canvas from './Canvas';
import './HotspotMap.slide.scss';

interface IRouteProps {
    lessonId: string;
}
export type TProps = IProps & RouteComponentProps<IRouteProps>;
export interface IProps {
    cardId: string;
    allowSkipNodes: boolean;
    sourceImage: any;
    nodes: any[];
    heading?: string;
    subHeading?: string;
    nodesTheme?: string;
    theme?: string;
}
interface IState {
    fileUrl?: string | null;
    title?: string;
    message?: string;
    activeNodeIndex?: number | null;
    viewedNodes: any[];
    ready?: boolean;
}
class HotspotMapCard extends Component<TProps, IState> {
    static contextType = LessonContext;

    async componentDidMount() {
        if (!this.props.allowSkipNodes) {
            this.context?.setIsBlockedByNodes?.(true);
        }
        this.setState({ fileUrl: await this.fetchFileUrl() });
    }

    async componentDidUpdate(prevProps: IProps, prevState: IState) {
        const newState: any = {};

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

    state: IState = {
        fileUrl: null,
        title: '',
        message: '',
        activeNodeIndex: null,
        viewedNodes: this.context?.hotspotsCardsViewedNodes?.[this.props.cardId] ?? [],
        ready: false,
    };

    canvasRef = {
        current: null,
    };

    canvasRefCallback = (e: any) => {
        if (e !== null) {
            this.canvasRef = {
                current: e,
            };
            this.setState({ ready: true });
        }
    };

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

    handleNodeClick = (i: any) => async (e: any) => {
        e.stopPropagation();
        // if (this.state.viewedNodes && this.state.viewedNodes.length > 0) {
        const viewedNodes = [...this.state.viewedNodes];
        const { activeNodeIndex } = this.state;
        let { title, message } = this.props.nodes[i],
            newActiveNodeIndex = i;

        if (activeNodeIndex !== null && !viewedNodes.includes(activeNodeIndex)) {
            const { cardId } = this.props,
                { lessonId } = this.props.match.params,
                { success } = await Api.call(
                    'post',
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
        // }
    };

    handleWrapperClick = async () => {
        const { activeNodeIndex } = this.state;

        if (activeNodeIndex !== null && this.state.viewedNodes) {
            const viewedNodes = [...this.state.viewedNodes];

            if (activeNodeIndex !== null && !viewedNodes.includes(activeNodeIndex)) {
                const { cardId } = this.props,
                    { lessonId } = this.props.match.params,
                    { success } = await Api.call(
                        'post',
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
        const { heading, subHeading, nodes, nodesTheme } = this.props,
            { fileUrl, viewedNodes, activeNodeIndex, title, message, ready } = this.state;
        return (
            <div className='hotspot-map-type'>
                <header>
                    {heading && <h1>{heading}</h1>}
                    {subHeading && <h3>{subHeading}</h3>}
                </header>
                {fileUrl && (
                    <div
                        ref={this.canvasRefCallback}
                        className={`canvas canvas--${nodesTheme}${activeNodeIndex !== null ? ' canvas--active' : ''}`}
                        onClick={this.handleWrapperClick}
                    >
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
                    <div className='popup'>
                        <span onClick={this.handleWrapperClick}>
                            <i className='fa-solid fa-times' />
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
