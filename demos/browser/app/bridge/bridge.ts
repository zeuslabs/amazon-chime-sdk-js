// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import '../../style.scss';
import 'bootstrap';

import {
  ConsoleLogger,
  DefaultDeviceController,
  DeviceControllerBasedMediaStreamBroker,
  DefaultMeetingSession,
  MeetingSessionConfiguration,
  MeetingSession,
  LogLevel,
  Logger,
  AudioVideoObserver
} from '../../../../src/index';

export class ChimeBridgeApp {
  static readonly BASE_URL: string = [location.protocol, '//', location.host, location.pathname.replace(/\/*$/, '/')].join('');
  static readonly MAX_BRIDGES: number = 5;
  hostPin: string | null = null;
  bridgePins: string[] = [];
  hostMeetings: any[] = [];
  bridgeMeetings: any[] = [];

  hostConnections: Connection[] = [];
  bridgeConnections: Connection[] = [];

  constructor() {
    (document.getElementById('flow-bridge') as HTMLDivElement).style.display = 'block';
    this.initEventListeners();
  }

  async joinPin(pin: string, pinFrom: string): Promise<any> {
    const response = await fetch(
      `${ChimeBridgeApp.BASE_URL}join_pin?pin=${encodeURIComponent(pin)}&pin_from=${encodeURIComponent(pinFrom)}`,
      {
        method: 'POST',
      }
    );
    const json = await response.json();
    if (json.error) {
      throw new Error(`Server error: ${json.error}`);
    }
    if (!json.Meeting) {
      throw new Error(`Server error: ${json.Error}`);
    }
    return json;
  }

  initEventListeners(): void {
    document.getElementById('form-bridge').addEventListener('submit', e => {
      e.preventDefault();
      this.bridge();
    });
  }

  cleanup(): void {
    try {
      this.hostPin = null;
      this.bridgePins = [];
      this.hostMeetings = [];
      this.bridgeMeetings = [];
      for (const connection of this.hostConnections) {
        connection.session.audioVideo.stop();
      }
      for (const connection of this.bridgeConnections) {
        connection.session.audioVideo.stop();
      }
      this.hostConnections = [];
      this.bridgeConnections = [];
    } catch (err) {
      console.error(err);
    }
  }

  async bridge(): Promise<void> {
    this.cleanup();
    try {
      this.validatePins();
    } catch (err) {
      alert(err.message);
      return;
    }
    this.showProgress();
    try {
      for (let i = 0; i < this.bridgePins.length; i++) {
        const bridgePin = this.bridgePins[i];
        console.log(`Looking up host ${i}: ${this.hostPin}`);
        const hostMeeting = await this.joinPin(this.hostPin, bridgePin);
        this.hostMeetings.push(hostMeeting);
        console.log(`Host ${i}: ${JSON.stringify(hostMeeting)}`);
        console.log(`Looking up bridge ${i}: ${bridgePin}`);
        const bridgeMeeting = await this.joinPin(bridgePin, this.hostPin);
        this.bridgeMeetings.push(bridgeMeeting);
        console.log(`Bridge ${i}: ${JSON.stringify(bridgeMeeting)}`);
      }
    } catch (err) {
      alert(`Unable to join PIN with error: ${err.message}`);
      return;
    }
    try {
      for (let i = 0; i < this.bridgePins.length; i++) {
        const host = this.hostMeetings[i];
        const bridge = this.bridgeMeetings[i];
        const hostPin = this.hostPin;
        const bridgePin = this.bridgePins[i];
        this.hostConnections.push(new Connection(
          hostPin,
          bridgePin,
          host,
          document.getElementById(`audioHost${i+1}`) as HTMLAudioElement,
          document.getElementById(`statusHost${i+1}`) as HTMLParagraphElement,
        ));
        this.bridgeConnections.push(new Connection(
          bridgePin,
          hostPin,
          bridge,
          document.getElementById(`audioBridge${i+1}`) as HTMLAudioElement,
          document.getElementById(`statusBridge${i+1}`) as HTMLParagraphElement,
        ));
        this.hostConnections[i].gotStreamCallback = (stream: MediaStream) => {
          this.hostConnections[i].logger.info('BRIDGING MEDIA STREAM');
          this.bridgeConnections[i].deviceController.chooseAudioInputDevice(stream);
        }
        this.bridgeConnections[i].gotStreamCallback = (stream: MediaStream) => {
          this.bridgeConnections[i].logger.info('BRIDGING MEDIA STREAM');
          this.hostConnections[i].deviceController.chooseAudioInputDevice(stream);
        }
      }
    } catch (err) {
      alert(`Unable to join: ${err.message}`);
      return;
    }
    this.hideProgress();
  }

  validatePins(): void {
    this.hostPin = this.pinOrNull('inputHost');
    this.bridgePins = [];
    for (let i = 0; i < ChimeBridgeApp.MAX_BRIDGES; i++) {
      const pin = this.pinOrNull(`inputBridge${i+1}`);
      if (pin) {
        this.bridgePins.push(pin);
      }
    }
    (document.getElementById(`inputHost`) as HTMLInputElement).value = this.hostPin || '';
    for (let i = 0; i < ChimeBridgeApp.MAX_BRIDGES; i++) {
      const bridgeElement = (document.getElementById(`inputBridge${i+1}`) as HTMLInputElement);
      if (i < this.bridgePins.length) {
        bridgeElement.value = this.bridgePins[i];
      } else {
        bridgeElement.value = '';
      }
    }
    if (this.hostPin === null) {
      throw new Error('Enter a valid host meeting PIN');
    }
    if (this.bridgePins.length === 0) {
      throw new Error('Enter one or more valid bridge meeting PINs');
    }
    for (let i = 0; i < this.bridgePins.length; i++) {
      if (this.bridgePins[i] === this.hostPin) {
        throw new Error('Bridge PIN must be different from host PIN');
      }
      for (let j = 0; j < this.bridgePins.length; j++) {
        if (i === j) {
          continue;
        }
        if (this.bridgePins[i] === this.bridgePins[j]) {
          throw new Error('Bridge PINs must be unique');
        }
      }
    }
  }

  pinOrNull(elementId: string): string | null {
    const element = (document.getElementById(elementId) as HTMLInputElement);
    const pin = element.value.trim().replace(
      'https://chime.aws/', '').replace('https://app.chime.aws/meetings/', '');
    if (/^\d{10}$/.test(pin)) {
      return pin;
    }
    return null;
  }

  showProgress(): void {
    (document.getElementById('progress-bridge') as HTMLDivElement).style.visibility = 'visible';
  }

  hideProgress(): void {
    (document.getElementById('progress-bridge') as HTMLDivElement).style.visibility = 'hidden';
  }
}

export class Connection implements AudioVideoObserver {
  logger: Logger | null = null;
  deviceController: DeviceControllerBasedMediaStreamBroker | null = null;
  configuration: MeetingSessionConfiguration | null = null;
  session: MeetingSession | null = null;
  gotStreamCallback: (stream: MediaStream) => void | null = null;
  
  constructor(
    toPin: string,
    fromPin: string,
    meetingInfo: any,
    private audioElement: HTMLAudioElement,
    private statusElement: HTMLParagraphElement,
  ) {
    this.logger = new ConsoleLogger(`${toPin}<->${fromPin}`, LogLevel.INFO);
    this.deviceController = new DefaultDeviceController(this.logger);
    this.configuration = new MeetingSessionConfiguration(meetingInfo.Meeting, meetingInfo.Attendee);
    this.configuration.ignoreVideoSources = true;
    this.session = new DefaultMeetingSession(this.configuration, this.logger, this.deviceController);
    this.session.audioVideo.bindAudioElement(this.audioElement);
    this.session.audioVideo.addObserver(this);
    this.session.audioVideo.start();
  }

  audioVideoDidStop() {
    this.status('Disconnected');
  }

  audioVideoDidStart() {
    const stream = this.audioElement.srcObject as MediaStream;
    if (stream) {
      this.status('Connected');
      this.gotStreamCallback(stream);
    } else {
      this.status('Failed');
    }
  }

  audioVideoDidStartConnecting(reconnecting: boolean) {
    if (reconnecting) {
      this.status('Reconnecting...');
    } else {
      this.status('Connecting...');
    }
  }

  status(s: string) {
    this.statusElement.innerText = s;
  }
}

window.addEventListener('load', () => {
  new ChimeBridgeApp();
});
