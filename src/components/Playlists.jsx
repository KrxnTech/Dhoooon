import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { FolderOpen, Trash2, Plus, ChevronLeft } from 'lucide-react';
import './Playlists.css';

export default function Playlists() {
    const navigate = useNavigate();
    const { userPlaylists, createPlaylist, deletePlaylist } = useMusic();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistLimit, setNewPlaylistLimit] = useState(10);

    const handleCreate = (e) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName, newPlaylistLimit);
            setNewPlaylistName('');
            setNewPlaylistLimit(10);
            setShowCreateModal(false);
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        deletePlaylist(id);
    };

    return (
        <div className="playlists-page-container">
            <div className="playlists-wrapper">
                <header className="playlists-header">
                    <h1 className="playlists-title">My Playlists</h1>
                    <button
                        type="button"
                        className="playlists-back"
                        onClick={() => navigate("/SongList")}
                    >
                        <ChevronLeft size={18} style={{marginRight: '5px', verticalAlign: 'middle'}} />
                        Back
                    </button>
                </header>

                <div className="playlists-actions-top">
                    <button
                        className="create-playlist-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={18} style={{marginRight: '8px', verticalAlign: 'middle'}} /> 
                        Create Playlist
                    </button>
                </div>

                {userPlaylists.length === 0 ? (
                    <div className="playlists-empty">
                        <p className="playlists-empty-text">No playlists yet</p>
                        <p className="playlists-empty-hint">Create one to organize your music!</p>
                    </div>
                ) : (
                    <div className="playlists-grid">
                        {userPlaylists.map((pl) => (
                            <div key={pl.id} className="playlist-card" onClick={() => navigate(`/Playlist/${pl.id}`)}>
                                <div className="playlist-card-icon">
                                    <FolderOpen size={48} />
                                </div>
                                <div className="playlist-card-info">
                                    <h3 className="playlist-card-name">{pl.name}</h3>
                                    <p className="playlist-card-count">{pl.songs.length} / {pl.limit} songs</p>
                                </div>
                                <button
                                    className="playlist-card-delete"
                                    onClick={(e) => handleDelete(e, pl.id)}
                                >
                                    <Trash2 size={20} color="#b3b3b3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {showCreateModal && (
                    <div className="create-modal-overlay">
                        <form className="create-modal" onSubmit={handleCreate}>
                            <h2 className="create-modal-title">New Playlist</h2>
                            <div className="create-modal-input-group">
                                <label htmlFor="pl-name">Playlist Name</label>
                                <input
                                    id="pl-name"
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="Enter name"
                                    required
                                />
                            </div>
                            <div className="create-modal-input-group">
                                <label htmlFor="pl-limit">Max Songs</label>
                                <input
                                    id="pl-limit"
                                    type="number"
                                    value={newPlaylistLimit}
                                    onChange={(e) => setNewPlaylistLimit(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="create-modal-btns">
                                <button type="button" className="create-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="create-modal-confirm">Create</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
