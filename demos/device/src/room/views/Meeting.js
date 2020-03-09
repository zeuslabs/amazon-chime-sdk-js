import React from 'react';

import VideoManager from '../containers/VideoManager';
import AudioManager from '../containers/AudioManager';

const Meeting = () => {
  return (
    <>
      <h1>In-Meeting</h1>
      <VideoManager />
      <AudioManager />
    </>
  );
};

export default Meeting;
