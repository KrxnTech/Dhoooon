import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LikedSong.css";

export default function LikedSong() {
  const navigate = useNavigate();
  const [likedSongs, setLikedSongs] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("LikedSongs");
    if (stored) {
      setLikedSongs(JSON.parse(stored));
    }
  }, []);

  const handleRemoveFromFav = (id) => {
    const updated = likedSongs.filter((song) => song.id !== id);
    setLikedSongs(updated);
    localStorage.setItem("LikedSongs", JSON.stringify(updated));
  };

  return (
    <div className="liked-page">
      <header className="liked-header">
        <h1 className="liked-title">Liked Songs</h1>
        <button
          type="button"
          className="liked-back"
          onClick={() => navigate("/SongList")}
        >
          Back
        </button>
      </header>

      {likedSongs.length === 0 ? (
        <div className="liked-empty">
          <p className="liked-empty-text">No liked songs yet</p>
          <p className="liked-empty-hint">Add songs from the Song List with ♥</p>
        </div>
      ) : (
        <ul className="liked-list" role="list">
          {likedSongs.map((song) => (
            <li key={song.id} className="liked-item">
              <button
                type="button"
                className="liked-item-main"
                onClick={() => navigate(`/Home/${song.id}`)}
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
                onClick={() => handleRemoveFromFav(song.id)}
                aria-label={`Remove ${song.title} from favourites`}
              >
                Remove
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
  );
}
