import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { FileImage } from 'src/components/ApiFile';
import './HotspotList.slide.scss';
import HotspotPoint from 'src/components/HotspotPoint';
import LessonContext from '../../../../LessonContext';
import { Api } from 'src/helpers/new';

interface IRouteProps {
    lessonId: string;
}

export type TProps = IProps & RouteComponentProps<IRouteProps>;

export interface IProps {
    imageTextList: IImageText[];
    cardId: string;
    direction: string;
    allowSkipNodes: boolean;
    heading?: string;
    subHeading?: string;
    content?: string;
    theme?: string;
}
interface IImageText {
    content?: string;
    title?: string;
    image?: string;
}
export interface IState {
    activeContent: string;
    activeTitle: string;
    activeNodeIndex: number;
    viewedNodes: any[];
    hasManyItems?: boolean;
}
class HotspotListCard extends Component<TProps, IState> {
    static contextType = LessonContext;

    state: IState = {
        activeContent: this.props?.imageTextList?.[0]?.content || '',
        activeTitle: this.props?.imageTextList?.[0]?.title || '',
        activeNodeIndex: 0,
        viewedNodes: this.context?.hotspotsCardsViewedNodes?.[this.props.cardId] ?? [],
        hasManyItems: false,
    };

    listRef: React.RefObject<HTMLInputElement> = React.createRef();

    scrollPos = { top: 0, left: 0, x: 0, y: 0 };

    async componentDidMount() {
        this.handleNodeClick();
        await this.initList();
        window.addEventListener('resize', this.initList);
    }

    async componentDidUpdate(prevProps: IProps, prevState: IState) {
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            await this.initList();
        }

        if (
            !this.props.allowSkipNodes &&
            this.state?.viewedNodes?.length === this.props?.imageTextList?.length &&
            this.context.isBlockedByNodes !== false
        ) {
            this.context?.setIsBlockedByNodes?.(false);
            this.context?.setViewedNodes?.(this.props.cardId, this.state?.viewedNodes);
        }
    }

    componentWillUnmount() {
        window.addEventListener('resize', this.initList);
    }

    mouseMoveHandler = (e: any) => {
        if (this.listRef.current) {
            const dx = e.clientX - this.scrollPos.x;
            const dy = e.clientY - this.scrollPos.y;

            this.listRef.current.style.cursor = 'grabbing';
            this.listRef.current.style.userSelect = 'none';
            this.listRef.current.scrollTop = this.scrollPos.top - dy;
            this.listRef.current.scrollLeft = this.scrollPos.left - dx;
        }
    };

    mouseDownHandler = (e: any) => {
        if (this.listRef.current) {
            this.scrollPos = {
                left: this.listRef.current.scrollLeft,
                top: this.listRef.current.scrollTop,
                x: e.clientX,
                y: e.clientY,
            };

            this.listRef.current.addEventListener('mousemove', this.mouseMoveHandler);
            this.listRef.current.addEventListener('mouseup', this.mouseUpOrLeaveHandler);
            this.listRef.current.addEventListener('mouseleave', this.mouseUpOrLeaveHandler);
        }
    };

    mouseUpOrLeaveHandler = (e: any) => {
        if (this.listRef.current) {
            this.listRef.current.removeEventListener('mousemove', this.mouseMoveHandler);
            this.listRef.current.removeEventListener('mouseup', this.mouseUpOrLeaveHandler);
            this.listRef.current.removeEventListener('mouseleave', this.mouseUpOrLeaveHandler);

            this.listRef.current.style.cursor = 'grab';
            this.listRef.current.style.removeProperty('user-select');
        }
    };

    initList = async () => {
        const newState: IState = {
            viewedNodes: this.context?.hotspotsCardsViewedNodes?.[this.props.cardId] ?? [],
            activeContent: this.props?.imageTextList?.[0]?.content || '',
            activeTitle: this.props?.imageTextList?.[0]?.title || '',
            activeNodeIndex: 0,
        };

        if (!newState.viewedNodes.includes(0)) {
            const { cardId } = this.props,
                { lessonId } = this.props.match.params,
                { success } = await Api.call('post', `/users/lessons/${lessonId}/cards/${cardId}/hotspots/0/viewed`);

            if (success) {
                newState.viewedNodes.push(0);
            }
        }

        if (this.listRef.current) {
            const listRef = this.listRef.current,
                { imageTextList, direction } = this.props,
                itemSize = 94, // item width + margin
                maxMeasure = direction === 'vertical' ? listRef.offsetHeight : listRef.offsetWidth;
            // +14 because the first item also has margin at the start
            if (imageTextList?.length * itemSize + 14 > maxMeasure) {
                newState.hasManyItems = true;
            }

            listRef.addEventListener('mousedown', this.mouseDownHandler);
        }

        this.setState(newState, () => {
            if (!this.props.allowSkipNodes && this.state?.viewedNodes?.length !== this.props?.imageTextList?.length) {
                if (this.context?.isBlockedByNodes !== true) {
                    this.context?.setIsBlockedByNodes?.(true);
                }
            } else {
                if (this.context?.isBlockedByNodes !== false) {
                    this.context?.setIsBlockedByNodes?.(false);
                    this.context?.setViewedNodes?.(this.props.cardId, this.state?.viewedNodes);
                }
            }
        });
    };

    handleNodeClick =
        (i: any = 0) =>
        async (e: any) => {
            e.stopPropagation();

            const viewedNodes = [...this.state.viewedNodes];
            const { activeNodeIndex } = this.state;
            let newActiveNodeIndex = i;

            if (activeNodeIndex !== null && !viewedNodes.includes(newActiveNodeIndex)) {
                const { cardId } = this.props,
                    { lessonId } = this.props.match.params,
                    { success } = await Api.call(
                        'post',
                        `/users/lessons/${lessonId}/cards/${cardId}/hotspots/${newActiveNodeIndex}/viewed`
                    );

                if (success) {
                    viewedNodes.push(newActiveNodeIndex);
                }
            }

            if (activeNodeIndex === newActiveNodeIndex) {
                newActiveNodeIndex = null;
            }

            this.setState({
                viewedNodes,
                activeNodeIndex: newActiveNodeIndex,
                activeContent: this.props?.imageTextList?.[i]?.content || '',
                activeTitle: this.props?.imageTextList?.[i]?.title || '',
            });
        };

    render() {
        const { heading, subHeading, content, imageTextList, direction } = this.props,
            { activeContent, activeNodeIndex, viewedNodes, hasManyItems } = this.state;

        return (
            <div className={`${direction}`}>
                <header className={`header`}>
                    {heading && <h1>{heading}</h1>}
                    {subHeading && <h3>{subHeading}</h3>}
                </header>
                {content && <section className='section' dangerouslySetInnerHTML={{ __html: content }} />}
                <div className='hotspotContent'>
                    {imageTextList && (
                        <div ref={this.listRef} className={`list`}>
                            {imageTextList.map((listItem, i) => (
                                <div
                                    className={`item${activeNodeIndex === i ? ` active` : ''}${
                                        viewedNodes.includes(i) ? ` viewed` : ''
                                    }`}
                                    // data-manysiblings={hasManyItems}
                                    onClick={this.handleNodeClick(i)}
                                    key={i}
                                >
                                    <FileImage fileId={listItem.image} draggable='false' />
                                    <h6>{listItem.title}</h6>
                                    <HotspotPoint
                                        className={`hotspotIcon--${direction}`}
                                        isViewed={viewedNodes.includes(i)}
                                        isActive={activeNodeIndex === i}
                                        index={i}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className='activeItemContent'>
                        {activeNodeIndex !== null ? (
                            <span dangerouslySetInnerHTML={{ __html: activeContent }} />
                        ) : (
                            <span className='greyed'>Select an image reveal more...</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(HotspotListCard);
