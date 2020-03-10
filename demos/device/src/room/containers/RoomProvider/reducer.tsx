export const initialState = {
  activeMeeting: false,
  isSharingLocalVideo: false,
};

export function reducer(state, action): any {
  const { type, _payload } = action;
  switch (type) {
    case 'JOIN_MEETING':
      return {
        ...state,
        activeMeeting: true,
      };

    case 'START_LOCAL_VIDEO':
      return {
        ...state,
        isSharingLocalVideo: true,
      };

    case 'END_MEETING':
      return {
        ...state,
        activeMeeting: null,
      };

    case 'LEAVE_MEETING':
      return {
        ...state,
        activeMeeting: null,
      };

    default:
      return state;
  }
}
