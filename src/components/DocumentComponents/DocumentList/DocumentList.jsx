import React from "react";
import "./DocumentList.scss";
import DocumentCard from "./DocumentCard/DocumentCard";
const DocumentList = () => {
  const [documents, setDocuments] = React.useState([
    {
      _id: 1,
      title: "Feature",
      data: [
        {
          _id: 1,
          title: "Tech requirement.pdf",
          size: 200,
        },
        {
          _id: 2,
          title: "Tech requirement.pdf",
          size: 200,
        },
        {
          _id: 3,
          title: "Tech requirement.pdf",
          size: 200,
        },
      ],
    },
    {
      _id: 2,
      title: "Favorite",
      data: [
        {
          _id: 1,
          title: "Tech requirement.pdf",
          size: 200,
        },
        {
          _id: 2,
          title: "Tech requirement.pdf",
          size: 200,
        },
        {
          _id: 3,
          title: "Tech requirement.pdf",
          size: 200,
        },
      ],
    },
    {
      _id: 3,
      title: "By me",
      data: [
        {
          _id: 1,
          title: "Tech requirement.pdf",
          size: 200,
        },
        {
          _id: 2,
          title: "Tech requirement.pdf",
          size: 200,
        },
        {
          _id: 3,
          title: "Tech requirement.pdf",
          size: 200,
        },
      ],
    },
  ]);
  return (
    <div className="document__list">
      <div className="document__list__container">
        <div className="document__list__container__heading">
          <h2>Document</h2>
        </div>
        <div className="document__list__container__main__content">
          {documents.length > 0 ? (
            documents.map((item) => (
              <DocumentCard
                key={item._id}
                title={item.title}
                data={item.data}
              />
            ))
          ) : (
            <h2>The documents is empty</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
