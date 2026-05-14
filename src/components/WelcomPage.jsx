import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, Sparkles, Heart, Moon } from 'lucide-react';
import './WelcomePage.css';

const WelcomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-glow"></div>
            
            <div className="welcome-content animate-fade">
                <div className="brand-badge">
                    <Sparkles size={16} />
                    <span>Experience Peace</span>
                </div>
                
                <h1 className="welcome-title">Dhoon</h1>
                <p className="welcome-subtitle">
                    Your personal sanctuary for late-night melodies and emotional comfort. 
                    Let the world fade away.
                </p>

                <div className="welcome-features">
                    <div className="feature-item">
                        <div className="feature-icon"><Moon size={20} /></div>
                        <span>Lavender Night Aesthetic</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon"><Heart size={20} /></div>
                        <span>Emotional Resonance</span>
                    </div>
                </div>

                <button className="get-started-btn" onClick={() => navigate('/SongList')}>
                    Start Listening
                    <Music2 size={20} />
                </button>

                <p className="welcome-footer">“Where words fail, music speaks.”</p>
            </div>
        </div>
    );
};

export default WelcomePage;
