// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import MessageDataObserver from '../messagedataobserver/MessageDataObserver';

// MessageController allows sending small messages of up to S=1024 bytes
// to other attendees. The server persistently stores the most recent
// N=16384 messages and makes them available for query. This allows for
// clients joining late or after a period of no connection to recover
// messages from the past.
//
// Each message can be sent in one of two modes: public and private.
// A public message is broadcast to all attendees and its data payload is
// visible to any attendee of the meeting. Future attendees will be able
// to query for the message and see its data payload. A private message is
// also broadcast to all attendees; however, its data payload is only
// visible if the attendee was an intended recipient of the message.
//
// The server assigns messages a monotonically increasing sequence number
// that is unique to the meeting. The sequence number can be used to resolve
// races between messages that are sent by different clients around the
// same time.
//
// Note that this API is not intended to support transfer of large payloads.
// The server will throttle incoming messages to T=10 messages per second
// per meeting.
export default interface MessageController {
  // Sends a message containing a data payload to all present
  // and future attendees of the meeting. The promise is resolved when
  // the server accepts the message and assigns it a sequence number.
  // The promise contains the sequence number assigned to the message.
  // The promise will reject if the server either throttles the message
  // or the signaling connection with the server becomes unavailable.
  sendPublicMessage(dataType: string, data: Uint8Array): Promise<number>;

  // Sends a message containing a data payload to . Other 
  // The promise contains the sequence number assigned to the message.
  // The promise will reject if the server either throttles the message
  // or the signaling connection with the server becomes unavailable.
  sendPrivateMessage(dataType: string, data: Uint8Array, targetAttendeeIds: string[]): Promise<number>;

  // Sends a request to the server to retrieve an inclusive range of
  // messages. Use a message data observer to receive the data.
  // Note that the data may arrive in multiple message data callbacks.
  retrieveMessages(rangeStart: number, rangeEnd: number): void;

  // Adds a message data observer to receive message data.
  addMessageDataObserver(observer: MessageDataObserver): void;

  // Removes a message data observer.
  removeMessageDataObserver(observer: MessageDataObserver): void;
}
