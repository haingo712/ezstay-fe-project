// Test script to check Room API directly
// Run in browser console or Node.js

const houseId = 'd35f8c4b-23e5-42cd-b1bb-874f5867047d';
const apiUrl = `http://localhost:5058/api/Rooms/ByHouseId/${houseId}`;

console.log('🔍 Testing Room API...');
console.log('📡 URL:', apiUrl);

fetch(apiUrl)
    .then(res => {
        console.log('📥 Response status:', res.status);
        console.log('📥 Response headers:', res.headers);
        return res.json();
    })
    .then(data => {
        console.log('✅ API Response:', data);
        console.log('📦 Data type:', typeof data);
        console.log('📦 Is array:', Array.isArray(data));

        if (Array.isArray(data) && data.length > 0) {
            console.log('🚪 First room:', data[0]);
            console.log('🖼️ ImageUrl field:', data[0].ImageUrl);
            console.log('🖼️ ImageUrl type:', typeof data[0].ImageUrl);
            console.log('🖼️ Is ImageUrl array:', Array.isArray(data[0].ImageUrl));
        } else if (data && data.value && Array.isArray(data.value)) {
            // OData format
            console.log('📦 OData response detected');
            console.log('🚪 First room:', data.value[0]);
            console.log('🖼️ ImageUrl field:', data.value[0]?.ImageUrl);
        } else {
            console.log('⚠️ Unexpected data format');
        }
    })
    .catch(err => {
        console.error('❌ API Error:', err);
    });
