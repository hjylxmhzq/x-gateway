import React from 'react';
import { Routes, Route } from "react-router-dom";
import './App.less';
import Dashboard from './pages/dashboard';
import Configuratioin from './pages/dashboard/pages/configuration';
import Login from './pages/login';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Dashboard />}>
          <Route index element={<Configuratioin />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
