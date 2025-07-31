import React from "react";
import fileDownload from "../../../../assets/home/planDocument/file_download.png";
import "./CardDocument.scss";
const CardDocument = (props) => {
  const truncateTitle = (title, maxLength) => {
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + "...";
    }
    return title;
  };
  return (
    <div className="card__document__container">
      <div className="card__document__heading">
        <div className="wrapper__input__title__document">
          <input type="checkbox" />
          <i className="fa-solid fa-file"></i>
          <div className="name_title_document">
            <span className="title_name">{truncateTitle(props.title, 11)}</span>
            <span>{props.size}</span>
          </div>
        </div>
      </div>
      <div className="owner__avatar">
        <img
          src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
          alt="this is avatar user"
        />
      </div>
      <div className="time_updated">
        <span>{props.lastUpdated}</span>
      </div>
      <div className="download_icon">
        <img src={fileDownload} alt="..." />
      </div>
    </div>
  );
};

export default CardDocument;
