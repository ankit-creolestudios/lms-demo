import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import './Mnemonic.slide.scss';
import MnemonicList from './MnemonicList';
import LessonContext from '../../../../LessonContext';
import { Api, EventBus } from 'src/helpers/new';

interface IRouteProps {
    lessonId: string;
}

export interface IProps {
    mnemonicList: any[];
    heading?: string;
    subHeading?: string;
    content?: string;
    cardId: string;
    allowSkipNodes: boolean;
    theme?: string;
}
interface IMnemonicList {}
interface IState {
    activeItemIndex: number[] | null;
    title: string;
    message: string;
    viewedNodes: string[];
    totalNodes: number;
}
export type TProps = IProps & RouteComponentProps<IRouteProps>;

export class MnemonicCard extends Component<TProps, IState> {
    static contextType = LessonContext;

    state: IState = {
        activeItemIndex: null,
        title: '',
        message: '',
        viewedNodes: this.context?.hotspotsCardsViewedNodes?.[this.props.cardId] ?? [],
        totalNodes: this.props?.mnemonicList?.reduce?.((count, row) => count + row.length, 0) ?? 0,
    };

    componentDidMount() {
        if (!this.props.allowSkipNodes) {
            this.context?.setIsBlockedByNodes?.(true);
        }
    }

    componentDidUpdate(prevProps: TProps, prevState: IState) {
        if (prevProps.cardId !== this.props.cardId) {
            this.setState(
                {
                    viewedNodes: this.context?.hotspotsCardsViewedNodes?.[this.props.cardId] ?? [],
                    totalNodes: this.props?.mnemonicList?.reduce?.((count, row) => count + row.length, 0) ?? 0,
                },
                () => {
                    if (
                        !this.props.allowSkipNodes &&
                        this.state?.viewedNodes?.length !== this.state.totalNodes &&
                        this.context?.isBlockedByNodes !== true
                    ) {
                        this.context?.setIsBlockedByNodes?.(true);
                    }
                }
            );
        }

        if (
            !this.props.allowSkipNodes &&
            this.state?.viewedNodes?.length === this.state.totalNodes &&
            this.context?.isBlockedByNodes !== false
        ) {
            this.context?.setIsBlockedByNodes?.(false);
            this.context?.setViewedNodes?.(this.props.cardId, this.state?.viewedNodes);
        }
    }

    setActiveItemIndex = (activeItemIndex: number[]) => async (e: any) => {
        const [rowIndex, itemIndex] = activeItemIndex,
            { title, content: message } = this.props.mnemonicList[rowIndex][itemIndex],
            viewedNodes = [...this.state.viewedNodes];

        if (activeItemIndex !== null && !viewedNodes.includes(`${rowIndex}-${itemIndex}`)) {
            const { cardId } = this.props,
                { lessonId } = this.props?.match?.params,
                { success } = await Api.call(
                    'post',
                    `/users/lessons/${lessonId}/cards/${cardId}/hotspots/${rowIndex}-${itemIndex}/viewed`
                );

            if (success) {
                viewedNodes.push(`${rowIndex}-${itemIndex}`);
            }
        }

        this.setState({
            activeItemIndex,
            title,
            message,
            viewedNodes,
        });
    };

    unsetActiveItemIndex = () => {
        this.setState({
            activeItemIndex: null,
            title: '',
            message: '',
        });
    };

    render() {
        const { heading, subHeading, content, mnemonicList } = this.props,
            { activeItemIndex, title, message } = this.state;

        return (
            <>
                <header>
                    {heading && <h1>{heading}</h1>}
                    {subHeading && <h3>{subHeading}</h3>}
                </header>
                {content && <div className='content' dangerouslySetInnerHTML={{ __html: content }} />}
                <MnemonicList
                    activeItemIndex={activeItemIndex}
                    rows={mnemonicList}
                    onItemClick={this.setActiveItemIndex}
                    viewedNodes={this.state.viewedNodes}
                />
                {activeItemIndex !== null && (
                    <div className='popup'>
                        <span onClick={this.unsetActiveItemIndex}>
                            <i className='fa-solid fa-times' />
                        </span>
                        <h1>{title}</h1>
                        <div dangerouslySetInnerHTML={{ __html: message }} />
                    </div>
                )}
            </>
        );
    }
}

export default withRouter(MnemonicCard);
