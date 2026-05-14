import { useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import { ChevronLeft, Heart, Music2 } from "lucide-react";
import "./LikedSong.css";

export default function LikedSong() {
  const navigate = useNavigate();
  const { likedSongs, toggleLike, playSong, currentSong } = useMusic();

  return (
    <div className="liked-page-container">
      <div className="liked-glow"></div>
      
      <div className="liked-wrapper animate-fade">
        <header className="liked-header glass">
          <button className="back-btn" onClick={() => navigate("/SongList")}>
            <ChevronLeft size={20} />
            <span>Sanctuary</span>
          </button>
          <h1 className="liked-title">Your Favorites</h1>
          <div className="header-meta">
            <Heart size={18} fill="var(--accent)" color="var(--accent)" />
            <span>{likedSongs.length} Melodies</span>
          </div>
        </header>

        {likedSongs.length === 0 ? (
          <div className="liked-empty glass">
            <div className="empty-icon-wrap">
              <Music2 size={48} />
            </div>
            <p className="liked-empty-text">Your heart is quiet.</p>
            <p className="liked-empty-hint">Save songs that resonate with you from the library.</p>
            <button className="go-back-btn" onClick={() => navigate("/SongList")}>Explore Music</button>
          </div>
        ) : (
          <div className="liked-list-grid">
            {likedSongs.map((song) => (
              <div key={song.id} className={`liked-card glass ${currentSong?.id === song.id ? 'active' : ''}`} onClick={() => playSong(song, likedSongs)}>
                <div className="card-artwork">
                  <img src={song.img} alt={song.title} />
                  <div className="card-overlay">
                    <Heart 
                      size={24} 
                      fill="var(--accent)" 
                      color="var(--accent)"
                      onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                    />
                  </div>
                </div>
                <div className="card-info">
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">{song.artist || "Unknown Artist"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
