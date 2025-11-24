// Centralized S3 URL helper
export const getS3Url = (s3Key) => {
  if (!s3Key) return null;
  if (s3Key.startsWith('http')) return s3Key;
  
  // Use environment variable or fallback to correct S3 URL format
  const baseUrl = process.env.REACT_APP_S3_BASE_URL || 'https://truetestify.s3.us-east-1.amazonaws.com';
  return `${baseUrl}/${s3Key}`;
};

export default getS3Url;