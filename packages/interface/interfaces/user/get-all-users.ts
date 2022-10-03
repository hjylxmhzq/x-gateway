export interface UserInfo {
  name: string;
  email: string;
  isAdmin: boolean;
  needTwoFacAuth: boolean;
  tags: string;
  lastLogin: number;
  createdAt: number;
}

export type GetAllUsersInfoResponse = UserInfo[];