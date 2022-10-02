import Joi from 'joi';
export interface ListLogFileRequest {
    fromTime: number;
    toTime: number;
}
export interface ListLogFile {
    date: number;
    name: string;
    hash: string;
}
export interface GetLogContentRequest {
    file: string;
}
export interface LogItem {
    level: string;
    message: string;
    date: number;
}
export declare type LogContent = LogItem[];
export declare type GetLogContentResponse = LogContent;
export declare type ListLogFileResponse = ListLogFile[];
export declare const ListLogFileRequestValidator: Joi.ObjectSchema<ListLogFileRequest>;
export declare const GetLogContentRequestValidator: Joi.ObjectSchema<GetLogContentRequest>;
