import React, { useState } from "react";
import { useMusic } from "../context/MusicContext";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2,
  Heart, Plus, MoreHorizontal, ListMusic
} from "lucide-react";
import "./GlobalPlayer.css";

export default function GlobalPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    volume,
    setVolume,
    likedSongs,
    toggleLike
  } = useMusic();

  if (!currentSong) return null;

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progress = (currentTime / (duration || 1)) * 100;

  return (
    <div className="global-player-container animate-slide-up">
      <div className="player-song-info">
        <img src={currentSong.img} alt="" className="player-art" />
        <div className="player-text">
          <span className="player-song-title">{currentSong.title}</span>
          <span className="player-song-artist">{currentSong.artist}</span>
        </div>
        <button 
          className={`nav-btn ${likedSongs.some(s => s.id === currentSong.id) ? 'active' : ''}`} 
          onClick={() => toggleLike(currentSong)}
          style={{ marginLeft: '10px' }}
        >
          <Heart size={18} fill={likedSongs.some(s => s.id === currentSong.id) ? "var(--accent)" : "none"} color={likedSongs.some(s => s.id === currentSong.id) ? "var(--accent)" : "currentColor"} />
        </button>
      </div>

      <div className="player-controls-section">
        <div className="playback-buttons">
          <button className="nav-btn"><Shuffle size={18} /></button>
          <button className="nav-btn" onClick={prevSong}><SkipBack size={22} fill="currentColor" /></button>
          <button className="play-pause-btn" onClick={togglePlay}>
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </button>
          <button className="nav-btn" onClick={nextSong}><SkipForward size={22} fill="currentColor" /></button>
          <button className="nav-btn"><Repeat size={18} /></button>
        </div>

        <div className="progress-container">
          <span className="time-label">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="global-slider"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            style={{ '--progress': `${progress}%` }}
          />
          <span className="time-label">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-extra-controls">
        <div className="volume-wrapper">
          <Volume2 size={18} color="rgba(255,255,255,0.6)" />
          <input 
            type="range" 
            className="volume-slider-mini" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>
        <button className="nav-btn"><ListMusic size={18} /></button>
      </div>
    </div>
  );
}
