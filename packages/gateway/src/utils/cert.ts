// import ACME from '@root/acme';
// import { logger, stringifyError } from './logger';
// import Keypairs from '@root/keypairs';
// import fs from 'fs-extra';
// import punycode from 'punycode';
// import { dirname, join } from 'path';
// import { fileURLToPath } from 'url';
// import CSR from '@root/csr';
// import PEM from '@root/pem';
// import acmeWebroot from 'acme-http-01-webroot';

// const __dirname = dirname(fileURLToPath(import.meta.url));
// const certFileDir = join(__dirname, '../../cert');
// fs.ensureDirSync(certFileDir);

// export async function createCertFile(domains: string[]) {

//   var maintainerEmail = 'hujingyuan25@163.com';
//   var subscriberEmail = 'hujingyuan25@163.com';
//   var customerEmail = 'hujingyuan25@163.com';
//   const agentName = 'x-gateway/1.0.0';
//   function notify(ev: string, msg: any) {
//     if ('error' === ev || 'warning' === ev) {
//       logger.error(ev.toUpperCase() + ' ' + stringifyError(msg.message));
//       return;
//     }
//   }
//   const acme = ACME.create({ maintainerEmail, packageAgent: agentName, notify });
//   logger('created acme');
//   const directoryUrl = 'https://acme-staging-v02.api.letsencrypt.org/directory';
//   await acme.init(directoryUrl);
//   logger('inited acme');

//   var accountKeypair = await Keypairs.generate({ kty: 'EC', format: 'jwk' });
//   var accountKey = accountKeypair.private;
//   console.info('registering new ACME account...');

//   var account = await acme.accounts.create({
//     subscriberEmail,
//     agreeToTerms: true,
//     accountKey
//   });
//   console.info('created account with id', account.key.kid);

//   var serverKeypair = await Keypairs.generate({ kty: 'RSA', format: 'jwk' });
//   var serverKey = serverKeypair.private;
//   var serverPem = await Keypairs.export({ jwk: serverKey }) as string;
//   await fs.writeFile('./privkey.pem', serverPem, 'ascii');

//   // Or you can load it from a file
//   // var serverPem = await fs.promises.readFile('./privkey.pem', 'ascii');
//   // console.info('wrote ./privkey.pem');

//   var serverKey = await Keypairs.import({ pem: serverPem });

//   domains = domains.map(function (name) {
//     return punycode.toASCII(name);
//   });
//   var encoding = 'der';
//   var typ = 'CERTIFICATE REQUEST';

//   var csrDer = await CSR.csr({ jwk: serverKey, domains, encoding });
//   var csr = PEM.packBlock({ type: typ, bytes: csrDer });
//   var webroot = acmeWebroot.create({});
//   logger(webroot.get());
//   var challenges = {
//     'http-01': webroot,
//   };

//   console.info('validating domain authorization for ' + domains.join(' '));
//   var pems = await acme.certificates.create({
//     account,
//     accountKey,
//     csr,
//     domains,
//     challenges
//   });
//   logger(pems);
// }

import acme from 'acme-client';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const certFileDir = join(__dirname, '../../cert');
export const challengeDir = join(certFileDir, 'challenge');

fs.ensureDirSync(challengeDir);

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
}