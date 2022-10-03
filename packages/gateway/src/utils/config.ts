import getDataSource from "../data-source";
import { ConfigEntity } from "../entities/config";

const appDataSource = await getDataSource();
const configRepository = appDataSource.getRepository(ConfigEntity);

const config: Record<string, string> = {};

const configEntities = await configRepository.find();

configEntities.forEach(c => {
  config[c.name] = c.value;
});

export function getConfigs() {
  return config;
}

export function getConfig(key: string) {
  return config[key];
}

export async function setConfig(key: string, value: string) {
  config[key] = value;
  const configEntity = await configRepository.findOneBy({ name: key });
  if (configEntity) {
    configEntity.value = value;
    await configRepository.save(configEntity);
  } else {
    const newConfigEntity = new ConfigEntity();
    newConfigEntity.name = key;
    newConfigEntity.value = value;
    await configRepository.save(newConfigEntity);
  }
}