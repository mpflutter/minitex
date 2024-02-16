export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

export class Logger {
  private logLevel: LogLevel;
  public profileMode = false;

  constructor(logLevel: LogLevel = LogLevel.ERROR) {
    this.logLevel = logLevel;
  }

  setLogLevel(logLevel: LogLevel = LogLevel.DEBUG) {
    this.logLevel = logLevel;
  }

  private log(level: LogLevel, ...args: any[]): void {
    if (level >= this.logLevel) {
      const message = args.length === 1 ? args[0] : args;
      console.log(`[${LogLevel[level]}]`, ...message);
    }
  }

  public debug(...args: any[]): void {
    this.log(LogLevel.DEBUG, ...args);
  }

  public info(...args: any[]): void {
    this.log(LogLevel.INFO, ...args);
  }

  public warn(...args: any[]): void {
    this.log(LogLevel.WARN, ...args);
  }

  public error(...args: any[]): void {
    this.log(LogLevel.ERROR, ...args);
  }

  public profile(...args: any[]): void {
    if (this.profileMode) {
      console.info("[PROFILE]", ...args);
    }
  }
}

export const logger = new Logger(LogLevel.ERROR);
