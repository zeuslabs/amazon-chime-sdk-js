import React, { useEffect, useReducer, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import MeetingManager from '../../../MeetingManager';
import { reducer, initialState } from './reducer';
import routes from '../../../routes';

const sendMessage = async msg => {
  if (!window.deviceEnvironment) return;
  console.log(`Sending message to controller ${msg.type}`);

  const env = await window.deviceEnvironment;
  env.sendMessage(msg);
};

const RoomProvider = ({ history }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isInitialized = useRef(false);

  const messageHandler = async ({ type, payload }) => {
    console.log(`RoomProvider::messageHandler - Message received with type: ${type}`);

    switch (type) {
      case 'JOIN_MEETING':
        const { meetingId, name } = payload;
        if ((!meetingId, !name)) return;

        try {
          await MeetingManager.joinMeeting(meetingId, name);
          dispatch({ type: 'JOIN_MEETING' });
          history.push(routes.MEETING);
        } catch (e) {
          alert(e);
        }

        break;

      case 'START_LOCAL_VIDEO':
        MeetingManager.startLocalVideo();
        dispatch({ type: 'START_LOCAL_VIDEO' });
        break;

      case 'LEAVE_MEETING':
        try {
          await MeetingManager.leaveMeeting();
          history.push(routes.ROOT);
          dispatch({ type: 'LEAVE_MEETING' });
        } catch (e) {
          alert(e);
        }
        break;

      case 'END_MEETING':
        try {
          await MeetingManager.endMeeting();
          history.push(routes.ROOT);
          dispatch({ type: 'END_MEETING' });
        } catch (e) {
          alert(e);
        }
        break;

      default:
        console.log(`Unhandled incoming message: ${type}`);
        break;
    }
  };

  useEffect(() => {
    if (!isInitialized.current) return;

    if (state.activeMeeting) {
      sendMessage({ type: 'MEETING_JOINED' });
    } else {
      sendMessage({ type: 'MEETING_LEFT' });
    }
  }, [state.activeMeeting]);

  useEffect(() => {
    if (!isInitialized.current) return;

    const { isSharingLocalVideo } = state;
    sendMessage({
      type: 'MEETING_DATA',
      payload: { isSharingLocalVideo: isSharingLocalVideo },
    });
  }, [state.isSharingLocalVideo]);

  useEffect(() => {
    if (!window.deviceEnvironment) return;

    deviceEnvironment.then(env => {
      env.init(messageHandler);
    });

    isInitialized.current = true;
  }, []);

  return null;
};

export default withRouter(RoomProvider);
