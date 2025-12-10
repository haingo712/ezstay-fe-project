import { jsPDF } from "jspdf";
import "jspdf-autotable";
import notification from '@/utils/notification';

// List of CORS proxies to try (updated with more reliable proxies)
const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Try to load image using our own Next.js API proxy
 * This is the most reliable method as it bypasses all CORS issues
 * @param {string} url - Image URL
 * @returns {Promise<string|null>} Base64 data URL or null if failed
 */
async function loadImageViaApiProxy(url) {
  try {
    // Use our own API route to proxy the image
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    console.log('🔄 Trying internal API proxy for:', url.substring(0, 80) + '...');
    
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('✅ Internal API proxy succeeded');
          resolve(reader.result);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
    console.warn('❌ Internal API proxy failed:', response.status);
    return null;
  } catch (error) {
    console.warn('❌ Internal API proxy error:', error.message);
    return null;
  }
}

/**
 * Try to fetch image using fetch API with external CORS proxies
 * @param {string} url - Image URL
 * @returns {Promise<string|null>} Base64 data URL or null if failed
 */
async function fetchImageAsBase64(url) {
  try {
    // Try fetch with cors proxy
    for (const proxyFn of CORS_PROXIES) {
      const proxyUrl = proxyFn(url);
      console.log('🔄 Trying fetch with external proxy:', proxyUrl.substring(0, 80) + '...');
      
      try {
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              console.log('✅ External proxy fetch succeeded');
              resolve(reader.result);
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        }
      } catch (fetchError) {
        console.warn('❌ Fetch failed:', fetchError.message);
      }
    }
    return null;
  } catch (error) {
    console.error('❌ fetchImageAsBase64 error:', error.message);
    return null;
  }
}

/**
 * Convert image URL to base64 data URL
 * Tries multiple methods: internal API proxy, direct load, external CORS proxies
 * @param {string} url - Image URL
 * @returns {Promise<string|null>} Base64 data URL or null if failed
 */
async function urlToBase64(url) {
  if (!url) return null;
  
  // If already base64, return as-is
  if (url.startsWith('data:image/')) {
    return url;
  }
  
  // Skip blob URLs - they won't work across contexts
  if (url.startsWith('blob:')) {
    console.warn('⚠️ Skipping blob URL (not supported):', url.substring(0, 50));
    return null;
  }
  
  console.log('📸 Starting image load for URL:', url.substring(0, 100) + '...');
  
  // Method 1: Try our internal API proxy first (most reliable)
  const apiProxyResult = await loadImageViaApiProxy(url);
  if (apiProxyResult) {
    return apiProxyResult;
  }
  
  // Method 2: Try direct loading (works for same-origin or CORS-enabled URLs)
  const directResult = await loadImageDirect(url);
  if (directResult) {
    console.log('✅ Direct loading succeeded');
    return directResult;
  }
  
  // Method 3: Try CORS proxies with Image element
  const urlsToTry = CORS_PROXIES.map(proxy => proxy(url));
  
  for (const tryUrl of urlsToTry) {
    console.log('🔄 Trying Image element with proxy:', tryUrl.substring(0, 80) + '...');
    
    try {
      const result = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const timeoutId = setTimeout(() => {
          console.warn('⏱️ Timeout for:', tryUrl.substring(0, 50));
          resolve(null);
        }, 15000); // 15 second timeout per attempt
        
        img.onload = () => {
          clearTimeout(timeoutId);
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width || 400;
            canvas.height = img.height || 250;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            console.log('✅ Image element method succeeded');
            resolve(base64);
          } catch (e) {
            console.error('❌ Canvas error:', e.message);
            resolve(null);
          }
        };
        
        img.onerror = (err) => {
          clearTimeout(timeoutId);
          console.warn('❌ Failed to load with Image element');
          resolve(null);
        };
        
        img.src = tryUrl;
      });
      
      if (result) return result;
    } catch (error) {
      console.error('❌ Error in Image element method:', error.message);
    }
  }
  
  // Method 4: Try fetch API with external proxies as last resort
  console.log('🔄 Trying fetch API with external proxies...');
  const fetchResult = await fetchImageAsBase64(url);
  if (fetchResult) {
    return fetchResult;
  }
  
  console.error('❌ All attempts failed for URL:', url.substring(0, 100));
  return null;
}

/**
 * Try to load image directly without proxy (for same-origin or CORS-enabled URLs)
 * @param {string} url - Image URL
 * @returns {Promise<string|null>} Base64 data URL or null if failed
 */
async function loadImageDirect(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      resolve(null);
    }, 8000); // 8 second timeout
    
    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 400;
        canvas.height = img.height || 250;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      } catch (e) {
        resolve(null);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(null);
    };
    
    img.src = url;
  });
}

/**
 * Remove Vietnamese diacritics and convert to ASCII
 * This is needed because jsPDF default fonts don't support Vietnamese characters
 * @param {string} str - String with Vietnamese characters
 * @returns {string} ASCII string without diacritics
 */
function removeVietnameseDiacritics(str) {
  if (!str) return str;
  
  const vietnameseMap = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'đ': 'd', 'Đ': 'D'
  };
  
  return str.split('').map(char => vietnameseMap[char] || char).join('');
}

/**
 * Detect image format from base64 string
 * @param {string} base64String - Base64 encoded image
 * @returns {string} Image format (JPEG, PNG, WEBP, etc.)
 */
function detectImageFormat(base64String) {
  if (!base64String) return 'PNG';
  
  // Check for data URL prefix
  if (base64String.startsWith('data:image/')) {
    if (base64String.includes('data:image/jpeg') || base64String.includes('data:image/jpg')) {
      return 'JPEG';
    } else if (base64String.includes('data:image/png')) {
      return 'PNG';
    } else if (base64String.includes('data:image/webp')) {
      return 'WEBP';
    } else if (base64String.includes('data:image/gif')) {
      return 'GIF';
    }
  }
  
  // Check base64 header bytes (first few characters after base64 prefix)
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // JPEG starts with /9j/ in base64
  if (base64Data.startsWith('/9j/') || base64Data.startsWith('iVBOR')) {
    return base64Data.startsWith('/9j/') ? 'JPEG' : 'PNG';
  }
  
  // Default to PNG for safety (most canvas exports are PNG)
  return 'PNG';
}

/**
 * Generate a complete contract PDF with all terms, conditions, and digital signatures
 * @param {Object} contract - Contract data
 * @param {string} ownerSignature - Owner's digital signature (base64)
 * @param {string} tenantSignature - Tenant's digital signature (base64)
 * @returns {Promise<jsPDF>} PDF document
 */
export async function generateContractPDF(contract, ownerSignature = null, tenantSignature = null) {
  console.log('📄 PDF Generator - Received contract data:', contract);
  console.log('📄 PDF Generator - Contract keys:', Object.keys(contract));
  console.log('📄 PDF Generator - Identity Profiles:', contract.identityProfiles || contract.IdentityProfiles);
  console.log('📄 PDF Generator - Room Details:', contract.roomDetails || contract.RoomDetails);
  console.log('📄 PDF Generator - Electricity Reading:', contract.electricityReading || contract.ElectricityReading);
  console.log('📄 PDF Generator - Water Reading:', contract.waterReading || contract.WaterReading);
  
  // Use signatures from contract data if not provided as parameters
  const finalOwnerSignature = ownerSignature || contract.ownerSignature || contract.OwnerSignature || null;
  const finalTenantSignature = tenantSignature || contract.tenantSignature || contract.TenantSignature || null;
  
  console.log('✍️ PDF Generator - Owner Signature:', finalOwnerSignature ? 'Available' : 'Not available');
  console.log('✍️ PDF Generator - Tenant Signature:', finalTenantSignature ? 'Available' : 'Not available');
  
  const doc = new jsPDF();
  
  console.log('📄 PDF Generator - Full contract object:', JSON.stringify(contract, null, 2));
  
  // Get tenant/owner information from multiple possible sources
  // Try identityProfiles first (array format)
  let identityProfiles = contract.IdentityProfiles || contract.identityProfiles || [];
  
  // Try other possible field names
  if (identityProfiles.length === 0) {
    identityProfiles = contract.tenants || contract.Tenants || 
                       contract.occupants || contract.Occupants ||
                       contract.users || contract.Users ||
                       contract.profiles || contract.Profiles || [];
  }
  
  console.log('👤 Identity Profiles Array Length:', identityProfiles.length);
  console.log('👤 Identity Profiles:', identityProfiles);
  
  if (identityProfiles.length === 0) {
    console.warn('⚠️ WARNING: No identity profiles found in contract!');
    console.warn('⚠️ Available contract keys:', Object.keys(contract));
  }
  
  // IMPORTANT: identityProfiles contains TENANTS ONLY (all people renting/living in the room)
  // CORRECT STRUCTURE FROM BACKEND:
  // identityProfiles[0] = Owner (LESSOR/Party A - người cho thuê)
  // identityProfiles[1] = Primary Tenant (LESSEE/Party B - người thuê chính/đại diện ký)
  // identityProfiles[2...] = Other occupants (người ở cùng)
  
  let ownerInfo = {};
  let primaryTenant = {};
  let otherOccupants = [];
  
  if (identityProfiles.length > 0) {
    // First profile is ALWAYS the owner (LESSOR)
    ownerInfo = identityProfiles[0];
    
    // Second profile (if exists) is the primary tenant (LESSEE)
    if (identityProfiles.length > 1) {
      primaryTenant = identityProfiles[1];
    }
    
    // Remaining profiles are other occupants
    if (identityProfiles.length > 2) {
      otherOccupants = identityProfiles.slice(2);
    }
  }
  
  console.log('👤 Owner (LESSOR/Party A - người cho thuê):', ownerInfo);
  console.log('👤 Primary Tenant (LESSEE/Party B - người thuê chính):', primaryTenant);
  console.log('👤 Other Occupants (người ở cùng):', otherOccupants);
  
  // Get room information first
  const roomDetails = contract.roomDetails || contract.RoomDetails || {};
  
  // Fallback: If ownerInfo is empty from identityProfiles, try contract.owner or roomDetails.owner
  if (Object.keys(ownerInfo).length === 0) {
    ownerInfo = contract.owner || contract.Owner || contract.ownerInfo || contract.OwnerInfo || 
                roomDetails.owner || roomDetails.Owner || {};
  }
  
  console.log('👤 Final Owner info (Lessor/Party A):', ownerInfo);
  console.log('👤 Owner info keys:', Object.keys(ownerInfo || {}));
  console.log('👤 Primary Tenant keys:', Object.keys(primaryTenant || {}));
  
  // Get OWNER information (LESSOR/Party A - Người cho thuê/Chủ nhà)
  const ownerName = ownerInfo.fullName || ownerInfo.FullName || 
                    ownerInfo.name || ownerInfo.Name ||
                    contract.ownerName || contract.OwnerName || 
                    roomDetails.ownerName || roomDetails.OwnerName || '[Owner Name Required]';
  const ownerPhone = ownerInfo.phone || ownerInfo.Phone || 
                     ownerInfo.phoneNumber || ownerInfo.PhoneNumber ||
                     contract.ownerPhone || contract.OwnerPhone || '';
  const ownerEmail = ownerInfo.email || ownerInfo.Email ||
                     contract.ownerEmail || contract.OwnerEmail || '';
  const ownerAddress = ownerInfo.address || ownerInfo.Address ||
                       contract.ownerAddress || contract.OwnerAddress || '';
  const ownerCitizenId = ownerInfo.citizenIdNumber || ownerInfo.CitizenIdNumber ||
                         ownerInfo.citizenId || ownerInfo.CitizenId || '';
  const ownerProvinceName = ownerInfo.provinceName || ownerInfo.ProvinceName || '';
  const ownerWardName = ownerInfo.wardName || ownerInfo.WardName || '';
  const ownerLocation = [ownerWardName, ownerProvinceName].filter(Boolean).join(', ');
  
  console.log('📋 Final Owner Info (Lessor/Party A) - Name:', ownerName, 'Phone:', ownerPhone, 'Email:', ownerEmail);
  
  if (Object.keys(primaryTenant).length === 0) {
    console.warn('⚠️ WARNING: No tenant data found! Party B (Lessee) will show placeholder values.');
  }
  
  // Get dates with proper validation
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      console.error('Error parsing date:', dateStr, e);
      return null;
    }
  };
  
  const checkinDate = parseDate(contract.checkinDate || contract.CheckinDate) || new Date();
  const checkoutDate = parseDate(contract.checkoutDate || contract.CheckoutDate) || new Date();
  const createdAt = parseDate(contract.createdAt || contract.CreatedAt);
  const updatedAt = parseDate(contract.updatedAt || contract.UpdatedAt);
  const canceledAt = parseDate(contract.canceledAt || contract.CanceledAt);
  
  // Get room details (already declared above)
  const roomName = contract.roomName || roomDetails.name || roomDetails.Name || '';
  
  // Get full address from roomDetails or boardingHouse location
  const boardingHouse = contract.boardingHouse || contract.BoardingHouse;
  const houseLocation = boardingHouse?.location || boardingHouse?.Location || roomDetails.location || roomDetails.Location;
  let roomAddress = roomDetails.fullAddress || roomDetails.FullAddress || 
                    roomDetails.address || roomDetails.Address || '';
  
  // If no address in roomDetails, try to get from boardingHouse location
  if (!roomAddress && houseLocation) {
    roomAddress = houseLocation.fullAddress || houseLocation.FullAddress ||
      [houseLocation.addressDetail || houseLocation.AddressDetail,
       houseLocation.communeName || houseLocation.CommuneName,
       houseLocation.districtName || houseLocation.DistrictName,
       houseLocation.provinceName || houseLocation.ProvinceName].filter(Boolean).join(', ');
  }
  
  const roomArea = roomDetails.area || roomDetails.Area || '';
  const maxOccupants = roomDetails.maxOccupants || roomDetails.MaxOccupants || contract.numberOfOccupants || contract.NumberOfOccupants || '';
  
  // Get contract pricing (use RoomPrice from contract, NOT from roomDetails)
  const monthlyRent = contract.roomPrice || contract.RoomPrice || roomDetails.price || roomDetails.Price || 0;
  const depositAmount = contract.depositAmount || contract.DepositAmount || 0;
  
  // Get occupant information
  const numberOfOccupants = contract.numberOfOccupants || contract.NumberOfOccupants || identityProfiles.length || 1;
  
  // Get utility readings if available
  const electricityReading = contract.electricityReading || contract.ElectricityReading || null;
  const waterReading = contract.waterReading || contract.WaterReading || null;
  
  // Header - Vietnam Republic format
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('SOCIALIST REPUBLIC OF VIETNAM', 105, 20, { align: 'center' });
  doc.text('Independence – Freedom – Happiness', 105, 30, { align: 'center' });
  
  // Divider line
  doc.line(75, 35, 135, 35);
  
  // Contract title
  doc.setFontSize(18);
  doc.text('HOUSE LEASE CONTRACT', 105, 50, { align: 'center' });
  
  // Contract basic info
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  let yPos = 70;
  
  doc.text(`Contract No: ${contract.id?.slice(0, 8) || ''}`, 20, yPos);
  yPos += 10;
  if (createdAt) {
    doc.text(`Created Date: ${createdAt.toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 7;
  }
  if (updatedAt && updatedAt.getTime() !== createdAt?.getTime()) {
    doc.text(`Last Updated: ${updatedAt.toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 7;
  }
  const contractStatus = contract.contractStatus || contract.ContractStatus || '';
  if (contractStatus) {
    doc.text(`Status: ${contractStatus}`, 20, yPos);
    yPos += 7;
  }
  if (contractStatus === 'Cancelled' && canceledAt) {
    doc.setTextColor(255, 0, 0);
    doc.text(`Canceled Date: ${canceledAt.toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 7;
    if (contract.reason || contract.Reason) {
      doc.text(`Reason: ${contract.reason || contract.Reason}`, 20, yPos);
      yPos += 7;
    }
    doc.setTextColor(0, 0, 0);
  }
  yPos += 8;
  
  // Parties information
  doc.setFont(undefined, 'bold');
  doc.text('THE CONTRACTING PARTIES:', 20, yPos);
  yPos += 10;
  
  // Party A - LESSOR (Owner/Landlord - Người cho thuê/Chủ nhà)
  doc.setFont(undefined, 'bold');
  doc.text('PARTY A (LESSOR - Owner/Landlord):', 20, yPos);
  yPos += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${removeVietnameseDiacritics(ownerName)}`, 20, yPos);
  yPos += 7;
  if (ownerAddress) {
    doc.text(`Address: ${removeVietnameseDiacritics(ownerAddress)}`, 20, yPos);
    yPos += 7;
  }
  if (ownerLocation) {
    doc.text(`Location: ${removeVietnameseDiacritics(ownerLocation)}`, 20, yPos);
    yPos += 7;
  }
  if (ownerPhone) {
    doc.text(`Phone: ${ownerPhone}`, 20, yPos);
    yPos += 7;
  }
  if (ownerEmail) {
    doc.text(`Email: ${ownerEmail}`, 20, yPos);
    yPos += 7;
  }
  if (ownerCitizenId) {
    doc.text(`Citizen ID: ${ownerCitizenId}`, 20, yPos);
    yPos += 7;
  }
  const ownerId = contract.ownerId || contract.OwnerId;
  if (ownerId) {
    doc.text(`Owner ID: ${ownerId.slice(0, 8)}`, 20, yPos);
    yPos += 7;
  }
  yPos += 3;
  
  // Party B - LESSEE (Tenant/Renter - Người thuê)
  const hasTenantData = Object.keys(primaryTenant).length > 0;
  
  // Get PRIMARY TENANT information (LESSEE/Party B - Người thuê)
  const tenantName = primaryTenant.fullName || primaryTenant.FullName || '[Tenant Name Required]';
  const tenantAddress = primaryTenant.address || primaryTenant.Address || '';
  const tenantPhone = primaryTenant.phone || primaryTenant.Phone || '';
  const tenantEmail = primaryTenant.email || primaryTenant.Email || '';
  const tenantCitizenId = primaryTenant.citizenIdNumber || primaryTenant.CitizenIdNumber || '';
  
  doc.setFont(undefined, 'bold');
  doc.text('PARTY B (LESSEE - Tenant/Renter):', 20, yPos);
  yPos += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${removeVietnameseDiacritics(tenantName)}`, 20, yPos);
  yPos += 7;
  if (tenantAddress) {
    doc.text(`Address: ${removeVietnameseDiacritics(tenantAddress)}`, 20, yPos);
    yPos += 7;
  }
  // Show province and ward if available
  const provinceName = primaryTenant.provinceName || primaryTenant.ProvinceName;
  const wardName = primaryTenant.wardName || primaryTenant.WardName;
  if (provinceName || wardName) {
    const locationText = [wardName, provinceName].filter(Boolean).join(', ');
    doc.text(`Location: ${removeVietnameseDiacritics(locationText)}`, 20, yPos);
    yPos += 7;
  }
  if (tenantPhone) {
    doc.text(`Phone: ${tenantPhone}`, 20, yPos);
    yPos += 7;
  }
  if (tenantEmail) {
    doc.text(`Email: ${tenantEmail}`, 20, yPos);
    yPos += 7;
  }
  if (tenantCitizenId) {
    doc.text(`Citizen ID: ${tenantCitizenId}`, 20, yPos);
    yPos += 7;
  }
  const citizenIdIssuedDate = primaryTenant.citizenIdIssuedDate || primaryTenant.CitizenIdIssuedDate;
  const citizenIdIssuedPlace = primaryTenant.citizenIdIssuedPlace || primaryTenant.CitizenIdIssuedPlace;
  if (citizenIdIssuedDate || citizenIdIssuedPlace) {
    const issuedDateStr = citizenIdIssuedDate ? new Date(citizenIdIssuedDate).toLocaleDateString('en-GB') : '';
    const issuedPlaceStr = citizenIdIssuedPlace ? removeVietnameseDiacritics(citizenIdIssuedPlace) : '';
    if (issuedDateStr && issuedPlaceStr) {
      doc.text(`ID Issued: ${issuedDateStr} at ${issuedPlaceStr}`, 20, yPos);
    } else if (issuedDateStr) {
      doc.text(`ID Issued: ${issuedDateStr}`, 20, yPos);
    } else if (issuedPlaceStr) {
      doc.text(`ID Issued at: ${issuedPlaceStr}`, 20, yPos);
    }
    yPos += 7;
  }
  const dobDate = primaryTenant.dateOfBirth || primaryTenant.DateOfBirth;
  if (dobDate) {
    doc.text(`Date of Birth: ${new Date(dobDate).toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 7;
  }
  
  // Show other occupants if any (người ở cùng) - from identityProfiles[2] onwards
  if (otherOccupants.length > 0) {
    yPos += 3;
    doc.setFont(undefined, 'bold');
    doc.text(`Other Occupants (${otherOccupants.length} person(s)):`, 20, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    otherOccupants.forEach((occupant, index) => {
      const occupantName = occupant.fullName || occupant.FullName || `Occupant ${index + 1}`;
      const occupantCCCD = occupant.citizenIdNumber || occupant.CitizenIdNumber || '';
      const occupantDOB = occupant.dateOfBirth || occupant.DateOfBirth;
      let occupantText = `  ${index + 1}. ${removeVietnameseDiacritics(occupantName)}`;
      if (occupantCCCD) {
        occupantText += ` (CCCD: ${occupantCCCD})`;
      }
      if (occupantDOB) {
        occupantText += ` - DOB: ${new Date(occupantDOB).toLocaleDateString('en-GB')}`;
      }
      doc.text(occupantText, 20, yPos);
      yPos += 6;
    });
  }
  yPos += 8;
  
  // Introduction
  const introText = 'After discussion and mutual understanding, the two parties have agreed to enter into this house lease contract with the following terms and conditions, which both parties pledge to strictly comply with:';
  const introLines = doc.splitTextToSize(introText, 170);
  doc.text(introLines, 20, yPos);
  yPos += introLines.length * 7 + 10;
  
  // Check if we need a new page before Article 1
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  // Article 1: The House for Lease
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 1: THE HOUSE FOR LEASE, PURPOSES OF USE', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const roomDesc = roomDetails.description || roomDetails.Description || '';
  const article1Text = `Party A agrees to lease to Party B the room "${removeVietnameseDiacritics(roomName)}" located at ${removeVietnameseDiacritics(roomAddress)}, managed by EZStay system. The room has an area of ${roomArea} m² and is designed to accommodate a maximum of ${maxOccupants} occupants. ${roomDesc ? 'Room description: ' + removeVietnameseDiacritics(roomDesc) + '. ' : ''}The room is fully furnished with essential equipment and facilities ready for residential use. All equipment and facilities are specifically listed and confirmed in the minutes of handover between the two parties. The leased premises shall be used solely for residential purposes and not for any illegal activities or commercial purposes without prior written consent from Party A.`;
  const article1Lines = doc.splitTextToSize(article1Text, 170);
  doc.text(article1Lines, 20, yPos);
  yPos += article1Lines.length * 7 + 10;
  
  // Check if we need a new page before Article 2
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  // Article 2: Duration of the Lease
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 2: DURATION OF THE LEASE', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const durationMonths = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24 * 30));
  const article2Text = `Duration of the lease: ${durationMonths} months, commencing on ${checkinDate.toLocaleDateString('en-GB')} and ending on ${checkoutDate.toLocaleDateString('en-GB')}. Upon expiration of this term, if both parties wish to continue the lease relationship, they shall negotiate the rental fee and other terms for a new lease contract. Party B will be given priority to sign a new contract for the same premises, provided that Party B has fulfilled all obligations under this contract and there is no violation of the terms herein. Either party wishing to extend must notify the other party in writing at least thirty (30) days prior to the expiration date.`;
  const article2Lines = doc.splitTextToSize(article2Text, 170);
  doc.text(article2Lines, 20, yPos);
  yPos += article2Lines.length * 7 + 10;
  
  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // Article 3: Rental Fee and Payment
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 3: RENTAL FEE, SECURITY DEPOSIT AND PAYMENT METHOD', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  // Display full pricing information
  const article3Text = `Monthly rental fee: ${monthlyRent.toLocaleString()} VND/month. Room area: ${roomArea} m². Maximum occupants: ${maxOccupants} persons. Current number of occupants: ${numberOfOccupants} person(s). Party B shall pay Party A a security deposit of ${depositAmount.toLocaleString()} VND upon signing this contract. This deposit serves as security for Party A against any damages to the property or unpaid bills. The deposit will be returned to Party B within fifteen (15) days after the contract termination, after deducting any outstanding electricity, water, and other utility bills, as well as costs for repairs of damages (if any) caused by Party B during the lease period. Payment method: Party B shall pay the monthly rent to Party A not later than the 5th day of each month. Payment can be made via bank transfer to Party A's designated account or in cash with a receipt. Late payment will incur a penalty of 0.5% of the monthly rent for each day of delay.`;
  const article3Lines = doc.splitTextToSize(article3Text, 170);
  doc.text(article3Lines, 20, yPos);
  yPos += article3Lines.length * 7 + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // Article 4: Utilities and Additional Services
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 4: UTILITIES AND ADDITIONAL SERVICES', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  let utilityInfo = '';
  if (electricityReading || waterReading) {
    utilityInfo = '\n\nINITIAL METER READINGS:\n';
    if (electricityReading) {
      const elecIndex = electricityReading.currentIndex || electricityReading.CurrentIndex || 0;
      const elecPrevIndex = electricityReading.previousIndex || electricityReading.PreviousIndex || 0;
      const elecPrice = electricityReading.price || electricityReading.Price || 0;
      const elecDate = electricityReading.readingDate || electricityReading.ReadingDate;
      const elecConsumption = electricityReading.consumption || electricityReading.Consumption || (elecIndex - elecPrevIndex);
      const elecTotal = electricityReading.total || electricityReading.Total || (elecConsumption * elecPrice);
      const elecNote = electricityReading.note || electricityReading.Note;
      utilityInfo += `- Electricity: ${elecIndex} kWh (Previous: ${elecPrevIndex} kWh, Consumption: ${elecConsumption} kWh)\n`;
      utilityInfo += `  Rate: ${elecPrice.toLocaleString()} VND/kWh, Total: ${elecTotal.toLocaleString()} VND\n`;
      if (elecDate) {
        utilityInfo += `  Reading date: ${new Date(elecDate).toLocaleDateString('en-GB')}\n`;
      }
      if (elecNote && elecNote.trim()) {
        utilityInfo += `  Note: ${elecNote}\n`;
      }
    }
    if (waterReading) {
      const waterIndex = waterReading.currentIndex || waterReading.CurrentIndex || 0;
      const waterPrevIndex = waterReading.previousIndex || waterReading.PreviousIndex || 0;
      const waterPrice = waterReading.price || waterReading.Price || 0;
      const waterDate = waterReading.readingDate || waterReading.ReadingDate;
      const waterConsumption = waterReading.consumption || waterReading.Consumption || (waterIndex - waterPrevIndex);
      const waterTotal = waterReading.total || waterReading.Total || (waterConsumption * waterPrice);
      const waterNote = waterReading.note || waterReading.Note;
      utilityInfo += `- Water: ${waterIndex} m³ (Previous: ${waterPrevIndex} m³, Consumption: ${waterConsumption} m³)\n`;
      utilityInfo += `  Rate: ${waterPrice.toLocaleString()} VND/m³, Total: ${waterTotal.toLocaleString()} VND\n`;
      if (waterDate) {
        utilityInfo += `  Reading date: ${new Date(waterDate).toLocaleDateString('en-GB')}\n`;
      }
      if (waterNote && waterNote.trim()) {
        utilityInfo += `  Note: ${waterNote}\n`;
      }
    }
  }
  const article4Text = `Party B shall be responsible for paying all utility costs including electricity, water, internet, and any other services used during the lease term. Utility charges shall be calculated based on actual consumption according to the meter readings. The cost per unit for electricity and water will be as follows:\n- Electricity: As per the current rate set by EVN (Vietnam Electricity) or as agreed by both parties\n- Water: As per the current rate set by the local water supply company or as agreed by both parties${utilityInfo}\n\nParty B must ensure timely payment of all utility bills. Failure to pay utility bills may result in disconnection of services, for which Party A shall not be held responsible. Party B shall also be responsible for maintaining the cleanliness of the leased premises and common areas.`;
  const article4Lines = doc.splitTextToSize(article4Text, 170);
  doc.text(article4Lines, 20, yPos);
  yPos += article4Lines.length * 7 + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Article 5: Rights and Obligations of Party A
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 5: RIGHTS AND OBLIGATIONS OF PARTY A (LESSOR)', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('1/ Rights of Party A:', 20, yPos);
  yPos += 7;
  
  const partyARights = [
    'To receive the full rental fee on time as agreed in Article 3.',
    'To inspect the leased premises with prior notice to ensure compliance with the contract terms.',
    'To request Party B to repair or compensate for any damages caused by Party B.',
    'To terminate the contract immediately if Party B violates any material terms of this contract.',
    'To increase the rental fee with 60 days prior written notice, but not more than once per year.'
  ];
  
  partyARights.forEach(right => {
    const rightLines = doc.splitTextToSize(right, 165);
    doc.text(rightLines, 25, yPos);
    yPos += rightLines.length * 7 + 3;
  });
  yPos += 5;
  
  doc.text('2/ Obligations of Party A:', 20, yPos);
  yPos += 7;
  
  const partyAObligations = [
    'To ensure that the house is legally owned by Party A and Party A has full rights to lease it.',
    'To hand over the house and all equipment and facilities to Party B in good working condition on the effective date of the contract.',
    'To provide Party B with necessary documents for temporary residence registration if requested.',
    'To ensure Party B\'s full and exclusive use rights of the leased premises during the lease term.',
    'To maintain the structural integrity of the building and conduct necessary major repairs (not caused by Party B).',
    'Not to interfere with Party B\'s peaceful enjoyment of the premises, except as permitted by this contract.',
    'To comply with the rental fee agreement during the lease term, except as provided in Article 5.1.5.',
    'If terminating the contract before its expiration without cause, to return the security deposit and compensate Party B an amount equal to one month\'s rent.',
    'To notify Party B at least sixty (60) days before the contract expiration regarding renewal or termination.'
  ];
  
  partyAObligations.forEach(obligation => {
    const obligationLines = doc.splitTextToSize(obligation, 165);
    doc.text(obligationLines, 25, yPos);
    yPos += obligationLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Article 6: Rights and Obligations of Party B
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 6: RIGHTS AND OBLIGATIONS OF PARTY B (LESSEE)', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('1/ Rights of Party B:', 20, yPos);
  yPos += 7;
  
  const partyBRights = [
    'To use the leased premises fully and exclusively during the lease term.',
    'To receive assistance from Party A for temporary residence registration.',
    'To request Party A to conduct necessary major repairs (not caused by Party B).',
    'To sublet the premises with prior written consent from Party A.',
    'To have peaceful and quiet enjoyment of the premises without unwarranted intrusion from Party A.',
    'To terminate the contract early with 60 days written notice and forfeiture of the security deposit.'
  ];
  
  partyBRights.forEach(right => {
    const rightLines = doc.splitTextToSize(right, 165);
    doc.text(rightLines, 25, yPos);
    yPos += rightLines.length * 7 + 3;
  });
  yPos += 5;

  doc.text('2/ Obligations of Party B:', 20, yPos);
  yPos += 7;
  
  const partyBObligations = [
    'To use the house for residential purposes only, not for illegal or commercial activities.',
    'To pay the rental fee on time according to the agreed method and amount.',
    'To pay all utility costs (electricity, water, internet, etc.) on time as required.',
    'To maintain the leased premises in good condition and conduct minor repairs at own expense.',
    'To compensate for any damage or loss to the property beyond normal wear and tear.',
    'Not to make structural changes or major alterations without written consent from Party A.',
    'To comply with all building rules, regulations, and community standards.',
    'To return the leased premises to Party A in the same condition as received (normal wear and tear excepted) within seven (7) days after contract termination.',
    'To be fully responsible under law for all activities conducted on the leased premises.',
    'Not to engage in or allow any illegal activities, including but not limited to: drug use, gambling, prostitution, or harboring prohibited items.',
    'Not to disturb other residents or neighbors with excessive noise or improper behavior.',
    'To obtain written permission from Party A before keeping pets on the premises.',
    'To allow Party A or authorized representatives to inspect the premises with reasonable notice (at least 24 hours).',
    'To maintain adequate insurance for personal belongings and third-party liability.',
    'To notify Party A immediately of any damages, defects, or necessary repairs to the premises.',
    'Not to assign or transfer this lease agreement without written consent from Party A.'
  ];
  
  partyBObligations.forEach(obligation => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    const obligationLines = doc.splitTextToSize(obligation, 165);
    doc.text(obligationLines, 25, yPos);
    yPos += obligationLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  // Article 7: Security and Safety
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 7: SECURITY, SAFETY, AND FIRE PREVENTION', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article7Clauses = [
    'Party B must strictly comply with fire prevention and fighting regulations. Any use of flammable or explosive materials is strictly prohibited.',
    'Party B is responsible for ensuring security of the leased premises, including locking doors and windows when leaving.',
    'Party B must not overload electrical systems and must use electrical appliances properly and safely.',
    'In case of fire, Party B must immediately notify relevant authorities and Party A, and take necessary measures to prevent fire spread.',
    'Party B is liable for any damages caused by violations of fire safety or security regulations.',
    'Party A shall provide basic fire safety equipment (fire extinguisher, smoke detector) and ensure they are in working condition.',
    'Party B must maintain and properly use all provided safety equipment and notify Party A if replacement is needed.'
  ];
  
  article7Clauses.forEach(clause => {
    const clauseLines = doc.splitTextToSize(clause, 165);
    doc.text(clauseLines, 25, yPos);
    yPos += clauseLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  // Article 8: Privacy and Data Protection
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 8: PRIVACY AND DATA PROTECTION', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article8Text = 'Both parties agree to protect each other\'s personal information and shall not disclose such information to third parties without consent, except as required by law. Party A shall maintain confidentiality of Party B\'s personal data collected during the lease term. Party B consents to Party A collecting and processing personal information solely for the purpose of executing this contract and complying with legal requirements. All personal data shall be handled in accordance with applicable data protection laws and regulations.';
  const article8Lines = doc.splitTextToSize(article8Text, 170);
  doc.text(article8Lines, 20, yPos);
  yPos += article8Lines.length * 7 + 10;

  // Article 9: Maintenance and Repairs
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 9: MAINTENANCE AND REPAIRS', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article9Text = 'Party A shall be responsible for major structural repairs and maintenance of the building, including roof, walls, foundation, and building systems (plumbing, electrical mains). Party B shall be responsible for minor repairs and day-to-day maintenance, including but not limited to: replacement of light bulbs, minor plumbing repairs, cleaning, and general upkeep. Party B must report any defects or damages to Party A within 48 hours of discovery. Party A shall conduct repairs within a reasonable timeframe (typically 7-14 days for non-emergency repairs). For emergency repairs (water leaks, electrical hazards, broken locks), Party A must respond within 24 hours.';
  const article9Lines = doc.splitTextToSize(article9Text, 170);
  doc.text(article9Lines, 20, yPos);
  yPos += article9Lines.length * 7 + 10;

  // Check if we need a new page
  if (yPos > 210) {
    doc.addPage();
    yPos = 20;
  }

  // Article 10: Dispute Resolution
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 10: DISPUTE RESOLUTION', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article10Text = 'Any disputes arising during the implementation of this contract shall be resolved through negotiation and mediation between the two parties in the spirit of cooperation and mutual understanding. If negotiations fail, the parties may seek assistance from local authorities or relevant government agencies for mediation. If mediation is unsuccessful, either party may bring the dispute to the competent People\'s Court in accordance with Vietnamese law. The governing law for this contract shall be the laws of the Socialist Republic of Vietnam.';
  const article10Lines = doc.splitTextToSize(article10Text, 170);
  doc.text(article10Lines, 20, yPos);
  yPos += article10Lines.length * 7 + 10;

  // Article 11: Force Majeure
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 11: FORCE MAJEURE', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const forceMajeureText = 'Force majeure circumstances are defined as events beyond the reasonable control of either party, including but not limited to: natural disasters (earthquakes, floods, typhoons, fires), war, civil unrest, riots, epidemics or pandemics, government orders or regulations, terrorism, or other unforeseen events that prevent contract performance. In case of force majeure:';
  const forceMajeureLines = doc.splitTextToSize(forceMajeureText, 170);
  doc.text(forceMajeureLines, 20, yPos);
  yPos += forceMajeureLines.length * 7 + 7;
  
  const forceMajeureClauses = [
    'The affected party must immediately notify the other party in writing within seven (7) days of the occurrence.',
    'Both parties shall cooperate in good faith to minimize damages and find appropriate alternative solutions.',
    'If the force majeure event lasts more than thirty (30) days, either party may terminate the contract without penalty by giving written notice.',
    'During the force majeure period, obligations under this contract may be suspended without liability for breach.',
    'Rental fees will be prorated for the period when the premises cannot be used due to force majeure.',
    'The security deposit shall be returned to Party B in full within thirty (30) days after termination due to force majeure.',
    'Neither party shall be liable for damages caused by force majeure events.'
  ];
  
  forceMajeureClauses.forEach(clause => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    const clauseLines = doc.splitTextToSize(clause, 165);
    doc.text(clauseLines, 25, yPos);
    yPos += clauseLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  // Article 12: Contract Termination
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 12: UNILATERAL TERMINATION OF THE CONTRACT', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('1/ Party A has the right to unilaterally terminate the contract when Party B:', 20, yPos);
  yPos += 10;
  
  const partyATermination = [
    'Fails to pay rent for two (2) consecutive months despite written reminders.',
    'Deliberately damages the leased premises or equipment.',
    'Uses the premises for illegal activities.',
    'Seriously affects environmental sanitation, fire protection safety, or disturbs neighbors.',
    'Sublets the premises without written consent from Party A.',
    'Makes unauthorized structural changes to the premises.',
    'Violates any material term of this contract after receiving written warning.',
    'Provides false information or documentation during contract execution.'
  ];
  
  partyATermination.forEach(term => {
    if (yPos > 265) {
      doc.addPage();
      yPos = 20;
    }
    const termLines = doc.splitTextToSize(term, 165);
    doc.text(termLines, 25, yPos);
    yPos += termLines.length * 7 + 3;
  });
  yPos += 5;
  
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.text('2/ Party B has the right to unilaterally terminate the contract when Party A:', 20, yPos);
  yPos += 10;
  
  const partyBTermination = [
    'Increases the rental fee in violation of the agreed terms.',
    'Fails to conduct necessary major repairs within reasonable time causing premises to be uninhabitable.',
    'Continuously interferes with Party B\'s peaceful enjoyment of the premises.',
    'Fails to ensure the legal ownership or right to lease the premises.',
    'Violates privacy rights by entering premises without proper notice or consent.',
    'Fails to provide essential services (water, electricity) without valid reason.',
    'Violates any material term of this contract after receiving written notice from Party B.'
  ];
  
  partyBTermination.forEach(term => {
    if (yPos > 265) {
      doc.addPage();
      yPos = 20;
    }
    const termLines = doc.splitTextToSize(term, 165);
    doc.text(termLines, 25, yPos);
    yPos += termLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page
  if (yPos > 210) {
    doc.addPage();
    yPos = 20;
  }

  // Article 13: Contract Amendments
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 13: CONTRACT AMENDMENTS AND MODIFICATIONS', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const article13Text = 'Any amendments, modifications, or supplements to this contract must be made in writing and signed by both parties. Verbal agreements or amendments shall not be legally binding. All amendments shall become appendices to this contract and have the same legal effect as the main contract. Both parties must retain copies of all signed amendments.';
  const article13Lines = doc.splitTextToSize(article13Text, 170);
  doc.text(article13Lines, 20, yPos);
  yPos += article13Lines.length * 7 + 10;

  // Article 14: Notices
  doc.setFont(undefined, 'bold');
  doc.text('ARTICLE 14: NOTICES AND COMMUNICATIONS', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  const noticesText = 'All notices, requests, demands, and communications between the parties shall be made in writing and delivered through the following methods:';
  const noticesLines = doc.splitTextToSize(noticesText, 170);
  doc.text(noticesLines, 20, yPos);
  yPos += noticesLines.length * 7 + 7;
  
  const noticesClauses = [
    'Direct hand delivery with signed acknowledgment receipt.',
    'Registered mail with return receipt to the addresses stated in this contract.',
    'Email to the registered email addresses of both parties (with read receipt confirmation).',
    'Courier service with proof of delivery.',
    'Notices are deemed received: immediately upon hand delivery, three (3) working days after posting if by mail, or upon email read confirmation.',
    'Any change in contact information (address, phone number, email) must be notified to the other party within five (5) working days.',
    'Emergency communications may be made via phone call, but must be followed up with written confirmation within 24 hours.'
  ];
  
  noticesClauses.forEach(clause => {
    if (yPos > 265) {
      doc.addPage();
      yPos = 20;
    }
    const clauseLines = doc.splitTextToSize(clause, 165);
    doc.text(clauseLines, 25, yPos);
    yPos += clauseLines.length * 7 + 3;
  });
  yPos += 10;

  // Check if we need a new page for appendices
  if (yPos > 180) {
    doc.addPage();
    yPos = 20;
  }

  // Appendices Section
  doc.setFont(undefined, 'bold');
  doc.text('APPENDICES', 20, yPos);
  doc.line(20, yPos + 2, 70, yPos + 2);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.text('This contract includes the following appendices as integral parts:', 20, yPos);
  yPos += 10;
  
  let appendix2Text = 'Appendix 2: Initial utility meter readings (electricity, water) with photographs and signatures';
  if (electricityReading || waterReading) {
    appendix2Text += ' - ';
    const details = [];
    if (electricityReading) {
      const elecIndex = electricityReading.currentIndex || electricityReading.CurrentIndex || 0;
      const elecPrice = electricityReading.price || electricityReading.Price || 0;
      details.push(`Electricity: ${elecIndex} kWh @ ${elecPrice} VND/kWh`);
    }
    if (waterReading) {
      const waterIndex = waterReading.currentIndex || waterReading.CurrentIndex || 0;
      const waterPrice = waterReading.price || waterReading.Price || 0;
      details.push(`Water: ${waterIndex} m³ @ ${waterPrice} VND/m³`);
    }
    appendix2Text += details.join(', ');
  }
  
  const appendices = [
    'Appendix 1: Detailed inventory list of furniture and equipment in the leased room with condition assessment',
    appendix2Text,
    'Appendix 3: Room condition inspection report with photographs from multiple angles',
    'Appendix 4: House rules, regulations, and community guidelines',
    'Appendix 5: Payment schedule, bank account details, and accepted payment methods',
    'Appendix 6: Emergency contact information for both parties and relevant authorities',
    'Appendix 7: Copy of Party A\'s property ownership documents',
    'Appendix 8: Copy of Party B\'s identification documents'
  ];
  
  appendices.forEach((appendix, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const appendixLine = `${index + 1}. ${appendix}`;
    const appendixLines = doc.splitTextToSize(appendixLine, 165);
    doc.text(appendixLines, 25, yPos);
    yPos += appendixLines.length * 7 + 3;
  });
  yPos += 10;

  // Final Statement
  doc.setFont(undefined, 'italic');
  const finalStatement = 'The contracting parties hereby acknowledge that they have carefully read, fully understood, and voluntarily agreed to all terms and conditions set forth in this contract and its appendices. Both parties execute this contract in good faith, with clear mind and without any coercion, fraud, or duress. This contract represents the entire agreement between the parties and supersedes any prior oral or written agreements.';
  const finalLines = doc.splitTextToSize(finalStatement, 170);
  
  if (yPos + finalLines.length * 7 > 270) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.text(finalLines, 20, yPos);
  yPos += finalLines.length * 7 + 15;

  // Additional Occupants Information (if more than 1 person)
  if (identityProfiles.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('OCCUPANT INFORMATION', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total number of occupants registered under this contract: ${identityProfiles.length}`, 20, yPos);
    yPos += 10;
    
    identityProfiles.forEach((profile, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const isSigner = profile.IsSigner || profile.isSigner;
      const profileName = profile.FullName || profile.fullName || '';
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${removeVietnameseDiacritics(profileName)}${isSigner ? ' (Primary Signer)' : ''}`, 20, yPos);
      yPos += 7;
      
      doc.setFont(undefined, 'normal');
      const occupantDetails = [];
      
      // Add tenant ID if available
      const tenantId = profile.tenantId || profile.TenantId;
      if (tenantId) {
        occupantDetails.push(`   - Tenant ID: ${tenantId.slice(0, 13)}`);
      }
      
      // Use correct field names from IdentityProfileResponse
      const citizenId = profile.CitizenIdNumber || profile.citizenIdNumber;
      if (citizenId) {
        occupantDetails.push(`   - Citizen ID: ${citizenId}`);
      }
      
      const idIssuedDate = profile.CitizenIdIssuedDate || profile.citizenIdIssuedDate;
      const idIssuedPlace = profile.CitizenIdIssuedPlace || profile.citizenIdIssuedPlace;
      if (idIssuedDate || idIssuedPlace) {
        const issuedDateStr = idIssuedDate ? new Date(idIssuedDate).toLocaleDateString('en-GB') : '';
        const issuedPlaceStr = idIssuedPlace ? removeVietnameseDiacritics(idIssuedPlace) : '';
        if (issuedDateStr && issuedPlaceStr) {
          occupantDetails.push(`   - ID Issued: ${issuedDateStr} at ${issuedPlaceStr}`);
        } else if (issuedDateStr) {
          occupantDetails.push(`   - ID Issued: ${issuedDateStr}`);
        } else if (issuedPlaceStr) {
          occupantDetails.push(`   - ID Issued at: ${issuedPlaceStr}`);
        }
      }
      
      const dob = profile.DateOfBirth || profile.dateOfBirth;
      if (dob) {
        occupantDetails.push(`   - Date of Birth: ${new Date(dob).toLocaleDateString('en-GB')}`);
      }
      
      const phone = profile.Phone || profile.phone || profile.PhoneNumber || profile.phoneNumber;
      if (phone) {
        occupantDetails.push(`   - Phone: ${phone}`);
      }
      
      const email = profile.Email || profile.email;
      if (email) {
        occupantDetails.push(`   - Email: ${email}`);
      }
      
      const address = profile.Address || profile.address;
      if (address) {
        occupantDetails.push(`   - Address: ${removeVietnameseDiacritics(address)}`);
      }
      
      // Add location if available
      const profileProvinceName = profile.ProvinceName || profile.provinceName;
      const profileWardName = profile.WardName || profile.wardName;
      if (profileProvinceName || profileWardName) {
        const locationText = [profileWardName, profileProvinceName].filter(Boolean).join(', ');
        occupantDetails.push(`   - Location: ${removeVietnameseDiacritics(locationText)}`);
      }
      
      // Add temporary residence if different from address
      const tempRes = profile.TemporaryResidence || profile.temporaryResidence;
      if (tempRes && tempRes !== address) {
        occupantDetails.push(`   - Temporary Residence: ${removeVietnameseDiacritics(tempRes)}`);
      }
      
      // Add profile notes if any
      const profileNotes = profile.Notes || profile.notes;
      if (profileNotes && profileNotes.trim()) {
        occupantDetails.push(`   - Notes: ${profileNotes}`);
      }
      
      occupantDetails.forEach(detail => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const detailLines = doc.splitTextToSize(detail, 170);
        doc.text(detailLines, 20, yPos);
        yPos += detailLines.length * 6;
      });
      yPos += 5;
    });
    
    yPos += 5;
  }

  // Contract Notes (if any)
  const contractNotes = contract.notes || contract.Notes;
  if (contractNotes && contractNotes.trim()) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('ADDITIONAL NOTES AND SPECIAL TERMS:', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const notesLines = doc.splitTextToSize(contractNotes, 170);
    doc.text(notesLines, 20, yPos);
    yPos += notesLines.length * 7 + 10;
  }

  // Contract Images (if uploaded)
  const contractImages = contract.contractImage || contract.ContractImage;
  const uploadedAt = contract.contractUploadedAt || contract.ContractUploadedAt;
  if (contractImages && contractImages.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('SCANNED CONTRACT DOCUMENTS:', 20, yPos);
    yPos += 8;
    
    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    doc.text(`Total ${contractImages.length} document image(s) uploaded${uploadedAt ? ' on ' + new Date(uploadedAt).toLocaleDateString('en-GB') : ''}`, 20, yPos);
    yPos += 6;
    
    doc.setFont(undefined, 'normal');
    contractImages.forEach((imageUrl, index) => {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      const shortUrl = imageUrl.length > 80 ? imageUrl.substring(0, 77) + '...' : imageUrl;
      doc.text(`${index + 1}. ${shortUrl}`, 25, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  // Contract Summary Section
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('CONTRACT SUMMARY', 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  // Build summary data only with available values
  const summaryData = [];
  
  if (contract.id) {
    summaryData.push(['Contract ID', contract.id.slice(0, 13)]);
  }
  if (ownerName) {
    summaryData.push(['Owner (Party A)', removeVietnameseDiacritics(ownerName)]);
  }
  if (tenantName) {
    summaryData.push(['Tenant (Party B)', removeVietnameseDiacritics(tenantName)]);
  }
  if (roomName) {
    summaryData.push(['Room', removeVietnameseDiacritics(roomName)]);
  } else {
    // Fallback to Room ID if room name not available
    const roomId = contract.roomId || contract.RoomId;
    if (roomId) {
      summaryData.push(['Room ID', roomId.slice(0, 13)]);
    }
  }
  summaryData.push(['Monthly Rent', `${monthlyRent.toLocaleString()} VND`]);
  summaryData.push(['Deposit', `${depositAmount.toLocaleString()} VND`]);
  summaryData.push(['Duration', `${Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24))} days`]);
  summaryData.push(['Check-in', checkinDate.toLocaleDateString('en-GB')]);
  summaryData.push(['Check-out', checkoutDate.toLocaleDateString('en-GB')]);
  summaryData.push(['Occupants', `${numberOfOccupants} person(s)`]);
  summaryData.push(['Status', contractStatus]);
  if (createdAt) {
    summaryData.push(['Created', createdAt.toLocaleDateString('en-GB')]);
  }
  
  // Add utility totals if available
  if (electricityReading) {
    const elecTotal = electricityReading.total || electricityReading.Total || 0;
    if (elecTotal > 0) {
      summaryData.push(['Initial Electricity Bill', `${elecTotal.toLocaleString()} VND`]);
    }
  }
  if (waterReading) {
    const waterTotal = waterReading.total || waterReading.Total || 0;
    if (waterTotal > 0) {
      summaryData.push(['Initial Water Bill', `${waterTotal.toLocaleString()} VND`]);
    }
  }
  
  summaryData.forEach(([label, value]) => {
    if (yPos > 275) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 25, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(value, 85, yPos);
    yPos += 7;
  });
  yPos += 10;

  // Signatures Section
  doc.addPage();
  yPos = 20;
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('SIGNATURES OF THE PARTIES', 105, yPos, { align: 'center' });
  doc.line(20, yPos + 3, 190, yPos + 3);
  yPos += 15;
  
  // Date and place of signing
  doc.setFont(undefined, 'italic');
  doc.setFontSize(11);
  const signingDate = new Date().toLocaleDateString('en-GB');
  yPos += 15;
  
  // Create two columns for signatures
  // PARTY A (LESSOR) = Owner = Người cho thuê (bên trái)
  // PARTY B (LESSEE) = Tenant = Người thuê (bên phải)
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('PARTY A (LESSOR)', 55, yPos, { align: 'center' });
  doc.text('PARTY B (LESSEE)', 155, yPos, { align: 'center' });
  yPos += 15;
  
  // Signature image boxes (no name/address above, will show name below)
  const signatureBoxHeight = 40;
  const signatureBoxWidth = 60;
  
  // Owner signature (Party A - Lessor - bên trái)
  doc.rect(25, yPos, signatureBoxWidth, signatureBoxHeight);
  if (finalOwnerSignature) {
    try {
      // Detect image format from base64 string or use auto-detection
      const ownerFormat = detectImageFormat(finalOwnerSignature);
      doc.addImage(finalOwnerSignature, ownerFormat, 27, yPos + 2, signatureBoxWidth - 4, signatureBoxHeight - 4);
    } catch (error) {
      console.error('Error adding owner signature to PDF:', error);
    }
  }
  
  // Tenant signature (Party B - Lessee - bên phải)
  doc.rect(125, yPos, signatureBoxWidth, signatureBoxHeight);
  if (finalTenantSignature) {
    try {
      // Detect image format from base64 string or use auto-detection
      const tenantFormat = detectImageFormat(finalTenantSignature);
      doc.addImage(finalTenantSignature, tenantFormat, 127, yPos + 2, signatureBoxWidth - 4, signatureBoxHeight - 4);
    } catch (error) {
      console.error('Error adding tenant signature to PDF:', error);
    }
  }
  
  yPos += signatureBoxHeight + 10;
  
  // Display names under signatures
  // PARTY A (LESSOR) = Owner name (người cho thuê)
  // PARTY B (LESSEE) = Primary Tenant name (người thuê chính)
  const ownerFinalName = ownerName || '[Owner Name]';
  const tenantFinalName = tenantName || '[Tenant Name]';
  console.log('📝 Signature names - Owner (Lessor/Party A):', ownerFinalName, '| Tenant (Lessee/Party B):', tenantFinalName);
  doc.text(removeVietnameseDiacritics(ownerFinalName), 55, yPos, { align: 'center' });
  doc.text(removeVietnameseDiacritics(tenantFinalName), 155, yPos, { align: 'center' });
  yPos += 7;
  
  // Display signed dates under names
  const ownerSignedAt = contract.ownerSignedAt || contract.OwnerSignedAt;
  const tenantSignedAt = contract.tenantSignedAt || contract.TenantSignedAt;
  
  doc.setFont(undefined, 'italic');
  doc.setFontSize(9);
  if (ownerSignedAt) {
    const ownerSignedDate = new Date(ownerSignedAt);
    doc.text(`Signed: ${ownerSignedDate.toLocaleDateString('en-GB')} ${ownerSignedDate.toLocaleTimeString('en-GB')}`, 55, yPos, { align: 'center' });
  }
  if (tenantSignedAt) {
    const tenantSignedDate = new Date(tenantSignedAt);
    doc.text(`Signed: ${tenantSignedDate.toLocaleDateString('en-GB')} ${tenantSignedDate.toLocaleTimeString('en-GB')}`, 155, yPos, { align: 'center' });
  }
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  yPos += 15;
  
  // Verification note
  if (finalOwnerSignature && finalTenantSignature) {
    doc.setFontSize(9);
    doc.setTextColor(0, 128, 0);
    doc.setFont(undefined, 'italic');
    yPos += 7;
  }

  // ============================================
  // CITIZEN ID CARD IMAGES SECTION (AT THE END)
  // ============================================
  try {
    if (identityProfiles.length > 0) {
      console.log('📸 Processing Citizen ID images at the end of PDF...');
      
      // Check for profiles with images
      const profilesWithImages = identityProfiles.filter(profile => 
        (profile.frontImageUrl || profile.FrontImageUrl || profile.citizenIdFront || profile.CitizenIdFront) || 
        (profile.backImageUrl || profile.BackImageUrl || profile.citizenIdBack || profile.CitizenIdBack)
      );
      
      console.log('📸 Profiles with CCCD images:', profilesWithImages.length);
      
      if (profilesWithImages.length > 0) {
        // New page for Citizen ID section
        doc.addPage();
        yPos = 20;
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('CITIZEN ID CARD IMAGES', 105, yPos, { align: 'center' });
        doc.line(20, yPos + 3, 190, yPos + 3);
        yPos += 15;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        // Process each profile
        for (let index = 0; index < profilesWithImages.length; index++) {
          const profile = profilesWithImages[index];
          const profileName = profile.fullName || profile.FullName || `Person ${index + 1}`;
          
          // Get image URLs
          const frontImageUrl = profile.frontImageUrl || profile.FrontImageUrl || profile.citizenIdFront || profile.CitizenIdFront;
          const backImageUrl = profile.backImageUrl || profile.BackImageUrl || profile.citizenIdBack || profile.CitizenIdBack;
          
          // Determine role label
          let roleLabel = '';
          if (index === 0) {
            roleLabel = ' (Owner/Lessor)';
          } else if (index === 1) {
            roleLabel = ' (Tenant/Lessee)';
          } else {
            roleLabel = ' (Co-occupant)';
          }
          
          // Check if need new page (need space for header + images side by side ~70px)
          if (yPos > 200) {
            doc.addPage();
            yPos = 20;
          }
          
          // Profile header
          doc.setFont(undefined, 'bold');
          doc.setFontSize(11);
          doc.text(`${index + 1}. ${removeVietnameseDiacritics(profileName)}${roleLabel}`, 20, yPos);
          yPos += 6;
          
          // Citizen ID Number
          const citizenId = profile.citizenIdNumber || profile.CitizenIdNumber || '';
          if (citizenId) {
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Citizen ID Number: ${citizenId}`, 20, yPos);
            yPos += 7;
          }
          
          // Image dimensions - side by side layout
          const imgWidth = 85;
          const imgHeight = 54;
          const leftX = 15;      // Left image X position
          const rightX = 105;   // Right image X position
          
          // Load both images in parallel
          let frontBase64 = null;
          let backBase64 = null;
          
          try {
            const [frontResult, backResult] = await Promise.all([
              frontImageUrl ? urlToBase64(frontImageUrl) : Promise.resolve(null),
              backImageUrl ? urlToBase64(backImageUrl) : Promise.resolve(null)
            ]);
            frontBase64 = frontResult;
            backBase64 = backResult;
          } catch (loadError) {
            console.error('❌ Error loading images:', loadError);
          }
          
          // Add labels
          doc.setFont(undefined, 'italic');
          doc.setFontSize(9);
          doc.text('Front side:', leftX, yPos);
          doc.text('Back side:', rightX, yPos);
          yPos += 4;
          
          const imageStartY = yPos;
          
          // Add front image (left side)
          if (frontBase64) {
            try {
              const imgFormat = detectImageFormat(frontBase64);
              doc.addImage(frontBase64, imgFormat, leftX, imageStartY, imgWidth, imgHeight);
              console.log('✅ Front image added to PDF (left)');
            } catch (imgError) {
              console.error('❌ Error adding front image:', imgError);
              doc.setTextColor(150, 150, 150);
              doc.text('[Image error]', leftX, imageStartY + 20);
              doc.setTextColor(0, 0, 0);
            }
          } else if (frontImageUrl) {
            doc.setTextColor(100, 100, 100);
            doc.text('[Not available]', leftX, imageStartY + 20);
            doc.setTextColor(0, 0, 0);
          }
          
          // Add back image (right side)
          if (backBase64) {
            try {
              const imgFormat = detectImageFormat(backBase64);
              doc.addImage(backBase64, imgFormat, rightX, imageStartY, imgWidth, imgHeight);
              console.log('✅ Back image added to PDF (right)');
            } catch (imgError) {
              console.error('❌ Error adding back image:', imgError);
              doc.setTextColor(150, 150, 150);
              doc.text('[Image error]', rightX, imageStartY + 20);
              doc.setTextColor(0, 0, 0);
            }
          } else if (backImageUrl) {
            doc.setTextColor(100, 100, 100);
            doc.text('[Not available]', rightX, imageStartY + 20);
            doc.setTextColor(0, 0, 0);
          }
          
          // Move Y position after images
          yPos = imageStartY + imgHeight + 10;
        }
      }
    }
  } catch (citizenIdError) {
    console.error('❌ Error in Citizen ID Images section:', citizenIdError);
    // Continue - don't block PDF generation
  }

  // Footer on last page
  doc.setFontSize(9);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(100, 100, 100);
  const footerY = 280;
  doc.text('_______________________________________________________________________________', 105, footerY - 5, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 105, footerY, { align: 'center' });
  doc.text('EZStay - Professional Property Management System', 105, footerY + 5, { align: 'center' });
  doc.text('This is a legally binding document. Please retain for your records.', 105, footerY + 10, { align: 'center' });

  return doc;
}

/**
 * Preview contract PDF - opens in new tab using blob URL (no popup blocker issues)
 */
export async function previewContractPDF(contract, ownerSignature = null, tenantSignature = null) {
  try {
    const doc = await generateContractPDF(contract, ownerSignature, tenantSignature);
    
    // Create blob from PDF
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Try to open in new tab (more reliable than window.open with document.write)
    const newTab = window.open(blobUrl, '_blank');
    
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      // Popup was blocked - fallback to download
      console.warn('⚠️ Popup blocked, falling back to download');
      notification.info('Popup blocked. The PDF will be downloaded instead.');
      
      // Create download link as fallback
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Contract-Preview-${contract.id?.slice(0, 8) || 'unknown'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } else {
      // Successfully opened in new tab
      // Clean up blob URL when the tab is closed (after some time)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000); // Clean up after 1 minute
    }
  } catch (error) {
    console.error('❌ Error previewing PDF:', error);
    notification.error('Failed to preview PDF. Please try downloading instead.');
  }
}

/**
 * Download contract PDF
 */
export async function downloadContractPDF(contract, ownerSignature = null, tenantSignature = null) {
  const doc = await generateContractPDF(contract, ownerSignature, tenantSignature);
  doc.save(`Contract-${contract.id?.slice(0, 8) || 'unknown'}-${new Date().toISOString().split('T')[0]}.pdf`);
}
