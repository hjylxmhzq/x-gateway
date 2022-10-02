import getDataSource from "../data-source";
import { ProxyEntity } from "../entities/proxy";
import { setSafeInterval } from "../utils/common";
import { HttpProxy, proxyManager } from "../utils/proxy-manager";


setSafeInterval(async() => {
  const appDataSource = await getDataSource();
  const proxyRepository = appDataSource.getRepository(ProxyEntity);
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
}, 20000);