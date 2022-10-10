import path from "path";
import { certFileDir, certManager, challengeDir, createLetsencryptCert } from "../utils/cert";
import fs from 'fs-extra';
import getDataSource from "../data-source";
import { CertEntity } from "../entities/cert";
import { setClientSecureContect } from "../main";
import { setConfig } from "../utils/config";

export async function createCert(certName: string, domain: string, createdBy: string) {

  const certObj = await certManager.addCert(certName, domain, createdBy);
  if (!certObj) return false;
  const { cert, key: privateKey, csr } = certObj;
  if (!cert || !privateKey || !csr) {
    return false;
  }
  const certDomainDir = path.join(certFileDir, domain);
  const certKeyFile = path.join(certDomainDir, 'key.pem');
  const certFile = path.join(certDomainDir, 'cert.pem');
  const csrFile = path.join(certDomainDir, 'csr.info');
  await fs.ensureDir(certDomainDir);
  await fs.writeFile(certFile, cert, { flag: 'w' });
  await fs.writeFile(certKeyFile, privateKey, { flag: 'w' });
  await fs.writeFile(csrFile, csr, { flag: 'w' });
  const appDataSource = await getDataSource();
  const certRepository = appDataSource.getRepository(CertEntity);
  const entity = new CertEntity();
  entity.name = certName;
  entity.domain = domain;
  entity.createdAt = Date.now();
  entity.createdBy = createdBy;
  entity.cert = cert;
  entity.key = privateKey;
  entity.useForWebClient = 0;
  await certRepository.save(entity);
  return true;
}

export async function deleteCert(certName: string) {
  const appDataSource = await getDataSource();
  const certRepository = appDataSource.getRepository(CertEntity);
  const result = await certRepository.delete(certName);
  return result.affected ? true : false;
}

export async function reCreateCert(name: string, createdBy: string) {
  const appDataSource = await getDataSource();
  const certRepository = appDataSource.getRepository(CertEntity);
  const entity = await certRepository.findOneBy({ name });
  if (!entity) {
    throw new Error(`no cert with name ${name}`);
  }
  const certObj = await certManager.addCert(entity.name, entity.domain, createdBy);
  if (!certObj) return false;
  const { cert, key: privateKey, csr } = certObj;
  if (!cert || !privateKey || !csr) {
    return false;
  }
  const certDomainDir = path.join(certFileDir, entity.domain);
  const certKeyFile = path.join(certDomainDir, 'key.pem');
  const certFile = path.join(certDomainDir, 'cert.pem');
  const csrFile = path.join(certDomainDir, 'csr.info');
  await fs.ensureDir(certDomainDir);
  await fs.writeFile(certFile, cert, { flag: 'w' });
  await fs.writeFile(certKeyFile, privateKey, { flag: 'w' });
  await fs.writeFile(csrFile, csr, { flag: 'w' });
  entity.cert = cert;
  entity.key = privateKey;
  await certRepository.save(entity);
  return true;
}

export async function getAllCerts() {
  const appDataSource = await getDataSource();
  const certRepository = appDataSource.getRepository(CertEntity);
  const certs = await certRepository.find();
  return certs.map(cert => {
    return {
      name: cert.name,
      createdBy: cert.createdBy,
      createdAt: cert.createdAt,
      domain: cert.domain,
      useForWebClient: cert.useForWebClient,
    };
  });
}

export async function getRunningProcess() {
  return certManager.running;
}

export async function setCertForWebClient(name: string) {

  const appDataSource = await getDataSource();
  const certRepository = appDataSource.getRepository(CertEntity);
  const entity = await certRepository.findOneBy({ name });

  if (entity) {
    await certRepository.update({}, { useForWebClient: 0 });
    entity.useForWebClient = 1;
    await certRepository.save(entity);
    setClientSecureContect(entity.key, entity.cert);
    setConfig('https', 'true');
  }

}