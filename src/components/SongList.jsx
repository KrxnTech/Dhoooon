import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import { Home, Music2, FolderOpen, Settings, Search, Mic, FolderPlus, Download, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, MoreHorizontal, Heart, Plus, Menu, Info, X } from "lucide-react";
import "./SongList.css";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SongList() {
  const navigate = useNavigate();
  const {
    playlist,
    addDownloadedSong,
    removeDownloadedSong,
    userPlaylists,
    addToPlaylist,
    likedSongs,
    toggleLike
  } = useMusic();

  const [selectedSong, setSelectedSong] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState("music");
  const fileInputRef = useRef(null);

  // Player state
  const audioRef = useRef(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(1);
  const [toggled, setToggled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [discoverSongs, setDiscoverSongs] = useState([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API_KEY = "";

  const isLiked = (id) => likedSongs.some(s => s.id === id);

  const handleDeleteSong = (music, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${music.title}" from your Dhoon playlist?`)) {
      removeDownloadedSong(music.id);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const songUrl = URL.createObjectURL(file);
      const newSong = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        img: "https://cdn-icons-png.flaticon.com/512/3844/3844724.png",
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "My Music",
        src: songUrl,
        isLocal: true
      };
      addDownloadedSong(newSong, file);
    });
  };

  const handleSyncFolder = async () => {
    try {
      if (!window.showDirectoryPicker) {
        alert("Your browser does not support folder synchronization. Please use the 'Pick Songs' button.");
        return;
      }
      const directoryHandle = await window.showDirectoryPicker();
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && (entry.name.endsWith('.mp3') || entry.name.endsWith('.m4a') || entry.name.endsWith('.wav') || entry.name.endsWith('.mp4'))) {
          const file = await entry.getFile();
          const songUrl = URL.createObjectURL(file);
          const newSong = {
            id: `local-${Date.now()}-${entry.name}`,
            img: "https://cdn-icons-png.flaticon.com/512/3844/3844724.png",
            title: entry.name.replace(/\.[^/.]+$/, ""),
            artist: "Synced Folder",
            src: songUrl,
            isLocal: true
          };
          addDownloadedSong(newSong, file);
        }
      }
      alert("Folder synced successfully!");
    } catch (err) {
      console.error(err);
      if (err.name !== 'AbortError') {
        alert("Failed to sync folder. Make sure you grant permission.");
      }
    }
  };

  const handleAddToPlaylistClick = (music, e) => {
    e.stopPropagation();
    setSelectedSong(music);
    setShowPlaylistModal(true);
  };

  const handleConfirmAddToPlaylist = (playlistId) => {
    addToPlaylist(playlistId, selectedSong);
    setShowPlaylistModal(false);
    setSelectedSong(null);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
    };
    recognition.start();
  };

  const fetchDiscoverSongs = async () => {
    if (!API_KEY) {
      console.warn("SoundCloud API Key is missing.");
      return;
    }
    setIsApiLoading(true);
    try {
      // Using SoundCloud's public charts endpoint
      const resp = await fetch(`https://api-v2.soundcloud.com/charts?kind=top&genre=soundcloud:genres:all-music&client_id=${API_KEY}&limit=20`);
      const data = await resp.json();
      
      const mapped = data.collection.map(item => {
        const track = item.track;
        return {
          id: `sc-${track.id}`,
          // Get high-res cover by replacing -large with -t500x500
          img: track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : track.user.avatar_url,
          title: track.title,
          artist: track.user.username,
          // Note: SoundCloud's stream URL requires the client_id to be appended
          src: `https://api.soundcloud.com/tracks/${track.id}/stream?client_id=${API_KEY}`,
          album: "SoundCloud Trending",
          genre: track.genre || "Pop"
        };
      });
      setDiscoverSongs(mapped);
    } catch (err) {
      console.error("SoundCloud Fetch Error:", err);
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === "Discover" && discoverSongs.length === 0) {
      fetchDiscoverSongs();
    }
  }, [selectedCategory]);

  // Player functions
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (currentSongIndex === -1 || !playlist[currentSongIndex]) return;

    const playAudio = async () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.load();
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        setIsPlaying(false);
        console.warn("Autoplay blocked, user interaction required.", e);
      }
    };
    playAudio();
  }, [currentSongIndex, playlist]);

  const togglePlay = () => {
    if (currentSongIndex === -1 && playlist.length > 0) {
      setCurrentSongIndex(0);
      return;
    }
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playSong = async (song) => {
    const originalIndex = playlist.findIndex(s => s.id === song.id);
    if (currentSongIndex === originalIndex) {
      togglePlay();
    } else {
      // Set song first to update src
      setCurrentSongIndex(originalIndex);
      setIsPlaying(true);
      
      // Attempt immediate play to satisfy mobile autoplay policies
      if (audioRef.current) {
        audioRef.current.src = song.src;
        try {
          await audioRef.current.play();
        } catch (err) {
          console.warn("Manual play required:", err);
        }
      }
    }
  };

  const nextSong = async () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentSongIndex + 1) % playlist.length;
    setCurrentSongIndex(nextIdx);
    setIsPlaying(true);
    
    if (audioRef.current && playlist[nextIdx]) {
      audioRef.current.src = playlist[nextIdx].src;
      try {
        await audioRef.current.play();
      } catch (err) { console.warn(err); }
    }
  };

  const prevSong = async () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentSongIndex - 1 + playlist.length) % playlist.length;
    setCurrentSongIndex(prevIdx);
    setIsPlaying(true);
    
    if (audioRef.current && playlist[prevIdx]) {
      audioRef.current.src = playlist[prevIdx].src;
      try {
        await audioRef.current.play();
      } catch (err) { console.warn(err); }
    }
  };

  const adjustVolume = (delta) => {
    setVolume(prev => Math.min(1, Math.max(0, prev + delta)));
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const filteredPlaylist = (selectedCategory === "Discover" ? discoverSongs : playlist).filter(song => {
    const query = searchTerm.toLowerCase();
    const searchMatch = (song.title?.toLowerCase() || "").includes(query) ||
      (song.artist?.toLowerCase() || "").includes(query) ||
      (song.album?.toLowerCase() || "").includes(query) ||
      (song.genre?.toLowerCase() || "").includes(query);

    if (selectedCategory === "All" || selectedCategory === "Discover") return searchMatch;
    if (selectedCategory === "Artists") return searchMatch && (song.artist && song.artist !== "Unknown" && song.artist !== "Synced Folder");
    if (selectedCategory === "Genres") return searchMatch && song.genre;
    if (selectedCategory === "Albums") return searchMatch && (song.album && song.album !== "Single");

    return searchMatch;
  });

  const track = playlist[currentSongIndex];

  return (
    <div className="songlist-page-container">
      <div className={`new-songlist-wrapper ${isSidebarOpen ? 'sidebar-active' : ''}`}>
        
        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

        {/* Sidebar */}
        <div className={`new-sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-mobile-header">
            <X size={24} color="#ffffff" onClick={() => setIsSidebarOpen(false)} />
          </div>
          <img src="https://mir-s3-cdn-cf.behance.net/project_modules/1400/9e3ae3179261313.64f6974fb4e06.jpg" className="sidebar-profile" alt="Profile" />

          <div className="sidebar-menu">
            <div className={`sidebar-item`} onClick={() => navigate('/')} title="Welcome Page"><Home size={22} /></div>
            <div className={`sidebar-item ${activeMenu === 'music' ? 'active' : ''}`} onClick={() => { setActiveMenu('music'); setIsSidebarOpen(false); }} title="Song List"><Music2 size={22} /></div>
            <div className={`sidebar-item ${activeMenu === 'folder' ? 'active' : ''}`} onClick={() => { setActiveMenu('folder'); navigate("/Playlists"); setIsSidebarOpen(false); }} title="Playlists"><FolderOpen size={22} /></div>
            <div className={`sidebar-item ${activeMenu === 'settings' ? 'active' : ''}`} onClick={() => { setActiveMenu('settings'); navigate("/LikedSongs"); setIsSidebarOpen(false); }} title="Liked Songs"><Settings size={22} /></div>
            <div className="sidebar-item" onClick={() => { navigate('/AboutDhoon'); setIsSidebarOpen(false); }} title="About Dhoon"><Info size={22} /></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="new-main-content">

          {/* Mobile Header (Only visible on small screens) */}
          <div className="mobile-header">
            <div className="new-title-mobile-wrap">
              <button className="btn-hamburger" onClick={() => setIsSidebarOpen(true)}><Menu size={24} color="#ffffff" /></button>
              {!showMobileSearch && <h1 className="new-title" style={{ fontSize: '24px' }}>Dhoon Playlist</h1>}
            </div>
            {showMobileSearch ? (
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  className="mobile-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => !searchTerm && setShowMobileSearch(false)}
                />
                {searchTerm && <X size={18} color="#b3b3b3" onClick={() => { setSearchTerm(""); setShowMobileSearch(false); }} style={{ marginLeft: '-30px', zIndex: 10 }} />}
              </div>
            ) : (
              <Search size={24} color="#ffffff" onClick={() => setShowMobileSearch(true)} />
            )}
          </div>

          {/* Desktop Header */}
          <div className="new-header">
            <h1 className="new-title">Dhoon Playlist</h1>
            <div className="new-search-container">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search"
                className="new-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm ? (
                <X size={18} style={{ cursor: 'pointer', color: '#b3b3b3' }} onClick={() => setSearchTerm("")} />
              ) : (
                <Mic size={18} style={{ cursor: 'pointer' }} onClick={startVoiceSearch} />
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="new-toolbar">
            <div className="new-toolbar-left">
              <button className="btn-pick" onClick={() => fileInputRef.current.click()}>
                <FolderPlus size={18} className="folder-icon" /> Pick Songs
              </button>
              <button className="btn-sync" onClick={handleSyncFolder}>
                <Download size={18} className="sync-icon" /> Sync Folder
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden-file-input"
                accept="audio/*"
                multiple
                onChange={handleFileSelect}
              />
            </div>
            <div className="new-toolbar-right">
              <div className="toolbar-icon"><Shuffle size={18} /></div>
              <div className="toolbar-icon"><Repeat size={18} /></div>
              <div className="toolbar-icon" onClick={togglePlay}>
                {isPlaying && track ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              </div>
              <div className="toolbar-icon" onClick={() => adjustVolume(-0.1)}><Volume2 size={16} /> -</div>
              <div className="toolbar-icon" onClick={() => adjustVolume(0.1)}><Volume2 size={16} /> +</div>
              <div className={`toggle-bg ${toggled ? 'toggled' : ''}`} onClick={() => setToggled(!toggled)}>
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>

          <div className="new-category-filters">
            {["All", "Discover", "Artists", "Genres", "Albums"].map(cat => (
              <button
                key={cat}
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List Headers */}
          <div className="list-headers">
            <span className="header-index">#</span>
            <span className="header-play-list">Title</span>
            <span className="header-artist-col">Artist</span>
            <span className="header-duration">Duration</span>
            <span className="header-genre">Genre</span>
            <span></span>
          </div>

          {/* Playlist Items */}
          <div className="new-playlist">
            {isApiLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#b3b3b3', width: '100%' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '15px' }}>Fetching trending music from Jamendo...</p>
              </div>
            ) : filteredPlaylist.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#b3b3b3', width: '100%' }}>
                <Search size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>No Song Found</p>
                <p style={{ fontSize: '14px' }}>Check your spelling or try searching for another track.</p>
              </div>
            ) : filteredPlaylist.map((music) => {
              const originalIndex = playlist.findIndex(s => s.id === music.id);
              const isActive = currentSongIndex === originalIndex;
              return (
                <div key={music.id} className={`playlist-item ${isActive ? 'active' : ''}`} onClick={() => playSong(music)}>
                  <div className="item-num-icon">
                    {isActive && isPlaying ? <Music2 size={18} /> : (isActive ? <Pause size={16} /> : <Plus size={16} />)}
                  </div>
                  <div className="item-info">
                    <img src={music.img} className="item-artwork" alt="" />
                    <div className="item-texts">
                      <span className="item-title">{music.title}</span>
                      <span className="item-artist-mobile">{music.artist}</span>
                    </div>
                  </div>
                  <div className="item-artist-col">{music.artist}</div>
                  <div className="item-duration">3:40</div> {/* Mocked duration per mockup since real duration isn't pre-loaded */}
                  <div className="item-genre">
                    {!isActive && <Heart size={16} color="#1DB954" fill="#1DB954" opacity={0} />}
                  </div>
                  <div className="item-actions">
                    <Heart
                      size={16}
                      className={isLiked(music.id) ? "heart-filled" : ""}
                      fill={isLiked(music.id) ? 'currentColor' : 'none'}
                      onClick={(e) => { e.stopPropagation(); toggleLike(music); }}
                    />
                    <MoreHorizontal size={18} onClick={(e) => handleAddToPlaylistClick(music, e)} />
                    {music.id.toString().startsWith('local-') && (
                      <div onClick={(e) => handleDeleteSong(music, e)} style={{ marginLeft: '10px' }}>🗑️</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Player Overlay */}
        {track && (
          <div className="new-bottom-player">
            <div className="player-left">
              <div className="player-arts-group">
                <img src={track.img} className="player-art-1" alt="" />
                <img src={track.img} className="player-art-2" alt="" />
              </div>
              <div className="player-song-info">
                <span className="player-song-title">{track.title}</span>
                <span className="player-song-artist-mobile">{track.artist}</span>
              </div>
            </div>

            <div className="player-center">
              <span className="player-time-text">{formatTime(currentTime)}</span>

              <div className="player-controls-main">
                <button className="control-btn" onClick={prevSong}><SkipBack size={18} fill="currentColor" /></button>
                <button className="control-btn play-btn" onClick={togglePlay}>
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
                <button className="control-btn" onClick={nextSong}><SkipForward size={18} fill="currentColor" /></button>
              </div>

              <div className="progress-container">
                <input
                  type="range"
                  className="progress-input"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseDown={() => setIsSeeking(true)}
                  onMouseUp={() => setIsSeeking(false)}
                  onTouchStart={() => setIsSeeking(true)}
                  onTouchEnd={() => setIsSeeking(false)}
                  style={{
                    background: `linear-gradient(to right, #1DB954 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`
                  }}
                />
              </div>

              <span className="player-time-text" style={{ textAlign: 'right' }}>{formatTime(duration)}</span>
            </div>

            <div className="player-volume-controls">
              <button className="vol-btn" onClick={() => adjustVolume(0.1)}>+</button>
              <div className="vol-indicator">
                <Volume2 size={14} />
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <button className="vol-btn" onClick={() => adjustVolume(-0.1)}>-</button>
              <div className="desktop-vol-slider">
                 <input 
                   type="range" 
                   min="0" max="1" step="0.01" 
                   value={volume} 
                   onChange={(e) => setVolume(Number(e.target.value))}
                 />
              </div>
            </div>

            <div className="player-right">
              <Settings size={18} onClick={() => navigate('/AboutDhoon')} />
            </div>
          </div>
        )}

        {/* Audio Element Hidden */}
        <audio
          ref={audioRef}
          src={track ? track.src : ''}
          crossOrigin="anonymous"
          onLoadedMetadata={() => setDuration(audioRef.current.duration)}
          onTimeUpdate={() => {
            if (!isSeeking && audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onEnded={nextSong}
        />

        {/* Modals */}
        {showPlaylistModal && (
          <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
            <div className="playlist-modal" onClick={e => e.stopPropagation()}>
              <h2 className="new-title" style={{ fontSize: '24px', marginBottom: '15px' }}>Select Playlist</h2>
              {userPlaylists.length === 0 ? (
                <p style={{ color: '#8fa0bc' }}>No playlists created yet. Create one in the Playlists section!</p>
              ) : (
                <ul className="playlist-selection-list">
                  {userPlaylists.map(pl => (
                    <li key={pl.id} className="playlist-selection-item">
                      <button onClick={() => handleConfirmAddToPlaylist(pl.id)}>
                        {pl.name} ({pl.songs.length}/{pl.limit})
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button className="btn-pick" style={{ marginTop: '15px', width: '100%', justifyContent: 'center' }} onClick={() => setShowPlaylistModal(false)}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
