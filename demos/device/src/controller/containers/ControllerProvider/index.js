import React, { useEffect, useReducer, useContext, createContext, useCallback } from 'react';

import { reducer, initialState } from './reducer';

async function sendMessage(msg) {
  if (!window.controllerEnvironment) return;
  console.log(`Sending message to hub ${msg.type}`);

  const env = await window.controllerEnvironment;
  env.sendMessage(msg);
}

const ControllerStateContext = createContext();
const ControllerDispatchContext = createContext();

export const ControllerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const wrappedDispatch = useCallback(
    msg => {
      sendMessage(msg);
      dispatch(msg);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!window.controllerEnvironment) return;

    controllerEnvironment.then(env => {
      env.init(messageHandler);
    });
  }, []);

  const messageHandler = msg => {
    console.log(`Received message from Hub: ${msg.type}`);
    dispatch(msg);
  };

  return (
    <ControllerStateContext.Provider value={state}>
      <ControllerDispatchContext.Provider value={wrappedDispatch}>
        {children}
      </ControllerDispatchContext.Provider>
    </ControllerStateContext.Provider>
  );
};

export function useControllerState() {
  const context = useContext(ControllerStateContext);
  if (context === undefined) {
    throw new Error('useControllerState must be used within a Provider');
  }
  return context;
}

export function useControllerDispatch() {
  const context = useContext(ControllerDispatchContext);
  if (context === undefined) {
    throw new Error('useControllerDispatch must be used within a Provider');
  }
  return context;
}

export default ControllerProvider;
