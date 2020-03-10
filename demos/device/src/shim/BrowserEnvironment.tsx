/* eslint-disable @typescript-eslint/no-explicit-any */
class BrowserEnvironment {
  channel = new BroadcastChannel('chime-broadcaster');

  init(messageHandler): any {
    console.info('Controller environment init called.');

    this.channel.onmessage = ({ data }) => {
      messageHandler(data);
    };
  }

  sendMessage(message): any {
    this.channel.postMessage(message);
  }
}

export default BrowserEnvironment;
