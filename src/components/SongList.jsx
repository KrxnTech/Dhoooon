import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import "./SongList.css";

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
  const fileInputRef = useRef(null);

  const isLiked = (id) => likedSongs.some(s => s.id === id);

  const handleDeleteSong = (music) => {
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
        img: "https://cdn-icons-png.flaticon.com/512/3844/3844724.png", // Improved default icon
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

  const handleAddToPlaylistClick = (music) => {
    setSelectedSong(music);
    setShowPlaylistModal(true);
  };

  const handleConfirmAddToPlaylist = (playlistId) => {
    addToPlaylist(playlistId, selectedSong);
    setShowPlaylistModal(false);
    setSelectedSong(null);
  };

  return (
    <div className="songlist-page">
      <header className="songlist-header">
        <h1 className="songlist-title">Dhoon Playlist</h1>
        <div className="songlist-header-btns">
          <button
            type="button"
            className="songlist-playlist-btn"
            onClick={() => navigate("/Playlists")}
            title="My Playlists"
          >
            📁
          </button>
          <button
            type="button"
            className="songlist-fav-btn"
            onClick={() => navigate("/LikedSongs")}
            title="Favorite Songs"
          >
            ♥
          </button>
        </div>
      </header>

      <div className="songlist-downloaded-section">
        <div className="download-btn-group">
          <button
            className="downloaded-songs-btn"
            onClick={() => fileInputRef.current.click()}
          >
            📂 Pick Songs
          </button>
          <button
            type="button"
            className="songlist-sync-btn"
            onClick={handleSyncFolder}
            title="Auto-Sync Folder"
          >
            🔄 Sync Folder
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="audio/*"
          multiple
          onChange={handleFileSelect}
        />
      </div>

      <ul className="songlist-list" role="list">
        {playlist.map((music) => (
          <li key={music.id} className="songlist-item">
            <button
              type="button"
              className="songlist-item-main"
              onClick={() => navigate(`/Home/${music.id}`)}
            >
              <img
                className="songlist-item-art"
                src={music.img}
                alt=""
              />
              <div className="songlist-item-info">
                <span className="songlist-item-title">{music.title}</span>
                <span className="songlist-item-artist">{music.artist}</span>
              </div>
            </button>
            <div className="songlist-item-actions">
              <button
                type="button"
                className={`songlist-item-fav ${isLiked(music.id) ? 'liked' : ''}`}
                onClick={() => toggleLike(music)}
                aria-label={isLiked(music.id) ? `Remove ${music.title} from favourites` : `Add ${music.title} to favourites`}
              >
                ♥
              </button>
              <button
                type="button"
                className="songlist-item-playlist"
                onClick={() => handleAddToPlaylistClick(music)}
                aria-label={`Add ${music.title} to playlist`}
              >
                +
              </button>
              {music.id.toString().startsWith('local-') && (
                <button
                  type="button"
                  className="songlist-item-delete"
                  onClick={() => handleDeleteSong(music)}
                  aria-label={`Delete ${music.title}`}
                >
                  🗑️
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="songlist-actions">
        <button
          type="button"
          className="songlist-back"
          onClick={() => navigate("/AboutDhoon")}
        >
          Back
        </button>
      </div>

      {showPlaylistModal && (
        <div className="playlist-modal-overlay">
          <div className="playlist-modal">
            <h2 className="playlist-modal-title">Select Playlist</h2>
            {userPlaylists.length === 0 ? (
              <p className="playlist-modal-empty">No playlists created yet. Create one in the Playlists section!</p>
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
            <button className="playlist-modal-close" onClick={() => setShowPlaylistModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
