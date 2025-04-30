import React, { useEffect, useState } from "react";
import "./po.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfileDetails } from "../../store/profile-store/Profile-deatils";
import {
  findMatches,
  getMutualMatches,
  postSkill,
  resetSkillState,
} from "../../store/post-store/PostStore";
import { useNavigate } from "react-router-dom";

function Post() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const { profileData } = useSelector((state) => state.profileReducer);
  const { isLoading, matchStatus, matchedUsers, error } = useSelector(
    (state) => state.skillsReducer
  );

  const [selectedSkill, setSelectedSkill] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [seek, setSeek] = useState(true);
  const [showMatchResults, setShowMatchResults] = useState(false);
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);
  const [searchedSkill, setSearchedSkill] = useState("");

  useEffect(() => {
    dispatch(fetchProfileDetails());
    return () => {
      dispatch(resetSkillState());
    };
  }, [dispatch]);

  // Modified handler with proper type checking
  const handleSkillChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setShowCustomSkillInput(true);
      setSelectedSkill("");
    } else {
      setShowCustomSkillInput(false);
      setSelectedSkill(value);
      setCustomSkill("");
    }
  };

  // Fixed type handler
  const handleTypeChange = (e) => {
    setSeek(e.target.value === "seek");
    // Reset skill selections when switching types
    setSelectedSkill("");
    setCustomSkill("");
    setShowCustomSkillInput(false);
  };

  const handleSubmit = async (e) => {
    console.log("submit");

    e.preventDefault();

    const skillToUse = selectedSkill || customSkill;

    if (!skillToUse) return;
    setSearchedSkill(skillToUse);
    setShowMatchResults(true);

    try {
      await dispatch(
        postSkill({
          skillName: skillToUse,
          type: seek ? "seek" : "offer",
          description: description.trim(),
        })
      ).unwrap();

      navigate("/match");
      console.log("submittted");
    } catch (error) {
      console.error("Error in skill operations:", error);
    }
  };

  const handleRetry = () => {
    const skillToUse = selectedSkill || customSkill;
    dispatch(
      findMatches({
        skill: skillToUse,
        type: seek ? "seek" : "offer",
      })
    );
  };

  const resetSearch = () => {
    setShowMatchResults(false);
    dispatch(resetSkillState());
    setSelectedSkill("");
    setCustomSkill("");
    setShowCustomSkillInput(false);
  };

  const getMatchedSkill = (user) => {
    if (seek && user.theyOffer) {
      return Array.isArray(user.theyOffer) ? user.theyOffer[0] : user.theyOffer;
    } else if (!seek && user.theySeek) {
      return Array.isArray(user.theySeek) ? user.theySeek[0] : user.theySeek;
    }
    return searchedSkill;
  };

  // Check if profile data and skills are available
  const hasSkills =
    profileData?.user?.skills &&
    Object.values(profileData.user.skills).length > 0;

  return (
    <div className="post-container">
      <form className="post-form" onSubmit={handleSubmit}>
        <h3 className="post-title">Create New Request</h3>

        <div className="form-group">
          <label htmlFor="type" className="post-label">
            Seek or Offer
          </label>
          <select
            name="type"
            id="type"
            className="post-select"
            value={seek ? "seek" : "offer"}
            onChange={handleTypeChange}
          >
            <option value="seek">Seek</option>
            <option value="offer">Offer</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="skills" className="post-label">
            {seek ? "Skills to Seek" : "Skills to Offer"}
          </label>

          {!seek ? (
            <select
              name="skills"
              id="skills"
              className="post-select"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              required
            >
              <option value="">Select skill</option>
              {hasSkills &&
                Object.values(profileData.user.skills).map((skill, index) => (
                  <option key={index} value={skill}>
                    {skill}
                  </option>
                ))}
            </select>
          ) : (
            <div className="skill-input-container">
              <select
                name="skills"
                id="seek-skills"
                className="post-select"
                value={showCustomSkillInput ? "custom" : selectedSkill}
                onChange={handleSkillChange}
                required={!showCustomSkillInput}
              >
                <option value="">Select skill</option>
                {hasSkills &&
                  Object.values(profileData.user.skills).map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                <option value="custom">Add a custom skill...</option>
              </select>

              {showCustomSkillInput && (
                <input
                  type="text"
                  className="post-input custom-skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Enter the skill you're seeking"
                  required
                />
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="post-label">
            Description
          </label>
          <textarea
            id="description"
            className="post-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a brief description about your skill or what you're looking for..."
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="post-button"
          disabled={(!selectedSkill && !customSkill) || isLoading}
        >
          {isLoading ? "Processing..." : seek ? "Seek Skill" : "Offer Skill"}
        </button>
      </form>
    </div>
  );
}

export default Post;
