import "./detail.css";
import { auth } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useEffect, useState } from "react";

const Detail = () => {
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, changeChat } = useChatStore();
    const { currentUser } = useUserStore();

    const [chatData, setChatData] = useState(null);
    const [sharedPhotos, setSharedPhotos] = useState([]);
    const [sharedFiles, setSharedFiles] = useState([]);
    const [showPhotos, setShowPhotos] = useState(true);
    const [showFiles, setShowFiles] = useState(false);

    // Real-time listeners to detect blocking changes
    useEffect(() => {
        if (!user || !currentUser) return;

        const unsubscribers = [];

        // Listen to the other user's document (to detect if they block us)
        const otherUserUnsub = onSnapshot(doc(db, "users", user.id), (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                const updatedUser = { ...user, blocked: userData.blocked || [] };

                // Update chat state with fresh user data
                changeChat(chatId, updatedUser);
            }
        });
        unsubscribers.push(otherUserUnsub);

        // Listen to current user's document (to detect our own blocking changes)
        const currentUserUnsub = onSnapshot(doc(db, "users", currentUser.id), (doc) => {
            if (doc.exists()) {
                const currentUserData = doc.data();
                const updatedCurrentUser = { ...currentUser, blocked: currentUserData.blocked || [] };

                // Update user store with fresh current user data
                useUserStore.setState({ currentUser: updatedCurrentUser });

                // Recalculate chat state with updated current user
                if (user) {
                    changeChat(chatId, user);
                }
            }
        });
        unsubscribers.push(currentUserUnsub);

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user?.id, currentUser?.id, chatId]);

    // Listen to chat messages to extract shared photos and files
    useEffect(() => {
        if (!chatId) return;

        const unsubscribe = onSnapshot(doc(db, "chats", chatId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setChatData(data);

                if (data.messages) {
                    // Extract photos from messages
                    const photos = data.messages
                        .filter(msg => msg.img)
                        .map((msg, index) => ({
                            id: `photo_${index}`,
                            url: msg.img,
                            timestamp: msg.createdAt,
                            sender: msg.senderId === currentUser.id ? 'You' : user.username
                        }))
                        .reverse(); // Show newest first

                    // Extract files from messages
                    const files = data.messages
                        .filter(msg => msg.file)
                        .map((msg, index) => ({
                            id: `file_${index}`,
                            ...msg.file,
                            timestamp: msg.createdAt,
                            sender: msg.senderId === currentUser.id ? 'You' : user.username
                        }))
                        .reverse(); // Show newest first

                    setSharedPhotos(photos);
                    setSharedFiles(files);
                }
            }
        });

        return () => unsubscribe();
    }, [chatId, currentUser?.id, user?.username]);

    const handleBlock = async () => {
        if (!user || !currentUser) return;

        const userDocRef = doc(db, "users", currentUser.id);

        try {
            // Update the database - the real-time listeners will handle state updates
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id)
            });

        } catch (err) {
            console.error("Error in block operation:", err);
        }
    }

    // Helper function to get file icon
    const getFileIcon = (fileType) => {
        if (!fileType) return '📎';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
        if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📋';
        if (fileType.includes('text')) return '📄';
        return '📎';
    };

    // Helper function to format date
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    // Helper function to download file/image
    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to opening in new tab
            window.open(url, '_blank');
        }
    };

    return (
        <div className="detail">
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h2>{user?.username}</h2>
                <p>{user?.about || "Hey there! I'm using Giggly"}</p>
            </div>
            <div className="scrollableContent">
                <div className="option">
                    <div className="title" onClick={() => setShowPhotos(!showPhotos)} style={{ cursor: 'pointer' }}>
                        <span>Shared Photos ({sharedPhotos.length})</span>
                        <img src={showPhotos ? "./arrowDown.png" : "./arrowUp.png"} alt="" />
                    </div>
                    {showPhotos && (
                        <div className="photos">
                            {sharedPhotos.length === 0 ? (
                                <div className="noItems">
                                    <span>No shared photos yet</span>
                                </div>
                            ) : (
                                sharedPhotos.map((photo) => (
                                    <div className="photoItem" key={photo.id}>
                                        <div className="photoDetail">
                                            <img src={photo.url} alt="Shared photo" />
                                            <div className="photoInfo">
                                                <span className="photoSender">{photo.sender}</span>
                                                <span className="photoDate">{formatDate(photo.timestamp)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(photo.url, `photo_${photo.id}.jpg`)}
                                            className="download"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <img src="./downloads.png" alt="Download" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <div className="option">
                    <div className="title" onClick={() => setShowFiles(!showFiles)} style={{ cursor: 'pointer' }}>
                        <span>Shared Files ({sharedFiles.length})</span>
                        <img src={showFiles ? "./arrowDown.png" : "./arrowUp.png"} alt="" />
                    </div>
                    {showFiles && (
                        <div className="files">
                            {sharedFiles.length === 0 ? (
                                <div className="noItems">
                                    <span>No shared files yet</span>
                                </div>
                            ) : (
                                sharedFiles.map((file) => (
                                    <div className="fileItem" key={file.id}>
                                        <div className="fileDetail">
                                            <div className="fileIconLarge">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <div className="fileInfo">
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="fileName"
                                                >
                                                    {file.name}
                                                </a>
                                                <span className="fileSender">{file.sender}</span>
                                                <span className="fileDate">{formatDate(file.timestamp)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(file.url, file.name)}
                                            className="download"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <img src="./downloads.png" alt="Download" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="buttons">
                <button
                    onClick={handleBlock}
                    disabled={isCurrentUserBlocked}
                    style={{
                        cursor: isCurrentUserBlocked ? 'not-allowed' : 'pointer',
                        opacity: isCurrentUserBlocked ? 0.6 : 1
                    }}
                >
                    {isCurrentUserBlocked
                        ? "You are blocked"
                        : isReceiverBlocked
                            ? "Unblock User"
                            : "Block User"
                    }
                </button>
                <button className="logout" onClick={() => auth.signOut()}>Logout</button>
            </div>
        </div>
    )
}

export default Detail;