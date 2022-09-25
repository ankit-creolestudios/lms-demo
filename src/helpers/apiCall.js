import {store} from '../store';
import axios from 'axios';

/**
 * Wrapper function to manage api calls to the backend
 *
 * @arg {string} method         'GET' | 'POST' | 'PUT' | 'DELETE'
 * @arg {string} path           eg. '/users'
 * @arg {object} payload
 * @arg {boolean} auth
 */
const apiCall = async (method, path, payload = null, withCredentials = false, auth = true) => {
    // prepare the config for the axios call
    const url = process.env.REACT_APP_API_URL + path,
        callConfig = {
            method: method.toUpperCase(),
            url,
            data: payload,
            headers: {},
            withCredentials,
        },
        { loggedIn } = store.getState();

    // add the auth token if it's needed
    if (auth) {
        const token = typeof auth === 'string' ? auth : loggedIn && loggedIn.token ? loggedIn.token : null;
        if (token) {
            callConfig.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // if we are sending data, it should be in json format
    if (payload !== null) {
        callConfig.headers['Content-Type'] = `application/json`;
    }

    // expect when we submitting a file upload which will be an instance of FormData
    if (payload instanceof FormData) {
        callConfig.headers['Content-Type'] = `multipart/form-data`;
    }

    try {
        // ship it and send it 🏏
        const { data: response } = await axios(callConfig),
            { message, error, success, data } = response;

        // everything is fine, return the response
        return {
            success,
            message,
            response: data || null,
            error: error || null,
            raw: response,
        };
    } catch (e) {
        if (e.response) {
            // Hupsie, something went wrong
            let { status, data: response } = e.response,
                { message, success } = response;

            // authentication or authorization failed
            if (status && status === 401) {
                // if it's authentication which failed redirect the user to log back in
                if (message === 'UNAUTHENTICATED' || message === 'UNAUTHORIZED') {
                    // before redirecting clear the redux storage
                    store.dispatch({
                        type: 'SET_LOGGED_IN',
                        payload: {
                            token: null,
                            user: {},
                            authenticationError: true,
                        },
                    });

                    localStorage.removeItem('authToken');

                    // redirect the user back to the login
                    // eslint-disable-next-line no-restricted-globals
                    history.pushState({}, 'RealEstateU', '/');
                }
            }

            // else it's prolly just authorization which failed, just return that to the caller so it handles it however wants
            // or a bad call was made
            return {
                success,
                message,
                response: message ?? '',
                error: message ?? '',
            };
            // api server is down...
        } else {
            return {
                success: false,
                message: "Couldn't connect to server",
                response: '',
                error: 'SERVERDOWN',
            };
        }
    }
};

export default apiCall;
