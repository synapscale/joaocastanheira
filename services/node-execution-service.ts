export async function executeCodeSafely(
  code: string,
  input: any,
  captureConsole: (message: string) => void,
  timeoutMs: number,
  useSandbox: boolean,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      const safeConsole = {
        log: (...args: any[]) => {
          const message = args
            .map((arg) => {
              if (typeof arg === "object") {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            })
            .join(" ");
          captureConsole(message);
          console.log(...args);
        },
        error: (...args: any[]) => {
          const message = args.map((arg) => String(arg)).join(" ");
          captureConsole(`ERROR: ${message}`);
          console.error(...args);
        },
        warn: (...args: any[]) => {
          const message = args.map((arg) => String(arg)).join(" ");
          captureConsole(`WARNING: ${message}`);
          console.warn(...args);
        },
        info: (...args: any[]) => {
          const message = args.map((arg) => String(arg)).join(" ");
          captureConsole(`INFO: ${message}`);
          console.info(...args);
        },
      };

      // eslint-disable-next-line no-new-func
      const fn = new Function(
        "input",
        "console",
        `
        "use strict";
        try {
          ${code}
          return input;
        } catch (error) {
          console.error("Execution error:", error.message);
          throw error;
        }
      `,
      );

      const result = fn(input, safeConsole);
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}
