import ChatProxy from './components/ChatProxy';
import ConfigProxy from './components/ConfigProxy';
import WebSocketServer from './components/WebSocketServer'

const info = {
    config_port: 6041,
    chat_port: 6042,
}

const chatProxy = new ChatProxy(info.chat_port);
const configProxy = new ConfigProxy(info.config_port, info.chat_port);
const web = new WebSocketServer(9081, (data) => {
    console.log('Sending ' + data);
    chatProxy.sendMessage(data);
});
web.start();
configProxy.start();
chatProxy.start();

chatProxy.use('in', buffer => console.log('[IN]', buffer.toString()));
chatProxy.use('out', buffer => console.log('[OUT]', buffer.toString()));

chatProxy.use('in', (buffer) => web.send('[IN] ' + buffer.toString()));
chatProxy.use('out', (buffer) => web.send('[OUT] ' + buffer.toString()));
