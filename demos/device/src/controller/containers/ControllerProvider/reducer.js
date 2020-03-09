export const initialState = {
  activeMeeting: false,
  isSharingLocalVideo: false,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'MEETING_JOINED':
      return {
        ...state,
        activeMeeting: true,
      };

    case 'MEETING_DATA':
      return {
        ...state,
        ...action.payload,
      };

    case 'MEETING_LEFT':
      return {
        ...state,
        activeMeeting: false,
      };

    default:
      return { ...state };
  }
}

export default reducer;
