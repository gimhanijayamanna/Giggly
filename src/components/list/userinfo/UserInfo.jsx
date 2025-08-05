import "./userinfo.css";

const UserInfo = () => {
    return (
        <div className="userinfo">
            <div className="user">
                <img src="./avatar.png" alt="User Avatar" />
                <h2>Gimhani</h2>
            </div>
            <div className="icons">
                <img src="./more.png" alt="More Options" />
                <img src="./video.png" alt="Video Call" />
                <img src="./edit.png" alt="Edit Profile" />
            </div>
        </div>
    )
}

export default UserInfo;