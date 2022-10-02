import { GetLogContentRequest, GetLogContentResponse, ListLogFileRequest, ListLogFileResponse } from "@x-gateway/interface/lib";
import { post } from "./common";

export const getLogFiles = async (params: ListLogFileRequest) => {
  const result = await post<ListLogFileResponse>('/log/list-logs', params);
  return result;
}

export const getLogContent = async (params: GetLogContentRequest) => {
  const result = await post<GetLogContentResponse>('/log/get-log', params);
  return result;
}
