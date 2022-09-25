import React, { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import MenuItemTitle from './MenuItemTitle';
import NavigationLessons from '../NavigationLessons';
import './MenuItem.scss';

class MenuItem extends Component {
    render() {
        const {
            props: { item, splitTitle },
            context: currentEventKey,
        } = this;

        return (
            <div className='cmenu-item'>
                <Accordion.Toggle
                    as='div'
                    onClick={this.props.onClick}
                    eventKey={item._id}
                    className={`cmenu-item__toggle${currentEventKey === item._id ? ' cmenu-item__toggle--open' : ''}`}>
                    <span className='cmenu-item__title'>
                        <MenuItemTitle title={item.title?.toString() ?? ''} splitTitle={splitTitle} />
                    </span>
                    <Fa icon={faChevronDown} />
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={item._id}>
                    <div className='cmenu-item__content'>
                        <NavigationLessons chapterId={item._id} />
                    </div>
                </Accordion.Collapse>
            </div>
        );
    }
}

export default withRouter(MenuItem);
