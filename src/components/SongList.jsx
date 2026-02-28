import { useNavigate } from "react-router-dom";
import AllMusic from "../MusicData/AllMusic";
import "./SongList.css";

export default function SongList() {
  const navigate = useNavigate();

  const handleAddToFav = (music) => {
    const stored = localStorage.getItem("LikedSongs");
    const likedSongs = stored ? JSON.parse(stored) : [];
    const isAlreadyLiked = likedSongs.some((song) => song.id === music.id);

    if (!isAlreadyLiked) {
      const updated = [...likedSongs, music];
      localStorage.setItem("LikedSongs", JSON.stringify(updated));
    } else {
      alert(`${music.title} is already in favourites`);
    }
  };

  return (
    <div className="songlist-page">
      <header className="songlist-header">
        <h1 className="songlist-title">Song List</h1>
        <button
          type="button"
          className="songlist-fav-btn"
          onClick={() => navigate("/LikedSongs")}
        >
          Fav Songs
        </button>
      </header>

      <ul className="songlist-list" role="list">
        {AllMusic.map((music) => (
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
              <span className="songlist-item-title">{music.title}</span>
            </button>
            <button
              type="button"
              className="songlist-item-fav"
              onClick={() => handleAddToFav(music)}
              aria-label={`Add ${music.title} to favourites`}
            >
              ♥
            </button>
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
    </div>
  );
}
