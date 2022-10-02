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

export type LogContent = LogItem[];

export type GetLogContentResponse = LogContent;

export type ListLogFileResponse = ListLogFile[];

export const ListLogFileRequestValidator = Joi.object<ListLogFileRequest>({
  fromTime: Joi.number().integer().positive().required(),
  toTime: Joi.number().integer().positive().required(),
});


export const GetLogContentRequestValidator = Joi.object<GetLogContentRequest>({
  file: Joi.string().required(),
});