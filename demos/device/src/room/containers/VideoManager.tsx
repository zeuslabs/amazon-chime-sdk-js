import React, { useReducer, useEffect } from 'react';

import MeetingManager from '../MeetingManager';
import VideoGrid from '../components/VideoGrid';
import VideoTile from '../components/VideoTile';

function reducer(state, { type, payload }) {
  switch (type) {
    case 'TILE_UPDATED': {
      const { tileId, ...rest } = payload;
      return {
        ...state,
        [tileId]: {
          ...rest,
        },
      };
    }
    case 'TILE_DELETED': {
      const { [payload]: omit, ...rest } = state;
      return {
        ...rest,
      };
    }
    default: {
      return { ...state };
    }
  }
}

const VideoManager = () => {
  const [state, dispatch] = useReducer(reducer, {});

  const videoTileDidUpdate = tileState => {
    dispatch({ type: 'TILE_UPDATED', payload: tileState });
  };

  const videoTileWasRemoved = (tileId: number) => {
    dispatch({ type: 'TILE_DELETED', payload: tileId });
  };

  const observers = { videoTileDidUpdate, videoTileWasRemoved };

  useEffect(() => {
    MeetingManager.addObserver(observers);

    return () => MeetingManager.removeObserver(observers);
  }, []);

  const videos = Object.keys(state).map(tileId => (
    <VideoTile
      key={tileId}
      nameplate="Attendee ID"
      isLocal={state[tileId].localTile}
      bindVideoTile={videoRef => MeetingManager.bindVideoTile(parseInt(tileId), videoRef)}
    />
  ));

  return <VideoGrid size={videos.length}>{videos}</VideoGrid>;
};

export default VideoManager;
