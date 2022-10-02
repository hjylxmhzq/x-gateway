import acme from 'acme-client';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

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