import React, { useState, useEffect, useRef } from "react";
import "./DetailMeeting.scss";
import schedule from "../../../../assets/meetingIcon/schedule.png";
import watch from "../../../../assets/meetingIcon/watch.png";
import meetingIcon from "../../../../assets/home/meeting-icon.png";

const DetailMeeting = () => {
  const [meetings, setMeetings] = useState([
    {
      _id: 1,
      title: "Research User Ability",
      desc: "Your presentation was clearly and engaging, but you can could improve by adding more detailed data and examples to support your points effectively.",
      dateStart: "2025-5-12",
      timeStart: "12PM",
      timeEnd: "4PM",
    },
    {
      _id: 2,
      title: "Research User Ability",
      desc: "Your presentation was clearly and engaging, but you can could improve by adding more detailed data and examples to support your points effectively.",
      dateStart: "2025-5-12",
      timeStart: "12PM",
      timeEnd: "4PM",
    },
    {
      _id: 3,
      title: "Research User Ability",
      desc: "Your presentation was clearly and engaging, but you can could improve by adding more detailed data and examples to support your points effectively.",
      dateStart: "2025-5-12",
      timeStart: "12PM",
      timeEnd: "4PM",
    },
  ]);

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
  }, [meetings]);

  return (
    <div className="detail__meeting__container">
      {meetings.length > 0 ? (
        meetings.map((item, index) => (
          <div
            key={item._id}
            className="detail__meeting__card"
            ref={(el) => (cardRefs.current[index] = el)}
          >
            <div className="detail__meeting__card__heading">
              <h2>{item.title}</h2>
              <i className="fa-regular fa-pen-to-square"></i>
            </div>
            <div className="detail__meeting__card__description">
              <p>{item.desc}</p>
            </div>
            <div className="detail__meeting__card__day__time">
              <div>
                <div className="detail__meeting__card__day__time__day">
                  <i className="fa-solid fa-calendar-days"></i>
                  <p>{item.dateStart}</p>
                </div>
                <div className="detail__meeting__card__day__time__time">
                  <i className="fa-solid fa-clock"></i>
                  <span>{item.timeStart}</span>
                  <span>:</span>
                  <span>{item.timeEnd}</span>
                </div>
              </div>
              <div>
                <img src={meetingIcon} alt="this is icon..."/>
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
