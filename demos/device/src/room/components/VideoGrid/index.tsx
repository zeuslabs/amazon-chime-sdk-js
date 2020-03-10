import React from 'react';

import './VideoGrid.css';

const VideoGrid = ({ children, size }) => {
  return <div className={`VideoGrid ${`VideoGrid--size-${size}`}`}>{children}</div>;
};

export default VideoGrid;
