import React, { Component } from 'react';
import apiCall from '../../helpers/apiCall';
import UserLayout from '../../layouts/User';

export default class Policy extends Component {
    state = {
        content: '',
    };

    async componentDidMount() {
        const { response, success } = await apiCall('GET', '/settings/' + this.props.keyword);

        this.setState({
            content: success ? response : 'Failed to load',
        });
    }

    render() {
        return (
            <UserLayout>
                <h1>{this.props.title}</h1>
                <br />
                <div id={this.props.keyword} dangerouslySetInnerHTML={{ __html: this.state.content }} />
            </UserLayout>
        );
    }
}
