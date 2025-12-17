import React, { useEffect, useState } from "react";
import fileDownload from "../../../../assets/home/planDocument/file_download.png";
import "./CardDocument.scss";
import { formatFileSize } from "../../../../helper/calculateByte";
import { formatDateUI } from "../../../../helper/formatDate";
import { useAuth } from "../../../../context/AuthProvider";
import { fetchUserById } from "../../../../service/UserService";
import { upperCaseFirstChart } from "../../../../helper/upperCaseFirstChart";

const CardDocument = (props) => {
  const { user } = useAuth();
  const [owner, setOwner] = useState(null);
  const truncateTitle = (title, maxLength) => {
    if (!title) return "";
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };
  useEffect(() => {
    if (!user?.token || !props.createBy) return;

    const fetchStudent = async () => {
      try {
        const u = await fetchUserById(user.token, props.createBy);
        setOwner({
          id: u._id,
          name: u.full_name || u.username || "Unknown",
          avatar:
            u.avatar_link ||
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        });
      } catch (error) {
        console.error("Fetch user failed:", error);
        setOwner(null);
      }
    };

    fetchStudent();
  }, []);

  return (
    <div className="card__document__container">
      <div className="card__document__heading">
        <div className="wrapper__input__title__document">
          <i className="fa-solid fa-file"></i>

          <div className="name_title_document">
            <span className="title_name">{truncateTitle(props.title, 11)}</span>
            <span>{formatFileSize(props.size)}</span>
          </div>
        </div>
      </div>

      <div className="owner__avatar">
        <img
          src={owner?.avatar}
          alt={owner?.name || "avatar"}
          title={owner?.name}
        />
        <span>{owner?.name}</span>
      </div>

      <div className="time_updated">
        <span style={{ color: "#000" }}>{formatDateUI(props.lastUpdated)}</span>
      </div>
    </div>
  );
};

export default CardDocument;
