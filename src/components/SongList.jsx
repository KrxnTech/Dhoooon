import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import {
  Home, Music2, FolderOpen, Settings, Search, Mic, FolderPlus, Download,
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2,
  MoreHorizontal, Heart, Plus, Menu, Info, X, User, BarChart3,
  CloudRain, Moon, Sparkles, Clock, ListMusic, Mic2, Monitor, Flame,
  ChevronLeft, Trash2
} from "lucide-react";
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
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    likedSongs,
    toggleLike,
    userProfile,
    userStats,
    moodCategories,
    setActiveMood,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
  } = useMusic();

  const [selectedSong, setSelectedSong] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // home, playlists, stats, profile
  const [immersiveMode, setImmersiveMode] = useState(null); // null, rain, focus, sleep
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLiked = (id) => likedSongs.some(s => s.id === id);

  const handleDeleteSong = (music, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${music.title}"?`)) {
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
        alert("Folder sync not supported in this browser.");
        return;
      }
      const directoryHandle = await window.showDirectoryPicker();
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && /\.(mp3|wav|m4a|mp4)$/.test(entry.name)) {
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
    } catch (err) {
      console.error(err);
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

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName, 10, 'all');
      setNewPlaylistName("");
      setShowCreateModal(false);
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => setSearchTerm(event.results[0][0].transcript);
    recognition.start();
  };

  const filteredPlaylist = playlist.filter(song => {
    const query = searchTerm.toLowerCase();
    return (song.title?.toLowerCase() || "").includes(query) ||
      (song.artist?.toLowerCase() || "").includes(query);
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const quotes = [
    "Music is the moon in the night sky.",
    "Where words fail, music speaks.",
    "Let the rhythm wash over your soul.",
    "Peace begins with a single melody.",
    "Your heart knows the rhythm."
  ];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);



  return (
    <div className={`dhoon-app ${immersiveMode ? `immersive-${immersiveMode}` : ''}`}>

      {/* Background Particles/Animations */}
      {immersiveMode === 'rain' && <div className="rain-container"><div className="rain"></div></div>}
      {immersiveMode === 'focus' && <div className="focus-bg"></div>}

      <div className={`main-layout ${isSidebarOpen ? 'sidebar-active' : ''}`}>

        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

        {/* Sidebar Navigation */}
        <aside className={`nav-sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h2 className="brand-logo">Dhoon</h2>
            <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}><X /></button>
          </div>

          <div className="nav-group">
            <button className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }}>
              <Home size={20} /> <span>Home</span>
            </button>
            <button className={`nav-link ${activeTab === 'playlists' ? 'active' : ''}`} onClick={() => { setActiveTab('playlists'); setIsSidebarOpen(false); }}>
              <FolderOpen size={20} /> <span>Playlists</span>
            </button>
            <button className={`nav-link ${activeTab === 'liked' ? 'active' : ''}`} onClick={() => { navigate('/LikedSongs'); setIsSidebarOpen(false); }}>
              <Heart size={20} /> <span>Favorites</span>
            </button>
            <button className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => { setActiveTab('stats'); setIsSidebarOpen(false); }}>
              <BarChart3 size={20} /> <span>Vibe Stats</span>
            </button>
          </div>


          <div className="sidebar-profile-mini" onClick={() => setActiveTab('profile')}>
            <img src={userProfile.avatar} alt="Avatar" />
            <div className="mini-info">
              <span className="mini-name">{userProfile.name}</span>
              <span className="mini-status">{userProfile.personality.split(' ')[0]}...</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="content-scrollable">

          {/* Header */}
          <header className="content-header glass">
            <div className="header-left">
              <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
              <button className="back-btn-global" onClick={() => navigate("/")}>
                <ChevronLeft size={20} />
              </button>
              <div className="greeting-wrap">
                <h1 className="greeting-text">{getGreeting()}, {userProfile.name}</h1>
                <p className="quote-text">“{quote}”</p>
              </div>
            </div>

            <div className="header-right">
              <div className="search-bar glass">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Find your vibe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={startVoiceSearch}><Mic size={18} /></button>
              </div>
              <button className="header-icon-btn profile-btn" onClick={() => setActiveTab('profile')}>
                <User size={20} />
              </button>
            </div>
          </header>

          <div className="content-body animate-fade">

            {activeTab === 'home' && (
              <>
                {/* Action Buttons */}
                <section className="quick-actions">
                  <button className="action-card glass" onClick={() => fileInputRef.current.click()}>
                    <div className="icon-wrap"><FolderPlus /></div>
                    <div className="action-info">
                      <span className="action-title">Pick Songs</span>
                      <span className="action-desc">Add from local device</span>
                    </div>
                  </button>
                  <button className="action-card glass" onClick={handleSyncFolder}>
                    <div className="icon-wrap"><Download /></div>
                    <div className="action-info">
                      <span className="action-title">Sync Folder</span>
                      <span className="action-desc">Auto-load your library</span>
                    </div>
                  </button>
                  <button className="action-card glass" onClick={() => { setActiveMood('all'); navigate('/Playlists'); }}>
                    <div className="icon-wrap"><ListMusic /></div>
                    <div className="action-info">
                      <span className="action-title">Import Playlist</span>
                      <span className="action-desc">Connect external source</span>
                    </div>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden-input" accept="audio/*" multiple onChange={handleFileSelect} />
                </section>

                {/* Song List */}
                <section className="song-list-section">
                  <h2 className="section-title">Your Late Night Library</h2>
                  <div className="song-grid">
                    {filteredPlaylist.map((music) => {
                      const isActive = currentSong?.id === music.id;
                      return (
                        <div key={music.id} className={`song-card glass ${isActive ? 'active-song' : ''}`} onClick={() => playSong(music, filteredPlaylist)}>
                          <div className="card-artwork">
                            <img src={music.img} alt={music.title} />
                            {isActive && isPlaying && <div className="playing-bars"><div className="bar"></div><div className="bar"></div><div className="bar"></div></div>}
                          </div>
                          <div className="card-info">
                            <span className="song-title">{music.title}</span>
                            <span className="song-artist">{music.artist}</span>
                          </div>
                          <div className="card-actions">
                            <button className={`fav-btn ${isLiked(music.id) ? 'liked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLike(music); }}>
                              <Heart size={18} fill={isLiked(music.id) ? "currentColor" : "none"} />
                            </button>
                            <button className="more-btn" onClick={(e) => handleAddToPlaylistClick(music, e)}><MoreHorizontal size={18} /></button>
                          </div>
                          {isActive && <div className="card-glow"></div>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'playlists' && (
              <section className="playlists-view">
                <div className="view-header">
                  <h2 className="section-title">Mood Collections</h2>
                  <button className="create-pl-btn glass" onClick={() => setShowCreateModal(true)}><Plus size={18} /> New Playlist</button>
                </div>
                
                <div className="mood-grid">
                  {moodCategories.map(mood => (
                    <div key={mood.id} className="mood-card glass" onClick={() => navigate(`/Playlist/${mood.id}`)}>
                      <div className="mood-icon">{mood.icon}</div>
                      <span className="mood-name">{mood.name}</span>
                      <span className="mood-count">View Collection</span>
                    </div>
                  ))}
                </div>

                {userPlaylists.length > 0 && (
                  <div className="user-playlists-section">
                    <h3 className="section-title" style={{ marginTop: '40px' }}>Your Vibes</h3>
                    <div className="mood-grid">
                      {userPlaylists.map(pl => (
                        <div key={pl.id} className="mood-card glass pl-card" onClick={() => navigate(`/Playlist/${pl.id}`)}>
                          <div className="mood-icon"><FolderOpen size={32} /></div>
                          <span className="mood-name">{pl.name}</span>
                          <span className="mood-count">{pl.songs.length} Songs</span>
                          <button 
                            className="pl-delete-btn" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if(window.confirm("Delete this playlist?")) deletePlaylist(pl.id); 
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'stats' && (
              <section className="stats-view">
                <h2 className="section-title">Your Music Soul</h2>
                <div className="stats-grid">
                  <div className="stat-card glass full-width">
                    <span className="stat-label">Your vibe this week</span>
                    <h3 className="stat-value highlight">{userStats.vibeSummary}</h3>
                  </div>
                  <div className="stat-card glass">
                    <Clock className="stat-icon" />
                    <span className="stat-label">Listening Hours</span>
                    <span className="stat-value">{userStats.hours}h</span>
                  </div>
                  <div className="stat-card glass">
                    <Flame className="stat-icon" />
                    <span className="stat-label">Day Streak</span>
                    <span className="stat-value">{userStats.streak}</span>
                  </div>
                  <div className="stat-card glass">
                    <Heart className="stat-icon" />
                    <span className="stat-label">Liked Songs</span>
                    <span className="stat-value">{userStats.likedCount}</span>
                  </div>
                  <div className="stat-card glass">
                    <Moon className="stat-icon" />
                    <span className="stat-label">Peak Time</span>
                    <span className="stat-value">{userStats.activeTime}</span>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'profile' && (
              <section className="profile-view">
                <div className="profile-hero glass">
                  <div className="profile-img-wrap">
                    <img src={userProfile.avatar} alt={userProfile.name} />
                  </div>
                  <div className="profile-text">
                    <h2 className="profile-name">{userProfile.name}</h2>
                    <span className="profile-username">{userProfile.username}</span>
                    <p className="profile-bio">{userProfile.bio}</p>
                    <div className="personality-tag glass">{userProfile.personality}</div>
                  </div>
                </div>
                <div className="profile-details-grid">
                  <div className="detail-card glass">
                    <span className="detail-label">Favorite Genre</span>
                    <span className="detail-value">{userProfile.favoriteGenre}</span>
                  </div>
                  <div className="detail-card glass">
                    <span className="detail-label">Favorite Artist</span>
                    <span className="detail-value">{userProfile.favoriteArtist}</span>
                  </div>
                </div>
              </section>
            )}

          </div>
        </main>




        {/* Playlist Selection Modal */}
        {showPlaylistModal && (
          <div className="modal-overlay" onClick={() => setShowPlaylistModal(false)}>
            <div className="modal-content glass animate-fade" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Save to Playlist</h2>
              <div className="pl-selection-list">
                {userPlaylists.map(pl => (
                  <button key={pl.id} className="pl-option glass" onClick={() => handleConfirmAddToPlaylist(pl.id)}>
                    <span className="pl-name">
                      {moodCategories.find(m => m.id === pl.moodId)?.icon} {pl.name}
                    </span>
                    <span className="pl-count">{pl.songs.length} Songs</span>
                  </button>
                ))}
                {userPlaylists.length === 0 && <p className="empty-msg">No playlists yet.</p>}
              </div>
              <button className="modal-close-btn" onClick={() => setShowPlaylistModal(false)}>Close</button>
            </div>
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <form className="modal-content glass animate-fade" onClick={e => e.stopPropagation()} onSubmit={handleCreatePlaylist}>
              <h2 className="modal-title">New Collection</h2>
              <div className="input-group">
                <label>Name your vibe</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Midnight Soul"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-close-btn" onClick={() => setShowCreateModal(false)} style={{ marginTop: 0 }}>Cancel</button>
                <button type="submit" className="play-pause-main" style={{ width: 'auto', padding: '0 25px', borderRadius: '50px' }}>Create</button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
