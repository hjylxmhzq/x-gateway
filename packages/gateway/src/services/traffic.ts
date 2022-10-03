import getDataSource from "../data-source";
import { TrafficEntity } from "../entities/traffic";
import { restoreFuzzyTime } from "./proxy";

const appDataSource = await getDataSource();
const trafficRepository = appDataSource.getRepository(TrafficEntity);

export async function getAllProxiesInfoInTraffic() {
  const result = await trafficRepository.createQueryBuilder()
    .select('*')
    .where('realTime = (select max(realTime) from "traffic_entity" i where i.proxyName = proxyName)')
    .execute() as TrafficEntity[];
  return result;
}

export async function getLatestProxyInfoInTrafficByName(name: string): Promise<TrafficEntity[]> {
  const result = await trafficRepository.createQueryBuilder()
    .select('*, max(time)')
    .where('proxyName = :proxyName')
    .setParameter('proxyName', name)
    .execute();
  return result;
}

export async function getProxyInfoByName(name: string) {
  const traffices = await trafficRepository.findBy({ proxyName: name });
  return traffices;
}