import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AllMusic from '../MusicData/AllMusic';
import { getAllSongs, saveSong, deleteSongFromDB } from './db';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
    const [playlist, setPlaylist] = useState(AllMusic);
    const [downloadedSongs, setDownloadedSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMood, setActiveMood] = useState('all');

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

    const moodCategories = [
        { id: 'rainy', name: 'Rainy Night', icon: '☔' },
        { id: 'focus', name: 'Calm Focus', icon: '🌙' },
        { id: 'romantic', name: 'Romantic', icon: '❤️' },
        { id: 'sleep', name: 'Sleep Mode', icon: '🌌' },
        { id: 'drive', name: 'Night Drive', icon: '🚗' },
        { id: 'lofi', name: 'Soft Lofi', icon: '🎧' },
        { id: 'morning', name: 'Peaceful Morning', icon: '🌅' },
        { id: 'deep', name: 'Deep Thoughts', icon: '✨' }
    ];

    const [userPlaylists, setUserPlaylists] = useState(() => {
        const stored = localStorage.getItem("UserPlaylists");
        let playlists = stored ? JSON.parse(stored) : [];
        
        // Ensure every moodCategory has a corresponding playlist
        moodCategories.forEach(mood => {
            if (!playlists.find(pl => pl.id === mood.id)) {
                playlists.push({
                    id: mood.id,
                    name: mood.name,
                    limit: 100,
                    songs: [],
                    isSystem: true
                });
            }
        });
        
        return playlists;
    });

    useEffect(() => {
        localStorage.setItem("UserPlaylists", JSON.stringify(userPlaylists));
    }, [userPlaylists]);

    const createPlaylist = (name, limit, moodId = 'all') => {
        const newPlaylist = {
            id: `playlist-${Date.now()}`,
            name,
            limit: parseInt(limit, 10),
            songs: [],
            moodId
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

    const [userProfile, setUserProfile] = useState({
        name: "Krish",
        username: "@krish_night",
        bio: "Dreaming through melodies.",
        avatar: "https://mir-s3-cdn-cf.behance.net/project_modules/1400/9e3ae3179261313.64f6974fb4e06.jpg",
        personality: "Late-night emotional listener 🌙",
        favoriteGenre: "Lo-Fi / Soul",
        favoriteArtist: "The Weeknd"
    });

    const [userStats, setUserStats] = useState({
        hours: 128,
        streak: 15,
        likedCount: likedSongs.length,
        vibeSummary: "soft nostalgia and calm nights.",
        moodTrend: "Peaceful 🕊️",
        activeTime: "11 PM - 2 AM"
    });

    useEffect(() => {
        setUserStats(prev => ({ ...prev, likedCount: likedSongs.length }));
    }, [likedSongs]);

    // Global Player Logic
    const audioRef = useRef(new Audio());
    const [currentQueue, setCurrentQueue] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const currentSong = currentSongIndex !== -1 ? currentQueue[currentSongIndex] : null;

    useEffect(() => {
        const audio = audioRef.current;
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => nextSong();

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentQueue, currentSongIndex]);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    const playSong = (song, queue) => {
        if (!song) return;
        const newQueue = queue || [song];
        const index = newQueue.findIndex(s => s.id === song.id);
        
        setCurrentQueue(newQueue);
        setCurrentSongIndex(index !== -1 ? index : 0);
        
        audioRef.current.src = song.src;
        audioRef.current.play().catch(err => console.log("Playback error:", err));
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (!currentSong) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.log("Playback error:", err));
        }
        setIsPlaying(!isPlaying);
    };

    const nextSong = () => {
        if (currentQueue.length === 0) return;
        const nextIndex = (currentSongIndex + 1) % currentQueue.length;
        playSong(currentQueue[nextIndex], currentQueue);
    };

    const prevSong = () => {
        if (currentQueue.length === 0) return;
        const prevIndex = (currentSongIndex - 1 + currentQueue.length) % currentQueue.length;
        playSong(currentQueue[prevIndex], currentQueue);
    };

    const seekTo = (time) => {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
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
            removeFromPlaylist,
            userProfile,
            userStats,
            moodCategories,
            activeMood,
            setActiveMood,
            currentSong,
            isPlaying,
            currentTime,
            duration,
            volume,
            setVolume,
            playSong,
            togglePlay,
            nextSong,
            prevSong,
            seekTo,
            currentQueue
        }}>
            {children}
        </MusicContext.Provider>
    );
};
