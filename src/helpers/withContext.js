import React from 'react';

const withContext = (Wrapped, Context) => (props) =>
    <Context.Consumer>{(value) => <Wrapped {...props} contextValue={value} />}</Context.Consumer>;

export default withContext;
