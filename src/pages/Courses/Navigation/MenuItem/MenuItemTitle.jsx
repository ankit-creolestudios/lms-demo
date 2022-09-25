import React, { Component } from 'react';

export default class MenuItemtitle extends Component {
    get shouldTitleSplit() {
        const { splitTitle, title } = this.props;

        if (splitTitle === false) {
            return false;
        }

        return /^Chapter ([\d\w\.]+)\s*-/.test(title);
    }

    get heading() {
        return this.props.title.split('-')[0].trim();
    }

    get subHeading() {
        return this.props.title.split('-')[1].trim();
    }

    render() {
        if (this.shouldTitleSplit) {
            return (
                <>
                    <b>{this.heading}</b>
                    {this.subHeading && <span>{this.subHeading}</span>}
                </>
            );
        }

        return <b>{this.props.title}</b>;
    }
}
