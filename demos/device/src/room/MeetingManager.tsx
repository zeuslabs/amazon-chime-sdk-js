import {
  AudioVideoFacade,
  AudioVideoObserver,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  Device,
  LogLevel,
  MeetingSessionConfiguration,
} from '../../../../build/index';

const BASE_URL = [
  location.protocol,
  '//',
  location.host,
  location.pathname.replace(/\/*$/, '/').replace('/device', ''),
].join('');

class MeetingManager {
  private meetingSession: DefaultMeetingSession;
  private audioVideo: AudioVideoFacade;
  private title: string;
  // private device: MediaTrackConstraints = {audio: true}

  async initializeMeetingSession(configuration: MeetingSessionConfiguration): Promise<any> {
    const logger = new ConsoleLogger('DEV-SDK', LogLevel.DEBUG);
    const deviceController = new DefaultDeviceController(logger);
    configuration.enableWebAudio = false;
    this.meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
    this.audioVideo = this.meetingSession.audioVideo;
    await this.setupAudioDevices();
  }

  async setupAudioDevices(): Promise<void> {
    const audioOutput = await this.audioVideo.listAudioOutputDevices();
    const defaultOutput = audioOutput[0] && audioOutput[0].deviceId;
    await this.audioVideo.chooseAudioOutputDevice(defaultOutput);

    const audioInput = await this.audioVideo.listAudioInputDevices();
    const defaultInput = audioInput[0] && audioInput[0].deviceId;
    await this.audioVideo.chooseAudioInputDevice(defaultInput);
  }

  addObserver(observer: AudioVideoObserver): void {
    if (!this.audioVideo) {
      console.error('AudioVideo not initialized. Cannot add observer');
      return;
    }

    this.audioVideo.addObserver(observer);
  }

  removeObserver(observer: AudioVideoObserver): void {
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
    const videoInput = await this.audioVideo.listVideoInputDevices();
    const defaultVideo = videoInput[0];
    await this.audioVideo.chooseVideoInputDevice(defaultVideo);
    this.audioVideo.startLocalVideoTile();
  }

  async joinMeeting(meetingId: string, name: string): Promise<any> {
    const url = `${BASE_URL}join?title=${encodeURIComponent(meetingId)}&name=${encodeURIComponent(
      name
    )}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
    this.title = data.JoinInfo.Title;
    await this.initializeMeetingSession(
      new MeetingSessionConfiguration(data.JoinInfo.Meeting, data.JoinInfo.Attendee)
    );
    this.audioVideo.start();
  }

  async endMeeting(): Promise<any> {
    await fetch(`${BASE_URL}end?title=${encodeURIComponent(this.title)}`, {
      method: 'POST',
    });
    this.leaveMeeting();
  }

  leaveMeeting(): void {
    this.audioVideo.stop();
  }

  bindAudioElement(ref: HTMLAudioElement) {
    this.audioVideo.bindAudioElement(ref);
  }

  unbindAudioElement(): void {
    this.audioVideo.unbindAudioElement();
  }
}

const Manager = new MeetingManager();

window.manager = Manager;

export default Manager;

// export default new MeetingManager();
