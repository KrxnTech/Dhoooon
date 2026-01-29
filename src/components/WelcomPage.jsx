import { useNavigate } from "react-router-dom"
import "./WelcomePage.css"
export default function WelcomePage() {
    const Navigate = useNavigate()
    return (
        <div className="WelcomePageDiv">

            <h1 className="Name">DHOON 🎵</h1>
            <div className="LogoWrapper">
                <h1 className="Logo"><i class="fa-solid fa-compact-disc"></i></h1>
            </div>
            <h3 className="WelcomeText">Welcome to Dhoon</h3>
            <p className="WhyDhoon">Your Personal Music Player</p>
            <button className="Buttons" onClick={() => Navigate("/AboutDhoon")}>Next</button>
        </div>
    )
}