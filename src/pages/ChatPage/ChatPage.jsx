import "./ChatPage.scss";
import FeatureChat from "../../components/ChatPageComponents/FeatureChat/FeatureChat";
import ChatWindow from "../../components/ChatPageComponents/ChatWindown/ChatWindow";
const ChatPage = () => {
  return (
    <div className="main__chat__page">
      <ChatWindow />
      <FeatureChat />
    </div>
  );
};

export default ChatPage;
