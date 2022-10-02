import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { certFileDir, challengeDir, createLetsencryptCert } from "../utils/cert";
import { httpServerPool } from "../utils/proxy-manager";
import fs from 'fs-extra';

export async function createCert(domain: string) {

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
    console.log(msg);
    log = log + msg + '\n';
  }

  const onFinished = async () => {
    httpServerPool.deleteHttpProcessor(80, processor);
  }

  const { cert, privateKey, csr } = await createLetsencryptCert(domain, logger, onFinished);
  const certDomainDir = path.join(certFileDir, domain);
  const certKeyFile = path.join(certDomainDir, 'key.pem');
  const certFile = path.join(certDomainDir, 'cert.pem');
  const csrFile = path.join(certDomainDir, 'csr.info');
  await fs.ensureDir(certDomainDir);
  await fs.writeFile(certFile, cert.toString(), { flag: 'w' });
  await fs.writeFile(certKeyFile, privateKey.toString(), { flag: 'w' });
  await fs.writeFile(csrFile, csr.toString(), { flag: 'w' });
  return true;
}

export function getAllCerts() {

}