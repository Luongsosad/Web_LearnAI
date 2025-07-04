import cloudinary from '../config/cloudinary.js';

export function uploadToCloudinary(file, folder = 'orders') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(file.buffer);
  });
}
