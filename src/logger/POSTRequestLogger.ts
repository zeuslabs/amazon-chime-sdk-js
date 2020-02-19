// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger, LogLevel } from '../index';
import IntervalScheduler from '../scheduler/IntervalScheduler';

export default class POSTRequestLogger implements Logger {
  private logCapture: string[] = [];
  private logSequenceNumber: number = 0;
  private lock = false;
  private static BATCH_SIZES = 75;
  private intervalScheduler: IntervalScheduler;

  constructor(
    private name: string,
    private level = LogLevel.WARN,
    private meetingId: string,
    private attendeeId: string,
    private intervalMs: number,
    private baseURL: string
  ) {
    this.intervalScheduler = new IntervalScheduler(this.intervalMs);
    var _this = this;
    window.addEventListener('unload', function(event) {
        _this.intervalScheduler.stop();
        if(!navigator.sendBeacon){
            return
        }
        // Send the beacon
        while (_this.logCapture.length > 0) {
            POSTRequestLogger.BATCH_SIZES = 10;
            let batch = _this.logCapture.slice(0, POSTRequestLogger.BATCH_SIZES);
            let body = JSON.stringify({
              meetingId: _this.meetingId,
              attendeeId: _this.attendeeId,
              appName: _this.name,
              logs: batch,
            });
            var status = navigator.sendBeacon(`${_this.baseURL}logs`, body);
            if (status == true){
                _this.logCapture = _this.logCapture.slice(batch.length);
            }
        }
    });
  }
  debug(debugFunction: () => string): void {
    if (LogLevel.DEBUG < this.level) {
      return;
    }
    this.log(LogLevel.DEBUG, debugFunction());
  }

  info(msg: string): void {
    this.log(LogLevel.INFO, msg);
  }

  warn(msg: string): void {
    this.log(LogLevel.WARN, msg);
  }

  error(msg: string): void {
    this.log(LogLevel.ERROR, msg);
  }

  setLogLevel(level: LogLevel): void {
    this.level = level;
  }

  getLogLevel(): LogLevel {
    return this.level;
  }

  async publishToCloudWatchCaller(flushAll: boolean): Promise<void> {
    if (flushAll === true && this.logCapture.length > 0) {
      this.intervalScheduler.stop();
      if (this.logCapture.length <= POSTRequestLogger.BATCH_SIZES)
        await this.publishToCloudWatch(this.logCapture.length);
      else {
        const batchSize = Math.ceil(this.logCapture.length / POSTRequestLogger.BATCH_SIZES);
        for (let i = 0; i < batchSize; i++) {
          if (this.logCapture.length > 0) {
            await this.publishToCloudWatch(POSTRequestLogger.BATCH_SIZES);
          }
        }
      }
    }
    this.intervalScheduler.start(async () => {
      this.publishToCloudWatch(POSTRequestLogger.BATCH_SIZES);
    });
  }

  async publishToCloudWatch(batchSize: number): Promise<void> {
    if (this.lock === true || this.logCapture.length === 0) {
      return;
    }
    this.lock = true;
    let batch = this.logCapture.slice(0, batchSize);
    const body = JSON.stringify({
      meetingId: this.meetingId,
      attendeeId: this.attendeeId,
      appName: this.name,
      logs: batch,
    });
    try {
      const response = await fetch(`${this.baseURL}logs`, {
        method: 'POST',
        body,
      });
      if (response.status === 200) {
        this.logCapture = this.logCapture.slice(batch.length);
      }
    }
    catch (ex) {
      this.warn('[POSTRequestLogger] ' + ex);
    }
    finally {
      this.lock = false;
    }
  }

  private log(type: LogLevel, msg: string): void {
    if (type < this.level) {
      return;
    }
    const date = new Date();
    const timestamp = date.toISOString();
    const logMessage = `${this.logSequenceNumber} ${timestamp} [${LogLevel[type]}] ${this.name} - ${msg}`;

    switch (type) {
      case LogLevel.ERROR:
        console.trace(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage.replace(/\\r\\n/g, '\n'));
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
    }
    this.logCapture.push(
      JSON.stringify({
        logSequenceNumber: this.logSequenceNumber,
        logMessage: msg,
        timestamp: date.getTime(),
        logLevelType: LogLevel[type],
      })
    );
    this.logSequenceNumber += 1;
  }
}
