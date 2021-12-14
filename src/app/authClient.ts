import { Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { getIdentityUrl } from './config';

export class AuthClientWrapper {
    public authClient?: AuthClient;
    public isLoggedIn = false;

    constructor() {
        return this;
    }

    // Create a new auth client and update it's ready state
    async create() {
        this.authClient = await AuthClient.create();
        const isAuthenticated = await this.authClient?.isAuthenticated();
        if (isAuthenticated && !this.authClient?.getIdentity().getPrincipal().isAnonymous()) {
            this.isLoggedIn = true
        }
    }

    async login(): Promise<Identity | undefined> {
        console.log('[AuthClientWrapper] try to login');
        return new Promise(async (resolve) => {
            const identityProvider = getIdentityUrl();

            await this.authClient?.login({
                identityProvider,
                onSuccess: async () => {
                    this.isLoggedIn = true;
                    console.log('[AuthClientWrapper] login success to', identityProvider);
                    resolve(this.authClient?.getIdentity());
                },
            });
        });
    }

    async logout() {
        console.log('[AuthClientWrapper] logout');
        this.isLoggedIn = false;
        return this.authClient?.logout({returnTo: '/'});
    }

    async getIdentity() {
        return this.authClient?.getIdentity();
    }

    async isAuthenticated() {
        return this.authClient?.isAuthenticated();
    }
}

export const authClient = new AuthClientWrapper();