import React, { useEffect, useReducer, useRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import MeetingManager from '../../MeetingManager';
import routes from '../../../routes';
import { initialState, reducer } from './reducer';
import { MessageHandler, DeviceMessage } from '../../../shim/types';

const sendMessage = async (msg: DeviceMessage): Promise<void> => {
  if (!window.deviceEnvironment) return;
  console.log(`Sending message to controller ${msg.type}`);

  const env = await window.deviceEnvironment;
  env.sendMessage(msg);
};

interface RoomProviderProps extends RouteComponentProps {}

const RoomProvider: React.FC<RoomProviderProps> = ({ history }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isInitialized = useRef(false);

  const messageHandler: MessageHandler = async ({ type, payload }) => {
    console.log(`RoomProvider::messageHandler - Message received with type: ${type}`);

    try {
      switch (type) {
        case 'JOIN_MEETING':
          const { meetingId, name } = payload;
          if (!meetingId || !name) return;

          await MeetingManager.joinMeeting(meetingId, name);
          dispatch({ type: 'JOIN_MEETING' });
          history.push(routes.MEETING);
          break;
        case 'START_LOCAL_VIDEO':
          MeetingManager.startLocalVideo();
          dispatch({ type: 'START_LOCAL_VIDEO' });
          break;
        case 'STOP_LOCAL_VIDEO':
          MeetingManager.stopLocalVideo();
          dispatch({ type: 'STOP_LOCAL_VIDEO' });
          break;
        case 'LEAVE_MEETING':
          await MeetingManager.leaveMeeting();
          history.push(routes.ROOT);
          dispatch({ type: 'LEAVE_MEETING' });
          break;
        case 'END_MEETING':
          await MeetingManager.endMeeting();
          history.push(routes.ROOT);
          dispatch({ type: 'END_MEETING' });
          break;
        default:
          console.log(`Unhandled incoming message: ${type}`);
          break;
      }
    } catch (e) {
      alert(e);
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

    window.deviceEnvironment.then(env => {
      env.init(messageHandler);
    });

    isInitialized.current = true;
  }, []);

  return null;
};

export default withRouter(RoomProvider);
