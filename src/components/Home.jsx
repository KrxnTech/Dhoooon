import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
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
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { playlist, isLoading } = useMusic();

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [pulseLevel, setPulseLevel] = useState(1);

  // Initialize Visualizer logic
  const initVisualizer = () => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaElementSource(audioRef.current);

      source.connect(analyser);
      analyser.connect(ctx.destination);

      analyser.fftSize = 256;

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      renderVisualizer();
    } catch (err) {
      console.error("Visualizer initialization failed:", err);
    }
  };

  const renderVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawBar = (ctx, centerX, centerY, radius, angle, barHeight) => {
      const xStart = centerX + Math.cos(angle) * (radius - 1);
      const yStart = centerY + Math.sin(angle) * (radius - 1);
      const xEnd = centerX + Math.cos(angle) * (radius + barHeight);
      const yEnd = centerY + Math.sin(angle) * (radius + barHeight);

      const gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
      gradient.addColorStop(0, '#e94560');
      gradient.addColorStop(1, 'rgba(233, 69, 96, 0.1)');

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.moveTo(xStart, yStart);
      ctx.lineTo(xEnd, yEnd);
      ctx.stroke();
    };

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 112;

      // Calculate beat for vibration
      let sum = 0;
      const bassCount = 15; // Increased bass range for better pulse
      for (let i = 0; i < bassCount; i++) {
        sum += dataArray[i];
      }
      const averageBass = sum / bassCount;
      const pulse = 1 + (averageBass / 255) * 0.15; // More intense pulse
      setPulseLevel(pulse);

      // Draw bars with Omni-Directional 4-Pole Symmetry (Top, Bottom, Left, Right)
      const totalBars = 120;
      for (let i = 0; i < totalBars; i++) {
        // Divide into 4 quadrants to place high-energy peaks at 0, 90, 180, 270 degrees
        let sampleDegree = i % (totalBars / 4);
        if (sampleDegree > totalBars / 8) {
          sampleDegree = (totalBars / 4) - sampleDegree;
        }

        // Map to frequency data (using first ~50% of spectrum for max movement)
        const dataIndex = Math.floor((sampleDegree / (totalBars / 8)) * (bufferLength * 0.5));
        const barHeight = (dataArray[dataIndex] / 255) * 65;

        // Ensure perfect 360 distribution
        const angle = (i / totalBars) * Math.PI * 2 - Math.PI / 2;

        drawBar(ctx, centerX, centerY, radius, angle, barHeight);
      }

      // Draw subtle outer glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(233, 69, 96, ${0.15 + (averageBass / 255) * 0.5})`;
      ctx.lineWidth = 5;
      ctx.stroke();
    };

    draw();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Note: We don't close AudioContext completely here to allow reuse, 
      // but in a production app you might close it if the component is destroyed for a long time.
    };
  }, []);

  // Sync currentIndex when playlist loads or id changes
  useEffect(() => {
    if (!isLoading) {
      const foundIndex = playlist.findIndex(s => s.id === id);
      if (foundIndex !== -1) {
        setCurrentIndex(foundIndex);
      } else if (!isNaN(Number(id))) {
        setCurrentIndex(Number(id));
      }
    }
  }, [id, playlist, isLoading]);

  useEffect(() => {
    let isMounted = true;

    const playAudio = async () => {
      if (!audioRef.current || currentIndex === -1 || !playlist[currentIndex]) return;

      try {
        // Small delay to ensure the browser identifies the new source
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!isMounted || !audioRef.current) return;

        initVisualizer(); // Initialize visualizer on first play

        // Reset and Load
        audioRef.current.pause();
        audioRef.current.load();
        audioRef.current.currentTime = 0;

        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          await playPromise;
          if (isMounted) setIsPlaying(true);
          // Force resume context for visualizer
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }
        }
      } catch (err) {
        console.warn("Autoplay blocked. Adding interaction listener...", err);
        if (isMounted) setIsPlaying(false);

        // AGGRESSIVE FIX: Wait for ANY user interaction on the page to trigger play
        const forcePlay = async () => {
          if (audioRef.current && isMounted) {
            try {
              initVisualizer();
              await audioRef.current.play();
              setIsPlaying(true);
              if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
              }
              cleanup();
            } catch (e) {
              console.log("Still blocked, waiting for next interaction...");
            }
          }
        };

        const cleanup = () => {
          window.removeEventListener('click', forcePlay);
          window.removeEventListener('touchstart', forcePlay);
          window.removeEventListener('keydown', forcePlay);
        };

        window.addEventListener('click', forcePlay);
        window.addEventListener('touchstart', forcePlay);
        window.addEventListener('keydown', forcePlay);

        return cleanup;
      }
    };

    const cleanupListener = playAudio();

    return () => {
      isMounted = false;
      if (typeof cleanupListener === 'function') cleanupListener();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentIndex, playlist]);

  const playSong = () => {
    initVisualizer();
    audioRef.current.play();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(true);
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const nextSong = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= playlist.length ? 0 : prev + 1
    );
  };

  const prevSong = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? playlist.length - 1 : prev - 1
    );
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const track = playlist[currentIndex];

  if (isLoading) {
    return (
      <div className="player-page loading-screen">
        <div className="spinner"></div>
        <p>Tuning your Dhoon...</p>
      </div>
    );
  }

  if (!track && currentIndex !== -1) {
    return (
      <div className="player-page error-screen">
        <h2>Song Not Found</h2>
        <button onClick={() => navigate("/SongList")}>Go Back to Playlist</button>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="player-page loading-screen">
        <div className="spinner"></div>
        <p>Loading your song...</p>
      </div>
    );
  }

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
        <div className="player-artwork-container">
          <canvas
            ref={canvasRef}
            className="player-visualizer-canvas"
            width={400}
            height={400}
          ></canvas>
          <div
            className="player-artwork"
            style={{ transform: `scale(${isPlaying ? pulseLevel : 1})` }}
          >
            <img
              className="player-artwork-img"
              src={track.img}
              alt=""
            />
          </div>
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
        crossOrigin="anonymous"
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
