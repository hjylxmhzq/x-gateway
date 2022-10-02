import { isDev } from "./dev";
import { logger, stringifyError } from "./logger";

export const resFac = (status = 0, data: Object = {}, message: string, error?: any) => {
  if (error) {
    logger.error(stringifyError(error));
  }
  error = isDev() ? error : undefined;
  return JSON.stringify({
    status,
    data,
    message,
    error,
  });
}