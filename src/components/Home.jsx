import { useState, useRef } from "react";
import AllMusic from "../MusicData/AllMusic";
import "./Home.css"
import Heading from "./Heading";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Home() {

    const audioRef = useRef(null) // using the function 
    const [isPlaying, setIsPlaying] = useState(false) // initial stage pe song pause haiii
    const { id } = useParams()
    const [currentIndex, setCurrentIndex] = useState(id)
    const Navigate = useNavigate()

    // create some function which will handle the music operation like pause play repeat ..

    const playSong = () => {
        audioRef.current.play()
        setIsPlaying(true)
    }

    const pauseSong = () => {
        audioRef.current.pause()
        setIsPlaying(false)
    }

    // const repeatSong = () => {
    //     audioRef.current.currentTime = 0
    //     audioRef.current.play()
    //     setIsPlaying(true)
    // }


    // apne next song pe gaye to current index ka value 0 se 1 ho gaya
    const nextSong = () => {
        let nextIndex = currentIndex + 1 // 0 + 1 = 1  
        if (nextIndex >= AllMusic.length) {
            nextIndex = 0
        }
        setCurrentIndex(nextIndex) // index update from 0 to 1 

        // time taken to shift the song from one to another 
        setTimeout(() => {
            audioRef.current.play()
            setIsPlaying(true)
        }, 0)
    }

    // apne prev song pe gaye to current index ka value 1 se 0 ho gaya - Jab function call hua tab !!
    const prevSong = () => {
        let prevIndex = currentIndex - 1 // 1 - 1 = 0 
        if (prevIndex < 0) {
            prevIndex = AllMusic.length - 1
        }
        setCurrentIndex(prevIndex) // index update from 1 to 0 
        setTimeout(() => {
            audioRef.current.play()
            setIsPlaying(true)
        }, 0)

    }

    return (
        <div className="MusicHomeDiv">
            <button className="BackToSongList" onClick={() => Navigate("/SongList")}>Back</button>
            <Heading />
            <img className="IMAGE" src={AllMusic[currentIndex].img} alt="" />
            <h2>{AllMusic[currentIndex].title}</h2>
            <p>{AllMusic[currentIndex].artist}</p>
            <input type="range" value="20" className="ProgressBar" />
            <audio src={AllMusic[currentIndex].src} ref={audioRef}></audio>
            <button className="ButtonFunctional" onClick={prevSong}>⏮</button>
            <button className="ButtonFunctional" onClick={playSong}>▶</button>
            <button className="ButtonFunctional" onClick={pauseSong}>⏸</button>
            <button className="ButtonFunctional" onClick={nextSong}>⏭</button>
        </div>
    )




}