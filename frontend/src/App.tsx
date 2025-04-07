import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Lobby from './components/Lobby';
import CodeBlockPage from './components/CodeBlockPage';


const App = ()=> {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/codeblocks" element={<Lobby/>}/>
        <Route path="/codeblocks/:id" element={<CodeBlockPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
