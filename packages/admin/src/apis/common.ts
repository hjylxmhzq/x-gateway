import { message } from 'antd';
const baseUrl = process.env.NODE_ENV.includes('dev') ? '//localhost:8100' : '';

export const post = async <T>(api: string, body: Record<string, any>): Promise<T> => {
  const resp = await fetch(baseUrl + api, {
    method: 'post',
    redirect: 'manual',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (resp.status >= 300 && resp.status < 400 && resp.status !== 304) {
    const redirect = resp.headers.get('location');
    if (redirect) {
      window.location.href = redirect;
    }
  }
  const result = await resp.json();
  if (result.status !== 0) {
    console.error(result.message);
    message.error(result.message);
    throw result;
  }
  return result.data;
}