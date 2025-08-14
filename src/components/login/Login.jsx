import "./login.css";
import { useState } from "react";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });

    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar({
                file,
                url: URL.createObjectURL(file)
            });
        }
    };

    return (
        <div className="login">
            {isLogin ? (
                // Login Section
                <div className="item">
                    <h2>Welcome back</h2>
                    <form>
                        <input type="email" name="email" placeholder="Email" required />
                        <input type="password" name="password" placeholder="Password" required />
                        <button type="submit">Login</button>
                    </form>
                    <div className="switch-text">
                        Don't have an account?
                        <span onClick={() => setIsLogin(false)} className="switch-link">Sign up</span>
                    </div>
                </div>
            ) : (
                // Sign Up Section
                <div className="item">
                    <h2>Create an Account</h2>
                    <form>
                        <label htmlFor="file">
                            <img src={avatar.url || "./avatar.png"} alt="Upload Preview" />
                            Upload an Image
                        </label>
                        <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                        <input type="email" name="email" placeholder="Email" required />
                        <input type="password" name="password" placeholder="Password" required />
                        <button type="submit">Sign Up</button>
                    </form>
                    <div className="switch-text">
                        Already have an account?
                        <span onClick={() => setIsLogin(true)} className="switch-link">Log in</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;