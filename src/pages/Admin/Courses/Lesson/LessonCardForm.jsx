import React, { Component } from 'react';
import HeadingCard from './CardTypes/HeadingCard';
import ImageCard from './CardTypes/ImageCard';
import TextCard from './CardTypes/TextCard';
import VideoCard from './CardTypes/VideoCard';
import AudioCard from './CardTypes/AudioCard';
import AudioSampleCard from './CardTypes/AudioSampleCard';
import DocumentCard from './CardTypes/DocumentCard';
import QuizCard from './CardTypes/QuizCard';
import { QuestionCard } from './CardTypes/QuestionCard';
import HotspotMapCard from './CardTypes/HotspotMapCard/HotspotMapCard';
import HotspotListCard from './CardTypes/HostspotListCard';
import HorizontalListCard from './CardTypes/HorizontalListCard';
import MnemonicCard from './CardTypes/MnemonicCard';
import TransitionCard from './CardTypes/TransitionCard';

export default class LessonCardForm extends Component {
    render() {
        const { cardType, isNew, orderIndex, _id, cardTitle, theme } = this.props;

        switch (cardType) {
            case 'TRANSITION': {
                const { content, sourceImage, sourceIcon, iconPosition } = this.props;

                return (
                    <TransitionCard
                        sourceImage={sourceImage}
                        sourceIcon={sourceIcon}
                        iconPosition={iconPosition}
                        content={content}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        theme={theme}
                    />
                );
            }
            case 'HEADING': {
                const { heading, subHeading, content, bgColor, fgColor, info } = this.props;

                return (
                    <HeadingCard
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        bgColor={bgColor}
                        fgColor={fgColor}
                        info={info}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        theme={theme}
                    />
                );
            }
            case 'IMAGE': {
                const {
                    heading,
                    subHeading,
                    content,
                    sourceImage,
                    imageUrl,
                    imagePosition,
                    info,
                    imageImportance,
                    allowEnlargeImage,
                } = this.props;

                return (
                    <ImageCard
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        sourceImage={sourceImage}
                        imageUrl={imageUrl}
                        imagePosition={imagePosition}
                        info={info}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        imageImportance={imageImportance}
                        theme={theme}
                        allowEnlargeImage={allowEnlargeImage}
                    />
                );
            }
            case 'VIDEO': {
                const { transcript, info, sourceVideo, cardType } = this.props;

                return (
                    <VideoCard
                        transcript={transcript}
                        sourceVideo={sourceVideo}
                        info={info}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        theme={theme}
                    />
                );
            }
            case 'AUDIO': {
                const { heading, subHeading, content, transcript, info, sourceAudio } = this.props;

                return (
                    <AudioCard
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        transcript={transcript}
                        sourceAudio={sourceAudio}
                        info={info}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        theme={theme}
                    />
                );
            }
            // AUDIO_SAMPLE
            case 'AUDIO_BIG': {
                const { heading, subHeading, info, sourceAudio, cardType } = this.props;

                return (
                    <AudioSampleCard
                        heading={heading}
                        subHeading={subHeading}
                        sourceAudio={sourceAudio}
                        info={info}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        theme={theme}
                    />
                );
            }
            case 'DOCUMENT': {
                const { sourceDocument, heading, content } = this.props;

                return (
                    <DocumentCard
                        sourceDocument={sourceDocument}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        heading={heading}
                        content={content}
                        theme={theme}
                    />
                );
            }
            case 'SINGLE_QUESTION': {
                const {
                    heading,
                    subHeading,
                    info,
                    questionType,
                    questions,
                    nextCardAvailable,
                    correctFeedback,
                    incorrectFeedback,
                    detailedQuestion,
                    content,
                } = this.props;

                return (
                    <QuestionCard
                        heading={heading}
                        subHeading={subHeading}
                        info={info}
                        questionType={questionType}
                        questions={questions}
                        isNew={isNew}
                        cardId={_id}
                        content={content}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        nextCardAvailable={nextCardAvailable}
                        correctFeedback={correctFeedback}
                        incorrectFeedback={incorrectFeedback}
                        detailedQuestion={detailedQuestion}
                        theme={theme}
                    />
                );
            }
            case 'HOTSPOT_LIST': {
                const { heading, subHeading, content, imageTextList, info, direction, allowSkipNodes } = this.props;

                return (
                    <HotspotListCard
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        imageTextList={imageTextList}
                        info={info}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        direction={direction}
                        theme={theme}
                        allowSkipNodes={allowSkipNodes}
                    />
                );
            }
            case 'HOTSPOT_MAP': {
                const { heading, subHeading, nodes, sourceImage, nodesTheme, allowSkipNodes } = this.props;

                return (
                    <HotspotMapCard
                        heading={heading}
                        subHeading={subHeading}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        sourceImage={sourceImage}
                        nodes={nodes}
                        theme={theme}
                        nodesTheme={nodesTheme}
                        allowSkipNodes={allowSkipNodes}
                    />
                );
            }
            case 'HORIZONTAL_LIST': {
                const { heading, subHeading, content, horizontalListItems, info } = this.props;
                return (
                    <HorizontalListCard
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        horizontalListItems={horizontalListItems}
                        info={info}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        theme={theme}
                    />
                );
            }
            case 'QUIZ': {
                const { quizId, cardType, quizType } = this.props;

                return (
                    <QuizCard
                        quizId={quizId}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        theme={theme}
                        quizType={quizType}
                    />
                );
            }
            case 'MNEMONIC': {
                const { heading, subHeading, content, info, mnemonicList, allowSkipNodes } = this.props;

                return (
                    <MnemonicCard
                        isNew={isNew}
                        cardId={_id}
                        theme={theme}
                        orderIndex={orderIndex}
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        info={info}
                        mnemonicList={mnemonicList}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        allowSkipNodes={allowSkipNodes}
                    />
                );
            }
            default: {
                const { heading, subHeading, content, info, sourceImage } = this.props;

                return (
                    <TextCard
                        heading={heading}
                        subHeading={subHeading}
                        sourceImage={sourceImage}
                        content={content}
                        info={info}
                        isNew={isNew}
                        cardId={_id}
                        orderIndex={orderIndex}
                        cardTitle={cardTitle}
                        cardType={cardType}
                        theme={theme}
                    />
                );
            }
        }
    }
}
