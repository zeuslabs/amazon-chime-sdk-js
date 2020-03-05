import React, { useEffect } from 'react';

import DolbyEnvironment from './DolbyEnvironment';
import BrowserEnvironment from './BrowserEnvironment';

// import DapiLink from './DapiLink';

// Todo - Route based communication layer for dolby/broadcast
// const channel = new BroadcastChannel('chime-broadcaster');

const RoomShim = () => {
  useEffect(() => {
    if (window.deviceEnvironment) return;

    console.log('Initializing Room shim layer');

    const urlParams = new URLSearchParams(window.location.search);
    const shim = urlParams.get('shim');

    if (shim === 'dolby') {
      console.log('Dolby shim param found. Setting up DolbyEnvironment');

      if (!dapi) {
        console.error('No dapi detected, aborting');
      }

      const dapi = window.dapi;
      window.deviceEnvironment = Promise.resolve(new DolbyEnvironment(dapi));
    } else {
      console.log('No shim param found. Setting up BrowserEnvironment');

      window.deviceEnvironment = Promise.resolve(new BrowserEnvironment());
    }
  }, []);

  return null;
};

export default RoomShim;
