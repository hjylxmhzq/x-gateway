export const post = async <T>(api: string, body: Record<string, any>): Promise<T> => {
  const resp = await fetch(api, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await resp.json();
  if (result.status !== 0) {
    console.error(result.message);
  }
  return result.data;
}