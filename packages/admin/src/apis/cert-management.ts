import { RequestNewCertRequest, RequestNewCertResponse, GetRunningCertProcessResponse, GetAllDelployedCertResponse, SetCertForWebClientRequest, SetCertForWebClientResponse, RecreateCertRequest, DeleteCertRequest, DeleteCertResponse } from "@x-gateway/interface";
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

export const recreateCert = async (params: RecreateCertRequest) => {
  const result = await post<SetCertForWebClientResponse>('/cert/recreate-cert', params);
  return result;
}

export const deleteCert = async (params: DeleteCertRequest) => {
  const result = await post<DeleteCertResponse>('/cert/delete-cert', params);
  return result;
}