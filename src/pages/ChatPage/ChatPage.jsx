import "./ChatPage.scss";
import FeatureChat from "../../components/ChatPageComponents/FeatureChat/FeatureChat";
import ChatWindow from "../../components/ChatPageComponents/ChatWindown/ChatWindow";
import { useParams } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import chatApi from '../../service/ChatService';
import { ChatContext } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthProvider';
import { jwtDecode } from 'jwt-decode';
import { fetchUserById } from '../../service/UserService';

const ChatPage = () => {
  const { boxId } = useParams();
  const dispatch = useDispatch();
  const boxes = useSelector((s) => s.chat?.boxes || []);
  const { setSelectedBox } = useContext(ChatContext);
  const { user } = useAuth();

  // helper to normalize raw server box into UI shape (minimal)
  const normalize = (b) => {
    const id = b._id || b.id || (b.boxChat && b.boxChat.boxChatId) || b.boxId;
    const members = Array.isArray(b.memberIds) && b.memberIds.length
      ? b.memberIds
      : Array.isArray(b.members) && b.members.length
      ? b.members.map((m) => m.userId || m.user_id || m)
      : [];

    // determine display name for personal boxes if missing
    let nameBox = b.name_box || b.name || '';
    const boxType = b.boxType || b.box_type || '';
    if (!nameBox && String(boxType).toUpperCase() === 'PERSONAL') {
      const currentUserId = (() => {
        if (!user?.token) return '';
        try {
          const dec = jwtDecode(user.token);
          return dec.id || dec._id || dec.email || '';
        } catch (e) {
          return '';
        }
      })();
      const other = (Array.isArray(members) && members.find((m) => m !== currentUserId)) || '';
      nameBox = other;
    }

    return {
      id,
      boxChat: {
        boxChatId: id,
        nameBox,
        avaBox: b.ava_box || b.avaBox || b.avatar || null,
      },
      members,
      memberObjects: Array.isArray(b.members) && b.members.length ? b.members : undefined,
      messages: b.messages || [],
      updatedAt: b.updated_at || b.updatedAt || b.created_at || b.createdAt,
      boxType,
    };
  };

  useEffect(() => {
    let mounted = true;
    const service = chatApi();
    const ensureSelect = async () => {
      if (!boxId) return;

      // try to find locally
      let raw = (boxes || []).find((b) => {
        const id = b._id || b.id || (b.boxChat && b.boxChat.boxChatId) || b.boxId;
        return String(id) === String(boxId);
      });

      if (!raw && user?.token) {
        try {
          const fetched = await service.getBoxes(user.token, dispatch);
          if (!mounted) return;
          // fetched may be array or object - handle array
          const list = Array.isArray(fetched) ? fetched : (fetched?.data || fetched || []);
          raw = list.find((b) => {
            const id = b._id || b.id || (b.boxChat && b.boxChat.boxChatId) || b.boxId;
            return String(id) === String(boxId);
          });
        } catch (e) {
          // ignore fetch errors
        }
      }

      if (raw) {
        const normalized = normalize(raw);
        // If PERSONAL and name missing/looks like id, try to enrich using userApi.getUserById
        try {
          const boxType = String(normalized.boxType || '').toUpperCase();
          const nameBox = normalized.boxChat && normalized.boxChat.nameBox;
          const looksLikeId = (s) => typeof s === 'string' && /^[0-9a-f]{6,}$/i.test(s);
          if (boxType === 'PERSONAL' && (!nameBox || looksLikeId(nameBox)) && user?.token) {
            // determine other member id
            const currentUserId = (() => {
              if (!user?.token) return '';
              try {
                const dec = jwtDecode(user.token);
                return dec.id || dec._id || dec.email || '';
              } catch (e) {
                return '';
              }
            })();
            const other = (Array.isArray(normalized.members) && normalized.members.find((m) => m && m !== currentUserId)) || null;
            if (other) {
              try {
                const info = await fetchUserById(user.token, other);
                if (mounted && info) {
                  normalized.boxChat.nameBox = info.full_name || info.email || other;
                  normalized.boxChat.avaBox = info.avatar_link ? `${info.avatar_link}` : normalized.boxChat.avaBox;
                }
              } catch (e) {
                // ignore enrich errors
              }
            }
          }
        } catch (e) {}

        setSelectedBox(normalized);
      }
    };

    ensureSelect();
    return () => {
      mounted = false;
    };
  }, [boxId, boxes, user?.token]);

  return (
    <div className="main__chat__page">
      <ChatWindow />
      <FeatureChat />
    </div>
  );
};

export default ChatPage;
