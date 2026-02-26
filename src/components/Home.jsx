import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AllMusic from "../MusicData/AllMusic";
import Heading from "./Heading";
import "./Home.css";

export default function Home() {
    const audioRef = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const startIndex = Number(id);
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [isPlaying, setIsPlaying] = useState(false);

    // CURRENT PLAY BACK POSITION IN SECOND 
    const [currentTime, setCurrentTime] = useState(0);

    // TOTAL LENGTH OF THE SONG 
    const [duration, setDuration] = useState(0);

    // TRACK THE USER SLIDING THE BAR ... ( PREVENT GLITCHES )
    const [isSeeking, setIsSeeking] = useState(false);

    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = 0;
        setCurrentTime(0);

        audioRef.current.play();
        setIsPlaying(true);
    }, [currentIndex]);

    const playSong = () => {
        audioRef.current.play();
        setIsPlaying(true);
    };

    const pauseSong = () => {
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const nextSong = () => {
        setCurrentIndex((prev) =>
            prev + 1 >= AllMusic.length ? 0 : prev + 1
        );
    };

    const prevSong = () => {
        setCurrentIndex((prev) =>
            prev - 1 < 0 ? AllMusic.length - 1 : prev - 1
        );
    };

    const handleSeek = (e) => {
        const time = Number(e.target.value); // USER NE JO DRAG KIYA : I MEAN KIS LENGHT TAK WO VALUE MILTI HAIII YAHA PE ( IN SECOND )
        audioRef.current.currentTime = time; // AUDIO KA CURRENT TIME USS VALUE PE SET HOTA HAIII 
        setCurrentTime(time); // STATE UPDATE VALUE NIKAL KE NIKAL GAYA 

    };

    return (
        <div className="MusicHomeDiv">

            {/* Send to Song List Page */}
            <button
                className="BackToSongList"
                onClick={() => navigate("/SongList")}
            >
                Back
            </button>

            {/* Setting up Heading Component */}
            <Heading />


            {/* Showing Image */}
            <img
                className="IMAGE"
                src={AllMusic[currentIndex].img}
                alt=""
            />

            {/* Showing Song Name */}
            <h2>{AllMusic[currentIndex].title}</h2>

            {/* Showing Artist Name */}
            <p>{AllMusic[currentIndex].artist}</p>


            {/* Sabka Baap - Progress Range Input */}
            <input
                type="range"
                className="ProgressBar"
                min="0" // STARTING POINT OF BAR Max = {0}
                max={duration} // TOTAL LENGHT KE EQUAL HAIIIII : IF LENGHT OF SONG = 180 SO DURATION WILL BE 180 Max = {180}
                value={currentTime} // THIS WILL MOVE THE BAR WITH SONG : BOLETO TO CURRENT POSITION OF SLIDER 🤔
                disabled={!duration}
                onChange={handleSeek} // WWHEN USER TRY TO DRAG THE SLIDER CALL THIS FUNCTION 🤔
                onMouseDown={() => setIsSeeking(true)} // WHEN USER START DRAGING THE SLIDER WITH MOUSE : setIsSeeking - True 
                onMouseUp={() => setIsSeeking(false)} // WHEN USER RELEASE THE MOVE FROM THE SLIDER : setIsSeeking - False 
            />

            <audio
                ref={audioRef} // CONNECT AUDIOREF WITH THIS ELEMEMT 
                src={AllMusic[currentIndex].src} // LOAD SONG 

                // TOTAL LENGHT OF THE SONG STORE HOGA IN SECOND 
                onLoadedMetadata={() =>
                    setDuration(audioRef.current.duration)
                }

                // RUNS CONTINUOUSLY WHEN SONG PLAY

                // WHAT IS DO ? 🤔
                // -> CHECK KARTA HAII KI USER SLIDER KO DRAG TO NAI KARA 
                // -> YE PROGRESS BAAR KO SMOOTHLY MOVE KARATA HAIIII 
                onTimeUpdate={() => {
                    if (!isSeeking) {
                        setCurrentTime(audioRef.current.currentTime);
                    }
                }}
                onEnded={nextSong} // PLAY NEXT SONG AUTOMATICALLY 
            />


            {/* Previewu us song Button */}
            <button className="ButtonFunctional" onClick={prevSong}>⏮</button>

            {
                isPlaying ?
                    // Pause Song 
                    (<button className="ButtonFunctional" onClick={pauseSong}>⏸</button>)
                    :
                    // Play Song 
                    (<button className="ButtonFunctional" onClick={playSong}>▶</button>)
            }

            {/* Next Song Button */}
            <button className="ButtonFunctional" onClick={nextSong}>⏭</button>
        </div>
    );
}



