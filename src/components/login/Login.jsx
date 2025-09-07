import "./login.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { uploadToCloudinary } from "../../lib/cloudinary";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });
    const [uploading, setUploading] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleAvatar = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }

            // Show preview immediately
            setAvatar({
                file,
                url: URL.createObjectURL(file)
            });

            try {
                setUploading(true);

                // Upload to Cloudinary using utility function
                const uploadResult = await uploadToCloudinary(file);

                // Update avatar state with Cloudinary URL
                setAvatar(prev => ({
                    ...prev,
                    url: uploadResult.url
                }));

                console.log("Image uploaded successfully:", uploadResult.url);

            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Failed to upload image. Please try again.");
                // Reset avatar on error
                setAvatar({
                    file: null,
                    url: ""
                });
            } finally {
                setUploading(false);
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("handleRegister called"); // Debug: Check if function is called
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        // Check if user selected an avatar but it's still uploading
        if (avatar.file && uploading) {
            toast.error("Please wait for the image to finish uploading");
            setLoading(false);
            return;
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            // Save user data including avatar URL to database
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: avatar.url || "", // Save the Cloudinary URL or empty string if no avatar
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: []
            });

            toast.success("Account created successfully! Please log in.");
            console.log("User registered with avatar URL:", avatar.url);

            // Reset form and avatar state
            setAvatar({
                file: null,
                url: ""
            });
            e.target.reset();

            // Redirect to login page after successful signup
            setTimeout(() => {
                setIsLogin(true);
            }, 1500); // Small delay to let user see the success message

        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back!");
            // Navigation will be handled by the auth state change
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            {isLogin ? (
                // Login Section
                <div className="item">
                    <img src="./Giggly.png" alt="Giggly Logo" className="logo" />
                    <h2>Welcome back</h2>
                    <form onSubmit={handleLogin}>
                        <input type="email" name="email" placeholder="Email" required disabled={loading} />
                        <input type="password" name="password" placeholder="Password" required disabled={loading} />
                        <button type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                    <div className="switch-text">
                        Don't have an account?
                        <span
                            onClick={() => !loading && setIsLogin(false)}
                            className={`switch-link ${loading ? 'disabled' : ''}`}
                        >
                            Sign up
                        </span>
                    </div>
                </div>
            ) : (
                // Sign Up Section
                <div className="item">
                    <img src="./Giggly.png" alt="Giggly Logo" className="logo" />
                    <h2>Create an Account</h2>
                    <form onSubmit={handleRegister}>
                        <label htmlFor="file">
                            <img src={avatar.url || "./avatar.png"} alt="Upload Preview" />
                            {uploading ? "Uploading..." : "Upload an Image"}
                        </label>
                        <input
                            type="file"
                            id="file"
                            style={{ display: "none" }}
                            onChange={handleAvatar}
                            accept="image/*"
                            disabled={uploading || loading}
                        />
                        <input type="text" name="username" placeholder="Username" required disabled={loading} />
                        <input type="email" name="email" placeholder="Email" required disabled={loading} />
                        <input type="password" name="password" placeholder="Password" required disabled={loading} />
                        <button type="submit" disabled={uploading || loading}>
                            {loading ? "Creating Account..." : uploading ? "Please wait..." : "Sign Up"}
                        </button>
                    </form>
                    <div className="switch-text">
                        Already have an account?
                        <span
                            onClick={() => !loading && setIsLogin(true)}
                            className={`switch-link ${loading ? 'disabled' : ''}`}
                        >
                            Log in
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;