import React, { Component } from 'react';

import {
    TextCard,
    HeadingCard,
    EndOfChapterQuiz,
    ImageCard,
    DocumentCard,
    VideoCard,
    HotspotListCard,
    HorizontalListCard,
    HotspotMapCard,
} from './CardTypes';
import AudioCard from './CardTypes/AudioCard';
import BaseQuestionCard from './CardTypes/interactive/questions/BaseQuestionCard';
import MnemonicCard from './CardTypes/MnemonicCard/MnemonicCard';
import TransitionCard from './CardTypes/TransitionCard';

export default class LessonCard extends Component {
    state = {
        isComponentReady: false,
    };

    themeRef = React.createRef();

    get cardSwitch() {
        const {
            _id,
            lessonLayout,
            cardType,
            heading,
            subHeading,
            content,
            bgColor,
            fgColor,
            info,
            sourceImage,
            sourceDocument,
            sourceVideo,
            sourceAudio,
            imageImportance,
            transcript,
            imagePosition,
            imageUrl,
            questions,
            nextCardAvailable,
            questionAttempt,
            questionType,
            imageTextList,
            horizontalListItems,
            nodes,
            lessonId,
            correctFeedback,
            incorrectFeedback,
            detailedQuestion,
            direction,
            updateBlockingCardIndex,
            cardIndex,
            allowEnlargeImage,
            nodesTheme,
            allowSkipNodes,
            quizId
        } = this.props;

        switch (cardType) {
            case 'HEADING': {
                return (
                    <HeadingCard
                        cardIndex={cardIndex}
                        cardType={cardType}
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        bgColor={bgColor}
                        fgColor={fgColor}
                        info={info}
                    />
                );
            }
            case 'TEXT': {
                return (
                    <TextCard
                        cardIndex={cardIndex}
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        info={info}
                        sourceImage={sourceImage}
                    />
                );
            }
            case 'IMAGE': {
                return (
                    <ImageCard
                        cardIndex={cardIndex}
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        info={info}
                        imageId={sourceImage}
                        imagePosition={imagePosition}
                        imageImportance={imageImportance}
                        allowEnlargeImage={allowEnlargeImage}
                        imageUrl={imageUrl}
                        cardId={_id}
                    />
                );
            }
            case 'AUDIO': {
                return (
                    <AudioCard
                        cardIndex={cardIndex}
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        transcript={transcript}
                        sourceAudio={sourceAudio}
                        info={info}
                    />
                );
            }
            case 'DOCUMENT': {
                return (
                    <DocumentCard
                        cardIndex={cardIndex}
                        fileId={sourceDocument}
                        lessonLayout={lessonLayout}
                        heading={heading}
                        content={content}
                        info={info}
                    />
                );
            }
            case 'VIDEO': {
                return <VideoCard info={info} cardIndex={cardIndex} videoId={sourceVideo} transcript={transcript} />;
            }
            case 'QUIZ': {
                return <EndOfChapterQuiz info={info} cardIndex={cardIndex} quizId={quizId} lessonLayout={lessonLayout} cardId={_id} />;
            }
            case 'SINGLE_QUESTION': {
                return (
                    <BaseQuestionCard
                        cardIndex={cardIndex}
                        heading={heading}
                        subHeading={subHeading}
                        nextCardAvailable={nextCardAvailable}
                        setNextCardAvailable={this.props.setNextCardAvailable}
                        bgColor={bgColor}
                        fgColor={fgColor}
                        questions={questions}
                        questionAttempt={questionAttempt}
                        id={_id}
                        detailedQuestion={detailedQuestion}
                        questionType={questionType}
                        correctFeedback={correctFeedback}
                        incorrectFeedback={incorrectFeedback}
                        content={content}
                        updateBlockingCardIndex={updateBlockingCardIndex}
                        info={info}
                    />
                );
            }
            case 'HOTSPOT_LIST': {
                return (
                    <HotspotListCard
                        cardIndex={cardIndex}
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        direction={direction}
                        imageTextList={imageTextList}
                        cardId={_id}
                        allowSkipNodes={allowSkipNodes}
                        info={info}
                    />
                );
            }
            case 'HORIZONTAL_LIST': {
                return (
                    <HorizontalListCard
                        cardIndex={cardIndex}
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        horizontalListItems={horizontalListItems}
                        id={_id}
                        info={info}
                    />
                );
            }
            case 'HOTSPOT_MAP': {
                return (
                    <HotspotMapCard
                        cardIndex={cardIndex}
                        heading={heading}
                        subHeading={subHeading}
                        sourceImage={sourceImage}
                        nodes={nodes}
                        cardId={_id}
                        lessonId={lessonId}
                        nodesTheme={nodesTheme}
                        allowSkipNodes={allowSkipNodes}
                        info={info}
                    />
                );
            }
            case 'MNEMONIC': {
                const { mnemonicList } = this.props;
                return (
                    <MnemonicCard
                        cardIndex={cardIndex}
                        heading={heading}
                        subHeading={subHeading}
                        mnemonicList={mnemonicList}
                        content={content}
                        cardId={_id}
                        lessonId={lessonId}
                        allowSkipNodes={allowSkipNodes}
                        info={info}
                    />
                );
            }
            case 'TRANSITION': {
                const { sourceIcon, iconPosition } = this.props;

                return (
                    <TransitionCard
                        cardIndex={cardIndex}
                        sourceIcon={sourceIcon}
                        iconPosition={iconPosition}
                        sourceImage={sourceImage}
                        content={content}
                        cardId={_id}
                        lessonId={lessonId}
                        info={info}
                    />
                );
            }
            default: {
                return <div></div>;
            }
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                isComponentReady: true,
            });
        }, 250);
    }

    componentDidUpdate(prevProps) {
        if (this.props?.cardsQuiz?.isInQuiz && !prevProps?.cardsQuiz?.isInQuiz) {
            if (this.themeRef.current) {
                this.themeRef.current.scrollTo(0, 0);
            }
        }

        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            this.setState(
                {
                    isComponentReady: false,
                },
                () => {
                    setTimeout(() => {
                        this.setState({ isComponentReady: true });
                    }, 400);
                }
            );
        }
    }

    render() {
        const { theme, lessonLayout, cardsQuiz } = this.props,
            { isComponentReady } = this.state;

        return (
            <main
                ref={this.themeRef}
                className={`lesson-cards__theme-${theme || 'default'}${isComponentReady ? ' lesson-cards__ready' : ''}${
                    lessonLayout === 'card' && cardsQuiz?.isInQuiz ? ' no-scroll' : ''
                }`}>
                {this.cardSwitch}
            </main>
        );
    }
}
