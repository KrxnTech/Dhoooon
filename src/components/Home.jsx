import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AllMusic from "../MusicData/AllMusic";
import Heading from "./Heading";
import "./Home.css";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Home() {
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const startIndex = Number(id);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play();
    setIsPlaying(true);
  }, [currentIndex]);

  const playSong = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const nextSong = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= AllMusic.length ? 0 : prev + 1
    );
  };

  const prevSong = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? AllMusic.length - 1 : prev - 1
    );
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const track = AllMusic[currentIndex];

  return (
    <div className="player-page">
      <header className="player-header">
        <button
          type="button"
          className="player-back"
          onClick={() => navigate("/SongList")}
          aria-label="Back to list"
        >
          Back
        </button>
        <Heading />
      </header>

      <div className="player-content">
        <div className="player-artwork">
          <img
            className="player-artwork-img"
            src={track.img}
            alt=""
          />
        </div>

        <div className="player-info">
          <h2 className="player-title">{track.title}</h2>
          <p className="player-artist">{track.artist}</p>
        </div>

        <div className="player-progress-wrap">
          <input
            type="range"
            className="player-progress"
            min="0"
            max={duration || 0}
            value={currentTime}
            disabled={!duration}
            onChange={handleSeek}
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
            onTouchStart={() => setIsSeeking(true)}
            onTouchEnd={() => setIsSeeking(false)}
            aria-label="Seek"
          />
          <div className="player-time">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-controls">
          <button
            type="button"
            className="player-btn player-btn-prev"
            onClick={prevSong}
            aria-label="Previous"
          >
            ⏮
          </button>
          <button
            type="button"
            className="player-btn player-btn-play"
            onClick={isPlaying ? pauseSong : playSong}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            className="player-btn player-btn-next"
            onClick={nextSong}
            aria-label="Next"
          >
            ⏭
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={track.src}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onTimeUpdate={() => {
          if (!isSeeking && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={nextSong}
      />
    </div>
  );
}
