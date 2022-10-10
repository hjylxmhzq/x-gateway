import getDataSource from "../data-source";
import { ProxyEntity } from "../entities/proxy";
import { TrafficEntity } from "../entities/traffic";
import { setSafeInterval } from "../utils/common";
import { HttpProxy, proxyManager } from "../utils/proxy-manager";

const appDataSource = await getDataSource();
const proxyRepository = appDataSource.getRepository(ProxyEntity);
const trafficRepository = appDataSource.getRepository(TrafficEntity);

const MAX_HISTORY_TIME = 3600 * 24 * 30 * 1000;

setSafeInterval(async () => {
  const proxies = proxyManager.listAllProxies();
  const proxiesMap = new Map<string, HttpProxy>();
  proxies.forEach(p => proxiesMap.set(p.name, p));
  const proxiesEntities = await proxyRepository.find();
  for (let proxyEntity of proxiesEntities) {
    const proxy = proxiesMap.get(proxyEntity.name);
    if (!proxy) {
      await proxyRepository.delete(proxyEntity.name);
    } else {
      proxyEntity.trafficSent = proxy.traffic.sent;
      proxyEntity.trafficReceived = proxy.traffic.received;
      await proxyRepository.save(proxyEntity);
    }
  }

  const now = Date.now();
  const time = createFuzzyTime(now);
  for (let proxy of proxies) {
    const trafficEntity = await trafficRepository.findOneBy({ time: String(time), proxyName: proxy.name });
    if (trafficEntity) {
      trafficEntity.requestCount = proxy.requestCount;
      trafficEntity.trafficReceived = proxy.traffic.received;
      trafficEntity.trafficSent = proxy.traffic.sent;
      trafficEntity.realTime = now;
      await trafficRepository.save(trafficEntity);
    } else {
      const newTrafficEntity = new TrafficEntity();
      newTrafficEntity.proxyName = proxy.name;
      newTrafficEntity.requestCount = proxy.requestCount;
      newTrafficEntity.time = String(time);
      newTrafficEntity.realTime = now;
      newTrafficEntity.trafficReceived = proxy.traffic.received;
      newTrafficEntity.trafficSent = proxy.traffic.sent;
      await trafficRepository.save(newTrafficEntity);
    }
  }

  const deleted = await trafficRepository.createQueryBuilder().where(`realTime < ${now - MAX_HISTORY_TIME}`).delete().execute();

}, 20000);

export const createFuzzyTime = (timestamp: number) => {
  // 每5分钟合并
  return timestamp / 1000 / 300 >> 0
}

export const restoreFuzzyTime = (timestamp: number) => {
  return timestamp * 300 * 1000;
}

export async function deleteProxyServer(proxyName: string) {
  const success = await proxyManager.deleteProxy(proxyName);
  if (success) {
    await trafficRepository.delete({ proxyName });
  }
  return success;
}