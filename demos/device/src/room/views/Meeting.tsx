import React from 'react';

import AudioManager from '../containers/AudioManager';
import VideoManager from '../containers/VideoManager';

const Meeting = (): JSX.Element => {
  return (
    <>
      <h1>In-Meeting</h1>
      <VideoManager />
      <AudioManager />
    </>
  );
};

export default Meeting;
