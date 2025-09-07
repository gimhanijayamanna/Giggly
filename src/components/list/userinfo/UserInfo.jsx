import "./userinfo.css";
import { useState } from "react";
import { useUserStore } from "../../../lib/userStore";
import EditProfile from "../../editProfile/EditProfile";

const UserInfo = () => {
    const { currentUser } = useUserStore();
    const [showEditProfile, setShowEditProfile] = useState(false);

    const handleEditProfile = () => {
        setShowEditProfile(true);
    };

    const handleCloseEditProfile = () => {
        setShowEditProfile(false);
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

            {showEditProfile && (
                <EditProfile onClose={handleCloseEditProfile} />
            )}
        </div>
    )
}

export default UserInfo;