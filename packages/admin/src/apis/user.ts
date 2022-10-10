import { CreateTotpRequest, DeleteUserRequest, DisableTotpRequest, GetAllUsersInfoResponse, GetUserInfoResponse, LoginResponse, RegisterRequest, CreateTotpResponse, DisableTotpResponse } from "@x-gateway/interface";
import { post } from "./common";

export async function login(username: string, password: string, token: string = '') {
  return await post<LoginResponse>('/user/login', { username, password, token });
}

export async function register(params: RegisterRequest) {
  return await post<LoginResponse>('/user/register', params);
}

export async function logout() {
  return await post<{}>('/user/logout', {});
}

export async function getUserInfo() {
  return await post<GetUserInfoResponse>('/user/get-user-info', {});
}

export async function getAllUserInfo() {
  return await post<GetAllUsersInfoResponse>('/user/get-all-users', {});
}

export async function deleteUser(params: DeleteUserRequest) {
  return await post<{}>('/user/delete-user', params);
}

export async function enableTotp(params: CreateTotpRequest) {
  return await post<CreateTotpResponse>('/user/enable-totp', params);
}

export async function disableTotp(params: DisableTotpRequest) {
  return await post<DisableTotpResponse>('/user/disable-totp', params);
}