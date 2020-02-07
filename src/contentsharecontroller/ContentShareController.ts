// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export default interface ContentShareController {
  startContentShare(stream: MediaStream): Promise<void>;

  startContentShareFromScreenCapture(sourceId?: string): Promise<void>;

  pauseContentShare(): void;

  unpauseContentShare(): void;

  stopContentShare(): void;
}
