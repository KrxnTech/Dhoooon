import { useState, useRef } from "react";
import AllMusic from "../MusicData/AllMusic";
import "./Home.css"
import Heading from "./Heading";

export default function Home() {

    const audioRef = useRef(null) // using the function 
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