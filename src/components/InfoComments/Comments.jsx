import React, { Component } from 'react';
import { Popover } from 'react-bootstrap';
import Comment from './Comment';

export default class Comments extends Component {
    render() {
        const { items, articleId, ...rest } = this.props;

        return (
            <Popover {...rest} id={`comments-popover__${articleId}`}>
                <Popover.Content>
                    <Comment
                        new={true}
                        showHr={true}
                        onSave={(text, callback) => {
                            this.props.onComment(articleId, text, callback);
                        }}
                    />
                    {items.length === 0
                        ? 'There is nothing here yet.'
                        : items.map((item, i) => (
                              <Comment
                                  {...item}
                                  showHr={i !== items.length - 1 && items.length - 1 !== 0}
                                  onSave={(text) => {
                                      this.props.onEdit(i, text);
                                  }}
                                  onDelete={() => {
                                      this.props.onDelete(i);
                                  }}
                                  key={item._id}
                              />
                          ))}
                </Popover.Content>
            </Popover>
        );
    }
}
