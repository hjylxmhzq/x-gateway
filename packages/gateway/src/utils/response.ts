import { isDev } from "./dev";

export const resFac = (status = 0, data: Object = {}, message: string, error?: any) => {
  error = isDev() ? error : undefined;
  return JSON.stringify({
    status,
    data,
    message,
    error,
  });
}