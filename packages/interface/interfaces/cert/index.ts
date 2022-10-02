import Joi from 'joi';

export interface RunningCertInstance {
  name: string;
  log: string;
  domain: string;
  createdBy: string;
  createdAt: number;
  status: 'running' | 'fail' | 'success',
  cert?: string;
  key?: string;
  csr?: string
}

export interface RequestNewCertRequest {
  name: string;
  domain: string;
}

export type RequestNewCertResponse = RunningCertInstance[];

export const RequestNewCertRequestValidator = Joi.object<RequestNewCertRequest>({
  domain: Joi.string().min(1).max(100).required(),
  name: Joi.string().min(1).max(200).required(),
});

export type GetRunningCertProcessResponse = RunningCertInstance[];

export interface DeployedCert {
  name: string;
  createdBy: string;
  createdAt: number;
  domain: string;
  useForWebClient: number;
}

export interface GetAllDelployedCertRequest {

}

export type GetAllDelployedCertResponse = DeployedCert[];

export interface SetCertForWebClientRequest {
  name: string;
}

export type SetCertForWebClientResponse = DeployedCert[];


export const SetCertForWebClientRequestValidator = Joi.object<SetCertForWebClientRequest>({
  name: Joi.string().min(1).max(200).required(),
});

export interface RecreateCertRequest {
  name: string;
};

export interface RecreateCertResponse {};

export const RecreateCertRequestValidator = Joi.object<RecreateCertRequest>({
  name: Joi.string().min(1).max(200).required(),
});