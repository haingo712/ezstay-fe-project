// Quick template for face registration in profile
// Copy and adapt from FaceLoginModal.js

// Key differences:
// 1. Use faceLoginService.registerFace() instead of faceLogin()
// 2. Need JWT token (user must be logged in)
// 3. Success → Show "Face registered!" instead of redirecting

// Example usage in profile page:
/*
import FaceRegisterModal from '@/components/FaceRegisterModal';

const [showFaceRegister, setShowFaceRegister] = useState(false);

<button onClick={() => setShowFaceRegister(true)}>
  Register Face for Login
</button>

<FaceRegisterModal 
  isOpen={showFaceRegister}
  onClose={() => setShowFaceRegister(false)}
  onSuccess={() => {
    alert('Face registered successfully!');
    setShowFaceRegister(false);
  }}
/>
*/
