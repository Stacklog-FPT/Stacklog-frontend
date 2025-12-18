import { useEffect, useRef } from "react";
import "./DetailMeeting.scss";
import meetingIcon from "../../../../assets/home/meeting-icon.png";
import { useSelector } from "react-redux";
import { formatDateUI } from "../../../../helper/formatDate";
import { truncateName } from "../../../../helper/upperCaseFirstChart";

const DetailMeeting = () => {
  const schedules = useSelector((state) => state.schedule.schedules);
  const sortedSchedules = [...schedules].sort((a, b) => {
    return new Date(a.slotStartTime) - new Date(b.slotStartTime);
  });

  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardRefs.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [sortedSchedules]);

  return (
    <div className="detail__meeting__container">
      {sortedSchedules.length > 0 ? (
        sortedSchedules.map((item, index) => (
          <div
            key={item.slotId || item._id}
            className="detail__meeting__card"
            ref={(el) => (cardRefs.current[index] = el)}
          >
            <div className="detail__meeting__card__heading">
              <h2>{truncateName(item.slotTitle, 11)}</h2>
              <i className="fa-regular fa-pen-to-square"></i>
            </div>
            <div className="detail__meeting__card__day__time">
              <div>
                <div className="detail__meeting__card__day__time__day">
                  <i className="fa-solid fa-calendar-days"></i>
                  <p>{formatDateUI(item.slotStartTime)}</p>
                </div>
              </div>
              <div>
                <img src={meetingIcon} alt="meeting icon" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <h2>No meetings today!</h2>
      )}
      <div className="detail__meeting__fade"></div>
    </div>
  );
};

export default DetailMeeting;
