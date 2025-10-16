// Debug utility for chat authentication
// Paste this in browser console to debug token issues

function debugChatAuth() {
  console.log('=== Chat Authentication Debug ===');
  
  // Check all possible token locations
  const tokens = {
    authToken: localStorage.getItem('authToken'),
    ezstay_token: localStorage.getItem('ezstay_token'),
    token: localStorage.getItem('token')
  };
  
  console.log('Available tokens:', tokens);
  
  // Find the active token
  const activeToken = tokens.authToken || tokens.ezstay_token || tokens.token;
  
  if (activeToken) {
    console.log('Active token found:', activeToken.substring(0, 20) + '...');
    
    // Try to decode JWT (basic decode, not verification)
    try {
      const payload = JSON.parse(atob(activeToken.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expiry:', new Date(payload.exp * 1000));
      console.log('Is token expired?:', Date.now() > payload.exp * 1000);
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
    
    // Test API call
    fetch('https://localhost:7000/api/Chat?postId=79e5a7b3-dafa-4a5f-b410-5300d501ec5b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
      }
    })
    .then(response => {
      console.log('API Test Result:', response.status, response.statusText);
      if (response.status === 401) {
        console.error('Token is invalid or expired');
      }
      return response.text();
    })
    .then(text => {
      console.log('API Response:', text);
    })
    .catch(error => {
      console.error('API Test Error:', error);
    });
    
  } else {
    console.error('No authentication token found');
    console.log('Available localStorage keys:', Object.keys(localStorage));
  }
}

// Auto-run debug
debugChatAuth();