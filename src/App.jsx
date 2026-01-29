import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import AboutDhoon from './components/AboutDhoon';
import WelcomePage from './components/WelcomPage';
import SongList from './components/SongList';
import Home from "./components/Home";
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/AboutDhoon" element={<AboutDhoon />} />
          <Route path="/SongList" element={<SongList />} />
          <Route path="/Home/:id" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
