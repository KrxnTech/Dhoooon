import "./LikedSong.css"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useDebugValue } from "react"
import AllMusic from "../MusicData/AllMusic"
export default function LikedSong() {
    const navigate = useNavigate()
    const [LikedSongs, setLikedSongs] = useState([])
    // LOAD LIKE SONG FROM LOCA STORAGE 
    useEffect(() => {
        const Stored = localStorage.getItem('LikedSongs')
        if (Stored) {
            setLikedSongs(JSON.parse(Stored))
        }
    }, [])
    // const LikedMusic = AllMusic.filter((Music) => Music.id === id) // IT IS TAKING AN OBJECT 

    const HandleRemoveFromFav = (id) => {
        const Update = LikedSongs.filter(song => song.id !== id)
        setLikedSongs(Update)
        localStorage.setItem('LikedSongs', JSON.stringify(Update))

    }
    return (
        <div className="LikedSongDiv">
            <p className="LikedSongTitle">Liked Songs</p>
            <button className="ButtonBack" onClick={() => navigate("/SongList")}>Back</button>
            {LikedSongs.length === 0 ? (
                <p>No Liked Song Yet</p>
            ) : (LikedSongs.map((song) => (
                <div key={song.id} className="ComedSongsLikedOne">
                    <p><span className="FlowerWrapper"><i className="FlowerIcon">🌸</i></span>{song.title}</p>
                    <button onClick={() => HandleRemoveFromFav(song.id)} className="RemoveSongButton">Remove</button>
                </div>
            )))}
        </div>
    )
}