import { useState, useRef } from "react";
import AllMusic from "../MusicData/AllMusic";
import "./Home.css"
import Heading from "./Heading";

export default function Home() {
    const audioRef = useRef(null) // ? 
    const [isPlaying, setIsPlaying] = useState(false) // initial stage pe song pause haiii
    const [currentIndex, setCurrentIndex] = useState(0)

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

    const nextSong = () => {
        let nextIndex = currentIndex + 1
        if (nextIndex >= AllMusic.length) {
            nextIndex = 0
        }
        setCurrentIndex(nextIndex)
        setTimeout(() => {
            audioRef.current.play()
            setIsPlaying(true)
        }, 0)
    }

    const prevSong = () => {
        let prevIndex = currentIndex - 1
        if (prevIndex < 0) {
            prevIndex = AllMusic.length - 1
        }
        setCurrentIndex(prevIndex)
        setTimeout(() => {
            audioRef.current.play()
            setIsPlaying(true)
        }, 0)

    }

    return (
        <div className="MusicHomeDiv">
            <Heading />
            <img className="IMAGE" src={AllMusic[currentIndex].img} alt="" />
            <h2>{AllMusic[currentIndex].title}</h2>
            <p>{AllMusic[currentIndex].artist}</p>
            <audio src={AllMusic[currentIndex].src} ref={audioRef}></audio>
            <button onClick={prevSong}>⏮</button>
            <button onClick={playSong}>▶</button>
            <button onClick={pauseSong}>⏸</button>
            <button onClick={nextSong}>⏭</button>
        </div>
    )




}