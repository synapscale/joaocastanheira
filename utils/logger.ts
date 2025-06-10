/**
 * Logging utilities used across the application.
 *
 * Use `debug()` for development-only logs. The messages will be
 * suppressed automatically in production builds.
 */

/** Determines if the current environment is production */
const IS_PRODUCTION = process.env.NEXT_PUBLIC_APP_ENV === 'production'

/**
 * Logs a debug message when not in production.
 *
 * @param args Values to log with console.debug
 */
export function debug(...args: unknown[]): void {
  if (!IS_PRODUCTION) {
    console.debug(...args)
  }
}

export default { debug }
