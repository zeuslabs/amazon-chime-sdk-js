// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Message from './Message'

// MessageData contains a list of messages. They are guaranteed to be
// given in a range of sequence numbers. The history range indicates
// the inclusive range of messages sequence number
export default class MessageData {
  // Array of messages
  message: Message[];

  // Start sequence number of the available message history.
  historyRangeStart: number;

  // End sequence number of the available message history.
  historyRangeEnd: number;
}
