import React, { useState } from 'react';

import { useControllerDispatch } from '../../ControllerProvider';
import Input from '../../../../components/form/Input';
import Submit from '../../../../components/form/Submit';
import KeyboardInput from '../../../../components/form/KeyboardInput';

import './MeetingForm.css';

const MeetingForm: React.FC = () => {
  const dispatch = useControllerDispatch();
  const [name, setName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
      <KeyboardInput label="Username" active={!!name} value={name} onChange={setName} />
      <KeyboardInput
        label="Meeting ID"
        active={!!meetingId}
        value={meetingId}
        onChange={setMeetingId}
      />
      <Submit>{isLoading ? 'loading...' : 'Submit'}</Submit>
    </form>
  );
};

export default MeetingForm;
