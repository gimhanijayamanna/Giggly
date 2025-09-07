import "./editProfile.css";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { toast } from "react-toastify";

const EditProfile = ({ onClose }) => {
    const { currentUser, fetchUserInfo } = useUserStore();

    const [formData, setFormData] = useState({
        username: currentUser?.username || "",
        avatar: currentUser?.avatar || "",
        about: currentUser?.about || "Hey there! I'm using Giggly"
    });

    const [avatar, setAvatar] = useState({
        file: null,
        url: currentUser?.avatar || ""
    });

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = async (e) => {
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

                // Upload to Cloudinary
                const uploadResult = await uploadToCloudinary(file);

                // Update avatar state with Cloudinary URL
                setAvatar(prev => ({
                    ...prev,
                    url: uploadResult.url
                }));

                setFormData(prev => ({
                    ...prev,
                    avatar: uploadResult.url
                }));

                console.log("Avatar uploaded successfully:", uploadResult.url);

            } catch (error) {
                console.error("Error uploading avatar:", error);
                toast.error("Failed to upload avatar. Please try again.");
                // Reset avatar on error
                setAvatar({
                    file: null,
                    url: currentUser?.avatar || ""
                });
                setFormData(prev => ({
                    ...prev,
                    avatar: currentUser?.avatar || ""
                }));
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!formData.username.trim()) {
            toast.error("Username is required");
            return;
        }

        if (uploading) {
            toast.error("Please wait for avatar upload to complete");
            return;
        }

        try {
            setSaving(true);

            // Update user document in Firestore
            const userDocRef = doc(db, "users", currentUser.id);
            await updateDoc(userDocRef, {
                username: formData.username.trim(),
                avatar: formData.avatar,
                about: formData.about.trim()
            });

            // Refresh user info in the store
            await fetchUserInfo(currentUser.id);

            toast.success("Profile updated successfully!");
            onClose();

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data
        setFormData({
            username: currentUser?.username || "",
            avatar: currentUser?.avatar || "",
            about: currentUser?.about || "Hey there! I'm using Giggly"
        });
        setAvatar({
            file: null,
            url: currentUser?.avatar || ""
        });
        onClose();
    };

    return (
        <div className="editProfile">
            <div className="overlay" onClick={onClose}></div>
            <div className="modal">
                <div className="header">
                    <h2>Edit Profile</h2>
                    <button className="closeBtn" onClick={onClose}>×</button>
                </div>

                <div className="content">
                    <div className="avatarSection">
                        <div className="avatarPreview">
                            <img src={avatar.url || "./avatar.png"} alt="Avatar Preview" />
                            {uploading && <div className="uploadingOverlay">Uploading...</div>}
                        </div>
                        <label htmlFor="avatarInput" className="changeAvatarBtn">
                            {uploading ? "Uploading..." : "Change Avatar"}
                        </label>
                        <input
                            type="file"
                            id="avatarInput"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            disabled={uploading || saving}
                            style={{ display: "none" }}
                        />
                    </div>

                    <div className="formSection">
                        <div className="inputGroup">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={saving}
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="inputGroup">
                            <label htmlFor="about">About</label>
                            <textarea
                                id="about"
                                name="about"
                                value={formData.about}
                                onChange={handleInputChange}
                                disabled={saving}
                                placeholder="Tell us about yourself..."
                                rows="3"
                                maxLength="150"
                            />
                            <small className="charCount">
                                {formData.about.length}/150 characters
                            </small>
                        </div>

                        <div className="inputGroup">
                            <label>Email</label>
                            <input
                                type="email"
                                value={currentUser?.email || ""}
                                disabled
                                placeholder="Email cannot be changed"
                            />
                        </div>
                    </div>
                </div>

                <div className="footer">
                    <button
                        className="cancelBtn"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        className="saveBtn"
                        onClick={handleSave}
                        disabled={uploading || saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
