import { onAuthStateChanged } from "firebase/auth";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import EditProfile from "./components/editProfile/EditProfile";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { useEffect, useState } from "react";

const App = () => {

    const { currentUser, isLoading, fetchUserInfo } = useUserStore();
    const {
        chatId,
        isDetailVisible,
        currentView,
        isEditProfileVisible,
        setCurrentView,
        hideEditProfile
    } = useChatStore();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, (user) => {
            console.log("Auth state changed:", user); // Debug log
            fetchUserInfo(user?.uid);
        });
        return () => {
            unSub();
        };
    }, [fetchUserInfo]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setCurrentView('list');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setCurrentView]);

    console.log("App render - currentUser:", currentUser, "isLoading:", isLoading); // Debug log

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className={`container ${isMobile ? 'mobile' : ''}`}>
            {
                currentUser ? (
                    <>
                        {/* Desktop view */}
                        {!isMobile && (
                            <>
                                <List />
                                {chatId && <Chat />}
                                {chatId && isDetailVisible && <Detail />}
                            </>
                        )}

                        {/* Mobile/Tablet view */}
                        {isMobile && (
                            <>
                                {currentView === 'list' && <List />}
                                {currentView === 'chat' && chatId && <Chat />}
                                {/* Detail popup for mobile */}
                                {chatId && isDetailVisible && <Detail />}
                            </>
                        )}

                        {/* Edit Profile Modal */}
                        {isEditProfileVisible && <EditProfile onClose={hideEditProfile} />}
                    </>
                ) : (
                    <Login />
                )}
            <Notification />
        </div>
    )
}

export default App;