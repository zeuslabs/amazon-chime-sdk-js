import './MeetingControls.css';

import React from 'react';

import Button from '../../../../components/Button';
import { useControllerDispatch, useControllerState } from '../../ControllerProvider';

const MeetingControls: React.FC = () => {
  const state = useControllerState();
  const dispatch = useControllerDispatch();

  const toggleVideoTile = (): void => {
    dispatch({
      type: state.isSharingLocalVideo ? 'STOP_LOCAL_VIDEO' : 'START_LOCAL_VIDEO',
    });
  };

  const leaveMeeting = (): void => {
    dispatch({
      type: 'LEAVE_MEETING',
    });
  };

  const endMeeting = (): void => {
    dispatch({
      type: 'END_MEETING',
    });
  };

  return (
    <div className="MeetingControls">
      <Button active={state.isSharingLocalVideo} onClick={toggleVideoTile}>
        {state.isSharingLocalVideo ? 'Disable video' : 'Enable video'}
      </Button>
      <Button onClick={leaveMeeting}>Leave meeting</Button>
      <Button onClick={endMeeting}>End meeting</Button>
    </div>
  );
};

export default MeetingControls;
