import React, { useState } from "react";
import "./Profile.scss";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Lê Văn Lu",
    role: "Student",
    image:
      "https://scontent.fsgn2-4.fna.fbcdn.net/v/t51.75761-15/487464014_17855438160405001_2975665951900708652_n.jpg?stp=dst-jpegr_tt6&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=pusnwsmEescQ7kNvwEUXcV0&_nc_oc=AdmYr6UmF9nTAPcZbC5Vv_UV8MNETpyyHxQSmqCf1Ueb60gbjBJqlw4A_81iAK3xIO0YvsC06MGY235dYbXtWZuk&_nc_zt=23&se=-1&_nc_ht=scontent.fsgn2-4.fna&_nc_gid=NmGpzOpK3AXB6KuFyXuIzw&oh=00_AfHIGhTyg_7RFERo4uPXa8bgTINH0isdPi7EoCkAN9kiNQ&oe=6804D738",
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
    if (isEditing) {
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
