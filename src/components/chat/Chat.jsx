import "./chat.css";

const Chat = () => {
    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Lorem ipsum dolor sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="Phone Icon" />
                    <img src="./video.png" alt="Video Icon" />
                    <img src="./info.png" alt="Info Icon" />
                </div>
            </div>
            <div className="center"></div>
            <div className="bottom">
                <div className="icons">
                    <img src="./img.png" alt="Image Icon" />
                    <img src="./camera.png" alt="Camera Icon" />
                    <img src="./mic.png" alt="Microphone Icon" />
                </div>
                <input type="text" placeholder="Type a message..." />
                <div className="emoji">
                    <img src="./emoji.png" alt="Emoji Icon" />
                </div>
                <button className="sendButton">Send</button>
            </div>
        </div>
    )
}



export default Chat;
