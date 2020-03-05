export class BrowserEnvironment {
  channel;

  constructor() {
    this.channel = new BroadcastChannel('chime-broadcaster');
  }

  init = messageHandler => {
    console.info('Controller environment init called.');

    this.channel.onmessage = ({ data }) => {
      messageHandler(data);
    };
  };

  sendMessage = message => {
    this.channel.postMessage(message);
  };
}

export default BrowserEnvironment;
