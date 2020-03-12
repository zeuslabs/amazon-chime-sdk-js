export interface State {
  activeMeeting: boolean;
  isSharingLocalVideo: boolean;
}

export const initialState: State = {
  activeMeeting: false,
  isSharingLocalVideo: false,
};

export function reducer(state: State, action: any): State {
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
        activeMeeting: false,
      };
    case 'LEAVE_MEETING':
      return {
        ...state,
        activeMeeting: false,
      };
    default:
      return state;
  }
}
