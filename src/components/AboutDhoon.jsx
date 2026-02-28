import { useNavigate } from "react-router-dom";
import "./AboutDhoon.css";

export default function AboutDhoon() {
  const navigate = useNavigate();

  return (
    <main className="about-page">
      <div className="about-content">
        <h1 className="about-brand">Dhoon</h1>
        <h2 className="about-title">About Dhoon</h2>
        <p className="about-text">
          It is a personal music player made by KrxnTech.
        </p>
        <p className="about-text">
          Here you can enjoy music without any ads and without any cost.
        </p>
        <div className="about-actions">
          <button
            type="button"
            className="about-cta"
            onClick={() => navigate("/")}
          >
            Back
          </button>
          <button
            type="button"
            className="about-cta about-cta-primary"
            onClick={() => navigate("/SongList")}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
