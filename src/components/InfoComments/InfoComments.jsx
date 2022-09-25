import React, { Component } from 'react';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './InfoComments.scss';
import Comments from './Comments';
import { OverlayTrigger } from 'react-bootstrap';
import apiCall from '../../helpers/apiCall';
import { connect } from 'react-redux';

class InfoComments extends Component {
    state = {
        comments: [],
    };

    async componentDidMount() {
        const { articleId, articleType } = this.props,
            { response: comments, success } = await apiCall('GET', `/users/${articleType}/${articleId}/comments`);

        if (success) {
            this.setState({
                comments,
            });
        }
    }

    handleDelete = async (i) => {
        const {
                props: { articleType },
                state: { comments },
            } = this,
            comment = comments[i],
            { success, message } = await apiCall('DELETE', `/users/${articleType}/comments/${comment._id}`);

        comments.splice(i, 1);

        this.setState({ comments }, () => {
            this.props.setGlobalAlert({
                type: success ? 'success' : 'error',
                message,
            });
        });
    };

    handleEdit = async (i, text) => {
        const {
                props: { articleType },
                state: { comments },
            } = this,
            comment = comments[i],
            { success, message, response } = await apiCall('PUT', `/users/${articleType}/comments/${comment._id}`, {
                text,
            });

        comments[i] = {
            ...comment,
            message: response.message,
        };

        this.setState({ comments }, () => {
            this.props.setGlobalAlert({
                type: success ? 'success' : 'error',
                message,
            });
        });
    };

    handleComment = async (articleId, text, callback) => {
        if (text !== '') {
            const {
                    props: { articleType },
                    state: { comments },
                } = this,
                { response, success, message } = await apiCall('POST', `/users/${articleType}/${articleId}/comments`, {
                    text,
                });

            comments.unshift(response);

            this.setState({ comments }, () => {
                this.props.setGlobalAlert({
                    type: success ? 'success' : 'error',
                    message,
                });

                callback();
            });
        }
    };

    render() {
        const {
            state: { comments },
            props: { articleId },
        } = this;

        return (
            <div className={`info-comments${comments.length !== 0 ? ' info-comments__active' : ''}`}>
                <OverlayTrigger
                    trigger='click'
                    placement='left'
                    rootClose
                    overlay={
                        <Comments
                            onDelete={this.handleDelete}
                            onEdit={this.handleEdit}
                            onComment={this.handleComment}
                            items={comments}
                            articleId={articleId}
                        />
                    }
                >
                    <Fa icon={faInfoCircle} />
                </OverlayTrigger>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(InfoComments);
