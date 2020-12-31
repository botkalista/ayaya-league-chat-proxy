import * as fs from 'fs';
import * as tls from 'tls';
import { Stream } from 'stream';

export default class ChatProxy {

    private port: number;
    private chatServerHost: string;
    private chatServer: tls.Server;
    private client: tls.TLSSocket;
    private socket: tls.TLSSocket;
    private middlewares: { dir: 'in' | 'out', action: (buffer: Buffer, info: any) => Buffer | void }[] = [];

    private incomingPipe = new Stream.PassThrough();
    private outgoingPipe = new Stream.PassThrough();

    constructor(port: number) {
        this.port = port;
        this.chatServerHost = 'euw1.chat.si.riotgames.com';
        this.chatServer = tls.createServer({ pfx: fs.readFileSync('src/certs/server.pfx') }, socket => {
            this.socket = socket;
            this.client = tls.connect({ port: 5223, host: this.chatServerHost });
            this.incomingPipe.on('data', chunk => this.socket.write(this.onIncoming(chunk)));
            this.outgoingPipe.on('data', chunk => this.client.write(this.onOutgoing(chunk)));
            this.client.pipe(this.incomingPipe);
            this.socket.pipe(this.outgoingPipe)
        });

    }

    private onIncoming(buffer: Buffer): any {
        let _buffer = buffer;
        const _info = {}
        const _middles = this.middlewares.filter(m => m.dir == 'in');
        _middles.forEach(mid => {
            const result = mid.action(_buffer, _info);
            if (result) _buffer = result;
        });
        return _buffer;
    }

    private onOutgoing(buffer: Buffer): any {
        let _buffer = buffer;
        const _info = {}
        const _middles = this.middlewares.filter(m => m.dir == 'out');
        _middles.forEach(mid => {
            const result = mid.action(_buffer, _info);
            if (result) _buffer = result;
        });
        return _buffer;
    }

    use(dir: 'in' | 'out', action: (buffer: Buffer, info: any) => Buffer | void) {
        const middleware = { dir, action }
        this.middlewares.push(middleware);
    }

    sendMessage(msg: string) {
        this.outgoingPipe.write(Buffer.from(msg));
    }

    start() {
        this.chatServer.listen(this.port);
    }
    stop() {
        this.chatServer.close();
    }
    isConnected(): boolean {
        return this.chatServer && this.chatServer.listening;
    }

}