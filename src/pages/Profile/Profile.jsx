import { useState } from "react";
import "./Profile.scss";
import userApi from "../../service/UserService";
import { useAuth } from "../../context/AuthProvider";
import avaChat from "../../assets/Logo.png";

const Profile = () => {
  const { user, logoutAuth } = useAuth();
  const { logout, error, isLoading } = userApi();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Lê Văn Lu",
    role: "Student",
    image:
      "https://i.pinimg.com/736x/f9/58/a1/f958a1d67ce15e9793a5001fedbd53ae.jpg",
    email: "levanlu@gmail.com",
    address: "Nguyễn Đức Trung, Thanh Khê, Đà Nẵng",
  });

  const [tempImage, setTempImage] = useState(profileData.image);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl);
      setProfileData((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await logout(user.token);
      (response);
      if (response) {
        logoutAuth();
      }
    } catch (e) {
      console.error("Login failed" || e.message);
    }
  };
  return (
    <div className="profile-popup">
      <div className="profile-popup-avatar">
        {isEditing ? (
          <>
            <label htmlFor="image-upload" className="image-upload-label">
              <img src={tempImage} alt="Avatar" />
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          </>
        ) : (
          <img src={profileData.image} alt="Avatar" />
        )}
        <div className="profile-popup-avatar-content">
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className="edit-input"
            />
          ) : (
            <h2>{profileData.name}</h2>
          )}
          <p>{profileData.role}</p>
          <button onClick={toggleEdit}>
            <i className="fa-solid fa-pen-to-square"></i>{" "}
            {isEditing ? "Save Profile" : "Edit Profile"}
          </button>
          <button onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            {isLoading ? "Is Logging" : "Logout"}
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
            <p>{profileData.email}</p>
          </div>
          <div className="profile-popup-information-content-element">
            <h4>Address</h4>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <p>{profileData.address}</p>
            )}
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default Profile;
