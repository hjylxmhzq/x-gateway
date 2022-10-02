import { RequestNewCertRequest, RequestNewCertResponse, GetRunningCertProcessResponse, GetAllDelployedCertResponse, SetCertForWebClientRequest, SetCertForWebClientResponse } from "@x-gateway/interface";
import { post } from "./common";

export const requestNewCert = async (params: RequestNewCertRequest) => {
  const result = await post<RequestNewCertResponse>('/cert/request-new-cert', params);
  return result;
}

export const getRunningCertProcess = async () => {
  const result = await post<GetRunningCertProcessResponse>('/cert/get-running-certs', {});
  return result;
}

export const getAllDeployedCerts = async () => {
  const result = await post<GetAllDelployedCertResponse>('/cert/get-deployed-certs', {});
  return result;
}

export const setCertForWebClient = async (params: SetCertForWebClientRequest) => {
  const result = await post<SetCertForWebClientResponse>('/cert/set-cert-for-webclient', params);
  return result;
}
