import { GetUserInfoResponse } from "@x-gateway/interface/lib";
import { useEffect, useState } from "react";
import { getUserInfo } from "../apis/user";

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<GetUserInfoResponse>({ name: '', email: '' });
  useEffect(() => {
    (async () => {
      const userInfo = await getUserInfo();
      setUserInfo(userInfo);
    })()
  }, []);
  return userInfo;
}