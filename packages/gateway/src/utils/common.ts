export function setSafeInterval(fn: () => Promise<any>, time: number) {
  let timer: NodeJS.Timeout | undefined;
  function helper() {
    timer = setTimeout(async () => {
      await fn();
      helper();
    }, time);
  }
  helper();
  return timer;
}

export function clearSafeInterval(timer: NodeJS.Timeout) {
  clearTimeout(timer);
}

export function domainMatch(domain: string, pattern: string) {
  pattern = pattern.trim();
  domain = domain.trim();
  if (pattern === domain) {
    return true;
  }
  if (pattern.startsWith('*.')) {
    const exactPattern = pattern.split('.').slice(1).join('.');
    const exactDomain = domain.split('.').slice(1).join('.');
    if (exactDomain === exactPattern) {
      return true;
    }
  }
  return false;
}