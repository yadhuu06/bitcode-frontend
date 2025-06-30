
import ImageKit from 'imagekit-javascript';

const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
  authenticationEndpoint: `${import.meta.env.VITE_API_BASE_URL}/api/auth/imagekit/`,
});
console.log("img p k",import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY)
console.log("e-point",import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT)
export default imagekit;
