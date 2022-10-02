import Joi from 'joi';
export interface RunningCertInstance {
    name: string;
    log: string;
    domain: string;
    createdBy: string;
    createdAt: number;
    status: 'running' | 'fail' | 'success';
    cert?: string;
    key?: string;
    csr?: string;
}
export interface RequestNewCertRequest {
    name: string;
    domain: string;
}
export declare type RequestNewCertResponse = RunningCertInstance[];
export declare const RequestNewCertRequestValidator: Joi.ObjectSchema<RequestNewCertRequest>;
export declare type GetRunningCertProcessResponse = RunningCertInstance[];
export interface DeployedCert {
    name: string;
    createdBy: string;
    createdAt: number;
    domain: string;
    useForWebClient: number;
}
export interface GetAllDelployedCertRequest {
}
export declare type GetAllDelployedCertResponse = DeployedCert[];
export interface SetCertForWebClientRequest {
    name: string;
}
export declare type SetCertForWebClientResponse = DeployedCert[];
export declare const SetCertForWebClientRequestValidator: Joi.ObjectSchema<SetCertForWebClientRequest>;
