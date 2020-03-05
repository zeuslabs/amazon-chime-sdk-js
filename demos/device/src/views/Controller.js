import React, { useState, useEffect, useReducer } from 'react';

const sendMessage = async msg => {
  if (!window.controllerEnvironment) return;
  console.log(`Sending message to hub ${msg.type}`);

  const env = await window.controllerEnvironment;
  env.sendMessage(msg);
};

// Todo - reducer for handling message states
const Controller = () => {
  const [name, setName] = useState('');
  const [meetingId, setMeetingId] = useState('');

  useEffect(() => {
    if (!window.controllerEnvironment) return;

    controllerEnvironment.then(env => {
      env.init(messageHandler);
    });
  }, []);

  const messageHandler = msg => {
    console.log(`Received message from Hub: ${msg.type}`);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'name') {
      setName(value);
    } else {
      setMeetingId(value);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    sendMessage({
      type: 'JOIN_MEETING',
      payload: {
        name,
        meetingId,
      },
    });
  };

  const startLocalVideo = () => {
    sendMessage({
      type: 'START_LOCAL_VIDEO',
    });
  };

  const endMeeting = () => {
    sendMessage({
      type: 'END_MEETING',
    });
  };

  // Todo - componentize
  return (
    <>
      <h1>Controller View</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={name} name="name" onChange={handleChange} />
        <br />
        <input
          placeholder="Meeting ID"
          value={meetingId}
          name="meetingId"
          onChange={handleChange}
        />
        <br />
        <button>Join meeting</button>
      </form>

      <br />
      <button onClick={startLocalVideo}>Start video</button>
      <br />
      <button onClick={endMeeting}>End Meeting</button>
    </>
  );
};

export default Controller;
