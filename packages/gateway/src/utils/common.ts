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
