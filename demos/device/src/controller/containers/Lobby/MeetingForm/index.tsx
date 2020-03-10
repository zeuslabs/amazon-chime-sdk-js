import React, { useState } from 'react';

import { useControllerDispatch } from '../../ControllerProvider';
import Input from '../../../../components/form/Input';
import Submit from '../../../../components/form/Submit';

import './MeetingForm.css';

const MeetingForm = () => {
  const dispatch = useControllerDispatch();
  const [name, setName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'meetingId') {
      setMeetingId(value);
    } else {
      setName(value);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    dispatch({
      type: 'JOIN_MEETING',
      payload: {
        name,
        meetingId,
      },
    });

    setIsLoading(true);
  };

  return (
    <form className="MeetingForm" onSubmit={handleSubmit}>
      <Input name="name" label="Username" onChange={handleChange} value={name} />
      <Input name="meetingId" label="Meeting ID" onChange={handleChange} value={meetingId} />
      <Submit>{isLoading ? 'loading...' : 'Submit'}</Submit>
    </form>
  );
};

export default MeetingForm;
