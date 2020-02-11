// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export default class Message {
  // A monotonically increasing sequence number that
  // uniquely identifies the message on the meeting.
  // The first message sent to the meeting will have
  // sequenceNumber=1.
  sequenceNumber: number;

  // Timestamp at which server processed the message
  // given in epoch milliseconds.
  timestampMs: number;

  // A string of up to D=255 printable ASCII characters indicating
  // the type of message. This field can be used to filter messages
  // on the receiving end.
  dataType: string;

  // The data payload of up to S=1024 bytes. The data field is null
  // if the current attendee was not a recipient of the message.
  data: Uint8Array | null;

  // The attendee ID of the sender.
  senderAttendeeId: string | null;
}
