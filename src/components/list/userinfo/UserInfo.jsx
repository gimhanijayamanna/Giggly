import "./userinfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";

const UserInfo = () => {
    const { currentUser } = useUserStore();
    const { toggleEditProfile } = useChatStore();

    const handleEditProfile = () => {
        toggleEditProfile();
    };

    return (
        <div className="userinfo">
            <div className="user">
                <img src={currentUser.avatar || "./avatar.png"} alt="User Avatar" />
                <h2>{currentUser.username}</h2>
            </div>
            <div className="icons">
                <img
                    src="./edit.png"
                    alt="Edit Profile"
                    onClick={handleEditProfile}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </div>
    )
}

export default UserInfo;