class Log {
    /**
     * @typedef {Object} LogLevel
     * @property {number} value - Numeric log level
     * @property {string} name - Corresponding console method name
     */
  
    /**
     * Logging levels constants
     * @enum {LogLevel}
     */
    static Levels = {
      DEBUG: /** @type {LogLevel} */ ({ value: 1, name: "debug" }),
      INFO: /** @type {LogLevel} */ ({ value: 2, name: "info" }),
      WARN: /** @type {LogLevel} */ ({ value: 3, name: "warn" }),
      ERROR: /** @type {LogLevel} */ ({ value: 4, name: "error" }),
    };
  
    /** @type {LogLevel} Current log level */
    static currentLevel = Log.Levels.DEBUG;
  
    /**
     * Checks if the provided level should be logged.
     * @param {LogLevel} level - Log level object
     * @returns {boolean}
     */
    static allows(level) {
      return level.value >= this.currentLevel.value;
    }
  
    /**
     * Mapping of log levels to console methods.
     * @type {Object.<string, Function>}
     */
    static logMethods = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
  
    /**
     * Logs a message at the specified level.
     * @param {LogLevel} level - Log level object
     * @param {...any} args - Arguments to log
     * @private
     */
    static _log(level, ...args) {
      if (this.allows(level)) {
        const logMethod = this.logMethods[level.name];
        if (logMethod) {
          logMethod(...args);
        }
      }
    }
  
    /**
     * Logs a debug message.
     * @param {...any} args - Arguments to log
     */
    static debug(...args) {
      this._log(this.Levels.DEBUG, ...args);
    }
  
    /**
     * Logs an info message.
     * @param {...any} args - Arguments to log
     */
    static info(...args) {
      this._log(this.Levels.INFO, ...args);
    }
  
    /**
     * Logs a warning message.
     * @param {...any} args - Arguments to log
     */
    static warn(...args) {
      this._log(this.Levels.WARN, ...args);
    }
  
    /**
     * Logs an error message.
     * @param {...any} args - Arguments to log
     */
    static error(...args) {
      this._log(this.Levels.ERROR, ...args);
    }
  }
  