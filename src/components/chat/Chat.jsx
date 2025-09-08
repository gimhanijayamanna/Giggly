import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { toast } from "react-toastify";

// Helper function to get file icon based on type
const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📋';
    if (fileType.includes('text')) return '📄';
    return '📎';
};

// Helper function to get readable file type
const getFileTypeDisplay = (fileType) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'Word Document';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'Excel Spreadsheet';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'PowerPoint';
    if (fileType.includes('text')) return 'Text File';
    return 'Document';
};

// Helper function to format timestamp
const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        // Show time for messages from today
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (diffInHours < 168) { // Less than a week
        // Show day and time for messages from this week
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
        // Show date for older messages
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

const Chat = () => {
    const [chat, setChat] = useState([]);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: ""
    });
    const [file, setFile] = useState({
        file: null,
        url: "",
        name: "",
        type: ""
    });
    const [uploading, setUploading] = useState(false);
    const [imagePopup, setImagePopup] = useState({
        show: false,
        url: ""
    });

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, toggleDetail, setCurrentView } = useChatStore();

    const endRef = useRef(null);
    const fileInputRef = useRef(null);
    const docFileInputRef = useRef(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const openImagePopup = (imageUrl) => {
        setImagePopup({
            show: true,
            url: imageUrl
        });
    };

    const closeImagePopup = () => {
        setImagePopup({
            show: false,
            url: ""
        });
    };

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

    const handleFile = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Define allowed file types
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                toast.error("Please select a valid document file (PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX)");
                return;
            }

            // Validate file size (max 25MB for documents)
            if (selectedFile.size > 25 * 1024 * 1024) {
                toast.error("File size should be less than 25MB");
                return;
            }

            try {
                setUploading(true);

                // Upload to Cloudinary using utility function
                const uploadResult = await uploadToCloudinary(selectedFile);

                // Set file state with Cloudinary URL
                setFile({
                    file: selectedFile,
                    url: uploadResult.url,
                    name: selectedFile.name,
                    type: selectedFile.type
                });

                console.log("File uploaded successfully:", uploadResult.url);

            } catch (error) {
                console.error("Error uploading file:", error);
                toast.error("Failed to upload file. Please try again.");
                setFile({
                    file: null,
                    url: "",
                    name: "",
                    type: ""
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
        if (text === "" && !img.url && !file.url) return;

        // Check if image or file is still uploading
        if ((img.file && uploading) || (file.file && uploading)) {
            toast.error("Please wait for the upload to finish");
            return;
        }

        try {
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    img: img.url || null,
                    file: file.url ? {
                        url: file.url,
                        name: file.name,
                        type: file.type
                    } : null,
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

                    // Set appropriate last message preview
                    let lastMessage = text;
                    if (img.url) lastMessage = "Image";
                    if (file.url) lastMessage = `📄 ${file.name}`;

                    userChatsData.chats[chatIndex].lastMessage = lastMessage;
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
            setFile({ // Clear the file after sending
                file: null,
                url: "",
                name: "",
                type: ""
            });
            // Reset file inputs to allow selecting the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            if (docFileInputRef.current) {
                docFileInputRef.current.value = "";
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="chat">
            <div className="top">
                {isMobile && (
                    <div className="backButton" onClick={() => setCurrentView('list')}>
                        <img src="./arrowDown.png" alt="Back" style={{ transform: 'rotate(90deg)' }} />
                    </div>
                )}
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                    </div>
                </div>
                <div className="icons">
                    <img
                        src="./info.png"
                        alt="Info Icon"
                        onClick={toggleDetail}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message, index) => (
                    <div
                        className={message.senderId === currentUser.id ? "message own" : "message"}
                        key={index}
                    >
                        <div className="texts">
                            {message.img && (
                                <img
                                    src={message.img}
                                    alt="image"
                                    onClick={() => openImagePopup(message.img)}
                                    style={{ cursor: 'pointer' }}
                                />
                            )}
                            {message.file && (
                                <div className="fileAttachment">
                                    <div className="fileIcon">
                                        {getFileIcon(message.file.type)}
                                    </div>
                                    <div className="fileInfo">
                                        <a
                                            href={message.file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="fileName"
                                        >
                                            {message.file.name}
                                        </a>
                                        <span className="fileType">
                                            {getFileTypeDisplay(message.file.type)}
                                        </span>
                                    </div>
                                    <a
                                        href={message.file.url}
                                        download={message.file.name}
                                        className="downloadBtn"
                                    >
                                        <img src="./downloads.png" alt="Download" style={{ width: '16px', height: '16px' }} />
                                    </a>
                                </div>
                            )}
                            {message.text && <p>{message.text}</p>}
                            <span>{formatMessageTime(message.createdAt)}</span>
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
                    <label htmlFor="docFile">
                        <img src="./attach.png" alt="Attach File Icon" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }} />
                    </label>
                    <input
                        type="file"
                        id="docFile"
                        ref={docFileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFile}
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                        disabled={uploading}
                    />
                </div>
                {img.url && (
                    <div className="imagePreview">
                        <img src={img.url} alt="Preview" />
                        <button
                            className="removeButton"
                            onClick={() => setImg({ file: null, url: "" })}
                        >
                            ✕
                        </button>
                    </div>
                )}
                {file.url && (
                    <div className="filePreview">
                        <span className="fileName">
                            📄 {file.name}
                        </span>
                        <button
                            className="removeButton"
                            onClick={() => setFile({ file: null, url: "", name: "", type: "" })}
                        >
                            ✕
                        </button>
                    </div>
                )}
                <input
                    type="text"
                    placeholder={
                        uploading
                            ? "Uploading file..."
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

            {/* Image Popup */}
            {imagePopup.show && (
                <div className="imagePopup" onClick={closeImagePopup}>
                    <div className="imagePopupContent" onClick={(e) => e.stopPropagation()}>
                        <button className="imagePopupClose" onClick={closeImagePopup}>
                            ×
                        </button>
                        <img src={imagePopup.url} alt="Full size image" />
                    </div>
                </div>
            )}
        </div>
    )
}



export default Chat;
