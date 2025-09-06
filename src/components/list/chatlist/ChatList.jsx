import { useState, useEffect } from "react";
import AddUser from "./addUser/AddUser";
import "./chatlist.css";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);

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

    return (
        <div className="chatlist">
            <div className="search">
                <div className="searchbar">
                    <img src="./search.png" alt="Search Icon" />
                    <input type="text" placeholder="Search" />
                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="add" className="add" onClick={() => setAddMode((prev) => !prev)} />
            </div>
            <div className="chatItems">
                {chats.map((chat) => (
                    <div className="item" key={chat.chatId} onClick={() => handleSelect(chat)}
                        style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}
                    >
                        <img src={chat.user.avatar || "./avatar.png"} alt="" />
                        <div className="texts">
                            <span>{chat.user.username}</span>
                            <p>{chat.lastMessage}</p>
                        </div>
                    </div>
                ))}
                {addMode && <AddUser />}
            </div>
        </div>
    )
}

export default ChatList;