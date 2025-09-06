import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { toast } from "react-toastify";

const Chat = () => {
    const [chat, setChat] = useState([]);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: ""
    });
    const [uploading, setUploading] = useState(false);

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

    const endRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);

    useEffect(() => {
        if (!chatId) return;

        const unSub = onSnapshot(
            doc(db, "chats", chatId),
            (res) => {
                setChat(res.data());
            }
        );

        return () => {
            unSub();
        };
    }, [chatId]);

    const handleEmoji = e => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    }

    const handleImg = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file");
                return;
            }

            // Validate file size (max 10MB for chat images)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size should be less than 10MB");
                return;
            }

            try {
                setUploading(true);

                // Upload to Cloudinary using utility function
                const uploadResult = await uploadToCloudinary(file);

                // Set image state with Cloudinary URL
                setImg({
                    file,
                    url: uploadResult.url
                });

                console.log("Image uploaded successfully:", uploadResult.url);

            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Failed to upload image. Please try again.");
                setImg({
                    file: null,
                    url: ""
                });
            } finally {
                setUploading(false);
            }
        }
    };

    if (!chatId) {
        return (
            <div className="chat">
                <div className="noChatSelected">
                    <h3>Select a chat to start messaging</h3>
                </div>
            </div>
        );
    }

    const handleSend = async () => {
        if (text === "" && !img.url) return;

        // Check if image is still uploading
        if (img.file && uploading) {
            toast.error("Please wait for the image to finish uploading");
            return;
        }

        try {
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    img: img.url || null,
                    createdAt: new Date()
                })
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async id => {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

                    userChatsData.chats[chatIndex].lastMessage = img.url ? "Image" : text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats
                    });
                }
            });

            setText(""); // Clear the input after sending
            setImg({ // Clear the image after sending
                file: null,
                url: ""
            });
            // Reset file input to allow selecting the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Lorem ipsum dolor sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="Phone Icon" />
                    <img src="./video.png" alt="Video Icon" />
                    <img src="./info.png" alt="Info Icon" />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message, index) => (
                    <div
                        className={message.senderId === currentUser.id ? "message own" : "message"}
                        key={index}
                    >
                        <div className="texts">
                            {message.img && <img src={message.img} alt="image" />}
                            {message.text && <p>{message.text}</p>}
                            {/* <span>{message.createdAt}</span> */}
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="Image Icon" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }} />
                    </label>
                    <input
                        type="file"
                        id="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleImg}
                        accept="image/*"
                        disabled={uploading}
                    />
                    <img src="./mic.png" alt="Microphone Icon" />
                </div>
                {img.url && (
                    <div className="imagePreview" style={{ margin: '0 10px' }}>
                        <img src={img.url} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover' }} />
                        <button
                            onClick={() => setImg({ file: null, url: "" })}
                            style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>
                )}
                <input
                    type="text"
                    placeholder={
                        uploading
                            ? "Uploading image..."
                            : (isCurrentUserBlocked || isReceiverBlocked)
                                ? "Cannot send messages"
                                : "Type a message..."
                    }
                    onChange={e => setText(e.target.value)}
                    value={text}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    disabled={uploading || isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <img src="./emoji.png" alt="Emoji Icon" onClick={() => setOpen(prev => !prev)} />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className="sendButton" onClick={handleSend} disabled={uploading || isCurrentUserBlocked || isReceiverBlocked}>
                    {uploading ? "Uploading..." : "Send"}
                </button>
            </div>
        </div>
    )
}



export default Chat;
