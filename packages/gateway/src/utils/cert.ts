import acme from 'acme-client';
import path, { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { httpServerPool } from './proxy-manager';
import { IncomingMessage, ServerResponse } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const certRootDir = join(__dirname, '../../cert');
export const challengeDir = join(certRootDir, 'challenge');
export const certFileDir = join(certRootDir, 'domain');

fs.ensureDirSync(challengeDir);
fs.ensureDirSync(certFileDir);

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
    directoryUrl: acme.directory.letsencrypt.staging,
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
  logger(`CSR:\n${csr.toString()}`);
  logger(`Private key:\n${key.toString()}`);
  logger(`Certificate:\n${cert.toString()}`);

  return { csr, privateKey: key, cert };
}

interface RunningCertInstance {
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
  async addCert(domain: string, createdBy: string) {
    const instance: RunningCertInstance = {
      log: 'start request certification...\n',
      domain,
      createdBy,
      createdAt: Date.now(),
      status: 'running',
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

    let log = '';
    const logger = (msg: string) => {
      instance.log = instance.log + msg + '\n';
    }

    const onFinished = async () => {
      httpServerPool.deleteHttpProcessor(80, processor);
    }
    const { cert, privateKey, csr } = await createLetsencryptCert(domain, logger, onFinished);
    instance.key = privateKey.toString();
    instance.cert = cert.toString();
    instance.csr = csr.toString();
    return instance;
  }
}

export const certManager = new CertManager();