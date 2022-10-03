import { GetAllProxyTrafficResponse, GetProxyTrafficRequest, GetProxyTrafficResponse } from "@x-gateway/interface/lib";
import { post } from "./common";

export const getAllProxiesTraffic = async () => {
  return await post<GetAllProxyTrafficResponse>('/traffic/get-all-proxies', {});
}

export const getProxyTrafficByName = async (params: GetProxyTrafficRequest) => {
  return await post<GetProxyTrafficResponse>('/traffic/get-proxy-traffic', params);
}
