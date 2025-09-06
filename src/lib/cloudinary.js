// Cloudinary configuration and utilities
const CLOUDINARY_CONFIG = {
    cloudName: "ddy2j87xc",
    uploadPreset: "Giggly",
    apiUrl: "https://api.cloudinary.com/v1_1/ddy2j87xc/image/upload"
};

export const uploadToCloudinary = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
        formData.append("cloud_name", CLOUDINARY_CONFIG.cloudName);

        const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return {
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes
        };
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
};

export const deleteFromCloudinary = async (publicId) => {
    // Note: Deletion requires server-side implementation for security
    // This is a placeholder for future implementation
    console.warn("Delete functionality requires server-side implementation");
};

export const getOptimizedImageUrl = (url, options = {}) => {
    if (!url) return "";

    const {
        width = 'auto',
        height = 'auto',
        crop = 'fill',
        quality = 'auto',
        format = 'auto'
    } = options;

    // Extract the public ID from the Cloudinary URL
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return url;

    const publicIdWithExtension = urlParts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithExtension.split('.')[0];

    const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;

    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformations}/${publicId}`;
};

export default CLOUDINARY_CONFIG;
