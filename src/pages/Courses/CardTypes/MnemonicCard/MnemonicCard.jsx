import React, { Component } from 'react';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './MnemonicCard.scss';
import MnemonicList from './MnemonicList';
import { LessonContext } from '../../LessonContext';
import { withRouter } from 'react-router';
import apiCall from '../../../../helpers/apiCall';
import CardButtons from '../../../../components/CardButtons';

export class MnemonicCard extends Component {
    static contextType = LessonContext;

    state = {
        activeItemIndex: null,
        title: '',
        message: '',
        viewedNodes: this.context?.hotspotsCardsViewedNodes?.[this.props.cardId] ?? [],
        totalNodes: this.props?.mnemonicList?.reduce?.((count, row) => count + row.length, 0) ?? 0,
        infoOpen: false,
    };

    componentDidMount() {
        if (!this.props.allowSkipNodes) {
            this.context?.setIsBlockedByNodes?.(true);
        }
    }

    componentDidUpdate(prevProps, prevState) {
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

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    setActiveItemIndex = (activeItemIndex) => async (e) => {
        const [rowIndex, itemIndex] = activeItemIndex,
            { title, content: message } = this.props.mnemonicList[rowIndex][itemIndex],
            viewedNodes = [...this.state.viewedNodes];

        if (activeItemIndex !== null && !viewedNodes.includes(`${rowIndex}-${itemIndex}`)) {
            const { cardId } = this.props,
                { lessonId } = this.props.match.params,
                { success } = await apiCall(
                    'POST',
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
        const { heading, subHeading, content, mnemonicList, info } = this.props,
            { activeItemIndex, title, message } = this.state;

        return (
            <div className='lesson-cards__mnemonic-type'>
                {info && <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={this.state.infoOpen} />}
                <header>
                    {heading && <h1>{heading}</h1>}
                    {subHeading && <h3>{subHeading}</h3>}
                </header>
                {content && (
                    <div
                        className='lesson-cards__mnemonic-type__content'
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                )}
                <MnemonicList
                    activeItemIndex={activeItemIndex}
                    rows={mnemonicList}
                    onItemClick={this.setActiveItemIndex}
                    viewedNodes={this.state.viewedNodes}
                />
                {activeItemIndex !== null && (
                    <div className='lesson-cards__mnemonic-type__popup'>
                        <span onClick={this.unsetActiveItemIndex}>
                            <Fa icon={faTimes} />
                        </span>
                        <h1>{title}</h1>
                        <div dangerouslySetInnerHTML={{ __html: message }} />
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(MnemonicCard);
