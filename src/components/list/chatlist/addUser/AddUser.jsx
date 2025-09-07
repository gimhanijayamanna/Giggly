import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = ({ onClose, existingChats }) => {
    const [user, setuser] = useState(null);
    const { currentUser } = useUserStore();

    const handleSearch = async e => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const username = formData.get("username")

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setuser(querySnapshot.docs[0].data());
            } else {
                console.log("User not found");
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleAdd = async () => {
        // Check if chat already exists with this user
        const existingChat = existingChats.find(chat => chat.user.id === user.id);

        if (existingChat) {
            console.log("Chat already exists with this user");
            alert("You already have a chat with this user!");
            return;
        }

        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        try {
            const newChatRef = doc(chatRef);
            await setDoc(newChatRef, {
                addedAt: serverTimestamp(),
                messages: []
            });

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                })
            });

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                })
            });

            console.log(newChatRef.id);

            // Close the AddUser popup after successfully adding the user
            if (onClose) {
                onClose();
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input type="text" name="username" placeholder="Username" required />
                <button>Search</button>
            </form>
            {user && <div className="user">
                <div className="detail">
                    <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd}>Add User</button>
            </div>}
        </div>
    );
}

export default AddUser;