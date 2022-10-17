import getDataSource from "../data-source";
import { ConfigEntity } from "../entities/config";
import { logger } from "./logger";

const defaultConfig = {
  enableShell: false,
};

const appDataSource = await getDataSource();
const configRepository = appDataSource.getRepository(ConfigEntity);

async function initConfig() {
  for (let [name, value] of Object.entries(defaultConfig)) {
    const configEntity = await configRepository.findOneBy({ name });
    if (!configEntity) {
      const newConfig = new ConfigEntity();
      newConfig.name = name;
      newConfig.value = JSON.stringify({ value });
      await configRepository.save(newConfig);
    } else {
      defaultConfig[name as keyof typeof defaultConfig] = JSON.parse(configEntity.value).value;
    }
  }
}

await initConfig();

const configManager = new Proxy(defaultConfig, {
  get(target, prop: keyof typeof defaultConfig) {
    return target[prop];
  },
  set(target, prop: keyof typeof defaultConfig, value) {
    if (!Object.prototype.hasOwnProperty.call(target, prop)) {
      logger.error(`no config name ${prop}`);
      return false;
    }
    target[prop] = value;
    configRepository.findOneBy({ name: prop })
      .then(configEntity => {
        if (configEntity) {
          configEntity.value = JSON.stringify({ value });
          return configRepository.save(configEntity);
        }
        logger.error(`no config name ${prop} in database`);
      });
    return true;
  },
});

export default configManager;