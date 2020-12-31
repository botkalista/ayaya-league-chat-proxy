import * as express from 'express';
import fetch from 'node-fetch';
import { Server } from 'http';
import * as fs from 'fs';

export default class ConfigProxy {

    private app: express.Application;
    private port: number;
    private chatPort: number;
    private server: Server;
    private baseUrl: string = "https://clientconfig.rpg.riotgames.com";

    constructor(port: number, chatPort: number) {
        this.port = port;
        this.chatPort = chatPort;
        this.app = express();
        this.app.use(this.proxy.bind(this));
    }

    start() {
        this.server = this.app.listen(this.port);
    }
    stop() {
        this.server.close();
    }
    isConnected(): boolean {
        return this.server && this.server.listening;
    }

    private async proxy(req: express.Request, res: express.Response) {
        const url = this.baseUrl + req.originalUrl;
        const userAgent = req.headers['user-agent'];
        const xRiotEntitlementsJWT = req.headers['x-riot-entitlements-jwt'];
        const authorization = req.headers['authorization'];

        const reqInit = {
            method: 'GET',
            headers: {
                'authorization': authorization,
                'user-agent': userAgent,
                'x-riot-entitlements-jwt': xRiotEntitlementsJWT
            }
        }

        const proxyResponse = await fetch(url, reqInit);
        const proxyResponseJson = await proxyResponse.json();

        fs.appendFileSync('logs/config_logs.txt', JSON.stringify({ url: req.originalUrl, data: proxyResponseJson }, null, 3));

        if (proxyResponseJson.hasOwnProperty('chat.host')) proxyResponseJson['chat.host'] = '127.0.0.1';
        if (proxyResponseJson.hasOwnProperty('chat.port')) proxyResponseJson['chat.port'] = this.chatPort;
        if (proxyResponseJson.hasOwnProperty('chat.affinities')) {
            for (const k in proxyResponseJson['chat.affinities']) {
                proxyResponseJson['chat.affinities'][k] = '127.0.0.1';
            }
        }
        if (proxyResponseJson.hasOwnProperty('chat.allow_bad_cert.enabled')) proxyResponseJson['chat.allow_bad_cert.enabled'] = true;

        if (proxyResponseJson.hasOwnProperty('lol.game_client_settings.specialoffer_enabled')) {
            proxyResponseJson['lol.game_client_settings.specialoffer_enabled'] = true;
            proxyResponseJson['lol.game_client_settings.starshards_purchase_enabled'] = true;
            proxyResponseJson['lol.game_client_settings.starshards_services_enabled'] = true;
        }

        res.json(proxyResponseJson);

    }

}