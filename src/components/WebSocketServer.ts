import * as ws from 'ws';

export default class WebSocketServer {

    private port: number;
    private server: ws.Server;
    private onData: (data) => void;

    constructor(port: number, onData: (data) => void) {
        this.port = port;
        this.onData = onData;
    }

    start() {
        this.server = new ws.Server({ port: this.port });
        this.server.on('connection', client => {
            client.on('message', msg => {
                this.onData(msg);
            });
        });
    }

    send(data) {
        this.server.clients.forEach(c => c.send(data));
    }

    stop() {
        this.server.close();
    }

}