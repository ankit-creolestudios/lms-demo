import './Menu.scss';
import React, { Component, Children } from 'react';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default class Menu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: false,
        };
    }

    toggleMenuCollapse = (e) => {
        e.preventDefault();

        this.setState((prevState) => ({
            collapsed: !prevState.collapsed,
        }));
    };

    render() {
        const { collapsed } = this.state;
        return (
            <menu className={'side-menu' + (collapsed ? ' side-menu--collapsed' : '')}>
                <div className='side-menu__items'>
                    {Children.map(this.props.children, (child) => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, {
                                to: this.props.basePath + child.props.to,
                            });
                        }
                        return child;
                    })}
                </div>
                <div className='side-menu__toggle' onClick={this.toggleMenuCollapse}>
                    <Fa icon={collapsed ? faChevronRight : faChevronLeft} size='2x' color='#cacaca' />
                </div>
            </menu>
        );
    }
}
