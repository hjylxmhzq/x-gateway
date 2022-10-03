import Router from '@koa/router';
import { DeleteUserRequest, DeleteUserRequestValidator, LoginRequest, LoginRequestValidator, RegisterRequest, RegisterRequestValidator } from '@x-gateway/interface';
import { auth, deleteUser, getAllUsers, getUserInfo, register } from '../services/user';
import { resFac } from '../utils/response';

const router = new Router({ prefix: '/user' });

router.post('/login', async (ctx, next) => {
  const body = ctx.request.body as LoginRequest;
  try {
    await LoginRequestValidator.validateAsync(body);
    const { username, password } = body;
    const user = await auth(username, password);
    ctx.type = 'json';
    if (user) {
      ctx.session.isLogin = true;
      ctx.session.username = username;
      ctx.session.isAdmin = user.isAdmin;
      ctx.body = resFac(0, {}, 'success');
    } else {
      ctx.body = resFac(1, {}, 'password error');
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

router.post('/register', async (ctx, next) => {
  const body = ctx.request.body as RegisterRequest;
  try {
    await RegisterRequestValidator.validateAsync(body);
    const { username, password, email, isAdmin } = body;
    const user = await register(username, password, email || '', isAdmin);
    ctx.type = 'json';
    if (user) {
      ctx.session.isLogin = true;
      ctx.session.username = username;
      ctx.body = resFac(0, {}, 'success');
    } else {
      ctx.body = resFac(1, {}, 'register error');
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

router.post('/logout', async (ctx, next) => {
  try {
    ctx.type = 'json';
    ctx.session.isLogin = false;
    ctx.body = resFac(0, {}, 'success');
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

router.post('/delete-user', async (ctx, next) => {
  const body = ctx.request.body as DeleteUserRequest;
  try {
    await DeleteUserRequestValidator.validateAsync(body);
    const success = await deleteUser(body.name);
    ctx.type = 'json';
    if (success) {
      ctx.body = resFac(0, {}, 'success');
    } else {
      ctx.body = resFac(1, {}, 'Delete user fail (Can not delete the only user)');
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

router.post('/get-user-info', async (ctx, next) => {
  const body = ctx.request.body as RegisterRequest;
  try {
    const user = await getUserInfo(ctx.session.username);
    ctx.type = 'json';
    if (user) {
      ctx.body = resFac(0, user, 'success');
    } else {
      ctx.body = resFac(1, {}, 'no user error');
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

router.post('/get-all-users', async (ctx, next) => {
  try {
    const users = await getAllUsers();
    ctx.type = 'json';
    if (users) {
      ctx.body = resFac(0, users, 'success');
    } else {
      ctx.body = resFac(1, {}, 'get users error');
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = resFac(1, {}, 'parameters error', e);
  }
  await next();
});

export default router;