import React, { Component } from 'react';
import DownloadButton from 'src/pages/Course/Stages/Lessons/Cards/Interactive/Question/Slide/QuestionsModal/DownloadButton';
import './LastAttempts.scss';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';

export default class LastAttempts extends Component {
    render() {
        return (
            <>
                <h3 className='last-attempts__heading'>Past attempts</h3>
                <div className='last-attempts__items'>
                    {this.props.items.map((item) => {
                        const { percentageScore, score, totalMarks } = item.results;

                        return (
                            <div
                                key={item._id}
                                className={`last-attempts__item${
                                    item.status
                                        ? item.status === 'FAIL'
                                            ? ' last-attempts__item--fail'
                                            : ' last-attempts__item--success'
                                        : ''
                                }`}
                            >
                                <h6>
                                    {item?.pausedAt?.length === item?.startedAt?.length && !item.status
                                        ? 'Saved'
                                        : item.status === 'FAIL'
                                        ? 'Failed'
                                        : 'Passed'}
                                </h6>
                                <span className='last-attempts__item__date'>
                                    {new Date(item.startedAt[0]).toLocaleDateString('en-US')}&nbsp;
                                    {new Date(item.startedAt[0]).toLocaleTimeString('en-US')}
                                </span>
                                {!!item.status && (
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`tooltip-${item._id}-qr`}>{'Your answers rating'}</Tooltip>
                                        }
                                    >
                                        <div className='last-attempts__item__rating'>
                                            {percentageScore ? percentageScore.cleanRound(2) : 0}%
                                        </div>
                                    </OverlayTrigger>
                                )}
                                {!!item.status && (
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`tooltip-${item._id}-qt`}>{'# correct / # total'}</Tooltip>
                                        }
                                    >
                                        <div className='last-attempts__item__answers'>
                                            {score} / {totalMarks}
                                        </div>
                                    </OverlayTrigger>
                                )}
                                <div className='last-attempts__item__buttons'>
                                    {!item.status &&
                                        item?.startedAt?.length === item?.pausedAt?.length &&
                                        (this.props.onResume ? (
                                            <Button className='bp' onClick={this.props.onResume}>
                                                Resume
                                            </Button>
                                        ) : (
                                            'Paused'
                                        ))}
                                    {!!item.status && (
                                        <Button
                                            onClick={() => {
                                                this.props.onItemClick(item);
                                            }}
                                            className='bd'
                                        >
                                            Review
                                        </Button>
                                    )}
                                    {!!item.status && <DownloadButton attempt={item}>Download</DownloadButton>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }
}

