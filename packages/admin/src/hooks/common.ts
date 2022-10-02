import { useState } from "react";

export function useForceUpdate() {
  const [count, setCount] = useState(0);
  return function () {
    setCount(count + 1);
  }
}