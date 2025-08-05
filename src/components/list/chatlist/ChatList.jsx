import { useState } from "react";
import "./chatlist.css";

const ChatList = () => {
    const [addMode, setAddMode] = useState(false);
    return (
        <div className="chatlist">
            <div className="search">
                <div className="searchbar">
                    <img src="./search.png" alt="Search Icon" />
                    <input type="text" placeholder="Search" />
                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="add" className="add" onClick={() => setAddMode((prev) => !prev)} />
            </div>
            <div className="chatItems">
                <div className="item">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Hello</p>
                    </div>
                </div>
                <div className="item">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Hello</p>
                    </div>
                </div>
                <div className="item">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Hello</p>
                    </div>
                </div>
                <div className="item">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Hello</p>
                    </div>
                </div>
                <div className="item">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Hello</p>
                    </div>
                </div>
                <div className="item">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Hello</p>
                    </div>
                </div>
                <div className="item">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Hello</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatList;