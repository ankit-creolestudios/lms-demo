import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faPenSquare, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';

class Comment extends Component {
    state = {
        edit: this.props.new ?? false,
        text: this.props.message ?? '',
    };

    toggleEdit = () => {
        this.setState({ edit: !this.state.edit });
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleEdit = () => {
        this.props.onSave(this.state.text, () => {
            this.setState({ text: '' });
        });

        if (!this.props.new) {
            this.toggleEdit();
        }
    };

    render() {
        const {
            state: { edit, text },
            props: {
                _id,
                author,
                createdAt,
                updatedAt,
                showHr,
                loggedIn: {
                    user: { _id: userId },
                },
            },
        } = this;

        return (
            <div className='info-comments__comment' key={_id}>
                {edit ? (
                    <>
                        <textarea
                            placeholder='Type your comment here...'
                            onChange={this.handleInputChange}
                            onFocus={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            name='text'
                            value={text}
                        />
                        <div className='info-comments__comment__buttons'>
                            {!this.props.new && (
                                <Button onClick={this.toggleEdit} size='sm' className='bd'>
                                    <Fa icon={faTimes} />
                                </Button>
                            )}
                            <Button size='sm' onClick={this.handleEdit} className='bp'>
                                {this.props.new ? 'Comment' : 'Save'}
                            </Button>
                        </div>
                        <hr />
                    </>
                ) : (
                    <>
                        <div className='info-comments__comment__text'>{text}</div>
                        <div className='info-comments__comment__info'>
                            <span>by {`${author.firstName} ${author.lastName}`}</span>
                            &middot;
                            <span>{new Date(createdAt).toLocaleString('en-US')}</span>
                            {createdAt !== updatedAt && '·'}
                            {createdAt !== updatedAt && <span>Edited</span>}
                            {author._id === userId && (
                                <>
                                    <OverlayTrigger
                                        placement='top'
                                        overlay={<Tooltip id={`edit-comment-`}>Edit</Tooltip>}>
                                        <Button onClick={this.toggleEdit} size='sm'>
                                            <Fa icon={faPenSquare} />
                                        </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        placement='top'
                                        overlay={<Tooltip id={`edit-comment-${_id}`}>Delete</Tooltip>}>
                                        <Button onClick={this.props.onDelete} size='sm'>
                                            <Fa icon={faTrash} />
                                        </Button>
                                    </OverlayTrigger>
                                </>
                            )}
                        </div>
                        {showHr && <hr />}
                    </>
                )}
            </div>
        );
    }
}

export default connect((state) => {
    return {
        loggedIn: state.loggedIn,
    };
})(Comment);
