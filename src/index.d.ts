declare global {
    interface Window {
        socket: {
            emit: (key: string, value: any) => void;
            on: (key: string, callBack: (value: any) => void) => void;
            off: (key: string, callBack?: (value: any) => void) => void;
        };
    }

    interface ObjectConstructor {
        keys<T>(o: T): ObjectKeys<T>;
    }

    interface Number {
        cleanRound(dp: number): number;
    }

    // eslint-disable-next-line no-var
    var USCurrency: Intl.NumberFormat;
}

export { };
