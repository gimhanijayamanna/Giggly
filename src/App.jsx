import { onAuthStateChanged } from "firebase/auth";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { useEffect } from "react";

const App = () => {

    const { currentUser, isLoading, fetchUserInfo } = useUserStore();
    const { chatId, isDetailVisible } = useChatStore();

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, (user) => {
            console.log("Auth state changed:", user); // Debug log
            fetchUserInfo(user?.uid);
        });
        return () => {
            unSub();
        };
    }, [fetchUserInfo]);

    console.log("App render - currentUser:", currentUser, "isLoading:", isLoading); // Debug log

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="container">
            {
                currentUser ? (
                    <>
                        <List />
                        {chatId && <Chat />}
                        {chatId && isDetailVisible && <Detail />}
                    </>
                ) : (
                    <Login />
                )}
            <Notification />
        </div>
    )
}

export default App;