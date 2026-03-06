import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import AboutDhoon from './components/AboutDhoon';
import WelcomePage from './components/WelcomPage';
import SongList from './components/SongList';
import Home from "./components/Home";
import LikedSong from "./components/LikedSong";
import Playlists from "./components/Playlists";
import PlaylistDetail from "./components/PlaylistDetail";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/AboutDhoon" element={<AboutDhoon />} />
          <Route path="/SongList" element={<SongList />} />
          <Route path="/Home/:id" element={<Home />} />
          <Route path="/LikedSongs" element={<LikedSong />} />
          <Route path="/Playlists" element={<Playlists />} />
          <Route path="/Playlist/:id" element={<PlaylistDetail />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
