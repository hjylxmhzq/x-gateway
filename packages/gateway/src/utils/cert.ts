import acme from 'acme-client';
import path, { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { IncomingMessage, ServerResponse } from 'http';
import { logger, stringifyError } from './logger';
import { httpServerPool } from './http-server-pool';
import getDataSource from '../data-source';
import { CertEntity } from '../entities/cert';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const certRootDir = join(__dirname, '../../cert');
export const challengeDir = join(certRootDir, 'challenge');
export const certFileDir = join(certRootDir, 'domain');

fs.ensureDirSync(challengeDir);
fs.ensureDirSync(certFileDir);

const appDataSource = await getDataSource();
const certRepository = appDataSource.getRepository(CertEntity);

export async function createLetsencryptCert(domain: string, logger: (msg: string) => void = () => { }, onFinished: () => Promise<any>) {
  acme.setLogger(logger);

  async function challengeCreateFn(authz: any, challenge: any, keyAuthorization: string) {
    logger('Triggered challengeCreateFn()');

    /* http-01 */
    if (challenge.type === 'http-01') {
      const filePath = join(challengeDir, challenge.token);
      // const filePath = `/var/www/html/.well-known/acme-challenge/${challenge.token}`;
      const fileContents = keyAuthorization;

      logger(`Creating challenge response for ${authz.identifier.value} at path: ${filePath}`);

      /* Replace this */
      logger(`Would write "${fileContents}" to path "${filePath}"`);
      await fs.writeFile(filePath, fileContents);
    }

    /* dns-01 */
    else if (challenge.type === 'dns-01') {
      const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
      const recordValue = keyAuthorization;

      logger(`Creating TXT record for ${authz.identifier.value}: ${dnsRecord}`);

      /* Replace this */
      logger(`Would create TXT record "${dnsRecord}" with value "${recordValue}"`);
      // await dnsProvider.createRecord(dnsRecord, 'TXT', recordValue);
    }
  }


  async function challengeRemoveFn(authz: any, challenge: any, keyAuthorization: string) {
    await onFinished();
    logger('Triggered challengeRemoveFn()');

    /* http-01 */
    if (challenge.type === 'http-01') {
      const filePath = `/var/www/html/.well-known/acme-challenge/${challenge.token}`;

      logger(`Removing challenge response for ${authz.identifier.value} at path: ${filePath}`);

      /* Replace this */
      logger(`Would remove file on path "${filePath}"`);
      // await fs.unlink(filePath);
    }

    /* dns-01 */
    else if (challenge.type === 'dns-01') {
      const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
      const recordValue = keyAuthorization;

      logger(`Removing TXT record for ${authz.identifier.value}: ${dnsRecord}`);

      /* Replace this */
      logger(`Would remove TXT record "${dnsRecord}" with value "${recordValue}"`);
      // await dnsProvider.removeRecord(dnsRecord, 'TXT');
    }
  }

  const client = new acme.Client({
    directoryUrl: process.env.NODE_ENV?.includes('dev') ? acme.directory.letsencrypt.staging : acme.directory.letsencrypt.production,
    accountKey: await acme.crypto.createPrivateKey()
  });

  /* Create CSR */
  const [key, csr] = await acme.crypto.createCsr({
    commonName: domain
  });

  /* Certificate */
  const cert = await client.auto({
    csr,
    email: 'hujingyuan25@163.com',
    termsOfServiceAgreed: true,
    challengeCreateFn,
    challengeRemoveFn
  });

  /* Done */
  if (process.env.NODE_ENV?.includes('dev')) {
    logger(`CSR:\n${csr.toString()}`);
    logger(`Private key:\n${key.toString()}`);
    logger(`Certificate:\n${cert.toString()}`);
  }

  logger('----- FINISH -----');
  certCache.clear();

  return { csr, privateKey: key, cert };
}

const certCache = new Map<string, { key: string | Buffer, cert: string | Buffer }>();

export async function getCertByDomain(domain: string, onlyForWebClient = false) {
  const cert = certCache.get(domain);
  if (cert) {
    return cert;
  }
  const where = onlyForWebClient ? { domain, useForWebClient: 1 } : { domain };
  const certEntity = await certRepository.findOneBy(where);
  if (certEntity) {
    const newCert = {
      key: certEntity.key,
      cert: certEntity.cert,
    };
    certCache.set(domain, newCert);
    return newCert;
  }
}

export interface RunningCertInstance {
  name: string;
  log: string;
  domain: string;
  createdBy: string;
  createdAt: number;
  status: 'running' | 'fail' | 'success',
  cert?: string;
  key?: string;
  csr?: string
}

class CertManager {
  running: RunningCertInstance[] = [];
  async addCert(name: string, domain: string, createdBy: string, onSuccess = async (instance: RunningCertInstance) => undefined) {

    let instance: RunningCertInstance = {
      name,
      log: 'start request certification...\n',
      domain,
      createdBy,
      createdAt: Date.now(),
      status: 'running',
    }
    const exist = this.running.find(instance => instance.name === name);
    if (exist) {
      if (exist.status === 'running') {
        return null;
      }
      exist.createdBy = createdBy;
      exist.createdAt = Date.now();
      exist.log += '----- REGENERATE -----\n';
      exist.status = 'running';
      instance = exist;
    } else {
      this.running.push(instance);
    }

    const processor = async (req: IncomingMessage, res: ServerResponse) => {

      if (!req.url) {
        return false;
      }
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      if (!urlObj.pathname.includes('acme-challenge')) {
        return false;
      }
      const token = urlObj.pathname.split('/').pop();
      if (!token) {
        return false;
      }
      const challengeFile = path.join(challengeDir, token);
      const fileContent = await fs.readFile(challengeFile);
      res.end(fileContent);
      return true;
    }

    httpServerPool.setHttpServerProcessor(80, processor, true);

    const certLogger = (msg: string) => {
      instance.log = instance.log + msg + '\n';
    }

    const onFinished = async () => {
      httpServerPool.deleteHttpProcessor(80, processor);
    }
    try {
      const { cert, privateKey, csr } = await createLetsencryptCert(domain, certLogger, onFinished);
      instance.key = privateKey.toString();
      instance.cert = cert.toString();
      instance.csr = csr.toString();
      instance.status = 'success';
      onFinished();
      await onSuccess(instance);
    } catch (e) {
      onFinished();
      instance.status = 'fail';
      instance.log += stringifyError(e) + '\n';
      logger.error(stringifyError(e));
    }
    return instance;
  }
}

export const certManager = new CertManager();