const TimeSlot = ({ isActive }) => {
  return (
    <div
      style={{
        backgroundColor: isActive ? "#b3cec9" : "#e5e5e5",
        height: "100%",
        width: "100%",
        borderRadius: "6px",
        transition: "all 0.3s",
      }}
    ></div>
  );
};

export default TimeSlot;
