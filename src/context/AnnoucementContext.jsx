import { createContext, useState } from "react";

export const AnnouncementContext = createContext();

export const AnnouncementProvider = ({ children }) => {
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(false);

  const toggleAnnouncement = () => {
    setIsAnnouncementVisible((prev) => !prev);
  };

  return (
    <AnnouncementContext.Provider
      value={{ isAnnouncementVisible, toggleAnnouncement }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};
