import { GetConfigsResponse } from "@x-gateway/interface/lib";
import { post } from "./common";

export async function getConfigs() {
  return await post<GetConfigsResponse>('/system/get-configs', {});
}