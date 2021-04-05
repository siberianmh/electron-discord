export const enum LogLevel {
  Trace = 10,
  Debug = 20,
  Info = 30,
  Warn = 40,
  Error = 50,
  Fatal = 60,
  None = 100,
}

export interface ILogger {
  trace(...values: ReadonlyArray<unknown>): void
  debug(...values: ReadonlyArray<unknown>): void
  info(...values: ReadonlyArray<unknown>): void
  warn(...values: ReadonlyArray<unknown>): void
  error(...values: ReadonlyArray<unknown>): void
  fatal(...values: ReadonlyArray<unknown>): void
  write(level: LogLevel, ...values: ReadonlyArray<unknown>): void
}

export type LogMethods = 'trace' | 'debug' | 'info' | 'warn' | 'error'

export class Logger implements ILogger {
  public level: LogLevel

  public constructor(level: LogLevel) {
    this.level = level
  }

  public trace(...values: ReadonlyArray<unknown>): void {
    this.write(LogLevel.Trace, ...values)
  }

  public debug(...values: ReadonlyArray<unknown>): void {
    this.write(LogLevel.Debug, ...values)
  }

  public info(...values: ReadonlyArray<unknown>): void {
    this.write(LogLevel.Info, ...values)
  }

  public warn(...values: ReadonlyArray<unknown>): void {
    this.write(LogLevel.Warn, ...values)
  }

  public error(...values: ReadonlyArray<unknown>): void {
    this.write(LogLevel.Error, ...values)
  }
  public fatal(...values: ReadonlyArray<unknown>): void {
    this.write(LogLevel.Fatal, ...values)
  }

  public write(level: LogLevel, ...values: ReadonlyArray<unknown>): void {
    if (level < this.level) {
      return
    }
    const method = Logger.levels.get(level)
    if (typeof method === 'string') {
      console[method](...values)
    }
  }

  protected static readonly levels = new Map<LogLevel, LogMethods>([
    [LogLevel.Trace, 'trace'],
    [LogLevel.Debug, 'debug'],
    [LogLevel.Info, 'info'],
    [LogLevel.Warn, 'warn'],
    [LogLevel.Error, 'error'],
    [LogLevel.Fatal, 'error'],
  ])
}

export const logger = new Logger(LogLevel.Info)
