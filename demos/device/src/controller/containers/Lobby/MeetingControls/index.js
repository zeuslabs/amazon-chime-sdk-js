import React from 'react';

import { useControllerState, useControllerDispatch } from '../../ControllerProvider';
import Button from '../../../../components/Button';

import './MeetingControls.css';

const MeetingControls = () => {
  const state = useControllerState();
  const dispatch = useControllerDispatch();

  const toggleVideoTile = () => {
    dispatch({
      type: 'START_LOCAL_VIDEO',
    });
  };

  const leaveMeeting = () => {
    dispatch({
      type: 'LEAVE_MEETING',
    });
  };

  const endMeeting = () => {
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
