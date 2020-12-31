# ayaya-league-chat-proxy
Proxy for League of Legends xmpp communication.

## Quick Start

```sh
npm install
npm start
npm run league
```

## Example code

```typescript
import ChatProxy from './components/ChatProxy';
import ConfigProxy from './components/ConfigProxy';

const info = {
   config_port:  6041,
   chat_port:  6042,
}

const chatProxy = new ChatProxy(info.chat_port);
const configProxy = new ConfigProxy(info.config_port, info.chat_port);

configProxy.start();
chatProxy.start();

chatProxy.use('in', buffer => console.log('[IN]', buffer.toString()));
chatProxy.use('out', buffer => console.log('[OUT]', buffer.toString()));

```

