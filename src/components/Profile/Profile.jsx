import React, { useEffect, useRef, useState, useCallback } from "react";
import "./pro.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProfileDetails,
  resetProfileState,
  saveProfileDetails,
} from "../../store/profile-store/Profile-deatils";

function ProfileDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profileData, loading } = useSelector((state) => state.profileReducer);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    bio: "",
    profileImage: null,
    location: {
      address: "",
      city: "",
      state: "",
      zipcode: "",
      coordinates: {
        lat: null,
        lng: null,
      },
    },
    availability: [],
    skills: [],
    jobHistory: [],
    education: [],
    certifications: [],
  });

  useEffect(() => {
    dispatch(fetchProfileDetails());
    return () => {
      dispatch(resetProfileState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        bio: profileData.user.bio || "",
        profileImage: profileData.user.profileImage || null,
        location: profileData.user.location || {
          address: "",
          city: "",
          state: "",
          zipcode: "",
          coordinates: {
            lat: null,
            lng: null,
          },
        },
        availability: profileData.user.availability || [],
        skills: profileData.user.skills || [],
        jobHistory: profileData.user.jobHistory || [],
        education: profileData.user.education || [],
        certifications: profileData.user.certifications || [],
      });
    }
  }, [profileData]);

  //   wizard steps
  const steps = [
    {
      title: "Bio",
      component: <BioSection formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Location",
      component: (
        <LocationSection formData={formData} setFormData={setFormData} />
      ),
    },
    {
      title: "Skills",
      component: (
        <SkillsSection formData={formData} setFormData={setFormData} />
      ),
    },
    {
      title: "Availability",
      component: (
        <AvailabilitySection formData={formData} setFormData={setFormData} />
      ),
    },
    {
      title: "Work Experience",
      component: <JobSection formData={formData} setFormData={setFormData} />,
    },
    {
      title: "Education",
      component: (
        <EducationSection formData={formData} setFormData={setFormData} />
      ),
    },
    {
      title: "Certifications",
      component: (
        <CertificationsSection formData={formData} setFormData={setFormData} />
      ),
    },
    {
      title: "Review",
      component: <ReviewSection formData={formData} />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await dispatch(saveProfileDetails(formData));
      if (saveProfileDetails.fulfilled.match(result)) {
        navigate("/post");
      } else {
        console.error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
    }
  };

  if (loading && !profileData) {
    return <div className="loading">Loading your profile...</div>;
  }

  return (
    <div className="main">
      <div className="profile-setup-container">
        <div className="progress-indicator">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index === currentStep ? "active" : ""} ${
                index < currentStep ? "completed" : ""
              }`}
              onClick={() => setCurrentStep(index)}
            >
              {step.title}
            </div>
          ))}
        </div>

        <div className="step-content">
          <h2>{steps[currentStep].title}</h2>
          {steps[currentStep].component}
        </div>

        <div className="navigation-buttons">
          {currentStep > 0 && (
            <button onClick={handlePrev} className="prev-btn">
              Prev
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button onClick={handleNext} className="next-btn">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="submit-btn">
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const BioSection = ({ formData, setFormData }) => {
  const [imagePreview, setImagePreview] = useState(
    formData.profileImage || null
  );
  const [hasUploadedImage, setHasUploadedImage] = useState(false);

  const handleBioChange = (e) => {
    setFormData({ ...formData, bio: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = function (event) {
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

          setImagePreview(dataUrl);
          setFormData({
            ...formData,
            profileImage: dataUrl,
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      setHasUploadedImage(true);
    }
  };

  return (
    <div className="form-section">
      <div className="profile-image-section">
        <div className="profile-image-container">
          {hasUploadedImage && imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="profile-image-preview"
            />
          ) : formData.profileImage ? (
            <img
              src={formData.profileImage}
              alt="Profile preview"
              className="profile-image-preview"
            />
          ) : (
            <div className="profile-image-placeholder">
              <i className="fa fa-user"></i>
            </div>
          )}
        </div>
        <div className="profile-image-upload">
          <label htmlFor="profile-image" className="upload-button">
            {imagePreview ? "Change Profile Picture" : "Upload Profile Picture"}
          </label>
          <input
            type="file"
            id="profile-image"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="bio">Professional Bio</label>
        <textarea
          id="bio"
          value={formData.bio}
          rows={5}
          onChange={handleBioChange}
          placeholder="Your Interests And Professional Interests"
        ></textarea>
      </div>
    </div>
  );
};

const LocationSection = ({ formData, setFormData }) => {
  const inputRef = useRef(null);
  const [addressInput, setAddressInput] = useState(
    formData.location.address || ""
  );

  useEffect(() => {
    setAddressInput(formData.location.address || "");
  }, [formData.location.address]);

  const initAutocomplete = useCallback(() => {
    const input = inputRef.current;
    if (!input || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(input);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place || !place.geometry) return;

      let address = "";
      let city = "";
      let state = "";
      let zipCode = "";

      place.address_components.forEach((component) => {
        const types = component.types;

        if (types.includes("street_number") || types.includes("route")) {
          address += component.long_name + " ";
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.short_name;
        }
        if (types.includes("postal_code")) {
          zipCode = component.long_name;
        }
      });

      setFormData((prev) => ({
        ...prev,
        location: {
          address: address.trim(),
          city,
          state,
          zipcode: zipCode,
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
        },
      }));

      setAddressInput(address.trim());
    });
  }, [setFormData]);

  useEffect(() => {
    const loadScript = () => {
      if (document.getElementById("google-maps")) {
        initAutocomplete();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&libraries=places`
      script.async = true;
      script.defer = true;
      script.id = "google-maps";
      script.setAttribute("loading", "async");
      script.onload = initAutocomplete;
      document.body.appendChild(script);
    };

    if (!window.google || !window.google.maps) {
      loadScript();
    } else {
      initAutocomplete();
    }
  }, [initAutocomplete]);

  return (
    <div className="form-section">
      <h3>Your Location</h3>
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input
          id="address"
          ref={inputRef}
          type="text"
          placeholder="Start typing your address"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
        />
      </div>

      {formData.location.city && (
        <div className="location-preview">
          <p>City: {formData.location.city}</p>
          <p>State: {formData.location.state}</p>
          <p>ZIP Code: {formData.location.zipcode}</p>
        </div>
      )}
    </div>
  );
};

const SkillsSection = ({ formData, setFormData }) => {
  const [currentSkill, setCurrentSkill] = useState("");

  const addSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill],
      });
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  return (
    <div className="form-section">
      <div className="form-group">
        <label htmlFor="skills">Skills</label>
        <div className="skill-input-group">
          <input
            id="skills"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            placeholder="Add a skill"
          />
          <button type="button" onClick={addSkill}>
            Add
          </button>
        </div>
      </div>

      <div className="skills-list">
        {formData.skills.map((skill) => (
          <div className="skill-tag" key={skill}>
            {skill}
            <button onClick={() => removeSkill(skill)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AvailabilitySection = ({ formData, setFormData }) => {
  const [currentAvailability, setCurrentAvailability] = useState({
    day: "",
    slots: [
      {
        startTime: "",
        endTime: "",
      },
    ],
  });

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleDayChange = (e) => {
    setCurrentAvailability({
      ...currentAvailability,
      day: e.target.value,
    });
  };

  const handleTimeChange = (index, field, value) => {
    const updatedSlots = [...currentAvailability.slots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [field]: value,
    };

    setCurrentAvailability({
      ...currentAvailability,
      slots: updatedSlots,
    });
  };

  const addSlot = () => {
    setCurrentAvailability({
      ...currentAvailability,
      slots: [...currentAvailability.slots, { startTime: "", endTime: "" }],
    });
  };

  const removeSlot = (index) => {
    const updatedSlots = currentAvailability.slots.filter(
      (_, i) => i !== index
    );
    setCurrentAvailability({
      ...currentAvailability,
      slots: updatedSlots,
    });
  };

  const addAvailability = () => {
    if (
      currentAvailability.day &&
      currentAvailability.slots.every((slot) => slot.startTime && slot.endTime)
    ) {
      // Check if day already exists and remove it
      const filteredAvailability = formData.availability.filter(
        (item) => item.day !== currentAvailability.day
      );

      setFormData({
        ...formData,
        availability: [...filteredAvailability, currentAvailability],
      });

      setCurrentAvailability({
        day: "",
        slots: [{ startTime: "", endTime: "" }],
      });
    }
  };

  const removeAvailability = (dayToRemove) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter(
        (item) => item.day !== dayToRemove
      ),
    });
  };

  return (
    <div className="form-section">
      <h3>When are you available?</h3>

      <div className="availability-input">
        <div className="form-group">
          <label htmlFor="day">Day</label>
          <select
            id="day"
            value={currentAvailability.day}
            onChange={handleDayChange}
          >
            <option value="">Select day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {currentAvailability.slots.map((slot, index) => (
          <div className="time-slot" key={index}>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) =>
                  handleTimeChange(index, "startTime", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) =>
                  handleTimeChange(index, "endTime", e.target.value)
                }
              />
            </div>

            {currentAvailability.slots.length > 1 && (
              <button type="button" onClick={() => removeSlot(index)}>
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="slot-actions">
          <button type="button" onClick={addSlot}>
            Add Another Time Slot
          </button>
          <button type="button" onClick={addAvailability}>
            Save Day
          </button>
        </div>
      </div>

      <div className="availability-summary">
        <h4>Your Availability</h4>
        {formData.availability.length > 0 ? (
          formData.availability.map((item, index) => (
            <div className="availability-day" key={index}>
              <h5>{item.day}</h5>
              <ul>
                {item.slots.map((slot, slotIndex) => (
                  <li key={slotIndex}>
                    {slot.startTime} - {slot.endTime}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => removeAvailability(item.day)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No availability added yet</p>
        )}
      </div>
    </div>
  );
};

const JobSection = ({ formData, setFormData }) => {
  const [currentJob, setCurrentJob] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [editIndex, setEditIndex] = useState(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentJob({
      ...currentJob,
      [name]: value,
    });
  };

  const addJob = () => {
    if (currentJob.title && currentJob.company && currentJob.startDate) {
      if (editIndex >= 0) {
        // Update existing job
        const updatedJobs = [...formData.jobHistory];
        updatedJobs[editIndex] = currentJob;
        setFormData({
          ...formData,
          jobHistory: updatedJobs,
        });
        setEditIndex(-1);
      } else {
        // Add new job
        setFormData({
          ...formData,
          jobHistory: [...formData.jobHistory, currentJob],
        });
      }

      // Reset current job
      setCurrentJob({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  };

  const editJob = (index) => {
    setCurrentJob(formData.jobHistory[index]);
    setEditIndex(index);
  };

  const removeJob = (index) => {
    const updatedJobs = formData.jobHistory.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      jobHistory: updatedJobs,
    });

    if (editIndex === index) {
      setEditIndex(-1);
      setCurrentJob({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  };

  return (
    <div className="form-section">
      <h3>Work Experience</h3>

      <div className="job-input">
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            id="title"
            name="title"
            value={currentJob.title}
            onChange={handleChange}
            placeholder="e.g. DevOps Engineer"
          />
        </div>

        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            value={currentJob.company}
            onChange={handleChange}
            placeholder="e.g. Infosys"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={currentJob.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={currentJob.endDate}
              onChange={handleChange}
              placeholder="Leave blank if current job"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            name="description"
            value={currentJob.description}
            onChange={handleChange}
            placeholder="Describe your responsibilities and achievements"
          />
        </div>

        <button type="button" onClick={addJob}>
          {editIndex >= 0 ? "Update Job" : "Add Job"}
        </button>

        {editIndex >= 0 && (
          <button
            type="button"
            onClick={() => {
              setEditIndex(-1);
              setCurrentJob({
                title: "",
                company: "",
                startDate: "",
                endDate: "",
                description: "",
              });
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="job-history-list">
        <h4>Added Work Experience</h4>
        {formData.jobHistory.length > 0 ? (
          formData.jobHistory.map((job, index) => (
            <div className="job-item" key={index}>
              <h5>
                {job.title} at {job.company}
              </h5>
              <p>
                {job.startDate} - {job.endDate || "Present"}
              </p>
              <p>{job.description}</p>
              <div className="job-actions">
                <button type="button" onClick={() => editJob(index)}>
                  Edit
                </button>
                <button type="button" onClick={() => removeJob(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No work experience added yet</p>
        )}
      </div>
    </div>
  );
};

//education
const EducationSection = ({ formData, setFormData }) => {
  const [currentEducation, setCurrentEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    graduationYear: "",
  });
  const [editIndex, setEditIndex] = useState(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentEducation({
      ...currentEducation,
      [name]: value,
    });
  };

  const addEducation = () => {
    if (
      currentEducation.institution &&
      currentEducation.degree &&
      currentEducation.field
    ) {
      if (editIndex >= 0) {
        // Update existing education
        const updatedEducation = [...formData.education];
        updatedEducation[editIndex] = currentEducation;
        setFormData({
          ...formData,
          education: updatedEducation,
        });
        setEditIndex(-1);
      } else {
        // Add new education
        setFormData({
          ...formData,
          education: [...formData.education, currentEducation],
        });
      }

      // Reset current education
      setCurrentEducation({
        institution: "",
        degree: "",
        field: "",
        graduationYear: "",
      });
    }
  };

  const editEducation = (index) => {
    setCurrentEducation(formData.education[index]);
    setEditIndex(index);
  };

  const removeEducation = (index) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      education: updatedEducation,
    });

    if (editIndex === index) {
      setEditIndex(-1);
      setCurrentEducation({
        institution: "",
        degree: "",
        field: "",
        graduationYear: "",
      });
    }
  };

  return (
    <div className="form-section">
      <h3>Education</h3>

      <div className="education-input">
        <div className="form-group">
          <label htmlFor="institution">Institution</label>
          <input
            id="institution"
            name="institution"
            value={currentEducation.institution}
            onChange={handleChange}
            placeholder="e.g. IIT Kanpur"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="degree">Degree</label>
            <input
              id="degree"
              name="degree"
              value={currentEducation.degree}
              onChange={handleChange}
              placeholder="e.g. B.Tech"
            />
          </div>

          <div className="form-group">
            <label htmlFor="field">Field of Study</label>
            <input
              id="field"
              name="field"
              value={currentEducation.field}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="graduationYear">Graduation Year</label>
          <input
            id="graduationYear"
            name="graduationYear"
            type="number"
            min="1900"
            max="2099"
            value={currentEducation.graduationYear}
            onChange={handleChange}
          />
        </div>

        <button type="button" onClick={addEducation}>
          {editIndex >= 0 ? "Update Education" : "Add Education"}
        </button>

        {editIndex >= 0 && (
          <button
            type="button"
            onClick={() => {
              setEditIndex(-1);
              setCurrentEducation({
                institution: "",
                degree: "",
                field: "",
                graduationYear: "",
              });
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="education-list">
        <h4>Added Education</h4>
        {formData.education.length > 0 ? (
          formData.education.map((edu, index) => (
            <div className="education-item" key={index}>
              <h5>
                {edu.degree} in {edu.field}
              </h5>
              <p>
                {edu.institution}, {edu.graduationYear}
              </p>
              <div className="education-actions">
                <button type="button" onClick={() => editEducation(index)}>
                  Edit
                </button>
                <button type="button" onClick={() => removeEducation(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No education added yet</p>
        )}
      </div>
    </div>
  );
};

//certifications
const CertificationsSection = ({ formData, setFormData }) => {
  const [currentCert, setCurrentCert] = useState({
    name: "",
    issuedBy: "",
    issueDate: "",
    expiryDate: "",
    credentialURL: "",
  });
  const [editIndex, setEditIndex] = useState(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCert({
      ...currentCert,
      [name]: value,
    });
  };

  const addCertification = () => {
    if (currentCert.name && currentCert.issuedBy) {
      if (editIndex >= 0) {
        // Update existing certification
        const updatedCerts = [...formData.certifications];
        updatedCerts[editIndex] = currentCert;
        setFormData({
          ...formData,
          certifications: updatedCerts,
        });
        setEditIndex(-1);
      } else {
        // Add new certification
        setFormData({
          ...formData,
          certifications: [...formData.certifications, currentCert],
        });
      }

      // Reset current certification
      setCurrentCert({
        name: "",
        issuedBy: "",
        issueDate: "",
        expiryDate: "",
        credentialURL: "",
      });
    }
  };

  const editCertification = (index) => {
    setCurrentCert(formData.certifications[index]);
    setEditIndex(index);
  };

  const removeCertification = (index) => {
    const updatedCerts = formData.certifications.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      certifications: updatedCerts,
    });

    if (editIndex === index) {
      setEditIndex(-1);
      setCurrentCert({
        name: "",
        issuedBy: "",
        issueDate: "",
        expiryDate: "",
        credentialURL: "",
      });
    }
  };

  return (
    <div className="form-section">
      <h3>Certifications</h3>

      <div className="certification-input">
        <div className="form-group">
          <label htmlFor="certName">Certification Name</label>
          <input
            id="certName"
            name="name"
            value={currentCert.name}
            onChange={handleChange}
            placeholder="e.g. AWS Certified Solutions Architect"
          />
        </div>

        <div className="form-group">
          <label htmlFor="issuedBy">Issued By</label>
          <input
            id="issuedBy"
            name="issuedBy"
            value={currentCert.issuedBy}
            onChange={handleChange}
            placeholder="e.g. AWS Certified Solutions Architect"
          />
        </div>

        <div className="form-group">
          <label htmlFor="issuedBy">Issued By</label>
          <input
            id="issuedBy"
            name="issuedBy"
            value={currentCert.issuedBy}
            onChange={handleChange}
            placeholder="e.g. Amazon"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="issueDate">Issue Date</label>
            <input
              id="issueDate"
              name="issueDate"
              type="date"
              value={currentCert.issueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={currentCert.expiryDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="credentialURL">Credential URL</label>
          <input
            id="credentialURL"
            name="credentialURL"
            type="url"
            value={currentCert.credentialURL}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <button type="button" onClick={addCertification}>
          Add Certification
        </button>
      </div>

      <div className="certification-list">
        <h4>Added Certifications</h4>
        {formData.certifications.map((cert, index) => (
          <div className="certification-item" key={index}>
            <h5>{cert.name}</h5>
            <p>Issued by: {cert.issuedBy}</p>
            <p>
              Valid: {cert.issueDate} to {cert.expiryDate || "No Expiry"}
            </p>
            {cert.credentialURL && (
              <p>
                <a
                  href={cert.credentialURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Credential
                </a>
              </p>
            )}
            <button type="button" onClick={() => removeCertification(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

//review
const ReviewSection = ({ formData }) => {
  return (
    <div className="form-section review-section">
      <h3>Review Your Profile</h3>

      <div className="review-block">
        <h4>Bio</h4>
        <p>{formData.bio || "No bio provided"}</p>
      </div>

      <div className="review-block">
        <h4>Location</h4>
        {formData.location.address ? (
          <div>
            <p>{formData.location.address}</p>
            <p>
              {formData.location.city}, {formData.location.state}{" "}
              {formData.location.zipCode}
            </p>
          </div>
        ) : (
          <p>No location provided</p>
        )}
      </div>

      <div className="review-block">
        <h4>Skills</h4>
        {formData.skills.length > 0 ? (
          <div className="skills-container">
            {formData.skills.map((skill, index) => (
              <span className="skill-badge" key={index}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p>No skills provided</p>
        )}
      </div>

      <div className="review-block">
        <h4>Availability</h4>
        {formData.availability.length > 0 ? (
          formData.availability.map((item, index) => (
            <div key={index} className="availability-item">
              <h5>{item.day}</h5>
              <ul>
                {item.slots.map((slot, slotIndex) => (
                  <li key={slotIndex}>
                    {slot.startTime} - {slot.endTime}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No availability provided</p>
        )}
      </div>

      <div className="review-block">
        <h4>Work Experience</h4>
        {formData.jobHistory.length > 0 ? (
          formData.jobHistory.map((job, index) => (
            <div key={index} className="job-summary">
              <h5>
                {job.title} at {job.company}
              </h5>
              <p>
                {job.startDate} - {job.endDate || "Present"}
              </p>
              <p>{job.description}</p>
            </div>
          ))
        ) : (
          <p>No work experience provided</p>
        )}
      </div>

      <div className="review-block">
        <h4>Education</h4>
        {formData.education.length > 0 ? (
          formData.education.map((edu, index) => (
            <div key={index} className="education-summary">
              <h5>
                {edu.degree} in {edu.field}
              </h5>
              <p>
                {edu.institution}, {edu.graduationYear}
              </p>
            </div>
          ))
        ) : (
          <p>No education provided</p>
        )}
      </div>

      <div className="review-block">
        <h4>Certifications</h4>
        {formData.certifications.length > 0 ? (
          formData.certifications.map((cert, index) => (
            <div key={index} className="certification-summary">
              <h5>{cert.name}</h5>
              <p>Issued by: {cert.issuedBy}</p>
              <p>
                Valid: {cert.issueDate} to {cert.expiryDate || "No Expiry"}
              </p>
            </div>
          ))
        ) : (
          <p>No certifications provided</p>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;
