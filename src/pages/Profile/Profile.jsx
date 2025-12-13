import { useEffect, useState } from "react";
import "./Profile.scss";
import userApi from "../../service/UserService";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import decodeToken from "../../service/DecodeJwt";
import { toast } from "sonner";
import { updateUserProfile } from "../../service/UserService";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const Profile = () => {
  const { user, logoutAuth } = useAuth();
  const { logout } = userApi();
  const userData = decodeToken(user?.token);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useSelector((state) => state.users);
  const [profileData, setProfileData] = useState({
    ...userInfo,
  });
  const [loading, setLoading] = useState(() => {
    if (profileData) {
      return false;
    }
    return true;
  });
  const [tempImage, setTempImage] = useState(profileData.avatar_link);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Image size must be under 5MB");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl);
      setProfileData((prev) => ({ ...prev, avatar_link: file }));
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleGetDetail();
      setTempImage(profileData.avatar_link || defaultAvatar);
    }
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

  const handleSaveProfile = async () => {
    if (!profileData.full_name?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Field',
        text: 'Full name is required!'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await updateUserProfile(
        user.token,
        userData.id,
        {
          ...profileData,
          avatar_link: profileData.avatar_link,
        },
        dispatch
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setProfileData(response.data || response);
        setTempImage(response.data?.avatar_link || response.avatar_link);
      }
    } catch (error) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
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
            src={profileData?.avatar_link || "avatar/default.png"}
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
              value={profileData?.full_name}
              onChange={handleInputChange}
              className="edit-input"
            />
          ) : (
            <h2>{profileData?.full_name || "Unknown User"}</h2>
          )}
          {loading ? (
            <Skeleton width={100} height={16} />
          ) : (
            <p>{profileData?.role}</p>
          )}
          <button
            onClick={isEditing ? handleSaveProfile : toggleEdit}
            disabled={loading}
          >
            <i className="fa-solid fa-pen-to-square"></i>
            {loading
              ? "Saving..."
              : isEditing
              ? "Save Profile"
              : "Edit Profile"}
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
        <div className="profile-popup-information-container">
          <div className="profile-popup-information-container-content">
            <div className="profile-popup-information-container-content-element">
              <h4>Email</h4>
              {loading ? (
                <Skeleton width={200} height={16} />
              ) : (
                <p>{profileData?.email}</p>
              )}
            </div>
            <div className="profile-popup-information-container-content-element">
              <h4>Description</h4>
              {loading ? (
                <Skeleton width={200} height={16} />
              ) : isEditing ? (
                <input
                  type="text"
                  name="description"
                  value={profileData?.description}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <p>{profileData?.description || "No description"}</p>
              )}
            </div>
            <div className="profile-popup-information-container-content-element">
              <h4>Work ID</h4>
              {loading ? (
                <Skeleton width={200} height={16} />
              ) : (
                <p>{profileData?.work_id}</p>
              )}
            </div>
            <div className="profile-popup-information-container-content-element">
              <h4>Personal Score</h4>
              {loading ? (
                <Skeleton width={100} height={16} />
              ) : (
                <p>{profileData?.personal_score}</p>
              )}
            </div>
          </div>
        </div>
        {profileData?.role === "ADMIN" && (
          <button className="btn__admin">
            <Link to={"/admin"}>Go to AdminDashboard</Link>
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
