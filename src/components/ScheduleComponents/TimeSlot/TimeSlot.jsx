const TimeSlot = ({ isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: isActive ? "#b3cec9" : "#e5e5e5",
        height: "100%",
        width: "100%",
        borderRadius: "6px",
        transition: "all 0.3s",
        cursor: isActive ? "pointer" : "default",
      }}
    ></div>
  );
};

export default TimeSlot;
