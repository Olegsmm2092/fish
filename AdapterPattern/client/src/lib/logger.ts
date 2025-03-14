type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  }
  
  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  }
  
  error(message: string, meta?: Record<string, any>) {
    this.log('error', message, meta);
  }
  
  debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta);
  }
  
  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    // In production, you might use a more sophisticated logging solution
    console.log(`[${level.toUpperCase()}] ${message}`, meta || '');
  }
}

export const logger = new Logger();
