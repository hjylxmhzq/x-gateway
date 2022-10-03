import { useEffect, useState } from "react";
import { getConfigs } from "../apis/system";

export function useForceUpdate() {
  const [count, setCount] = useState(0);
  return function () {
    setCount(count + 1);
  }
}

export function useConfigs() {
  const [configs, setConfigs] = useState({});
  useEffect(() => {
    (async () => {
      const configs = await getConfigs();
      setConfigs(configs);
    })();
  }, []);
  return configs;
}