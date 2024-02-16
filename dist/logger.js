"use strict";
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
    setProfileMode() {
        this.profileMode = true;
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
        console.info("[PROFILE]", ...args);
    }
}
exports.Logger = Logger;
exports.logger = new Logger(LogLevel.ERROR);
