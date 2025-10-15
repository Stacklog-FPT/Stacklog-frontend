import React from 'react';
import './DocumentCard.scss';
const DocumentCard = ({ title, data }) => {
  console.log(data);
  return (
    <div className="document__card">
      <div className="document__card__container">
        <div className="document__card__container__heading">
          <h2>{title}</h2>
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </div>

        <div className="document__card__container__list__data">
          {data.length > 0 ? (
            data.map((item) => (
              <div className="document__card__container__list__data__item">
                <i className="fa-solid fa-file"></i>
                <div className="document__card__container__list__data__item__content">
                  <span className="document__card__container__list__data__item__content__title">
                    {item.documentTitle}
                  </span>
                  <span className="document__card__container__list__data__item__content__size">
                    {item.documentSize} KB
                  </span>
                </div>
              </div>
            ))
          ) : (
            <h2>No data here!</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
