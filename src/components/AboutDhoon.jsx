import { useNavigate } from "react-router-dom"
import "./AboutDhoon.css"
export default function AboutDhoon() {
    const Navigate = useNavigate()
    return (
        <div className="AboutDhoonDiv">
            <h3 className="AboutDhoonTitle">About Dhoon 💗</h3>
            <p className="AboutDhoonText">It is a personal music player made by KrxnTech</p>
            <p>Here you can ENJOY music without any Adds and without any cost</p>
            <button className="Buttons" onClick={() => Navigate("/")}>Back</button>
            <button className="Buttons" onClick={() => Navigate("/SongList")}>Next</button>
            <img className="ImageAnimeGirl" src="public\MusicData\11-117708_anime-little-girl-png-transparent-png-removebg-preview.png" alt="" />
        </div>
    )
} 