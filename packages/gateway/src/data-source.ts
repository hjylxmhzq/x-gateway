import { DataSource } from "typeorm"
import { logger, stringifyError } from "./utils/logger";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDataDource = new DataSource({
  type: "better-sqlite3",
  database: "./sqlite/app.db",
  entities: [
    join(__dirname, "./entities/*.js"),
  ],
  synchronize: true,
});

const dataSourcePromise = appDataDource.initialize().then(() => {
  logger.info('data source is initialized');
  return appDataDource;
}).catch(e => {
  logger.error(stringifyError(e));
  return appDataDource;
});

const getDataSource = () => dataSourcePromise;

export default getDataSource;