import { ListLogFileResponse } from '@x-gateway/interface/lib';
import fs from 'fs-extra';
import path from 'path';

interface LogFileDesc {
  name: string;
  date: number;
  hash: string;
}

const logDir = process.env.LOG_DIR || 'logs';
const logDirAbsPath = path.join(process.cwd(), logDir);

export async function getAllLogs(fromTime: number, toTime: number): Promise<ListLogFileResponse> {
  const files = await fs.readdir(logDirAbsPath);
  const auditFiles = files.filter(f => f.endsWith('audit.json'));
  const audits: ListLogFileResponse = [];
  for (const file of auditFiles) {
    const filePath = path.join(logDirAbsPath, file);
    const fileContent = await fs.readFile(filePath);
    const logFiles: LogFileDesc[] = JSON.parse(fileContent.toString()).files;
    audits.push(...logFiles.filter(f => f.date >= fromTime && f.date <= toTime));
    audits.sort((prev, next) => next.date - prev.date);
  }
  return audits;
}

interface LogItem {
  level: string;
  message: string;
}

export async function getLogFileContent(file: string): Promise<LogItem[]> {
  const logFileAbsPath = path.join(process.cwd(), file);
  const fileContent = await fs.readFile(logFileAbsPath);
  const logItems = fileContent.toString().split('\n').filter(Boolean).map(c => JSON.parse(c));
  return logItems;
}