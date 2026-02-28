import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <main className="welcome-page">
      <div className="welcome-content">
        <h1 className="welcome-brand">Dhoon</h1>
        <div className="welcome-logo" aria-hidden="true">
          <i className="fa-solid fa-compact-disc" />
        </div>
        <h2 className="welcome-title">Welcome to Dhoon</h2>
        <p className="welcome-tagline">Your Personal Music Player</p>
        <button
          type="button"
          className="welcome-cta"
          onClick={() => navigate("/AboutDhoon")}
        >
          Get Started
        </button>
      </div>
    </main>
  );
}
