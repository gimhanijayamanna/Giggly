import { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '../lib/cloudinary';

export const useMediaUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);

    const uploadFile = async (file, options = {}) => {
        const {
            maxSizeInMB = 5,
            allowedTypes = ['image/*'],
            onSuccess = () => { },
            onError = () => { }
        } = options;

        // Validate file type
        const isValidType = allowedTypes.some(type => {
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.replace('/*', '/'));
            }
            return file.type === type;
        });

        if (!isValidType) {
            const error = `Please select a valid file type: ${allowedTypes.join(', ')}`;
            toast.error(error);
            onError(error);
            return null;
        }

        // Validate file size
        if (file.size > maxSizeInMB * 1024 * 1024) {
            const error = `File size should be less than ${maxSizeInMB}MB`;
            toast.error(error);
            onError(error);
            return null;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            // Simulate upload progress (Cloudinary doesn't provide real-time progress)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const result = await uploadToCloudinary(file);

            clearInterval(progressInterval);
            setUploadProgress(100);
            setUploadedFile(result);

            toast.success("File uploaded successfully!");
            onSuccess(result);

            return result;
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file. Please try again.");
            onError(error);
            return null;
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setUploadProgress(0);
        setUploading(false);
    };

    return {
        uploading,
        uploadProgress,
        uploadedFile,
        uploadFile,
        resetUpload
    };
};

export const useImageUpload = (options = {}) => {
    const defaultOptions = {
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSizeInMB: 5,
        ...options
    };

    return useMediaUpload(defaultOptions);
};

export const useAvatarUpload = () => {
    return useImageUpload({
        maxSizeInMB: 2,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
};