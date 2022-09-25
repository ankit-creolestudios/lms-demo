export const getState = (key) => {
    const serializedState = localStorage.getItem(key);
    if (!serializedState) {
        return undefined;
    }
    return ['authToken', 'reuCheckoutCartId'].includes(key) ? serializedState : JSON.parse(serializedState);
};

export const setState = (key, data) => {
    const serializedState = ['authToken', 'reuCheckoutCartId'].includes(key) ? data : JSON.stringify(data);
    localStorage.setItem(key, serializedState);
};

export const removeState = (key) => {
    localStorage.removeItem(key);
};

export const clearState = () => {
    localStorage.clear();
};
