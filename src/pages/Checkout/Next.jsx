import React, { Component } from 'react';
import { HiChevronRight } from 'react-icons/hi';

export default class Next extends Component {
    render() {
        return (
            <button onClick={this.props.onClick}>
                Next <HiChevronRight />
            </button>
        );
    }
}
