import { useState, useEffect } from "react";
import AddUser from "./addUser/AddUser";
import "./chatlist.css";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// Helper function to format timestamp for chat list
const formatChatListTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
        // Show "now" for messages less than 1 hour old
        return 'now';
    } else if (diffInHours < 24) {
        // Show time for messages from today
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (diffInHours < 168) { // Less than a week
        // Show day for messages from this week
        return date.toLocaleDateString([], { weekday: 'short' });
    } else {
        // Show date for older messages
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
};

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState("");

    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();

    useEffect(() => {
        if (!currentUser?.id) return;

        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {/*not uid cus in database its id*/
            const items = res.data().chats;

            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);
                const user = userDocSnap.data();
                return { ...item, user };
            });
            const chatData = await Promise.all(promises);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));/*js sort*/
        });

        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat) => {
        const userchats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });
        const chatIndex = userchats.findIndex((item) => item.chatId === chat.chatId);

        userchats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);
        try {
            await updateDoc(userChatsRef, { chats: userchats });
        } catch (err) {
            console.log(err);
        }

        changeChat(chat.chatId, chat.user);
    }

    const filteredChats = chats.filter(c =>
        c.user.username.toLowerCase().includes(input.toLowerCase())
    );

    return (
        <div className="chatlist">
            <div className="search">
                <div className="searchbar">
                    <img src="./search.png" alt="Search Icon" />
                    <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)} />
                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="add" className="add" onClick={() => setAddMode((prev) => !prev)} />
            </div>
            <div className="chatItems">
                {filteredChats.map((chat) => (
                    <div className="item" key={chat.chatId} onClick={() => handleSelect(chat)}
                        style={{
                            backgroundColor: (!chat?.isSeen && chat?.lastMessage && chat?.lastMessage.trim() !== "" && chatId !== chat.chatId)
                                ? "#5183fe"
                                : "transparent"
                        }}
                    >
                        <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"} alt="" />
                        <div className="texts">
                            <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
                            <p>{chat.lastMessage}</p>
                        </div>
                        <div className="timestamp">
                            <span>{formatChatListTime(chat.updatedAt)}</span>
                        </div>
                    </div>
                ))}
                {addMode && <AddUser onClose={() => setAddMode(false)} existingChats={chats} />}
            </div>
        </div>
    )
}

export default ChatList;