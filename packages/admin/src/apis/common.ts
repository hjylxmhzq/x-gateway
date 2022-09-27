import { message } from 'antd';
const baseUrl = process.env.NODE_ENV.includes('dev') ? '//localhost:8100' : '';

export const post = async <T>(api: string, body: Record<string, any>): Promise<T> => {
  const resp = await fetch(baseUrl + api, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await resp.json();
  if (result.status !== 0) {
    console.error(result.message);
    message.error(result.message);
    throw result;
  }
  return result.data;
}