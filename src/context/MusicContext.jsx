import React, { createContext, useState, useEffect, useContext } from 'react';
import AllMusic from '../MusicData/AllMusic';
import { getAllSongs, saveSong, deleteSongFromDB } from './db';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    const [playlist, setPlaylist] = useState(AllMusic);
    const [downloadedSongs, setDownloadedSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load downloaded songs from IndexedDB (actual files)
    useEffect(() => {
        const loadSongs = async () => {
            try {
                const storedSongs = await getAllSongs();
                if (storedSongs && storedSongs.length > 0) {
                    // Re-create the blob URLs for each stored file
                    const songsWithUrls = storedSongs.map(song => ({
                        ...song,
                        src: URL.createObjectURL(song.file)
                    }));
                    setDownloadedSongs(songsWithUrls);
                    setPlaylist([...AllMusic, ...songsWithUrls]);
                } else {
                    setPlaylist(AllMusic);
                }
            } catch (err) {
                console.error("Failed to load songs from DB:", err);
                setPlaylist(AllMusic);
            } finally {
                setIsLoading(false);
            }
        };
        loadSongs();
    }, []);

    const addDownloadedSong = async (song, file) => {
        try {
            // Save to IndexedDB (storing the actual file object)
            await saveSong({ ...song, file });

            // For the current session, we use the URL already created in SongList
            setDownloadedSongs(prev => {
                const updated = [...prev, song];
                setPlaylist([...AllMusic, ...updated]);
                return updated;
            });
        } catch (err) {
            console.error("Failed to save song:", err);
            alert("Storage full or error saving song.");
        }
    };

    const [likedSongs, setLikedSongs] = useState(() => {
        const stored = localStorage.getItem("LikedSongs");
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem("LikedSongs", JSON.stringify(likedSongs));
    }, [likedSongs]);

    const toggleLike = (song) => {
        setLikedSongs(prev => {
            const isLiked = prev.find(s => s.id === song.id);
            if (isLiked) {
                return prev.filter(s => s.id !== song.id);
            }
            return [...prev, song];
        });
    };

    const removeDownloadedSong = async (id) => {
        try {
            await deleteSongFromDB(id);

            // Cascading delete from playlist source
            setDownloadedSongs(prev => {
                const updated = prev.filter(s => s.id !== id);
                setPlaylist([...AllMusic, ...updated]);
                return updated;
            });

            // Cascading delete from Favorites
            setLikedSongs(prev => prev.filter(s => s.id !== id));

            // Cascading delete from All Playlists
            setUserPlaylists(prev => {
                return prev.map(pl => ({
                    ...pl,
                    songs: pl.songs.filter(s => s.id !== id)
                }));
            });

        } catch (err) {
            console.error("Failed to delete song:", err);
            alert("Error deleting song.");
        }
    };

    const [userPlaylists, setUserPlaylists] = useState(() => {
        const stored = localStorage.getItem("UserPlaylists");
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem("UserPlaylists", JSON.stringify(userPlaylists));
    }, [userPlaylists]);

    const createPlaylist = (name, limit) => {
        const newPlaylist = {
            id: `playlist-${Date.now()}`,
            name,
            limit: parseInt(limit, 10),
            songs: []
        };
        setUserPlaylists(prev => [...prev, newPlaylist]);
    };

    const deletePlaylist = (playlistId) => {
        if (window.confirm("Are you sure you want to delete this playlist?")) {
            setUserPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
        }
    };

    const addToPlaylist = (playlistId, song) => {
        setUserPlaylists(prev => {
            return prev.map(pl => {
                if (pl.id === playlistId) {
                    if (pl.songs.length >= pl.limit) {
                        alert("This playlist has reached its maximum song limit.");
                        return pl;
                    }
                    if (pl.songs.find(s => s.id === song.id)) {
                        alert("Song already in playlist.");
                        return pl;
                    }
                    return { ...pl, songs: [...pl.songs, song] };
                }
                return pl;
            });
        });
    };

    const removeFromPlaylist = (playlistId, songId) => {
        setUserPlaylists(prev => {
            return prev.map(pl => {
                if (pl.id === playlistId) {
                    return { ...pl, songs: pl.songs.filter(s => s.id !== songId) };
                }
                return pl;
            });
        });
    };

    return (
        <MusicContext.Provider value={{
            playlist,
            addDownloadedSong,
            removeDownloadedSong,
            downloadedSongs,
            isLoading,
            likedSongs,
            toggleLike,
            userPlaylists,
            createPlaylist,
            deletePlaylist,
            addToPlaylist,
            removeFromPlaylist
        }}>
            {children}
        </MusicContext.Provider>
    );
};
