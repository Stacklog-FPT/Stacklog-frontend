import React from "react";
import "./DocumentRecent.scss";
const DocumentRecent = () => {
  const [recentDocuments, setRecentDocuments] = React.useState([
    {
      _id: 1,
      title: "Tech requirement.pdf",
      description: "I read but didn't understand anything",
    },
    {
      _id: 1,
      title: "Tech requirement.pdf",
      description: "I read but didn't understand anything",
    },
    {
      _id: 2,
      title: "Tech requirement.pdf",
      description: "I read but didn't understand anything",
    },
    {
      _id: 3,
      title: "Tech requirement.pdf",
      description: "I read but didn't understand anything",
    },
    {
      _id: 4,
      title: "Tech requirement.pdf",
      description: "I read but didn't understand anything",
    },
    {
      _id: 5,
      title: "Tech requirement.pdf",
      description: "I read but didn't understand anything",
    },
    {
      _id: 6,
      title: "Tech requirement.pdf",
      description: "I read but didn't understand anything",
    },
  ]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(recentDocuments.length / itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = recentDocuments.slice(startIndex, endIndex);

  //
  return (
    <div className="document__recent">
      <div className="document__recent__container">
        <div className="document__recent__container__heading">
          <h2>Recent</h2>
        </div>

        <div className="document__recent__container__main__content">
          {currentItems.length > 0 ? (
            currentItems.map((item) => {
              return (
                <div
                  className="document__recent__container__main__content__item"
                  key={item._id}
                >
                  <i className="fa-solid fa-play"></i>
                  <div className="document__recent__container__main__content__item__content">
                    <span className="document__recent__container__main__content__item__content__title">
                      {item.title}
                    </span>
                    <span className="document__recent__container__main__content__item__content__description">
                      {item.description}
                    </span>
                  </div>
                  <div className="document__recent__container__main__content__item__bin">
                    <i className="fa-solid fa-dumpster"></i>
                  </div>
                </div>
              );
            })
          ) : (
            <h2>No document recent</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentRecent;
