
export interface IStorageClient {

    clear(): Promise<void>;

    getItem<T>(key: string): Promise<T | undefined>;

    setItem<T>(key: string, value: T): Promise<T>;

    removeItem(key: string): Promise<void>;

    // iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U): Promise<U>;
    //
    // key(keyIndex: number): Promise<string>;
    //
    // keys(): Promise<string[]>;
    //
    // length(): Promise<number>;
}

export interface IRecoilStorageClient {
    clear(): Promise<void>;

    getItem(key: string): Promise<string>;

    setItem(key: string, value: any): Promise<void>;

    removeItem(key: string): Promise<void>;
}