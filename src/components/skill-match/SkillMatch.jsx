import { useState, useEffect } from "react";
import { Search, Filter, User, Edit, Trash2, Heart } from "lucide-react";
import "./match.css";
import { useDispatch, useSelector } from "react-redux";
import {
  resetSkillState,
  skillAsyncThunk,
  postSkill,
  deleteSkill,
  getMatches,
} from "../../store/post-store/PostStore";
import { useNavigate } from "react-router-dom";

const SkillCard = ({ skill, onEdit, onDelete, onMatch }) => {
  const isOffer = skill.type === "offer";

  return (
    <div className="skill-card">
      <div className={`skill-type ${isOffer ? "offer" : "seek"}`}>
        {isOffer ? "OFFERING" : "SEEKING"}
      </div>

      <div className="skill-content">
        <h3 className="skill-title">{skill.skillName}</h3>
        <p className="skill-description">
          {skill.description || "No description provided"}
        </p>

        <div className="skill-user">
          <User size={16} className="icon" />
          <span>{skill.userId?.name || "Anonymous User"}</span>
        </div>

        <div className="skill-actions">
          <button onClick={() => onEdit(skill)} className="action edit">
            <Edit size={16} className="icon" />
            Edit
          </button>

          <button onClick={() => onDelete(skill._id)} className="action delete">
            <Trash2 size={16} className="icon" />
            Delete
          </button>

          <button
            onClick={() => onMatch(skill.skillName)}
            className="action match"
          >
            <Heart size={16} className="icon" />
            Match
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SkillCardGrid() {
  const dispatch = useDispatch();
  const {
    data: skills,
    isLoading,
    error,
    matches,
    matchedUsers,
    matchStatus,
  } = useSelector((state) => state.skillsReducer);

  const [editSkill, setEditSkill] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchSkillName, setMatchSkillName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  useEffect(() => {
    dispatch(skillAsyncThunk());

    return () => {
      dispatch(resetSkillState());
    };
  }, [dispatch]);

  const handleEdit = (skill) => {
    setEditSkill(skill);
    setShowEditModal(true);
  };

  const handleEditSubmit = (updatedSkill) => {
    dispatch(
      postSkill({
        ...updatedSkill,
        _id: editSkill._id,
      })
    ).then(() => {
      dispatch(skillAsyncThunk());
      setShowEditModal(false);
      setEditSkill(null);
    });
  };

  const handleDelete = (skillId) => {
    setSkillToDelete(skillId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    dispatch(deleteSkill(skillToDelete))
      .then(() => {
        return dispatch(skillAsyncThunk());
      })
      .then(() => {
        setShowDeleteConfirm(false);
        setSkillToDelete(null);
      })
      .catch((error) => {
        console.error("Error deleting skill:", error);
      });
  };

  const handleMatch = (skillName) => {
    const currentSkill = skills.find((skill) => skill.skillName === skillName);
    const type = currentSkill.type;

    const query = {
      skillName,
      type,
    };

    setMatchSkillName(skillName);
    dispatch(getMatches(query));
    setShowMatchModal(true);
  };
  return (
    <div className="container">
      {/* <div className="search-bar">
        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <div className="input-group">
            <input type="text" placeholder="Search skills..." disabled />
            <Search size={18} className="icon" />
          </div>

          <div className="input-group">
            <select disabled>
              <option value="">All Types</option>
              <option value="seek">Seeking</option>
              <option value="offer">Offering</option>
            </select>
            <Filter size={18} className="icon" />
          </div>

          <button type="submit" className="btn-search" disabled>
            Search
          </button>
        </form>
      </div> */}

      {error && <div className="error">{error}</div>}

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading skills...</p>
        </div>
      ) : (
        <div className="skill-grid">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={skill}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMatch={handleMatch}
              />
            ))
          ) : (
            <div className="no-results">
              No skills found. Try adjusting your search.
            </div>
          )}
        </div>
      )}

      {showEditModal && (
        <SkillEditModal
          skill={editSkill}
          onSave={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showMatchModal && (
        <MatchResultsModal
          skillName={matchSkillName}
          matchedUsers={matchedUsers}
          matches={matches}
          matchStatus={matchStatus}
          onClose={() => setShowMatchModal(false)}
        />
      )}
    </div>
  );
}

function SkillEditModal({ skill, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    skillName: skill.skillName || "",
    description: skill.description || "",
    type: skill.type || "offer",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Skill</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Skill Name</label>
            <input
              type="text"
              name="skillName"
              value={formData.skillName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="offer">Offering</option>
              <option value="seek">Seeking</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Delete</h2>
        <p>
          Are you sure you want to delete this skill? This action cannot be
          undone.
        </p>

        <div className="modal-actions">
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchResultsModal({ skillName, matches, matchStatus, onClose }) {
  const matchItems = matches?.matches || [];
  const hasMatches = matchItems.length > 0;
  const matchType = matches?.type || "";

  const isOffering = matchType === "offer";

  const navigate = useNavigate();

  const handleClick = (match) => {
    navigate("/chat", {
      state: {
        selectedUser: {
          id: match.userId._id,
          name: match.userId.name,
          email: match.userId.email,
        },
        skillMatch: {
          skillName: match.skillName,
          type: match.type,
          description: match.description,
        },
      },
    });
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Matches for "{skillName}"</h2>

        {matchStatus === "loading" && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Finding matches...</p>
          </div>
        )}

        {matchStatus === "error" && (
          <div className="error">
            <p>Failed to find matches. Please try again.</p>
          </div>
        )}

        {matchStatus !== "loading" && !hasMatches ? (
          <div className="no-matches">
            <p>No matches found for this skill.</p>
          </div>
        ) : (
          <div className="matches-list">
            {console.log(matchItems)}
            {matchItems
              .filter((match) => match.userId && match._id)
              .map((match) => (
                <div key={match._id} className="match-item">
                  <div className="match-user">
                    <User size={20} className="icon" />
                    <h3>{match.userId?.name || "Anonymous"}</h3>
                  </div>

                  <div className={`match-${match.type}`}>
                    <h4>
                      {match.type === "seek" ? "They Seek:" : "They Offer:"}
                    </h4>
                    <p>{match.skillName}</p>
                    {match.description && (
                      <p className="match-description">{match.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleClick(match)}
                    className="btn-contact"
                  >
                    Contact
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="btn-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
