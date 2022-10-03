import  crypto from 'crypto';

export function sha1(str: string) {
  var shasum = crypto.createHash('sha1')
  shasum.update(str);
  return shasum.digest('hex');
}