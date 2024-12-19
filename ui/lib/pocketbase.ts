import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import PocketBase from 'pocketbase';

let singletonClient: PocketBase | null = null;

export function createBrowserClient(dbHost: string) {
    if (!dbHost) {
        throw new Error('dbHost argument is required!');
    }

    const createNewClient = () => {
        return new PocketBase(
            `http://${dbHost}`
        );
    };

    const _singletonClient = singletonClient ?? createNewClient();

    if (typeof window === 'undefined') return _singletonClient;

    if (!singletonClient) singletonClient = _singletonClient;

    singletonClient.authStore.onChange(() => {
        document.cookie = singletonClient!.authStore.exportToCookie({
            httpOnly: false,
        });
    });

    return singletonClient;
}

export function createServerClient(cookieStore?: ReadonlyRequestCookies) {
    if (typeof window !== 'undefined') {
        throw new Error(
            'This method is only supposed to call from the Server environment'
        );
    }

    const client = new PocketBase(
        'http://localhost:8090'
    );

    if (cookieStore) {
        const authCookie = cookieStore.get('pb_auth');

        if (authCookie) {
            client.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
        }
    }

    return client;
}