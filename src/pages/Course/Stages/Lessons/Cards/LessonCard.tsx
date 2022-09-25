import React, { Component } from 'react';
import {
    TextCard,
    HeadingCard,
    ImageCard,
    DocumentCard,
    AudioCard,
    VideoCard,
    HorizontalListCard,
    MnemonicCard,
    TransitionCard,
    HotspotListCard,
    HotspotMapCard,
} from './';
import { QuizCard, QuestionCard } from './Interactive';
import { ButtonList, IButton } from './Components';
import { ButtonModal, InfoModal, ImageModal } from './Components/Modal';
import './LessonCard.scss';

export type TPageCards =
    | 'TEXT'
    | 'HEADING'
    | 'IMAGE'
    | 'DOCUMENT'
    | 'AUDIO'
    | 'VIDEO'
    | 'QUIZ'
    | 'HORIZONTAL_LIST'
    | 'MNEMONIC'
    | 'TRANSITION'
    | 'HOTSPOT_LIST'
    | 'HOTSPOT_MAP'
    | 'SINGLE_QUESTION';

export interface ICard {
    _id: string;
    cardType: TPageCards;
    cardTitle: 'string';
    heading?: string;
    subHeading?: string;
    content?: string;
    info?: string;
    sourceImage?: string;
    imagePosition?: string;
    imageUrl?: string;
    sourceDocument?: string;
    transcript?: string;
    sourceAudio?: string;
    sourceVideo?: string;
    theme?: string;
    quiz?: any;
    quizAttempts: any[];
    quizPassed: boolean;
    lastQuizAttempt: any;
    quizType?: string;
    imageImportance?: boolean;
    allowEnlargeImage?: boolean;
    horizontalListItems: any[];
    mnemonicList: any[];
    allowSkipNodes: boolean;
    sourceIcon: string;
    iconPosition: string;
    direction: string;
    imageTextList: any[];
    nodes: any[];
    nodesTheme?: string;
    cardIndex: number;
    nextCardAvailable?: string;
    setNextCardAvailable?: string;
    bgColor?: string;
    fgColor?: string;
    questions?: string;
    questionAttempt?: string;
    detailedQuestion?: string;
    questionType?: string;
    correctFeedback?: string;
    incorrectFeedback?: string;
    updateBlockingCardIndex?: string;
    quizId: string;
}

interface IState {
    buttons: IButton[];
}

export default class LessonCard extends Component<ICard, IState> {
    state = {
        buttons: [],
    };

    componentDidUpdate(prevProps: ICard) {
        if (prevProps.info !== this.props.info) {
            this.generateButtons();
        }
    }

    componentDidMount() {
        this.generateButtons();
    }

    renderCard = () => {
        const props = this.props;

        switch (props.cardType) {
            case 'TEXT':
                return (
                    <TextCard
                        heading={props.heading}
                        subHeading={props.subHeading}
                        content={props.content}
                        sourceImage={props.sourceImage}
                        theme={props.theme}
                    />
                );
            case 'HEADING':
                return (
                    <HeadingCard
                        heading={props.heading}
                        subHeading={props.subHeading}
                        content={props.content}
                        theme={props.theme}
                    />
                );
            case 'IMAGE':
                return (
                    <ImageCard
                        heading={props.heading}
                        subHeading={props.subHeading}
                        content={props.content}
                        sourceImage={props.sourceImage}
                        imagePosition={props.imagePosition}
                        imageUrl={props.imageUrl}
                        theme={props.theme}
                        imageImportance={props.imageImportance}
                    />
                );
            case 'DOCUMENT':
                return (
                    <DocumentCard
                        heading={props.heading}
                        content={props.content}
                        sourceDocument={props.sourceDocument}
                        theme={props.theme}
                    />
                );
            case 'AUDIO':
                return (
                    <AudioCard
                        heading={props.heading}
                        subHeading={props.subHeading}
                        content={props.content}
                        transcript={props.transcript}
                        sourceAudio={props.sourceAudio}
                        theme={props.theme}
                    />
                );
            case 'VIDEO':
                return <VideoCard sourceVideo={props.sourceVideo} transcript={props.transcript} theme={props.theme} />;
            case 'HORIZONTAL_LIST':
                return (
                    <HorizontalListCard
                        heading={props.heading}
                        subHeading={props.subHeading}
                        content={props.content}
                        horizontalListItems={props.horizontalListItems}
                    />
                );
            case 'MNEMONIC': {
                return (
                    <MnemonicCard
                        heading={props.heading}
                        theme={props.theme}
                        subHeading={props.subHeading}
                        mnemonicList={props.mnemonicList}
                        content={props.content}
                        cardId={props._id}
                        allowSkipNodes={props.allowSkipNodes}
                    />
                );
            }
            case 'TRANSITION': {
                const { sourceIcon, iconPosition, sourceImage, info, content, theme } = this.props;

                return (
                    <TransitionCard
                        sourceIcon={sourceIcon}
                        iconPosition={iconPosition}
                        sourceImage={sourceImage}
                        content={content}
                        theme={theme}
                    />
                );
            }
            case 'HOTSPOT_LIST': {
                return (
                    <HotspotListCard
                        heading={props.heading}
                        subHeading={props.subHeading}
                        content={props.content}
                        direction={props.direction}
                        imageTextList={props.imageTextList}
                        cardId={props._id}
                        allowSkipNodes={props.allowSkipNodes}
                    />
                );
            }
            case 'HOTSPOT_MAP': {
                return (
                    <HotspotMapCard
                        heading={props.heading}
                        subHeading={props.subHeading}
                        sourceImage={props.sourceImage}
                        nodes={props.nodes}
                        cardId={props._id}
                        nodesTheme={props.nodesTheme}
                        allowSkipNodes={props.allowSkipNodes}
                    />
                );
            }
            case 'QUIZ':
                return (
                    <QuizCard
                        quiz={props.quiz}
                        quizAttempts={props.quizAttempts}
                        quizPassed={props.quizPassed}
                        lastAttempt={props.lastQuizAttempt}
                        quizType={props.quizType}
                        cardId={props._id}
                        quizId={props.quizId}
                        cardIndex={props.cardIndex}
                    />
                );
            case 'SINGLE_QUESTION':
                return (
                    <QuestionCard
                        heading={props.heading}
                        subHeading={props.subHeading}
                        nextCardAvailable={props.nextCardAvailable}
                        setNextCardAvailable={props.setNextCardAvailable}
                        bgColor={props.bgColor}
                        fgColor={props.fgColor}
                        questions={props.questions}
                        questionAttempt={props.questionAttempt}
                        id={props._id}
                        detailedQuestion={props.detailedQuestion}
                        questionType={props.questionType}
                        correctFeedback={props.correctFeedback}
                        incorrectFeedback={props.incorrectFeedback}
                        content={props.content}
                        updateBlockingCardIndex={props.updateBlockingCardIndex}
                        theme={props.theme}
                    />
                );
            default:
                return <b>Card not supported - {props.cardType}</b>;
        }
    };

    generateButtons = () => {
        const props = this.props;

        const buttons: IButton[] = [];

        if (props.info) {
            buttons.push({
                cardId: props._id,
                icon: 'fa-info',
                title: 'More Info',
                component: <InfoModal info={props.info} />,
                buttonKey: 'info',
            });
        }

        if (props.cardType === 'IMAGE' && props.sourceImage && props.allowEnlargeImage) {
            buttons.push({
                cardId: props._id,
                icon: 'fa-expand-alt',
                title: 'Enlarge Image',
                component: <ImageModal imageId={props.sourceImage} />,
                buttonKey: 'image',
            });
        }

        this.setState({
            buttons,
        });
    };

    render() {
        const { buttons } = this.state;
        const { _id } = this.props;

        return (
            <div className='lesson-card'>
                <ButtonList buttons={buttons ?? []} />
                <ButtonModal cardId={_id} />
                {this.renderCard()}
            </div>
        );
    }
}
