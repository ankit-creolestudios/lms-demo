import { store } from 'src/store';
import axios from 'axios';
import EventBus from './EventBus';

interface IObject {
    [key: string]: any;
}
type IOptionalObject = IObject | null;
type IPayload = IOptionalObject | FormData;
type RequestTypes = 'get' | 'post' | 'patch' | 'delete' | 'put';

interface ICallConfig {
    method: RequestTypes | Uppercase<RequestTypes>;
    url: string;
    data: IPayload;
    headers: IObject;
}

interface IReturnType {
    success: boolean;
    response: any;
    message: string;
    error: any | null;
    notification?: {
        message: string;
        title?: string;
    };
    raw: any;
}

export default class Api {
    static baseUrl = `${process.env.REACT_APP_API_URL}/`;

    static async call(
        method: RequestTypes | Uppercase<RequestTypes>,
        path: string,
        payload: IPayload = null,
        params: IOptionalObject = null
    ): Promise<IReturnType> {
        const { loggedIn } = store.getState();
        if (!loggedIn) {
            throw new Error('user must be logged in to use this method');
        }
        // remove preceding slash if exists
        path = path.replace(/^\//g, '');
        const queryParameters = this.paramBuilder(params),
            token = loggedIn.token,
            callConfig = {
                method: method.toUpperCase() as Uppercase<RequestTypes>,
                url: this.baseUrl + path + queryParameters,
                data: payload,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

        return await this.sendRequest(callConfig);
    }

    static paramBuilder(params: IOptionalObject) {
        let retVal = '';
        if (params) {
            retVal = '?';
            for (const param in params) {
                if (param && params[param] !== null && params[param] !== undefined) {
                    const query = `${param}=${params[param]}&`;
                    retVal = retVal + query;
                } else {
                    continue;
                }
            }
        }
        return retVal.slice(0, -1);
    }

    static async sendRequest(callConfig: ICallConfig): Promise<IReturnType> {
        if (callConfig.data !== null) {
            callConfig.headers['Content-Type'] = `application/json`;
        }
        if (callConfig.data instanceof FormData) {
            callConfig.headers['Content-Type'] = `multipart/form-data`;
        }

        try {
            const { data: response } = await axios(callConfig),
                { message, error, success, data, notification } = response;

            EventBus.dispatch('api-response', { message, success, notification });

            return {
                success,
                message,
                response: data || null,
                error: error || success ? null : message,
                notification,
                raw: response,
            };
        } catch (e: any) {
            if (e.response) {
                const { data: response } = e.response,
                    { message, success, status } = response;

                EventBus.dispatch('api-response', { message, success });

                if (status && status === 401) {
                    window.location.replace(`${window.location.origin}/login`);
                }

                return {
                    success,
                    message,
                    response: message ?? '',
                    error: message ?? '',
                    raw: e,
                };
            } else {
                const errorMessage = {
                    success: false,
                    message:
                        "Couldn't connect to server, please try again.\r\n If the problem persits please contact support",
                    response: '',
                    error: 'SERVERDOWN',
                    raw: e,
                };

                return errorMessage;
            }
        }
    }
}
