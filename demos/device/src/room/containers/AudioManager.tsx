import React, { useEffect, useRef } from 'react';

import MeetingManager from '../../MeetingManager';

const AudioManager = () => {
  const audioRef = useRef();

  useEffect(() => {
    MeetingManager.bindAudioElement(audioRef.current);

    return () => MeetingManager.unbindAudioElement();
  }, [audioRef]);

  return <audio ref={audioRef} style={{ display: 'none' }}></audio>;
};

export default AudioManager;
