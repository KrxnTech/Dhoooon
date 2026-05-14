import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { FolderOpen, Trash2, Plus, ChevronLeft, Music2, Sparkles } from 'lucide-react';
import './Playlists.css';

export default function Playlists() {
    const navigate = useNavigate();
    const { userPlaylists, createPlaylist, deletePlaylist, moodCategories, activeMood } = useMusic();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistLimit, setNewPlaylistLimit] = useState(10);

    const currentMoodObj = moodCategories.find(m => m.id === activeMood);
    const filteredPlaylists = activeMood === 'all' 
        ? userPlaylists 
        : userPlaylists.filter(pl => pl.moodId === activeMood);

    const handleCreate = (e) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName, newPlaylistLimit, activeMood);
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
            <div className="playlists-glow"></div>

            <div className="playlists-wrapper animate-fade">
                <header className="playlists-header glass">
                    <button className="back-btn" onClick={() => navigate("/SongList")}>
                        <ChevronLeft size={20} />
                        <span>Library</span>
                    </button>
                    <h1 className="playlists-title">
                        {currentMoodObj ? `${currentMoodObj.icon} ${currentMoodObj.name}` : "Mood Collections"}
                    </h1>
                    <button className="create-pl-btn glass" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        <span>Create Collection</span>
                    </button>
                </header>

                <div className="collections-grid">
                    {filteredPlaylists.map((pl) => (
                        <div key={pl.id} className="collection-card glass" onClick={() => navigate(`/Playlist/${pl.id}`)}>
                            <div className="collection-visual">
                                <FolderOpen size={40} color="var(--accent)" />
                                <div className="visual-glow"></div>
                            </div>
                            <div className="collection-info">
                                <h3 className="collection-name">{pl.name}</h3>
                                <p className="collection-meta">{pl.songs.length} / {pl.limit} Melodies</p>
                            </div>
                            <button className="collection-delete" onClick={(e) => handleDelete(e, pl.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {filteredPlaylists.length === 0 && (
                        <div className="collections-empty glass">
                            <Music2 size={40} color="var(--text-secondary)" />
                            <p>No {activeMood !== 'all' ? `${currentMoodObj?.name} ` : ''}collections yet.</p>
                            <button onClick={() => setShowCreateModal(true)}>Start a new vibe</button>
                        </div>
                    )}
                </div>

                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <form className="modal-content glass animate-fade" onClick={e => e.stopPropagation()} onSubmit={handleCreate}>
                            <h2 className="modal-title">New Collection</h2>
                            <div className="input-group">
                                <label>Collection Name</label>
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="e.g. Rainy Midnight"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="input-group">
                                <label>Song Limit</label>
                                <input
                                    type="number"
                                    value={newPlaylistLimit}
                                    onChange={(e) => setNewPlaylistLimit(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="confirm-btn">Create</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
