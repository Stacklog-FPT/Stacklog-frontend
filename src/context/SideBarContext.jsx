import { createContext, useState } from "react";

export const SidebarContext = createContext();

const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  console.log(isOpen)
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggleOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;
