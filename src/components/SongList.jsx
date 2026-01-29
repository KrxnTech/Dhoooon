import { useNavigate } from "react-router-dom"
import AllMusic from "../MusicData/AllMusic";
import "./SongList.css"
export default function SongList() {
    const navigate = useNavigate()
    return (
        <div className="SongListDiv">
            <p className="MusicListTitle">Song List</p>
            <ul className="ULBASE">
                {
                    AllMusic.map((Music) => (
                        <div onClick={() => navigate(`/Home/${Music.id}`)} className="SingleSongListDiv">
                            <li className="List-Song-title">{Music.title}</li> <p className="PlayIcon">▶</p>
                        </div>
                    ))
                }
            </ul>
            <button className="Button" onClick={() => navigate("/AboutDhoon")}>Back</button>
        </div>
    )
}