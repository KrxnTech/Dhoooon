import { useNavigate } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import { ChevronLeft, Heart } from "lucide-react";
import "./LikedSong.css";

export default function LikedSong() {
  const navigate = useNavigate();
  const { likedSongs, toggleLike } = useMusic();

  const handleRemoveFromFav = (music) => {
    toggleLike(music);
  };

  return (
    <div className="liked-page-container">
      <div className="liked-wrapper">
        <header className="liked-header">
          <h1 className="liked-title">Liked Songs</h1>
          <button
            type="button"
            className="liked-back"
            onClick={() => navigate("/SongList")}
          >
            <ChevronLeft size={18} style={{marginRight: '5px'}} />
            Back
          </button>
        </header>

        {likedSongs.length === 0 ? (
          <div className="liked-empty">
            <p className="liked-empty-text">No liked songs yet</p>
            <p className="liked-empty-hint">Add songs from the Song List with ♥</p>
          </div>
        ) : (
          <ul className="liked-list">
            {likedSongs.map((song) => (
              <li key={song.id} className="liked-item">
                <button
                  type="button"
                  className="liked-item-main"
                  onClick={() => navigate("/SongList")}
                >
                  <img
                    className="liked-item-art"
                    src={song.img}
                    alt=""
                  />
                  <span className="liked-item-title">{song.title}</span>
                </button>
                <button
                  type="button"
                  className="liked-item-remove"
                  onClick={() => handleRemoveFromFav(song)}
                  aria-label={`Remove ${song.title} from favourites`}
                >
                  <Heart size={16} fill="#1DB954" color="#1DB954" style={{marginRight: '8px', verticalAlign: 'middle'}} />
                  Liked
                </button>
              </li>
            ))}
          </ul>
        )}

        {likedSongs.length > 0 && (
          <div className="liked-actions">
            <button
              type="button"
              className="liked-back-bottom"
              onClick={() => navigate("/SongList")}
            >
              Back to Song List
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
