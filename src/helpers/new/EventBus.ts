import { IAlert, IToast } from 'src/GlobalHandlers/AlertHandler';

interface listeners {
    [key: string]: any;
}

export default class EventBus {
    static listeners: listeners = {};

    static on(event: string, listener: (...args: any) => void): void {
        this.listeners[event] = listener;
        document.addEventListener(event, listener);
    }

    static dispatch<T>(
        event: 'alert' | 'toast' | T,
        data?: T extends 'alert' ? Omit<IAlert, 'id'> : T extends 'toast' ? Omit<IToast, 'id'> : any
    ): void {
        document.dispatchEvent(new CustomEvent(event as string, { detail: data }));
    }

    static remove(event: string, callback?: (...args: any) => void) {
        if (callback) {
            document.removeEventListener(event, callback);
        } else {
            document.removeEventListener(event, this.listeners[event]);
        }

        delete this.listeners[event];
    }
}
