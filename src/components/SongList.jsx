import { useNavigate } from "react-router-dom"
import AllMusic from "../MusicData/AllMusic";
import "./SongList.css"
export default function SongList() {
    const navigate = useNavigate()
    const HandleAddToFav = (music) => {
        const Stored = localStorage.getItem("LikedSongs")
        const LikedSongs = Stored ? JSON.parse(Stored) : []

        const IsAlreadyLiked = LikedSongs.some(song => song.id === music.id)

        if (!IsAlreadyLiked) {
            const Update = [...LikedSongs, music]
            localStorage.setItem('LikedSongs', JSON.stringify(Update))
        } else {
            alert(`${music.title} is Already in Fav`)
        }


    }
    return (
        <div className="SongListDiv">
            <p className="MusicListTitle">Song List <button onClick={() => navigate("/LikedSongs")} className="FavSongsButton">Fav Songs</button></p>
            <div className="SongListHeader">
                <p className="SongNameP">SongName</p>
                <p className="AddFavP">Add Fav</p>
            </div>
            <br />
            <ul className="ULBASE">
                {
                    AllMusic.map((Music) => (
                        <div key={Music.id} className="SingleSongListDiv">
                            <img
                                className="Image"
                                src={Music.img}
                                alt="" />
                            <li
                                onClick={() => navigate(`/Home/${Music.id}`)}
                                className="List-Song-title">
                                {Music.title}
                            </li>
                            <i
                                onClick={() => HandleAddToFav(Music)}
                                className="HeartIcon">
                                💗</i>
                        </div>
                    ))
                }
            </ul>
            <button className="Button" onClick={() => navigate("/AboutDhoon")}>Back</button>
        </div>
    )
}