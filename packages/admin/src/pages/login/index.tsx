import React, { useState } from 'react';
import { login } from '../../apis/user';
import style from './index.module.less';

const Login: React.FC = () => {

  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [needToken, setTokenInputVisible] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password, token);
    if (success) {
      if (success.needToken) {
        setTokenInputVisible(true);
        return;
      }
      const url = new URL(window.location.href);
      const redirect = url.searchParams.get('redirect');
      if (redirect) {
        window.location.href = redirect;
      } else {
        window.location.href = '/';
      }
    }
  }

  return <div className={style.container}>
    <form className={style.login} onSubmit={onSubmit}>
      <input name='username' type="text" placeholder="Username" value={username} onChange={e => setUserName(e.target.value)} />
      <input name='password' type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      {
        needToken &&
        <>
          <span>请输入TOTP二次验证码</span>
          <input name='token' placeholder="TOTP验证码" value={token} onChange={e => setToken(e.target.value)} />
        </>
      }
      <button>Login</button>
    </form>
  </div>
}

export default Login;