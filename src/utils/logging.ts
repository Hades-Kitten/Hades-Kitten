const COLOURS = {
  RESET: "\x1b[0m",
  BRIGHT: "\x1b[1m",
  DIM: "\x1b[2m",
  UNDERSCORE: "\x1b[4m",
  BLINK: "\x1b[5m",
  REVERSE: "\x1b[7m",
  HIDDEN: "\x1b[8m",

  FG_BLACK: "\x1b[30m",
  FG_RED: "\x1b[31m",
  FG_GREEN: "\x1b[32m",
  FG_YELLOW: "\x1b[33m",
  FG_BLUE: "\x1b[34m",
  FG_MAGENTA: "\x1b[35m",
  FG_CYAN: "\x1b[36m",
  FG_WHITE: "\x1b[37m",

  BG_BLACK: "\x1b[40m",
  BG_RED: "\x1b[41m",
  BG_GREEN: "\x1b[42m",
  BG_YELLOW: "\x1b[43m",
  BG_BLUE: "\x1b[44m",
  BG_MAGENTA: "\x1b[45m",
  BG_CYAN: "\x1b[46m",
  BG_WHITE: "\x1b[47m",
};

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  OFF = 5,
}

interface LogOptions {
  timestamp?: boolean;
  colorize?: boolean;
  scopeColor?: string;
}

class Logger {
  private static logLevel: LogLevel = LogLevel.INFO;
  private scope: string[];
  private options: LogOptions;
  private static readonly MAX_LEVEL_LENGTH = Math.max(
    ...Object.keys(LogLevel)
      .filter((k) => Number.isNaN(Number(k)))
      .map((k) => k.length),
  );

  private static readonly SCOPE_COLOURS = [
    COLOURS.FG_RED,
    COLOURS.FG_GREEN,
    COLOURS.FG_YELLOW,
    COLOURS.FG_BLUE,
    COLOURS.FG_MAGENTA,
    COLOURS.FG_CYAN,
  ];

  private static scopeColours: { [scopeName: string]: string } = {};

  constructor(scope: string | string[] = [], options: LogOptions = {}) {
    this.scope = Array.isArray(scope) ? scope : [scope];
    this.options = {
      timestamp: true,
      colorize: true,
      scopeColor: this.getScopeColor(this.scope.join("/")),
      ...options,
    };

    if (process.env.LOG_LEVEL) {
      try {
        const envLogLevel = process.env.LOG_LEVEL.toUpperCase();
        if (envLogLevel in LogLevel) {
          Logger.setLogLevel(LogLevel[envLogLevel as keyof typeof LogLevel]);
        } else {
          console.warn(
            `Invalid LOG_LEVEL environment variable: ${process.env.LOG_LEVEL}. Using default: INFO.`,
          );
        }
      } catch (e) {
        console.warn(`Error parsing LOG_LEVEL: ${e}. Using default: INFO.`);
      }
    }
  }

  static setLogLevel(level: LogLevel): void {
    Logger.logLevel = level;
  }

  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return COLOURS.FG_WHITE;
      case LogLevel.INFO:
        return COLOURS.FG_GREEN;
      case LogLevel.WARN:
        return COLOURS.FG_YELLOW;
      case LogLevel.ERROR:
        return COLOURS.FG_RED;
      case LogLevel.FATAL:
        return COLOURS.BG_RED + COLOURS.FG_WHITE;
      default:
        return COLOURS.RESET;
    }
  }

  private getScopeColor(scopeName: string): string {
    if (Logger.scopeColours[scopeName]) {
      return Logger.scopeColours[scopeName];
    }

    const colourIndex =
      Object.keys(Logger.scopeColours).length % Logger.SCOPE_COLOURS.length;
    const colour = Logger.SCOPE_COLOURS[colourIndex];
    Logger.scopeColours[scopeName] = colour;
    return colour;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const now = new Date();
    const timestamp = this.options.timestamp
      ? `${COLOURS.DIM}[${now.toLocaleString()}]${COLOURS.RESET} `
      : "";
    const levelString = LogLevel[level];
    const scopeString =
      this.scope.length > 0 ? `[${this.scope.join("/")}] ` : "";
    const levelColor = this.getLevelColor(level);
    const COLOURStart = this.options.colorize ? levelColor : "";
    const colorEnd = this.options.colorize ? COLOURS.RESET : "";

    const formattedMessage = `${timestamp}${COLOURStart}[${levelString}]${colorEnd} ${this.options.colorize && this.options.scopeColor ? this.options.scopeColor : ""}${scopeString}${COLOURS.RESET}${message}`;
    return formattedMessage;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (level >= Logger.logLevel) {
      const formattedMessage = this.formatMessage(level, message);
      console.log(formattedMessage, ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  fatal(message: string, ...args: unknown[]): void {
    this.log(LogLevel.FATAL, message, ...args);
  }

  child(scope: string | string[], options: LogOptions = {}): Logger {
    const newScope = Array.isArray(scope)
      ? [...this.scope, ...scope]
      : [...this.scope, scope];
    return new Logger(newScope, { ...this.options, ...options });
  }
}

const singleton = new Logger("global", {
  timestamp: true,
  colorize: true,
  scopeColor: COLOURS.FG_MAGENTA,
});

export default singleton;
export { Logger, LogLevel, COLOURS };
