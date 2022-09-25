import React, { Component } from 'react';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

class MenuItem extends Component {
    render() {
        const { props } = this;

        return (
            <Link
                to={props.to}
                className={`side-menu__item${
                    this.props.breadcrumbList[props.to] ||
                    (Object.keys(this.props.breadcrumbList).length === 0 &&
                        (props.text === 'Dashboard' || props.children === 'Dashboard'))
                        ? ' side-menu__item--active'
                        : ''
                }`}
                key={props.text}
            >
                <Fa icon={props.icon} />
                <span>{props.text ? props.text : props.children}</span>
            </Link>
        );
    }
}

export default connect((state) => {
    return {
        breadcrumbList: state.globalBreadcrumb,
    };
})(MenuItem);
