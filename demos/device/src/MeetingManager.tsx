/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AudioVideoFacade,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  Device,
  LogLevel,
  MeetingSessionConfiguration,
} from '../../../build/index';

class MeetingManager {
  private static BASE_URL = [
    location.protocol,
    '//',
    location.host,
    location.pathname.replace(/\/*$/, '/').replace('/device', ''),
  ].join('');

  private title: string = '';
  private meetingSession: DefaultMeetingSession | null = null;
  private audioVideo: AudioVideoFacade | null = null;
  private device: Device = null;

  constructor() {}

  async initializeMeetingSession(configuration: any): Promise<void> {
    const logger = new ConsoleLogger('DEV-SDK', LogLevel.DEBUG);
    const deviceController = new DefaultDeviceController(logger);
    configuration.enableWebAudio = false;
    this.meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
    this.audioVideo = this.meetingSession.audioVideo;
    const outputDevices = await this.audioVideo.listAudioOutputDevices();
    const defaultDev = outputDevices[0] && outputDevices[0].deviceId;
    await this.audioVideo.chooseAudioOutputDevice(defaultDev);
    await this.audioVideo.chooseAudioInputDevice(this.device);
  }

  addObserver(observer: any): void {
    if (!this.audioVideo) {
      console.error('AudioVideo not initialized. Cannot add observer');
      return;
    }

    this.audioVideo.addObserver(observer);
  }

  removeObserver(observer: any): void {
    if (!this.audioVideo) {
      console.error('AudioVideo not initialized. Cannot remove observer');
      return;
    }

    this.audioVideo.removeObserver(observer);
  }

  bindVideoTile(id: number, videoEl: HTMLVideoElement): void {
    this.audioVideo.bindVideoElement(id, videoEl);
  }

  async startLocalVideo(): Promise<void> {
    await this.audioVideo.chooseVideoInputDevice(this.device);
    this.audioVideo.startLocalVideoTile();
  }

  async joinMeeting(
    meetingId: string | number | boolean,
    name: string | number | boolean
  ): Promise<void> {
    const url = `${MeetingManager.BASE_URL}join?title=${encodeURIComponent(
      meetingId
    )}&name=${encodeURIComponent(name)}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
    this.title = data.JoinInfo.Title;
    await this.initializeMeetingSession(
      new MeetingSessionConfiguration(data.JoinInfo.Meeting, data.JoinInfo.Attendee)
    );
    this.audioVideo.start();
  }

  async endMeeting(): Promise<void> {
    await fetch(`${MeetingManager.BASE_URL}end?title=${encodeURIComponent(this.title)}`, {
      method: 'POST',
    });
    this.leaveMeeting();
  }

  leaveMeeting(): void {
    this.audioVideo.stop();
  }

  bindAudioElement = (ref: HTMLAudioElement) => {
    this.audioVideo.bindAudioElement(ref);
  };

  unbindAudioElement = (): void => {
    this.audioVideo.unbindAudioElement();
  };
}

export default new MeetingManager();
