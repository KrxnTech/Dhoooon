import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import './PlaylistDetail.css';

export default function PlaylistDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userPlaylists, removeFromPlaylist } = useMusic();

    const currentPlaylist = userPlaylists.find(pl => pl.id === id);

    if (!currentPlaylist) {
        return (
            <div className="playlist-detail-page">
                <p>Playlist not found</p>
                <button onClick={() => navigate('/Playlists')}>Back to Playlists</button>
            </div>
        );
    }

    return (
        <div className="playlist-detail-page">
            <header className="playlist-detail-header">
                <div className="playlist-detail-info-header">
                    <h1 className="playlist-detail-title">{currentPlaylist.name}</h1>
                    <span className="playlist-detail-stats">{currentPlaylist.songs.length} / {currentPlaylist.limit} songs</span>
                </div>
                <button
                    type="button"
                    className="playlist-detail-back"
                    onClick={() => navigate("/Playlists")}
                >
                    Back
                </button>
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
                                className="playlist-detail-item-main"
                                onClick={() => navigate(`/Home/${song.id}`)}
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
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
