import { useEffect, useState } from "react";
import "./Profile.scss";
import userApi from "../../service/UserService";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Profile = () => {
  const { user, logoutAuth } = useAuth();
  const { logout, getUserByEmail } = userApi();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({});
  console.log(profileData);
  const [tempImage, setTempImage] = useState("");

  const handleGetDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserByEmail(user.token, user.email);
      if (response) {
        setProfileData(response.user);
        setTempImage(response.avatar_link || "avatar/default.png");
      }
    } catch (e) {
      setError(e.message || "Failed to fetch user details");
      console.error("Failed to fetch user details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token && user?.email) {
      handleGetDetail();
    } else {
      setError("User not authenticated");
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl);
      setProfileData((prev) => ({ ...prev, avatar_link: imageUrl }));
    }
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await logout(user.token);
      if (response) {
        logoutAuth();
      }
    } catch (e) {
      console.error("Logout failed:", e.message);
    }
  };

  return (
    <div className="profile-popup">
      {error && <p className="error">{error}</p>}
      <div className="profile-popup-avatar">
        {loading ? (
          <Skeleton circle width={100} height={100} />
        ) : isEditing ? (
          <label htmlFor="image-upload" className="image-upload-label">
            <img src={tempImage || "avatar/default.png"} alt="Avatar" />
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
        ) : (
          <img
            src={profileData.avatar_link || "avatar/default.png"}
            alt="Avatar"
          />
        )}
        <div className="profile-popup-avatar-content">
          {loading ? (
            <Skeleton width={150} height={20} />
          ) : isEditing ? (
            <input
              type="text"
              name="full_name"
              value={profileData.full_name}
              onChange={handleInputChange}
              className="edit-input"
            />
          ) : (
            <h2>{profileData.full_name || "Unknown User"}</h2>
          )}
          {loading ? (
            <Skeleton width={100} height={16} />
          ) : (
            <p>{profileData.role}</p>
          )}
          <button onClick={toggleEdit}>
            <i className="fa-solid fa-pen-to-square"></i>
            {isEditing ? "Save Profile" : "Edit Profile"}
          </button>
          <button onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            {loading ? "Is Logging" : "Logout"}
          </button>
        </div>
      </div>
      <div className="profile-popup-information">
        <div className="profile-popup-information-heading">
          <h3>Information</h3>
        </div>
        <div className="profile-popup-information-content">
          <div className="profile-popup-information-content-element">
            <h4>Email</h4>
            {loading ? (
              <Skeleton width={200} height={16} />
            ) : (
              <p>{profileData.email}</p>
            )}
          </div>
          <div className="profile-popup-information-content-element">
            <h4>Description</h4>
            {loading ? (
              <Skeleton width={200} height={16} />
            ) : isEditing ? (
              <input
                type="text"
                name="description"
                value={profileData.description}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <p>{profileData.description || "No description"}</p>
            )}
          </div>
          <div className="profile-popup-information-content-element">
            <h4>Work ID</h4>
            {loading ? (
              <Skeleton width={200} height={16} />
            ) : (
              <p>{profileData.work_id}</p>
            )}
          </div>
          <div className="profile-popup-information-content-element">
            <h4>Personal Score</h4>
            {loading ? (
              <Skeleton width={100} height={16} />
            ) : (
              <p>{profileData.personal_score}</p>
            )}
          </div>
        </div>
        {loading ? (
          <Skeleton width={200} height={30} />
        ) : profileData?.role === "STUDENT" &&
          profileData?.role === "LECTURER" ? (
          <>
            <div className="profile-popup-information-heading">
              <h3>Current Class</h3>
            </div>
            <div className="profile-popup-information-content">
              <div className="profile-popup-information-content-element">
                <h4>Class</h4>
                <p>SDN301c</p>
              </div>
              <div className="profile-popup-information-content-element">
                <h4>Class</h4>
                <p>MMA301c</p>
              </div>
            </div>
            <div className="profile-popup-information-content">
              <div className="profile-popup-information-content-element">
                <h4>Class</h4>
                <p>SWD301c</p>
              </div>
              <div className="profile-popup-information-content-element">
                <h4>Class</h4>
                <p>EXE101c</p>
              </div>
            </div>
          </>
        ) : (
          <button className="btn__admin">
            <Link to={"/admin"}>Go to AdminDashboard</Link>
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
