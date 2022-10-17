import React, { useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import './App.less';
import Dashboard from './pages/dashboard';
import CertManagementPage from './pages/dashboard/pages/cert';
import Configuratioin from './pages/dashboard/pages/configuration';
import LogBrowser from './pages/dashboard/pages/log-browser';
import TrafficHistoryPage from './pages/dashboard/pages/traffic';
import UserManagementPage from './pages/dashboard/pages/user';
import Login from './pages/login';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Dashboard />}>
          <Route index element={<Configuratioin />}></Route>
          <Route path='log' element={<LogBrowser />}></Route>
          <Route path='traffic' element={<TrafficHistoryPage />}></Route>
          <Route path='user' element={<UserManagementPage />}></Route>
          <Route path='cert' element={<CertManagementPage />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
