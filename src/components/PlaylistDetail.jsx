import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { ChevronLeft, X, Trash2 } from 'lucide-react';
import './PlaylistDetail.css';

export default function PlaylistDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userPlaylists, removeFromPlaylist, deletePlaylist, moodCategories, playSong, currentSong, isPlaying } = useMusic();

    const currentPlaylist = userPlaylists.find(pl => pl.id === id);
    const moodObj = moodCategories.find(m => m.id === id);

    if (!currentPlaylist) {
        return (
            <div className="playlist-detail-page-container">
                <div className="playlist-detail-empty glass">
                    <h2 className="playlist-detail-empty-text">Playlist not found</h2>
                    <button className="add-songs-hint-btn" onClick={() => navigate("/SongList")}>Return to Library</button>
                </div>
            </div>
        );
    }

    return (
        <div className="playlist-detail-page-container">
            <div className="playlist-detail-glow"></div>
            <div className="playlist-detail-wrapper animate-fade">
                <header className="playlist-detail-header">
                    <div className="playlist-detail-info">
                        <h1 className="playlist-detail-title">
                            {moodObj ? `${moodObj.icon} ${moodObj.name}` : currentPlaylist.name}
                        </h1>
                        <span className="playlist-detail-stats">{currentPlaylist.songs.length} melodies</span>
                    </div>
                    <div className="playlist-detail-actions">
                        {!moodObj && (
                            <button
                                type="button"
                                className="playlist-detail-delete-btn"
                                onClick={() => {
                                    if (window.confirm("Delete this entire collection?")) {
                                        deletePlaylist(currentPlaylist.id);
                                        navigate("/SongList");
                                    }
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button
                            type="button"
                            className="playlist-detail-back"
                            onClick={() => navigate("/SongList")}
                        >
                            <ChevronLeft size={18} style={{ marginRight: '5px' }} />
                            Back
                        </button>
                    </div>
                </header>

                {currentPlaylist.songs.length === 0 ? (
                    <div className="playlist-detail-empty">
                        <p className="playlist-detail-empty-text">No songs in this playlist yet</p>
                        <button className="add-songs-hint-btn" onClick={() => navigate('/SongList')}>Add Songs from List</button>
                    </div>
                ) : (
                    <ul className="playlist-detail-list">
                        {currentPlaylist.songs.map((song) => (
                            <li key={song.id} className="playlist-detail-item">
                                <button
                                    type="button"
                                    className={`playlist-detail-item-main ${currentSong?.id === song.id ? 'active' : ''}`}
                                    onClick={() => playSong(song, currentPlaylist.songs)}
                                >
                                    <img
                                        className="playlist-detail-item-art"
                                        src={song.img}
                                        alt=""
                                    />
                                    <div className="playlist-detail-item-info">
                                        <span className="playlist-detail-item-title">{song.title}</span>
                                        <span className="playlist-detail-item-artist">{song.artist}</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="playlist-detail-item-remove"
                                    onClick={() => removeFromPlaylist(currentPlaylist.id, song.id)}
                                    aria-label={`Remove ${song.title} from playlist`}
                                >
                                    <X size={20} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
