import getDataSource from "../data-source";
import { UserEntity } from "../entities/user";
import { sha1 } from "../utils/crypto";
import { totp } from 'otplib';

const appDataSource = await getDataSource();
const userRepository = appDataSource.getRepository(UserEntity);

export async function auth(username: string, password: string) {
  const sha1Pwd = sha1(password);
  const user = await userRepository.findOneBy({ name: username, password: sha1Pwd });
  if (user) {
    user.lastLogin = Date.now();
    await userRepository.save(user);
  }
  return user;
}

export async function getUserInfo(username: string) {
  const user = await userRepository.findOneBy({ name: username });
  if (user) {
    return {
      name: user.name,
      email: user.email,
    }
  }
  return null;
}

export async function getAllUsers() {
  const users = await userRepository.find();
  if (users.length) {
    return users.map(user => {
      return {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        needTwoFacAuth: user.needTwoFacAuth,
        tags: user.tags,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      }
    });
  }
  return null;
}

export async function register(username: string, password: string, email: string, isAdmin = false) {
  const sha1Pwd = sha1(password);
  const user = await userRepository.findOneBy({ name: username });
  if (user) {
    return null;
  }
  const now = Date.now();
  const newUser = new UserEntity();
  newUser.name = username;
  newUser.password = sha1Pwd;
  newUser.tags = '';
  newUser.needTwoFacAuth = false;
  newUser.isAdmin = isAdmin;
  newUser.lastLogin = now;
  newUser.createdAt = now;
  newUser.email = email;
  await userRepository.save(newUser);
  return newUser;
}


export async function deleteUser(username: string) {
  const count = await userRepository.countBy({ isAdmin: true });
  const total = await userRepository.count();
  if (count <= 1 && total <= 1) {
    return false;
  }
  const deleted = await userRepository.delete(username);
  if (!deleted.affected) {
    return false;
  }
  return true;
}

export async function enableTotp(username: string, token: string, secret: string) {
  const valided = totp.check(token, secret);
  const at = totp.generate(secret);
  if (!valided) {
    return false;
  }
  const user = await userRepository.findOneBy({ name: username });
  if (!user) {
    return false;
  }
  user.needTwoFacAuth = true;
  user.otpSecret = secret;
  await userRepository.save(user);
  return true;
}

export async function disableTotp(username: string) {
  const user = await userRepository.findOneBy({ name: username });
  if (!user) {
    return false;
  }
  user.needTwoFacAuth = false;
  user.otpSecret = '';
  await userRepository.save(user);
  return true;
}