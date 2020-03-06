import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from '../../../src/index';

const BASE_URL = [
  location.protocol,
  '//',
  location.host,
  location.pathname.replace(/\/*$/, '/').replace('/device', ''),
].join('');
class MeetingManager {
  constructor() {
    this.title = null;
    this.meetingSession = null;
    this.audioVideo = null;
  }

  async initializeMeetingSession(configuration) {
    const logger = new ConsoleLogger('DEV-SDK', LogLevel.DEBUG);
    const deviceController = new DefaultDeviceController(logger);
    configuration.enableWebAudio = false;
    this.meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
    this.audioVideo = this.meetingSession.audioVideo;
    const outputDevices = await this.audioVideo.listAudioOutputDevices();
    const defaultDev = outputDevices[0] && outputDevices[0].deviceId;
    await this.audioVideo.chooseAudioOutputDevice(defaultDev);
    await this.audioVideo.chooseAudioInputDevice({ audio: true });
  }

  addObserver(observer) {
    if (!this.audioVideo) {
      console.error('AudioVideo not initialized. Cannot add observer');
      return;
    }

    this.audioVideo.addObserver(observer);
  }

  bindVideoTile(id, videoEl) {
    this.audioVideo.bindVideoElement(id, videoEl);
  }

  async startLocalVideo() {
    await this.audioVideo.chooseVideoInputDevice({ audio: true, video: true });
    this.audioVideo.startLocalVideoTile();
  }

  async joinMeeting(meetingId, name) {
    try {
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
    } catch (err) {
      console.log(err);
    }
  }

  async endMeeting() {
    await fetch(`${BASE_URL}end?title=${encodeURIComponent(this.title)}`, {
      method: 'POST',
    });
    this.leaveMeeting();
  }

  leaveMeeting() {
    this.audioVideo.stop();
  }

  bindAudioElement = ref => {
    this.audioVideo.bindAudioElement(ref);
  };

  unbindAudioElement = () => {
    this.audioVideo.unbindAudioElement();
  };
}

export default new MeetingManager();
