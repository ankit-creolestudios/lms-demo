import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';

export default class TableButton extends Component {
    render() {
        let { condition, url, text, classes, doc, icon, clickCallback, reloadTable, disabled } = this.props,
            disabledMessage = disabled && typeof disabled === 'function' ? disabled(doc) : '',
            Button;

        if (condition && typeof condition === 'function' && !condition(doc)) {
            return null;
        }

        if (typeof icon === 'function') {
            icon = icon(doc);
        }

        if (typeof text === 'function') {
            text = text(doc);
        }

        classes = classes || '';

        if (typeof clickCallback === 'function') {
            Button = (
                <button
                    className={`btn btn--small ${classes}`}
                    disabled={!!disabledMessage}
                    style={{ pointerEvents: disabledMessage ? 'none' : 'auto' }}
                    onClick={(e) => {
                        clickCallback(e, doc, reloadTable);
                    }}>
                    {!icon ? text : <Fa icon={icon} />}
                </button>
            );
        } else {
            if (url) {
                url = url.replace(/\/:([a-zA-Z_]*)/, (match, p1) => `/${doc[p1]}`);
            } else {
                throw new Error(
                    'You need to provide either a clickCallback or an url for an element of rowButtons property'
                );
            }

            Button = (
                <Link to={url} className={`btn btn--small ${classes}`}>
                    {!icon ? text : <Fa icon={icon} />}
                </Link>
            );
        }

        return !!disabledMessage ? (
            <OverlayTrigger
                placement='left'
                overlay={
                    <Tooltip id={`tooltip-${doc._id}-disabled-${text.toLocaleLowerCase().replace(/\\s+/g, '')}`}>
                        {disabledMessage}
                    </Tooltip>
                }>
                <span className='d-inline-block'>{Button}</span>
            </OverlayTrigger>
        ) : !icon ? (
            Button
        ) : (
            <OverlayTrigger
                placement='top'
                overlay={
                    <Tooltip id={`tooltip-${doc._id}-${text.toLocaleLowerCase().replace(/\\s+/g, '')}`}>{text}</Tooltip>
                }>
                {Button}
            </OverlayTrigger>
        );
    }
}
