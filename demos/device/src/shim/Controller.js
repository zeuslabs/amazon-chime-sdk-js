import React, { useEffect } from 'react';

import DolbyEnvironment from './DolbyEnvironment';
import BrowserEnvironment from './BrowserEnvironment';

const ControllerShim = () => {
  useEffect(() => {
    if (window.controllerEnvironment) return;

    console.log('Initializing Controller shim layer');

    const urlParams = new URLSearchParams(window.location.search);
    const shim = urlParams.get('shim');

    if (shim === 'dolby') {
      console.log('Dolby param found. Setting up DolbyEnvironment');

      if (!dapi) {
        console.error('No dapi detected, aborting');
      }

      const dapi = window.dapi;
      window.controllerEnvironment = Promise.resolve(new DolbyEnvironment(dapi));
    } else {
      console.log('No shim param found. Setting up BrowserEnvironment');

      window.controllerEnvironment = Promise.resolve(new BrowserEnvironment());
    }
  }, []);

  return null;
};

export default ControllerShim;
