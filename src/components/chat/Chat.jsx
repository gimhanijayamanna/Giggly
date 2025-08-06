import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";

const Chat = () => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");

    const handleEmoji = e => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    }

    console.log(text);
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
            <div className="center">
                <div className="message own">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <span>1 min ago</span>
                    </div>
                </div><div className="message">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <span>1 min ago</span>
                    </div>
                </div><div className="message">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <span>1 min ago</span>
                    </div>
                </div><div className="message own">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div className="message own">
                    <div className="texts">
                        <img src="https://images.pexels.com/photos/33198252/pexels-photo-33198252.jpeg" alt="image" />
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div className="message">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div className="message">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <span>1 min ago</span>
                    </div>
                </div>
                <div className="message">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <span>1 min ago</span>
                    </div>
                </div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <img src="./img.png" alt="Image Icon" />
                    <img src="./camera.png" alt="Camera Icon" />
                    <img src="./mic.png" alt="Microphone Icon" />
                </div>
                <input type="text" placeholder="Type a message..." onChange={e => setText(e.target.value)} value={text} />
                <div className="emoji">
                    <img src="./emoji.png" alt="Emoji Icon" onClick={() => setOpen(prev => !prev)} />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className="sendButton">Send</button>
            </div>
        </div>
    )
}



export default Chat;
