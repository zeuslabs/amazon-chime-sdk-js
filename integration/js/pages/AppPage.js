const {By, promise} = require('selenium-webdriver');
const {TestUtils} = require('kite-common');

const elements = {
  meetingIdInput: By.id('inputMeeting'),
  sipMeetingIdInput: By.id('sip-inputMeeting'),
  voiceConnectorIdInput: By.id('voiceConnectorId'),
  attendeeNameInput: By.id('inputName'),
  authenticateButton: By.id('authenticate'),
  localVideoBotton: By.id('button-camera'),
  joinButton: By.id('joinButton'),
  meetingEndButtom: By.id('button-meeting-end'),
  meetingLeaveButton: By.id('button-meeting-leave'),
  screenShareButton: By.id('button-screen-share'),
  screenViewButton: By.id('button-screen-view'),
  contentShareButton: By.id('button-content-share'),
  contentSharePauseButton: By.id('button-pause-content-share'),
  sipAuthenticateButton: By.id('button-sip-authenticate'),
  roster: By.id('roster'),
  participants: By.css('li'),
  switchToSipFlow: By.id('to-sip-flow'),

  authenticationFlow: By.id('flow-authenticate'),
  deviceFlow: By.id('flow-devices'),
  meetingFlow: By.id('flow-meeting'),
  sipAuthenticateFlow: By.id('flow-sip-authenticate'),
  sipUriFlow: By.id('flow-sip-uri'),

  failedMeetingFlow: By.id('flow-failed-meeting'),
  microphoneDropDown440HzButton: By.id('dropdown-menu-microphone-440-Hz'),
  microphoneDropDownButton: By.id('button-microphone-drop'),
  microphoneButton: By.id('button-microphone'),

  meetingAudio: By.id('meeting-audio'),
  sipUri: By.id('sip-uri'),
};

const SessionStatus = {
  STARTED: 'Started',
  FAILED: 'Failed',
  CONNECTING: 'Connecting',
};

class AppPage {
  constructor(driver, logger) {
    this.driver = driver;
    this.logger = logger;
  }

  async open(stepInfo) {
    await TestUtils.open(stepInfo);
  }

  async close(stepInfo) {
    await stepInfo.driver.close();
  }

  async enterMeetingId(meetingId) {
    let meetingIdInputBox = await this.driver.findElement(elements.meetingIdInput);
    await meetingIdInputBox.clear();
    await meetingIdInputBox.sendKeys(meetingId);
  }

  async enterAttendeeName(attendeeName) {
    let attendeeNameInputBox = await this.driver.findElement(elements.attendeeNameInput);
    await attendeeNameInputBox.clear();
    await attendeeNameInputBox.sendKeys(attendeeName);
  }

  async authenticate() {
    let authenticateButton = await this.driver.findElement(elements.authenticateButton);
    await authenticateButton.click();
  }

  async joinMeeting() {
    let joinButton = await this.driver.findElement(elements.joinButton);
    await joinButton.click();
  }

  async endTheMeeting() {
    let meetingEndButtom = await this.driver.findElement(elements.meetingEndButtom);
    await meetingEndButtom.click();
  }

  async leaveTheMeeting() {
    let meetingLeaveButton = await this.driver.findElement(elements.meetingLeaveButton);
    await meetingLeaveButton.click();
  }

  async clickScreenShareButton() {
    let screenShareButton = await this.driver.findElement(elements.screenShareButton);
    await screenShareButton.click();
  }

  async clickScreenViewButton() {
    let screenViewButton = await this.driver.findElement(elements.screenViewButton);
    await screenViewButton.click();
  }

  async clickContentShareButton() {
    const contentShareButton = await this.driver.findElement(elements.contentShareButton);
    await contentShareButton.click();
  }

  async clickContentSharePauseButton() {
    const contentSharePauseButton = await this.driver.findElement(elements.contentSharePauseButton);
    await contentSharePauseButton.click();
  }

  async clickCameraButton() {
    let localVideoButton = await this.driver.findElement(elements.localVideoBotton);
    await localVideoButton.click();
  }

  async clickMicrophoneButton() {
    let microphoneButton = await this.driver.findElement(elements.microphoneButton);
    await microphoneButton.click();
  }

  async playRandomTone() {
    let tone = await this.driver.findElement(elements.microphoneDropDown440HzButton);
    await tone.click();
  }

  async clickOnMicrophoneDropDownButton() {
    let microphoneDropDown = await this.driver.findElement(elements.microphoneDropDownButton);
    await microphoneDropDown.click();
  }

  async getNumberOfParticipantsOnRoster() {
    const roster = await this.driver.findElement(elements.roster);
    const participantElements = await this.driver.findElements(elements.participants);
    this.logger(`Number of participants on roster: ${participantElements.length}`);
    return participantElements.length;
  }

  async getSessionStatus() {
    // TODO: find a way to check if the user was able to join the meeting or not
    await TestUtils.waitAround(5 * 1000); // wait for 5 secs
    return SessionStatus.STARTED;
  }

  async switchToSipCallFlow() {
    let switchToSipFlow = await this.driver.findElement(elements.switchToSipFlow);
    await switchToSipFlow.click();
  }

  async getSipUri() {
    return await this.driver.findElement(elements.sipUri).getAttribute("value");
  }

  async authenticateSipCall(meetingId, voiceConnectorId) {
    let sipMeetingIdInput = await this.driver.findElement(elements.sipMeetingIdInput);
    await sipMeetingIdInput.clear();
    await sipMeetingIdInput.sendKeys(meetingId);

    let voiceConnectorIdInput = await this.driver.findElement(elements.voiceConnectorIdInput);
    await voiceConnectorIdInput.clear();
    await voiceConnectorIdInput.sendKeys(voiceConnectorId);

    let sipAuthenticateButton = await this.driver.findElement(elements.sipAuthenticateButton);
    await sipAuthenticateButton.click();
  }

  async switchToSipCallFlow() {
    let switchToSipFlow = await this.driver.findElement(elements.switchToSipFlow);
    await switchToSipFlow.click();
  }

  async waitingToEndMeeting() {
    let timeout = 10;
    let i = 0;
    var meetingEnding = true;
    while (meetingEnding && i < timeout) {
      try {
        meetingEnding = await this.isMeetingEnding();
      } catch (e) {
        meetingEnding = true;
      }
      if (meetingEnding === false) {
        console.log("meeting ended");
        return 'done'
      }
      i++;
      await TestUtils.waitAround(1000);
    }
    return 'failed'
  }

  async waitForAuthentication() {
    let timeout = 10;
    let i = 0;
    let authenticating = true;
    while (authenticating && i < timeout) {
      authenticating = await this.isAuthenticating();
      if (authenticating === false) {
        return 'done'
      }
      i++;
      await TestUtils.waitAround(1000);
    }
    return 'failed'
  }

  async waitForSipAuthentication() {
    let timeout = 10;
    let i = 0;
    let authenticated = false;
    while (!authenticated && i < timeout) {
      authenticated = await this.isSipAuthenticated();
      if (authenticated === true) {
        return 'done'
      }
      i++;
      await TestUtils.waitAround(1000);
    }
    return 'failed'
  }

  async waitToJoinTheMeeting() {
    let timeout = 20;
    let i = 0;
    let joining = true;
    while (joining && i < timeout) {
      joining = await this.isJoiningMeeting();
      if (joining === false) {
        return 'done'
      }
      i++;
      await TestUtils.waitAround(1000);
    }
    return 'failed'
  }

  async isJoiningMeeting() {
    return await this.driver.findElement(elements.deviceFlow).isDisplayed();
  }

  async isAuthenticating() {
    return await this.driver.findElement(elements.authenticationFlow).isDisplayed();
  }

  async isMeetingEnding() {
    return await this.driver.findElement(elements.meetingFlow).isDisplayed();
  }

  async isSipAuthenticated() {
    return await this.driver.findElement(elements.sipUriFlow).isDisplayed();
  }

  async checkIfMeetingAuthenticated() {
    return await this.driver.findElement(elements.deviceFlow).isDisplayed();
  }

  async checkIfUserJoinedTheMeeting() {
    return await this.driver.findElement(elements.meetingFlow).isDisplayed();
  }

  async checkIfFailedToJoinMeeting() {
    return await this.driver.findElement(elements.failedMeetingFlow).isDisplayed();
  }

  async rosterCheck(numberOfParticipants) {
    let i = 0;
    let timeout = 10;
    while (i < timeout) {
      try {
        const participantCountOnRoster = await this.getNumberOfParticipantsOnRoster();
        if (participantCountOnRoster === numberOfParticipants) {
          return true;
        }
      } catch (err) {
      }
      await TestUtils.waitAround(10);
      i++;
    }
    return false;
  }

  async videoCheck(stepInfo, index, expectedState = 'video') {
    let checked; // Result of the verification
    let i = 0; // iteration indicator
    let timeout = 10;
    checked = await TestUtils.verifyVideoDisplayByIndex(stepInfo.driver, index);
    while ((checked.result !== expectedState) && i < timeout) {
      checked = await TestUtils.verifyVideoDisplayByIndex(stepInfo.driver, index);
      i++;
      await TestUtils.waitAround(1000);
    }
    return checked.result;
  }

  async videoCheckLong(stepInfo, index, expectedState) {
    let checked; // Result of the verification
    let i = 0; // iteration indicator
    let timeout = 10;
    checked = await TestUtils.verifyVideoDisplayByIndex(stepInfo.driver, index);
    while ((checked.result !== expectedState) && i < timeout) {
      checked = await TestUtils.verifyVideoDisplayByIndex(stepInfo.driver, index);
      i++;
      await TestUtils.waitAround(1000);
    }
    // after the video is in desired state, monitor it for 30 secs to check if it stays in that state.
    i = 0;
    timeout = 60;
    let success = 0;
    let total = 0;
    while (i < timeout) {
      checked = await TestUtils.verifyVideoDisplayByIndex(stepInfo.driver, index);
      i++;
      if (checked.result === expectedState) {
        success++;
      }
      total++;
      await TestUtils.waitAround(1000);
    }
    if (success / total > 0.75) {
      return true
    }
    return false;
  }

  async audioCheck(stepInfo, expectedState) {
    let res = undefined;
    try {
      res = await this.driver.executeAsyncScript(async (expectedState) => {
        let logs = [];
        let callback = arguments[arguments.length - 1];

        const sleep = (milliseconds) => {
          return new Promise(resolve => setTimeout(resolve, milliseconds))
        };

        let successfulToneChecks = 0;
        let totalToneChecks = 0;
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let minToneError = Infinity;
        let maxToneError = -Infinity;
        try {
          let stream = document.getElementById('meeting-audio').srcObject;
          let source = audioContext.createMediaStreamSource(stream);
          let analyser = audioContext.createAnalyser();
          source.connect(analyser);
          let byteFrequencyData = new Uint8Array(analyser.frequencyBinCount);
          let floatFrequencyData = new Float32Array(analyser.frequencyBinCount);

          await sleep(5000);

          const getAverageVolume = () => {
            analyser.getByteFrequencyData(byteFrequencyData);

            let values = 0;
            let average;
            let length = byteFrequencyData.length;
            // get all the frequency amplitudes
            for (let i = 0; i < length; i++) {
              values += byteFrequencyData[i];
            }
            average = values / length;
            return average;
          };

          const checkVolumeFor = async (runCount) => {
            let i = 0;
            for (i = 0; i < runCount; i++) {
              totalToneChecks++;
              const avgTestVolume = getAverageVolume();
              logs.push(`Resulting volume ${avgTestVolume}`);
              if (
                (expectedState === "AUDIO_ON" && avgTestVolume > 0) ||
                (expectedState === "AUDIO_OFF" && avgTestVolume === 0)
              ) {
                successfulToneChecks++;
              }
              i++;
              await sleep(100)
            }
          };

          const checkFrequency = (targetReceiveFrequency) => {
            analyser.getFloatFrequencyData(floatFrequencyData);
            // logs.push(`frequency data : ${floatFrequencyData}`);
            let maxBinDb = -Infinity;
            let hotBinFrequency = 0;
            const binSize = audioContext.sampleRate / analyser.fftSize; // default fftSize is 2048
            for (let i = 0; i < floatFrequencyData.length; i++) {
              const v = floatFrequencyData[i];
              if (v > maxBinDb) {
                maxBinDb = v;
                hotBinFrequency = i * binSize;
              }
            }
            const error = Math.abs(hotBinFrequency - targetReceiveFrequency);
            if (maxBinDb > -Infinity) {
              if (error < minToneError) {
                minToneError = error;
              }
              if (error > maxToneError) {
                maxToneError = error;
              }
            }
            if (error <= 2 * binSize) {
              successfulToneChecks++;
            }
            totalToneChecks++;
            return hotBinFrequency
          };

          const checkFrequencyFor = async (runCount, freq) => {
            let i = 0;
            for (i = 0; i < runCount; i++) {
              const testFrequency = checkFrequency(freq);
              logs.push(`Resulting Frequency ${testFrequency}`);
              i++;
              await sleep(100)
            }
          };

          if (expectedState === "AUDIO_OFF") {
            await checkVolumeFor(50);
          }

          if (expectedState === "AUDIO_ON") {
            await checkFrequencyFor(50, 440);
          }
        } catch (e) {
          logs.push(`${e}`)
        } finally {
          logs.push(`test completed`);
          await audioContext.close();
          callback({
            percentage: successfulToneChecks / totalToneChecks,
            logs
          });
        }
      }, expectedState);
    } catch (e) {
      this.logger(`Audio Check Failed ${e}`)
    } finally {
      if (res) {
        res.logs.forEach(l => {
          this.logger(l)
        })
      }
    }
    this.logger(`Audio check success rate: ${res.percentage * 100}%`);
    if (res.percentage >= 0.75) {
      return true
    }
    return false
  }

  async getScreenSharePixelSum() {
    return await this.driver.executeAsyncScript(async () => {
      var callback = arguments[arguments.length - 1];
      const getSum = (total, num) => {
        return total + num;
      };
      var canvas = document.querySelector('canvas');
      var sum = 0;
      if (canvas !== null && canvas !== undefined) {
        var ctx = canvas.getContext('2d');
        var imageData = ctx.getImageData(0, 0, 1000, 600).data;
        var sum = imageData.reduce(getSum);
      }
      callback(sum);
    });
  }

  async checkScreenShare(expectedState) {
    let pixelData = [];
    let i = 0;
    let timeout = 10;
    let success = 0;
    let pixelSum = await this.getScreenSharePixelSum();
    pixelData.push(pixelSum);
    while (i < timeout) {
      i++;
      pixelSum = await this.getScreenSharePixelSum();
      pixelData.push(pixelSum);
      let pixelDataLen = pixelData.length;
      if (expectedState === "video" && pixelData[pixelDataLen - 1] - pixelData[pixelDataLen - 2] !== 0) {
        success++;
      }
      if (expectedState === "blank" && pixelData[pixelDataLen - 1] - pixelData[pixelDataLen - 2] === 0) {
        success++;
      }
      await TestUtils.waitAround(1000);
    }
    if (success === 0) {
      return 'failed'
    }
    return expectedState
  }

}

module.exports.AppPage = AppPage;
module.exports.SessionStatus = SessionStatus;
