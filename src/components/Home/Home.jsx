import React, { useEffect, useState } from "react";
import bkg from "../../assets/bks.jpeg";
import "./hm.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setVisible(false);
  };
  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="home-container">
      {visible && (
        <div className={`overlay ${visible ? "fade-in" : "fade-out"}`}>
          <div className="content">
            <h1 className="title">
              Welcome to <span className="highlight">SkillSwap</span>
            </h1>
            <p className="subtitle">
              Connect, learn, and trade skills with people from around the world
            </p>

            <button className="cta-button" onClick={handleClick}>
              Get Started
            </button>
          </div>
        </div>
      )}
      {!visible && (
        <div className="about-us-container">
          <div className="about-header">
            <h1>
              About <span className="highlight">SkillSwap</span>
            </h1>
            <p className="about-tagline">
              Connecting Skills, Empowering People
            </p>
          </div>

          <div className="about-content">
            <div className="about-section">
              <div className="about-icon">🌟</div>
              <h2>Our Mission</h2>
              <p>
                At SkillSwap, we believe everyone has valuable skills to share.
                Our platform connects individuals looking to exchange knowledge
                and expertise, creating a global community of lifelong learners.
              </p>
            </div>

            <div className="about-section">
              <div className="about-icon">🤝</div>
              <h2>How It Works</h2>
              <p>
                Create a profile showcasing your skills. Browse and connect with
                others who have skills you want to learn. Arrange skill
                exchanges that benefit both parties - no money needed, just
                valuable knowledge sharing.
              </p>
            </div>

            <div className="about-section">
              <div className="about-icon">🚀</div>
              <h2>Our Story</h2>
              <p>
                Founded in 2024, SkillSwap began as a small community of
                professionals who wanted to learn from each other. Today, we've
                grown into a global platform connecting thousands of skilled
                individuals across 40+ countries.
              </p>
            </div>
          </div>

          <div className="about-team">
            <h2>Connect With Us</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">👩‍💼</div>
                <a href="https://www.linkedin.com/in/vikas-rawat-8b6252306/">
                  <h3>Linkedin</h3>
                </a>
              </div>
              <div className="team-member">
                <div className="member-avatar">👨‍💻</div>
                <a href="https://github.com/vikasRawat17">
                  <h3>Github</h3>
                </a>
              </div>
              <div className="team-member">
                <div className="member-avatar">👩‍🎨</div>
                <a href="https://x.com/home">
                  <h3>twitter</h3>
                </a>
              </div>
              <div className="team-member">
                <div className="member-avatar">👨‍🔬</div>
                <a href="https://www.instagram.com/condensed_flame/">
                  <h3>Instagram</h3>
                </a>
              </div>
            </div>
          </div>

          <div className="about-cta">
            <h2>Ready to start swapping skills?</h2>
            <button className="about-button" onClick={() => setVisible(true)}>
              Back to Home
            </button>
            <button onClick={handleSignUp} className="about-button primary">
              Sign Up Now
            </button>
          </div>
        </div>
      )}

      {/* <div className="background">
        <div className="text-overlay">
          <h1 className="main-title">SkillSwap</h1>
        </div>
      </div> */}
    </div>
  );
}

export default Home;
