"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(logLevel = LogLevel.ERROR) {
        this.profileMode = false;
        this.logLevel = logLevel;
    }
    setLogLevel(logLevel = LogLevel.DEBUG) {
        this.logLevel = logLevel;
    }
    log(level, ...args) {
        if (level >= this.logLevel) {
            const message = args.length === 1 ? args[0] : args;
            console.log(`[${LogLevel[level]}]`, ...message);
        }
    }
    debug(...args) {
        this.log(LogLevel.DEBUG, ...args);
    }
    info(...args) {
        this.log(LogLevel.INFO, ...args);
    }
    warn(...args) {
        this.log(LogLevel.WARN, ...args);
    }
    error(...args) {
        this.log(LogLevel.ERROR, ...args);
    }
    profile(...args) {
        if (this.profileMode) {
            console.info("[PROFILE]", ...args);
        }
    }
}
exports.Logger = Logger;
exports.logger = new Logger(LogLevel.ERROR);
