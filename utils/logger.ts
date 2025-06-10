export const logger = {
  log: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
};

export default logger;
