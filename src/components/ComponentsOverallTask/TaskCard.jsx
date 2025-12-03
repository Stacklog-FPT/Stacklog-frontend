import "./TaskCard.scss";

export default function TaskCard({
  percentage,
  title,
  description,
  total,
  avatars,
  buttonText,
  color,
}) {
  return (
    <div className={`task-card task-card--${color}`}>
      <div className="task-card__content">
        <h3 style={{fontSize: 16, color: "#1f2937"}}>Overview of a member's duties</h3>
        <div className="task-card__header">
          <div
            className={`task-card__percentage task-card__percentage--${color}`}
          >
            <svg viewBox="0 0 100 100" className="progress-circle">
              <circle cx="50" cy="50" r="45" className="progress-circle__bg" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-circle__fill"
                style={{
                  strokeDasharray: `${percentage * 2.827} 282.7`,
                }}
              />
            </svg>
            <span className="percentage-text">{percentage}%</span>
          </div>
          <div className="task-card__info">
            <h3 className="task-card__title">{title}</h3>
            <p className="task-card__description">{description}</p>
            <p className="task-card__total">Total: {total}</p>
          </div>
        </div>

        <div className="task-card__footer">
          <div className="task-card__avatars">
              {avatars.map((avatar, idx) => (
                <div key={idx} className="avatar">
                  {typeof avatar === "string" ? (
                    <img src={avatar} alt={`avatar-${idx}`} className="avatar-img" />
                  ) : (
                    avatar
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
