export const initialState = {
  activeMeeting: false,
  isSharingLocalVideo: false,
};

export const reducer = (state, action): any => {
  const [type, payload] = action;

  switch (type) {
    case 'MEETING_JOINED':
      return {
        ...state,
        activeMeeting: true,
      };

    case 'MEETING_DATA':
      return {
        ...state,
        payload,
      };

    case 'MEETING_LEFT':
      return {
        ...state,
        activeMeeting: false,
      };

    default:
      return { ...state };
  }
};
