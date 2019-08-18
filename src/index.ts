import * as request from 'request-promise';

interface Options {
    clientToken: string;
}

class Creeper {
    private clientToken: string;
    constructor({ clientToken }: Options) {
        this.clientToken = clientToken;
    }

    async getStatus() {
        return request.get('https://status.mojang.com/check');
    }

    async getUUID(username: string) {
        return await request.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    }

    async getNameHistroy(uuid: string) {
        return await request.get(`https://api.mojang.com/user/profiles/${uuid}/names`);
    }

    async getUUIDs(usernames: string[] | string) {
        if (typeof usernames === 'string') usernames = [usernames];
        return await request.post({ uri: 'https://api.mojang.com/profiles/minecraft', body: 'usernames', json: true });
    }

    async getProfileAndSkin(uuid: string) {
        return await request.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}?unsigned=false`);
    }

    async changeSkin(uuid: string, accessToken: string, model: string, url: string) {
        return await request.post({uri: `https://api.mojang.com/user/profile/${uuid}/skin`, headers: {'Authorization': `Bearer ${accessToken}`}, form: {model, url}, json: true});
    }

    async uploadSkin(uuid: string, accessToken: string, model: string, file: string) {
        return await request.put({uri: `https://api.mojang.com/user/profile/${uuid}/skin`, headers: {'Authorization': `Bearer ${accessToken}`,
            'Content-Length': `${Buffer.byteLength(file)}`,
            'Content-Type': 'multipart/form-data;boundary=---------------------------------------C-R-E-E-P-E-R'
        },form: {model, file}, json: true});
    }

    async resetSkin(uuid: string, accessToken: string) {
        return await request.delete({uri: `https://api.mojang.com/user/profile/${uuid}/skin`, headers: {'Authorization': `Bearer ${accessToken}`}, json: true});
    }

    async blockedServers() {
        return await request.get('https://sessionserver.mojang.com/blockedservers');
    }

    async authenticate(username: string, password: string) {
        return await request.post({
            uri: 'https://authserver.mojang.com/authenticate', body: {
                agent: {
                    name: 'Minecraft',
                    version: '1'
                },
                username, password,
                clientToken: this.clientToken,
                requestUser: true
            }, json: true
        });
    }

    async refresh(accessToken: string) {
        return await request.post({
            uri: 'https://authserver.mojang.com/refresh', body: {
                accessToken,
                clientToken: this.clientToken,
                requestUser: true
            }, json: true
        });
    }

    async validate(accessToken: string) {
        return request.post({
            uri: 'https://authserver.mojang.com/validate', body: {
                accessToken,
                clientToken: this.clientToken,
            }, json: true
        });
    }

    async signout(username: string, password: string) {
        return request.post({ uri: 'https://authserver.mojang.com/signout', body: { username, password }, json: true });
    }


    async invalidate(accessToken: string) {
        return request.post({
            uri: 'https://authserver.mojang.com/validate', body: {
                accessToken,
                clientToken: this.clientToken,
            }, json: true
        });
    }
}
