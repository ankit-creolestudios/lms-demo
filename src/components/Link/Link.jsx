import React from 'react';
import { Link } from 'react-router-dom';

export const Anchor = (props) => {
    const isExternal = () => {
        if (props.to.startsWith('https://') || props.to.startsWith('http://') || props.to.startsWith('mailto:')) {
            return true;
        }

        return false;
    };

    return isExternal() ? (
        <a href={props.to} {...props} />
    ) : props.disabled ? (
        <Link {...props} onClick={(e) => e.preventDefault()} />
    ) : (
        <Link {...props} />
    );
};
