import './MeetingControls.css';

import React from 'react';

import Button from '../../../../components/Button';
import { useControllerDispatch, useControllerState } from '../../ControllerProvider';

const MeetingControls: React.FC = (): JSX.Element => {
  const state = useControllerState();
  const dispatch = useControllerDispatch();

  const toggleVideoTile = (): void => {
    dispatch({
      type: 'START_LOCAL_VIDEO',
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
      <button onClick={leaveMeeting}>Leave meeting</button>
      <button onClick={endMeeting}>End meeting</button>
    </div>
  );
};

export default MeetingControls;
