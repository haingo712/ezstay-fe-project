"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import contractService from "@/services/contractService";
import roomService from "@/services/roomService";
import otpService from "@/services/otpService";
import imageService from "@/services/imageService";
import serviceService from "@/services/serviceService";
import userService from "@/services/tenantService";
import utilityReadingService, { UtilityType } from "@/services/utilityReadingService";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import api from "@/utils/api";
import { toast } from "react-toastify";
import SignatureCanvas from "@/components/SignatureCanvas";
import { generateContractPDF as generatePDF, previewContractPDF as previewPDF, downloadContractPDF } from "@/utils/contractPDFGenerator";


export default function ContractsManagementPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const houseId = params.id; // Get boarding house ID from URL
  const actionParam = searchParams.get('action');
  const fromRentalRequest = searchParams.get('fromRentalRequest') === 'true';

  // Ref to track if we're loading profiles from backend (edit mode)
  const isLoadingProfilesRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'delete', 'cancel', 'extend', 'uploadImages', 'signature'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Signature Setting states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureStep, setSignatureStep] = useState(1); // 1: signature setting, 2: OTP verification
  const [signatureTab, setSignatureTab] = useState('draw'); // Only 'draw' tab is used
  const [signatureName, setSignatureName] = useState('');
  const [signaturePhone, setSignaturePhone] = useState('');
  const [signaturePreview, setSignaturePreview] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureEmail, setSignatureEmail] = useState(''); // Email for OTP
  const [currentOtpId, setCurrentOtpId] = useState(null); // OTP ID from backend
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [canResendOtp, setCanResendOtp] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Cancel and Extend contract states
  const [cancelReason, setCancelReason] = useState("");
  const [extendDate, setExtendDate] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Upload Contract Images states
  const [contractImages, setContractImages] = useState([]);
  const [contractImagePreviews, setContractImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Utility Reading Management states
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [electricReadings, setElectricReadings] = useState([]);
  const [waterReadings, setWaterReadings] = useState([]);
  const [loadingUtilityReadings, setLoadingUtilityReadings] = useState(false);
  const [showUtilityForm, setShowUtilityForm] = useState(false);
  const [editingUtilityReading, setEditingUtilityReading] = useState(null);
  const [editingUtilityType, setEditingUtilityType] = useState(null); // Track which type is being edited
  // Separate form data for Electric and Water
  const [electricFormData, setElectricFormData] = useState({
    price: '',
    note: '',
    currentIndex: ''
  });
  const [waterFormData, setWaterFormData] = useState({
    price: '',
    note: '',
    currentIndex: ''
  });
  const [savingElectric, setSavingElectric] = useState(false);
  const [savingWater, setSavingWater] = useState(false);
  const [activeUtilityTab, setActiveUtilityTab] = useState('electric'); // 'electric' or 'water'

  // New contract creation states
  const [createStep, setCreateStep] = useState(1); // 1: contract, 2: identity profile, 3: utility readings, 4: services
  const [creatingContract, setCreatingContract] = useState(false);

  // Service states
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Contract form data
  const [contractData, setContractData] = useState({
    roomId: "", // Will be selected
    roomPrice: 0, // Room price - required by backend
    checkinDate: "",
    checkoutDate: "",
    depositAmount: 0,
    numberOfOccupants: 1,
    notes: ""
  });

  // Identity profiles form data - ARRAY for multiple occupants
  const [profiles, setProfiles] = useState([{
    userId: "",
    gender: "Male",
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    gender: "Male", // Default gender
    provinceId: "",
    provinceName: "",
    wardId: "",
    wardName: "",
    address: "",
    temporaryResidence: "",
    citizenIdNumber: "",
    citizenIdIssuedDate: "",
    citizenIdIssuedPlace: "",
    notes: "",
    avatarUrl: "",
    frontImageUrl: "",
    backImageUrl: ""
  }]);

  // Computed getter/setter for backward compatibility with UI form
  const identityProfileData = profiles[0] || {};
  const setIdentityProfileData = (newData) => {
    const newProfiles = [...profiles];
    newProfiles[0] = newData;
    setProfiles(newProfiles);
  };

  const [contractErrors, setContractErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});

  // Utility readings form data
  const [utilityReadingData, setUtilityReadingData] = useState({
    electricityReading: {
      price: "",
      note: "",
      currentIndex: ""
    },
    waterReading: {
      price: "",
      note: "",
      currentIndex: ""
    }
  });
  const [utilityErrors, setUtilityErrors] = useState({});

  // Rooms data
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [currentEditingRoomId, setCurrentEditingRoomId] = useState(null); // Track room ID when editing

  // Address data
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [wardsByProfile, setWardsByProfile] = useState({}); // Store wards for each profile: { profileIndex: [...wards] }
  const [addressLoading, setAddressLoading] = useState(false);
  const [vietnamProvinces, setVietnamProvinces] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && houseId) {
      fetchData();
      fetchRooms();
    }
  }, [authLoading, isAuthenticated, user, houseId]);

  // Load rental request data if coming from rental requests page
  useEffect(() => {
    if (mounted && actionParam === 'create' && fromRentalRequest) {
      console.log('📋 Loading rental request data...');
      try {
        const rentalRequestDataStr = sessionStorage.getItem('rentalRequestData');
        if (rentalRequestDataStr) {
          const rentalRequestData = JSON.parse(rentalRequestDataStr);
          console.log('📋 Rental request data loaded:', rentalRequestData);

          // Pre-fill contract form with rental request data
          setContractData(prev => ({
            ...prev,
            roomId: rentalRequestData.roomId || '',
            roomPrice: rentalRequestData.roomPrice || 0,
            checkinDate: rentalRequestData.checkinDate ? rentalRequestData.checkinDate.split('T')[0] : '',
            checkoutDate: rentalRequestData.checkoutDate ? rentalRequestData.checkoutDate.split('T')[0] : '',
            numberOfOccupants: rentalRequestData.numberOfOccupants || 1,
            notes: ''
          }));

          // If there's tenant profile data from rental request, pre-fill the first profile
          if (rentalRequestData.tenantProfile) {
            const tp = rentalRequestData.tenantProfile;
            console.log('👤 Tenant profile from rental request:', tp);

            // Create tenant profile with data from rental request
            const tenantProfile = {
              fullName: tp.fullName || '',
              gender: tp.gender ?? 0,
              dateOfBirth: tp.dateOfBirth ? new Date(tp.dateOfBirth).toISOString().split('T')[0] : '',
              phone: tp.phone || '',
              email: tp.email || '',
              provinceId: tp.provinceId || '',
              provinceName: tp.provinceName || '',
              wardId: tp.wardId || '',
              wardName: tp.wardName || '',
              address: tp.address || '',
              temporaryResidence: tp.temporaryResidence || '',
              citizenIdNumber: tp.citizenIdNumber || '',
              citizenIdIssuedDate: tp.citizenIdIssuedDate ? new Date(tp.citizenIdIssuedDate).toISOString().split('T')[0] : '',
              citizenIdIssuedPlace: tp.citizenIdIssuedPlace || '',
              frontImageUrl: tp.frontImageUrl || '',
              backImageUrl: tp.backImageUrl || '',
              avatar: tp.avatar || '',
              isRepresentative: true,
              userId: rentalRequestData.tenantUserId || ''
            };

            // Set profiles with tenant profile as first entry
            setProfiles([tenantProfile]);
            console.log('✅ Tenant profile pre-filled from rental request');
          } else if (rentalRequestData.tenantUserId) {
            // Fallback: If no profile data, store tenant ID for later use
            console.log('👤 Tenant user ID from rental request:', rentalRequestData.tenantUserId);
            sessionStorage.setItem('pendingTenantUserId', rentalRequestData.tenantUserId);
          }

          // Open create contract modal
          setShowCreateContractModal(true);
          setModalType('create');
          setCreateStep(1);

          // Clear rental request data from sessionStorage after loading
          sessionStorage.removeItem('rentalRequestData');

          toast.info(t('ownerContracts.toast.rentalRequestLoaded'));
        }
      } catch (error) {
        console.error('❌ Error loading rental request data:', error);
      }
    }
  }, [mounted, actionParam, fromRentalRequest]);

  useEffect(() => {
    // Load provinces data when component mounts
    fetchProvinces();
  }, []);

  // OTP Timer countdown
  useEffect(() => {
    let interval;
    if (signatureStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [signatureStep, otpTimer]);

  // Auto-generate profiles array when numberOfOccupants changes
  // BUT: Don't auto-adjust in Edit mode - user manually manages profiles
  useEffect(() => {
    const count = parseInt(contractData.numberOfOccupants) || 1;
    console.log('👥 Number of Occupants changed:', count);
    console.log('📝 Modal type:', modalType);

    // SKIP auto-adjustment if we're in edit mode and profiles are being loaded from backend
    // This prevents overwriting loaded profile data from backend
    if (modalType === 'edit' && isLoadingProfilesRef.current) {
      console.log('⏭️ SKIPPING profile auto-adjustment - in edit mode with loaded profiles');
      return;
    }

    setProfiles(currentProfiles => {
      console.log('📊 Current profiles before update:', currentProfiles.length);

      // If count hasn't changed, don't update anything to preserve data
      if (currentProfiles.length === count) {
        console.log('✅ Profiles count matches, no change needed - preserving existing data');
        return currentProfiles; // Return SAME reference to prevent re-render
      }

      if (currentProfiles.length < count) {
        // Add more profiles - PRESERVE existing profiles
        const newProfiles = [...currentProfiles];
        for (let i = currentProfiles.length; i < count; i++) {
          newProfiles.push({
            userId: null,
            fullName: '',
            dateOfBirth: '',
            phoneNumber: '',
            email: '',
            gender: 'Male', // Default gender
            provinceId: '',
            provinceName: '',
            wardId: '',
            wardName: '',
            address: '',
            temporaryResidence: '',
            citizenIdNumber: '',
            citizenIdIssuedDate: '',
            citizenIdIssuedPlace: '',
            notes: '',
            avatarUrl: '',
            frontImageUrl: '',
            backImageUrl: ''
          });
        }
        console.log('➕ Adding profiles, new total:', newProfiles.length);
        return newProfiles;
      } else if (currentProfiles.length > count) {
        // Remove excess profiles - PRESERVE remaining profiles
        console.log('➖ Removing profiles, new total:', count);
        return currentProfiles.slice(0, count);
      }

      return currentProfiles;
    });
  }, [contractData.numberOfOccupants, modalType]); // Removed profiles.length to fix React error

  const fetchData = async () => {
    if (!user || !user.id) {
      console.log("❌ No user ID available for fetching contracts");
      return;
    }

    if (!houseId) {
      console.log("❌ No house ID available for fetching contracts");
      return;
    }

    try {
      setLoading(true);
      console.log("📄 Fetching contracts for owner:", user.id);
      console.log("🏠 Current boarding house ID:", houseId);

      // Fetch contracts for this owner (no need to pass user.id since it's from JWT token)
      const contractsResponse = await contractService.getByOwnerId();
      console.log("📄 All contracts fetched:", contractsResponse);

      // Enrich contracts with room information and filter by current house
      const enrichedContracts = await Promise.all(
        (contractsResponse || []).map(async (contract) => {
          try {
            if (contract.roomId) {
              const roomResponse = await roomService.getById(contract.roomId);
              console.log(`🏠 Room info for ${contract.roomId}:`, roomResponse);
              return {
                ...contract,
                roomName: roomResponse?.name || roomResponse?.roomName || 'Unknown Room',
                roomDetails: roomResponse,
                boardingHouseId: roomResponse?.boardingHouseId
              };
            }
            return contract;
          } catch (error) {
            console.error(`❌ Error fetching room ${contract.roomId}:`, error);
            return {
              ...contract,
              roomName: 'Unknown Room'
            };
          }
        })
      );

      // Filter contracts for this specific boarding house
      console.log("🔍 Filtering contracts:");
      console.log("  Current houseId:", houseId, "Type:", typeof houseId);
      enrichedContracts.forEach((contract, idx) => {
        console.log(`  Contract ${idx}: boardingHouseId =`, contract.boardingHouseId, "Type:", typeof contract.boardingHouseId, "Match:", contract.boardingHouseId === houseId);
      });

      const houseContracts = enrichedContracts.filter(contract => {
        const match = String(contract.boardingHouseId) === String(houseId);
        if (!match) {
          console.log(`  ❌ Contract ${contract.id} filtered out: ${contract.boardingHouseId} !== ${houseId}`);
        }
        return match;
      });

      console.log("📄 Total contracts:", enrichedContracts.length);
      console.log("🏠 Contracts for this house:", houseContracts.length);
      console.log("📄 Filtered contracts:", houseContracts);

      // Temporary: Show all contracts if filter returns empty (for debugging)
      if (houseContracts.length === 0 && enrichedContracts.length > 0) {
        console.warn("⚠️ No contracts matched this house - showing all contracts for debugging");
        setContracts(enrichedContracts);
      } else {
        setContracts(houseContracts);
      }

    } catch (error) {
      console.error("❌ Error fetching contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    if (!houseId) {
      console.log("❌ No house ID available for fetching rooms");
      return;
    }

    try {
      setRoomsLoading(true);
      console.log("🏠 Fetching rooms for house ID:", houseId);

      // Fetch rooms for this specific boarding house
      const roomsResponse = await roomService.getByBoardingHouseId(houseId);
      console.log("🏠 Rooms fetched:", roomsResponse);

      // Filter only available rooms (roomStatus = 0)
      // BUT: Include current editing room even if not available
      const availableRooms = (roomsResponse || []).filter(room => {
        const isAvailable = room.roomStatus === 0 ||
          room.roomStatus === "Available" ||
          room.roomStatus?.toLowerCase() === "available";
        const isCurrentEditingRoom = currentEditingRoomId && room.id === currentEditingRoomId;

        return isAvailable || isCurrentEditingRoom;
      });

      console.log("✅ Available rooms filtered:", availableRooms.length, "out of", roomsResponse.length);
      if (currentEditingRoomId) {
        console.log("📌 Including current editing room:", currentEditingRoomId);
      }
      setRooms(availableRooms);

    } catch (error) {
      console.error("❌ Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      setAddressLoading(true);
      console.log("🏛️ Fetching provinces...");

      // Fetch provinces data from public folder
      const response = await fetch('/data/vietnam-provinces.json');
      const provincesData = await response.json();
      console.log("🏛️ Provinces fetched:", provincesData.length);
      console.log("🏛️ First province sample:", provincesData[0]);
      setProvinces(provincesData || []);
      setVietnamProvinces(provincesData || []); // Also set for dependent form

    } catch (error) {
      console.error("❌ Error fetching provinces:", error);
      setProvinces([]);
      setVietnamProvinces([]);
    } finally {
      setAddressLoading(false);
    }
  };

  // Helper function to update a specific profile in the array
  const updateProfile = (profileIndex, field, value) => {
    console.log(`📝 Updating profile ${profileIndex} - ${field}:`, value);
    console.log(`📋 Current profiles array:`, profiles);
    console.log(`📋 Profile BEFORE update:`, profiles[profileIndex]);

    setProfiles(currentProfiles => {
      console.log(`🔄 Inside setProfiles callback - currentProfiles:`, currentProfiles);
      const newProfiles = [...currentProfiles];
      newProfiles[profileIndex] = {
        ...newProfiles[profileIndex],
        [field]: value
      };
      console.log(`✅ Profile ${profileIndex} AFTER update:`, newProfiles[profileIndex]);
      console.log(`✅ New profiles array:`, newProfiles);
      return newProfiles;
    });

    // Clear profile-specific errors
    const errorKey = `profile${profileIndex}_${field}`;
    if (profileErrors[errorKey]) {
      setProfileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Search Identity Profile by Citizen ID (CCCD)
  const [searchingCCCD, setSearchingCCCD] = useState({});

  const searchIdentityProfileByCCCD = async (profileIndex, citizenId) => {
    if (!citizenId || citizenId.trim().length < 9) {
      toast.error(t('ownerContracts.toast.invalidCitizenId'));
      return;
    }

    setSearchingCCCD(prev => ({ ...prev, [profileIndex]: true }));

    try {
      console.log('🔍 Searching User by Citizen ID:', citizenId);
      console.log('🔍 Citizen ID length:', citizenId.length);

      // TEMPORARY: Test direct API call bypassing gateway
      const directApiUrl = `http://localhost:7001/api/Profile/search-cccd/${citizenId}`;
      const gatewayUrl = `/api/Profile/search-cccd/${citizenId}`;

      console.log('🔍 Gateway URL:', gatewayUrl);
      console.log('🔍 Direct API URL:', directApiUrl);

      // Try gateway first
      console.log('📡 Calling via API Gateway...');
      const response = await api.get(gatewayUrl);
      console.log('📦 Full API Response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response value:', response);
      console.log('📦 Response length (if string):', typeof response === 'string' ? response.length : 'N/A');

      // Check for empty response (204 No Content)
      if (!response || response === '' || (typeof response === 'string' && response.trim() === '')) {
        console.log('❌ Empty response - likely 204 No Content or user not found');
        toast.warning(t('ownerContracts.toast.noUserFound') + ' ' + t('ownerContracts.toast.verifyId'));
        return;
      }

      console.log('📦 Response keys:', Object.keys(response || {}));

      // Parse if response is string (API Gateway may return stringified JSON)
      let userData = response;
      if (typeof response === 'string') {
        console.log('⚠️ Response is string, parsing JSON...');
        console.log('📝 String to parse:', response.substring(0, 100)); // First 100 chars
        try {
          userData = JSON.parse(response);
          console.log('✅ Parsed JSON successfully');
        } catch (e) {
          console.error('❌ Failed to parse JSON:', e);
          console.error('❌ Raw response:', response);
          toast.error(t('ownerContracts.toast.invalidResponse'));
          return;
        }
      }

      console.log('📦 userData type:', typeof userData);
      console.log('📦 userData.id:', userData?.id);
      console.log('📦 userData.userId:', userData?.userId);
      console.log('� userData.fullName:', userData?.fullName);

      console.log('🔍 userData assigned:', userData);
      console.log('🔍 Check condition:', !userData, !userData?.id);

      if (!userData || !userData.id) {
        console.log('❌ No user found - userData is null or missing id');
        console.log('❌ userData value:', userData);
        console.log('❌ userData.id value:', userData?.id);
        toast.warning(t('ownerContracts.toast.noUserFound') + ' ' + t('ownerContracts.toast.verifyId'));
        return;
      }

      console.log('✅ Found User:', userData);
      console.log('✅ Full user data:', JSON.stringify(userData, null, 2));

      // Find province to load wards dropdown
      let wardsForProvince = [];
      if (userData.provinceId) {
        const selectedProvince = provinces.find(p => p.code.toString() === userData.provinceId.toString());
        if (selectedProvince) {
          wardsForProvince = selectedProvince.wards || [];
          console.log('🏛️ Found province:', selectedProvince.name, 'with', wardsForProvince.length, 'wards');

          // Update wards dropdown for this profile
          setWardsByProfile(prev => ({
            ...prev,
            [profileIndex]: wardsForProvince
          }));
        }
      }

      // Map backend fields to form fields and auto-fill
      setProfiles(currentProfiles => {
        const newProfiles = [...currentProfiles];
        newProfiles[profileIndex] = {
          ...newProfiles[profileIndex],
          // User ID - Backend returns "id" field, prioritize it
          userId: userData.id || userData.Id || userData.userId || userData.UserId || null,
          // Personal info
          fullName: userData.fullName || userData.FullName || '',
          dateOfBirth: (userData.dateOfBirth || userData.DateOfBirth) ? (userData.dateOfBirth || userData.DateOfBirth).split('T')[0] : '',
          phoneNumber: userData.phone || userData.Phone || '',
          email: userData.email || userData.Email || '',
          gender: userData.gender || userData.Gender || 'Male',
          // Address with names from backend
          provinceId: userData.provinceId || userData.ProvinceId || '',
          provinceName: userData.provinceName || userData.ProvinceName || '',
          wardId: userData.wardId || userData.WardId || '',
          wardName: userData.wardName || userData.WardName || '',
          address: userData.detailAddress || userData.DetailAddress || '',
          temporaryResidence: userData.temporaryResidence || userData.TemporaryResidence || '',
          // Citizen ID - keep the searched value
          citizenIdNumber: userData.citizenIdNumber || userData.CitizenIdNumber || citizenId,
          citizenIdIssuedDate: (userData.citizenIdIssuedDate || userData.CitizenIdIssuedDate) ? (userData.citizenIdIssuedDate || userData.CitizenIdIssuedDate).split('T')[0] : '',
          citizenIdIssuedPlace: userData.citizenIdIssuedPlace || userData.CitizenIdIssuedPlace || '',
          // Images and notes
          avatarUrl: userData.avatar || userData.Avatar || '',
          frontImageUrl: userData.frontImageUrl || userData.FrontImageUrl || '',
          backImageUrl: userData.backImageUrl || userData.BackImageUrl || '',
          notes: userData.bio || userData.Bio || ''
        };

        console.log('✅ Profile auto-filled:', newProfiles[profileIndex]);
        console.log('✅ Full profile data:', JSON.stringify(newProfiles[profileIndex], null, 2));
        return newProfiles;
      });

      toast.success(t('ownerContracts.toast.profileAutoFilled', { name: userData.fullName }));

    } catch (error) {
      console.error('❌ Error searching user:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);

      if (error.response?.status === 404) {
        toast.info(t('ownerContracts.toast.noUserFound'));
      } else if (error.response?.status === 204) {
        toast.warning(t('ownerContracts.toast.noUserFound') + ' ' + t('ownerContracts.toast.idNotInDb'));
      } else if (error.response?.status === 401) {
        toast.error(t('ownerContracts.toast.unauthorized'));
      } else {
        toast.error(t('ownerContracts.toast.searchFailed'));
      }
    } finally {
      setSearchingCCCD(prev => ({ ...prev, [profileIndex]: false }));
    }
  };

  const handleProvinceChange = (profileIndex, provinceCode) => {
    console.log("🏛️ Province selected for profile", profileIndex, ":", provinceCode, "type:", typeof provinceCode);
    console.log("🏛️ Total provinces:", provinces.length);
    console.log("🏛️ First province sample:", provinces[0]);

    // Find selected province and update wards FOR THIS PROFILE
    const selectedProvince = provinces.find(p => {
      const match = p.code.toString() === provinceCode.toString();
      if (match) {
        console.log("✅ Found matching province:", p.name, "code:", p.code);
      }
      return match;
    });

    // Update provinceId AND provinceName in profile
    updateProfile(profileIndex, 'provinceId', provinceCode);
    updateProfile(profileIndex, 'provinceName', selectedProvince?.name || '');
    updateProfile(profileIndex, 'wardId', ''); // Reset ward when province changes
    updateProfile(profileIndex, 'wardName', ''); // Reset ward name

    if (selectedProvince) {
      console.log("🏘️ Setting wards for profile", profileIndex, ":", selectedProvince.wards?.length, "wards");
      setWardsByProfile(prev => {
        const updated = {
          ...prev,
          [profileIndex]: selectedProvince.wards || []
        };
        console.log("🏘️ WardsByProfile updated:", updated);
        return updated;
      });
    } else {
      console.log("❌ Province not found! provinceCode:", provinceCode);
      setWardsByProfile(prev => ({
        ...prev,
        [profileIndex]: []
      }));
    }
  };

  const handleWardChange = (profileIndex, wardCode) => {
    console.log("🏘️ Ward selected for profile", profileIndex, ":", wardCode);

    // Find selected ward from wardsByProfile for this profile
    const wardsForProfile = wardsByProfile[profileIndex] || [];
    const selectedWard = wardsForProfile.find(w => w.code.toString() === wardCode.toString());

    // Update wardId AND wardName in profile
    updateProfile(profileIndex, 'wardId', wardCode);
    updateProfile(profileIndex, 'wardName', selectedWard?.name || '');
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setModalType('view');
    setShowModal(true);
  };
  // Edit Contract - Opens the full 3-step modal with all contract details
  const handleEditContract = async (contract) => {
    console.log(" Opening edit contract modal for:", contract.id);
    console.log("📋 Contract data received:", contract);
    console.log("🏛️ Current provinces state:", provinces.length, "provinces loaded");

    try {
      // Ensure provinces are loaded first
      let currentProvinces = provinces;
      if (provinces.length === 0) {
        console.log("⏳ Provinces not loaded yet, fetching...");
        try {
          const response = await fetch('/data/vietnam-provinces.json');
          const data = await response.json();
          currentProvinces = data || [];
          setProvinces(currentProvinces);
          console.log("✅ Provinces loaded:", currentProvinces.length);
        } catch (err) {
          console.error("❌ Error loading provinces:", err);
        }
      }

      // Fetch full contract details to ensure we have all data
      console.log("🔄 Fetching full contract details...");
      const fullContract = await contractService.getById(contract.id);
      console.log("✅ Full contract data fetched:", fullContract);
      console.log("✅ Full contract JSON:", JSON.stringify(fullContract, null, 2));
      console.log("✅ All keys in fullContract:", Object.keys(fullContract));
      console.log("✅ identityProfiles field:", fullContract.identityProfiles);
      console.log("✅ IdentityProfiles field (PascalCase):", fullContract.IdentityProfiles);

      setSelectedContract(fullContract);

      // Set current editing room ID so it can be included in room dropdown
      const editingRoomId = fullContract.roomId;
      setCurrentEditingRoomId(editingRoomId);
      console.log("🔑 Set current editing room ID:", editingRoomId);

      // Fetch rooms and manually include editing room if needed
      const roomsResponse = await roomService.getByBoardingHouseId(houseId);
      const availableRooms = (roomsResponse || []).filter(room => {
        const isAvailable = room.roomStatus === 0 ||
          room.roomStatus === "Available" ||
          room.roomStatus?.toLowerCase() === "available";
        const isEditingRoom = editingRoomId && room.id === editingRoomId;
        return isAvailable || isEditingRoom;
      });
      console.log("✅ Rooms loaded for edit (including current):", availableRooms.length);
      setRooms(availableRooms);

      // Populate contract data from existing contract
      setContractData({
        tenantId: fullContract.tenantId || "",
        roomId: fullContract.roomId || "",
        roomPrice: fullContract.roomPrice || 0,
        checkinDate: fullContract.checkinDate ? fullContract.checkinDate.split('T')[0] : "",
        checkoutDate: fullContract.checkoutDate ? fullContract.checkoutDate.split('T')[0] : "",
        depositAmount: fullContract.depositAmount || 0,
        numberOfOccupants: fullContract.numberOfOccupants || 1,
        notes: fullContract.notes || ""
      });

      console.log("📝 Contract data populated:", {
        tenantId: fullContract.tenantId,
        roomId: fullContract.roomId,
        checkinDate: fullContract.checkinDate,
        checkoutDate: fullContract.checkoutDate,
        depositAmount: fullContract.depositAmount,
        numberOfOccupants: fullContract.numberOfOccupants
      });

      // Try to get identity profiles from multiple sources
      console.log("🔄 Looking for identity profiles...");
      console.log("📋 contract.identityProfiles:", contract.identityProfiles);
      console.log("📋 fullContract.identityProfiles:", fullContract.identityProfiles);

      // Use identity profiles from contract object (already loaded in list)
      let identityProfiles = contract.identityProfiles || fullContract.identityProfiles || [];

      // If not found, try fetching from dedicated API
      if (!identityProfiles || identityProfiles.length === 0) {
        console.log("🔄 Identity profiles not in contract object, fetching from API...");
        try {
          identityProfiles = await contractService.getIdentityProfiles(contract.id);
          console.log("✅ Identity profiles fetched from API:", identityProfiles);
        } catch (error) {
          console.error("❌ Error fetching identity profiles from API:", error);
          identityProfiles = [];
        }
      }

      console.log("✅ Final identity profiles to use:", identityProfiles);
      console.log("✅ Identity profiles JSON:", JSON.stringify(identityProfiles, null, 2));

      // Populate identity profiles array (support multiple profiles)
      if (identityProfiles && identityProfiles.length > 0) {
        console.log("👤 Identity profiles found:", identityProfiles.length);
        console.log("👤 Raw profile data from backend:", JSON.stringify(identityProfiles, null, 2));
        console.log("👤 First profile keys:", Object.keys(identityProfiles[0]));

        // Map all profiles from backend to frontend format
        // Try both camelCase and PascalCase to handle different API responses
        const mappedProfiles = identityProfiles.map((profile, idx) => {
          console.log(`👤 Mapping profile ${idx}:`, profile);

          return {
            userId: profile.userId || profile.UserId || null,
            fullName: profile.fullName || profile.FullName || "",
            dateOfBirth: (profile.dateOfBirth || profile.DateOfBirth) ? (profile.dateOfBirth || profile.DateOfBirth).split('T')[0] : "",
            phoneNumber: profile.phoneNumber || profile.PhoneNumber || profile.phone || profile.Phone || "",
            email: profile.email || profile.Email || "",
            gender: profile.gender || profile.Gender || "Male",
            provinceId: profile.provinceId || profile.ProvinceId || "",
            provinceName: profile.provinceName || profile.ProvinceName || "",
            wardId: profile.wardId || profile.WardId || "",
            wardName: profile.wardName || profile.WardName || "",
            address: profile.address || profile.Address || "",
            temporaryResidence: profile.temporaryResidence || profile.TemporaryResidence || "",
            citizenIdNumber: profile.citizenIdNumber || profile.CitizenIdNumber || "",
            citizenIdIssuedDate: (profile.citizenIdIssuedDate || profile.CitizenIdIssuedDate) ? (profile.citizenIdIssuedDate || profile.CitizenIdIssuedDate).split('T')[0] : "",
            citizenIdIssuedPlace: profile.citizenIdIssuedPlace || profile.CitizenIdIssuedPlace || "",
            notes: profile.notes || profile.Notes || "",
            // Avatar is returned as 'avatar' field from backend response (mapped from AvatarUrl in backend)
            avatarUrl: profile.avatar || profile.Avatar || profile.avatarUrl || profile.AvatarUrl || "",
            frontImageUrl: profile.frontImageUrl || profile.FrontImageUrl || "",
            backImageUrl: profile.backImageUrl || profile.BackImageUrl || ""
          };
        });

        console.log("✅ Mapped profiles result:", JSON.stringify(mappedProfiles, null, 2));

        setProfiles(mappedProfiles);
        isLoadingProfilesRef.current = true; // Mark that we've loaded profiles from backend
        console.log("✅ Profiles populated:", mappedProfiles.length, "profile(s)");

        // Load wards for ALL profiles that have provinceId
        // Use currentProvinces (fetched above) instead of provinces state which might be stale
        const newWardsByProfile = {};
        mappedProfiles.forEach((profile, index) => {
          if (profile.provinceId) {
            const provinceCode = parseInt(profile.provinceId);
            const selectedProvince = currentProvinces.find(p => p.code === provinceCode);
            if (selectedProvince) {
              newWardsByProfile[index] = selectedProvince.wards || [];
              console.log(`🏘️ Wards loaded for profile ${index} province ${provinceCode}:`, selectedProvince.wards?.length, "wards");
            } else {
              console.log(`❌ Province ${provinceCode} not found in currentProvinces (${currentProvinces.length} provinces)`);
            }
          }
        });
        setWardsByProfile(newWardsByProfile);
        console.log("🏘️ WardsByProfile set for all profiles:", newWardsByProfile);
      } else {
        console.log("⚠️ No identity profiles found for this contract");
        // Generate empty profiles based on numberOfOccupants
        const emptyProfiles = [];
        const occupantCount = fullContract.numberOfOccupants || 1;
        for (let i = 0; i < occupantCount; i++) {
          emptyProfiles.push({
            userId: null,
            fullName: "",
            dateOfBirth: "",
            phoneNumber: "",
            email: "",
            gender: "Male", // Default gender
            provinceId: "",
            provinceName: "",
            wardId: "",
            wardName: "",
            address: "",
            temporaryResidence: "",
            citizenIdNumber: "",
            citizenIdIssuedDate: "",
            citizenIdIssuedPlace: "",
            notes: "",
            avatarUrl: "",
            frontImageUrl: "",
            backImageUrl: ""
          });
        }
        setProfiles(emptyProfiles);
        isLoadingProfilesRef.current = true;
      }

      // Populate utility readings if exists
      // Backend returns ElectricityReading and WaterReading as separate objects
      console.log("⚡ Checking utility readings...");
      console.log("⚡ ElectricityReading:", fullContract.electricityReading || fullContract.ElectricityReading);
      console.log("⚡ WaterReading:", fullContract.waterReading || fullContract.WaterReading);

      const electricityReading = fullContract.electricityReading || fullContract.ElectricityReading;
      const waterReading = fullContract.waterReading || fullContract.WaterReading;

      if (electricityReading || waterReading) {
        setUtilityReadingData({
          electricityReading: {
            price: electricityReading?.price?.toString() || electricityReading?.Price?.toString() || "",
            note: electricityReading?.note || electricityReading?.Note || "",
            currentIndex: electricityReading?.currentIndex?.toString() || electricityReading?.CurrentIndex?.toString() || ""
          },
          waterReading: {
            price: waterReading?.price?.toString() || waterReading?.Price?.toString() || "",
            note: waterReading?.note || waterReading?.Note || "",
            currentIndex: waterReading?.currentIndex?.toString() || waterReading?.CurrentIndex?.toString() || ""
          }
        });

        console.log("⚡ Utility data populated:", {
          electricity: electricityReading?.currentIndex || electricityReading?.CurrentIndex,
          water: waterReading?.currentIndex || waterReading?.CurrentIndex
        });
      } else if (fullContract.utilityReadings && fullContract.utilityReadings.length > 0) {
        // Fallback: old format with utilityReadings array
        console.log("⚡ Using legacy utilityReadings array:", fullContract.utilityReadings);

        const elecReading = fullContract.utilityReadings.find(r =>
          r.utilityType === 0 || r.utilityType === "Electricity" || r.type === "Electric" || r.Type === "Electric"
        );
        const watReading = fullContract.utilityReadings.find(r =>
          r.utilityType === 1 || r.utilityType === "Water" || r.type === "Water" || r.Type === "Water"
        );

        setUtilityReadingData({
          electricityReading: {
            price: elecReading?.price?.toString() || "",
            note: elecReading?.note || "",
            currentIndex: elecReading?.currentIndex?.toString() || ""
          },
          waterReading: {
            price: watReading?.price?.toString() || "",
            note: watReading?.note || "",
            currentIndex: watReading?.currentIndex?.toString() || ""
          }
        });
      } else {
        console.log("⚠️ No utility readings found for this contract");
      }

      // Populate selected services from contract data
      console.log("🛠️ Checking services...");
      const contractServices = fullContract.serviceInfors || fullContract.ServiceInfors;
      console.log("🛠️ Contract services:", contractServices);

      if (contractServices && contractServices.length > 0) {
        // Fetch available services to get full service data with ids
        try {
          const services = await serviceService.getAll();
          console.log("📋 Available services for matching:", services);

          // Match contract services with available services by serviceName
          const matchedServices = contractServices.map(contractService => {
            const serviceName = contractService.serviceName || contractService.ServiceName || "";
            const matchedService = services.find(s =>
              s.serviceName === serviceName || s.ServiceName === serviceName
            );
            if (matchedService) {
              return {
                id: matchedService.id || matchedService.Id,
                serviceName: matchedService.serviceName || matchedService.ServiceName,
                price: matchedService.price || matchedService.Price
              };
            }
            // Fallback if no match found
            return {
              id: contractService.id || contractService.Id || null,
              serviceName: serviceName,
              price: contractService.price || contractService.Price || 0
            };
          }).filter(s => s.id !== null); // Only include services that were matched

          setSelectedServices(matchedServices);
          setAvailableServices(services || []);
          console.log("✅ Services matched and populated:", matchedServices.length, "service(s)");
        } catch (error) {
          console.error("❌ Error fetching services for matching:", error);
          setSelectedServices([]);
        }
      } else {
        console.log("⚠️ No services found for this contract");
        setSelectedServices([]);
      }

      // Set modal type and open modal
      setModalType('edit');
      setCreateStep(1); // Start from step 1
      setShowCreateContractModal(true);

      console.log("✅ Edit modal opened successfully");

    } catch (error) {
      console.error("❌ Error fetching contract details:", error);
      toast.error("Error loading contract details: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteContract = (contract) => {
    setSelectedContract(contract);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCancelContract = (contract) => {
    setSelectedContract(contract);
    setCancelReason("");
    setModalType('cancel');
    setShowModal(true);
  };

  const handleExtendContract = (contract) => {
    setSelectedContract(contract);
    // Set default extend date to 1 year from current checkout date
    const currentCheckout = new Date(contract.checkoutDate);
    const newCheckout = new Date(currentCheckout);
    newCheckout.setFullYear(newCheckout.getFullYear() + 1);
    setExtendDate(newCheckout.toISOString().split('T')[0]);
    setModalType('extend');
    setShowModal(true);
  };

  // Upload Contract Images handler
  const handleUploadContractImages = (contract) => {
    setSelectedContract(contract);
    setContractImages([]);
    setContractImagePreviews([]);
    setUploadProgress(0);
    setModalType('uploadImages');
    setShowModal(true);
  };

  const handleContractImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setContractImages(files);

    // Generate previews using URL.createObjectURL (more efficient and reliable)
    const previews = files.map(file => URL.createObjectURL(file));
    setContractImagePreviews(previews);

    console.log("📷 Selected", files.length, "images for upload");
  };

  const handleRemoveContractImage = (index) => {
    // Cleanup the object URL
    const urlToRevoke = contractImagePreviews[index];
    if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRevoke);
    }

    setContractImages(prev => prev.filter((_, i) => i !== index));
    setContractImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmUploadImages = async () => {
    if (contractImages.length === 0) {
      toast.error(t('ownerContracts.toast.selectImage'));
      return;
    }

    console.log("📤 Starting upload process:", {
      contractId: selectedContract.id,
      filesCount: contractImages.length,
      fileDetails: contractImages.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }))
    });

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await contractService.uploadContractImages(selectedContract.id, contractImages);
      console.log("✅ Upload result:", result);

      clearInterval(progressInterval);
      setUploadProgress(100);

      await fetchData(); // Refresh data

      // Cleanup object URLs
      contractImagePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      setTimeout(() => {
        setShowModal(false);
        setContractImages([]);
        setContractImagePreviews([]);
        setUploadProgress(0);
        toast.success(t('ownerContracts.toast.imagesUploaded'));
      }, 500);
    } catch (error) {
      console.error("❌ Upload error:", error);
      console.error("❌ Error response:", error.response?.data);
      toast.error(t('ownerContracts.toast.uploadError') + ": " + (error.response?.data?.message || error.message || ""));
    } finally {
      setIsUploading(false);
    }
  };

  // Contract creation functions
  const validateContractStep = () => {
    const errors = {};

    if (!contractData.roomId) errors.roomId = "Please select a room";
    if (!contractData.checkinDate) errors.checkinDate = "Check-in date is required";
    if (!contractData.checkoutDate) errors.checkoutDate = "Check-out date is required";
    if (contractData.depositAmount < 0) errors.depositAmount = "Deposit amount must be >= 0";
    if (contractData.numberOfOccupants < 1 || contractData.numberOfOccupants > 9) {
      errors.numberOfOccupants = "Number of occupants must be between 1 and 9";
    }

    // Date validation
    if (contractData.checkinDate && contractData.checkoutDate) {
      const checkin = new Date(contractData.checkinDate);
      const checkout = new Date(contractData.checkoutDate);
      if (checkin >= checkout) {
        errors.checkoutDate = "Check-out date must be after check-in date";
      }
    }

    setContractErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfileStep = () => {
    const errors = {};

    // Validate all profiles in the array
    profiles.forEach((profile, index) => {
      if (!profile.fullName.trim()) errors[`profile${index}_fullName`] = "Full name is required";
      if (!profile.dateOfBirth) errors[`profile${index}_dateOfBirth`] = "Date of birth is required";
      if (!profile.phoneNumber.trim()) errors[`profile${index}_phoneNumber`] = "Phone number is required";
      if (!profile.provinceId) errors[`profile${index}_provinceId`] = "Please select a province";
      if (!profile.wardId) errors[`profile${index}_wardId`] = "Please select a ward";
      if (!profile.address.trim()) errors[`profile${index}_address`] = "Address is required";
      if (!profile.temporaryResidence.trim()) errors[`profile${index}_temporaryResidence`] = "Temporary residence is required";
      if (!profile.citizenIdNumber.trim()) errors[`profile${index}_citizenIdNumber`] = "Citizen ID number is required";
      if (!profile.citizenIdIssuedDate) errors[`profile${index}_citizenIdIssuedDate`] = "Citizen ID issued date is required";
      if (!profile.citizenIdIssuedPlace.trim()) errors[`profile${index}_citizenIdIssuedPlace`] = "Citizen ID issued place is required";
      if (!profile.frontImageUrl.trim()) errors[`profile${index}_frontImageUrl`] = "Front image of ID is required";
      if (!profile.backImageUrl.trim()) errors[`profile${index}_backImageUrl`] = "Back image of ID is required";

      // Email validation
      if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        errors[`profile${index}_email`] = "Invalid email format";
      }
    });

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUtilityStep = () => {
    const errors = {};

    // Validate electricity reading
    if (!utilityReadingData.electricityReading.currentIndex || parseFloat(utilityReadingData.electricityReading.currentIndex) < 0) {
      errors.electricityCurrentIndex = "Electricity current index is required and must be >= 0";
    }

    // Validate water reading
    if (!utilityReadingData.waterReading.currentIndex || parseFloat(utilityReadingData.waterReading.currentIndex) < 0) {
      errors.waterCurrentIndex = "Water current index is required and must be >= 0";
    }

    // Validate price fields if provided
    if (utilityReadingData.electricityReading.price && parseFloat(utilityReadingData.electricityReading.price) < 0) {
      errors.electricityPrice = "Electricity price must be >= 0";
    }

    if (utilityReadingData.waterReading.price && parseFloat(utilityReadingData.waterReading.price) < 0) {
      errors.waterPrice = "Water price must be >= 0";
    }

    // Validate note length
    if (utilityReadingData.electricityReading.note && utilityReadingData.electricityReading.note.length > 100) {
      errors.electricityNote = "Electricity note cannot exceed 100 characters";
    }

    if (utilityReadingData.waterReading.note && utilityReadingData.waterReading.note.length > 100) {
      errors.waterNote = "Water note cannot exceed 100 characters";
    }

    setUtilityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAllSteps = () => {
    console.log("🔍 Validating all steps before creating contract...");

    const contractValid = validateContractStep();
    const profileValid = validateProfileStep();
    const utilityValid = validateUtilityStep();

    console.log("📋 Validation results:", {
      contract: contractValid,
      profile: profileValid,
      utility: utilityValid
    });

    return contractValid && profileValid && utilityValid;
  };

  const handleNextStep = () => {
    if (createStep === 1) {
      if (validateContractStep()) {
        setCreateStep(2);
      }
    } else if (createStep === 2) {
      if (validateProfileStep()) {
        setCreateStep(3);
      }
    } else if (createStep === 3) {
      if (validateUtilityStep()) {
        setCreateStep(4);
        // Fetch services when entering step 4
        fetchServices();
      }
    }
  };

  const handlePreviousStep = () => {
    if (createStep === 2) {
      setCreateStep(1);
    } else if (createStep === 3) {
      setCreateStep(2);
    } else if (createStep === 4) {
      setCreateStep(3);
    }
  };

  // Fetch available services
  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const services = await serviceService.getAll();
      console.log("📋 Fetched services:", services);
      setAvailableServices(services || []);
    } catch (error) {
      console.error("❌ Error fetching services:", error);
      toast.error(t('ownerContracts.toast.loadServicesFailed'));
      setAvailableServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleCreateContract = async () => {
    const isEditMode = modalType === 'edit';
    console.log(`🚀 Starting contract ${isEditMode ? 'update' : 'creation'}...`);
    console.log("👤 Current User Info:", user);
    console.log("🔑 Is Authenticated:", isAuthenticated);
    console.log("🎭 User Role:", user?.role);
    console.log("📝 Current form data:", {
      contractData,
      profiles,
      utilityReadingData
    });

    if (!validateAllSteps()) {
      console.log("❌ Validation failed - stopping operation");
      toast.warning(`Please fix all validation errors before ${isEditMode ? 'updating' : 'creating'} the contract.`);
      return;
    }

    try {
      setCreatingContract(true);

      // Validate GUID formats
      const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
      };

      if (!isValidGuid(contractData.roomId)) {
        toast.error("Invalid Room ID format. Please select a valid room.");
        return;
      }

      // Prepare request data with ProfilesInContract array (NEW STRUCTURE)
      // Get the selected room's price
      const selectedRoom = rooms.find(r => r.id === contractData.roomId);
      const roomPrice = selectedRoom?.price || 0;

      // Get province and ward names from IDs
      const getProvinceName = (provinceId) => {
        const province = provinces.find(p => String(p.code) === String(provinceId));
        return province?.name || "";
      };

      const getWardName = (profileIndex, wardId) => {
        const wards = wardsByProfile[profileIndex] || [];
        const ward = wards.find(w => String(w.code) === String(wardId));
        return ward?.name || "";
      };

      // Log profiles BEFORE mapping
      console.log("🔍 === CHECKING PROFILES BEFORE MAPPING ===");
      profiles.forEach((p, i) => {
        console.log(`Profile ${i}:`, {
          userId: p.userId,
          hasUserId: !!p.userId,
          userIdType: typeof p.userId,
          gender: p.gender,
          fullName: p.fullName
        });
      });

      const requestData = {
        ProfilesInContract: profiles.map((p, index) => {
          // Generate a new GUID for userId if not provided (backend requires UserId)
          const userId = p.userId && p.userId !== "" ? p.userId : '00000000-0000-0000-0000-000000000000'; // Use null GUID if no userId

          return {
            UserId: userId,
            Gender: String(p.gender || "Male"), // Ensure it's a string
            FullName: p.fullName || "",
            Avatar: p.avatarUrl || "", // Backend expects 'Avatar', frontend uses 'avatarUrl'
            DateOfBirth: new Date(p.dateOfBirth).toISOString(),
            Phone: p.phoneNumber || "", // Backend expects 'Phone', frontend uses 'phoneNumber'
            Email: p.email || "",
            ProvinceId: String(p.provinceId || ""), // Add ProvinceId
            ProvinceName: p.provinceName || getProvinceName(p.provinceId),
            WardId: String(p.wardId || ""), // Add WardId
            WardName: p.wardName || getWardName(index, p.wardId),
            Address: p.address || "",
            TemporaryResidence: p.temporaryResidence || "",
            CitizenIdNumber: p.citizenIdNumber || "",
            CitizenIdIssuedDate: new Date(p.citizenIdIssuedDate).toISOString(),
            CitizenIdIssuedPlace: p.citizenIdIssuedPlace || "",
            FrontImageUrl: p.frontImageUrl || "",
            BackImageUrl: p.backImageUrl || ""
          };
        }),
        RoomId: contractData.roomId,
        RoomPrice: parseFloat(contractData.roomPrice) || 0, // Required by backend
        CheckinDate: new Date(contractData.checkinDate).toISOString(),
        CheckoutDate: new Date(contractData.checkoutDate).toISOString(),
        DepositAmount: parseFloat(contractData.depositAmount),
        RoomPrice: parseFloat(roomPrice),
        NumberOfOccupants: parseInt(contractData.numberOfOccupants),
        Notes: contractData.notes || null,
        ElectricityReading: {
          Price: utilityReadingData.electricityReading.price ? parseFloat(utilityReadingData.electricityReading.price) : null,
          Note: utilityReadingData.electricityReading.note || null,
          CurrentIndex: parseFloat(utilityReadingData.electricityReading.currentIndex)
        },
        WaterReading: {
          Price: utilityReadingData.waterReading.price ? parseFloat(utilityReadingData.waterReading.price) : null,
          Note: utilityReadingData.waterReading.note || null,
          CurrentIndex: parseFloat(utilityReadingData.waterReading.currentIndex)
        },
        ServiceInfors: selectedServices.map(s => ({
          ServiceName: s.serviceName || s.ServiceName || s.name,
          Price: parseFloat(s.price || s.Price || 0)
        }))
      };

      console.log(`📋 ${isEditMode ? 'Updating' : 'Creating'} contract with multiple profiles:`, requestData);
      console.log("📋 Request data JSON:", JSON.stringify(requestData, null, 2));
      console.log("📋 Request data structure validation:");
      console.log("- RoomId:", requestData.RoomId);
      console.log("- ProfilesInContract (count):", requestData.ProfilesInContract.length);
      console.log("- ProfilesInContract:", requestData.ProfilesInContract);
      console.log("- ElectricityReading:", requestData.ElectricityReading);
      console.log("- WaterReading:", requestData.WaterReading);
      console.log("- ServiceInfors (count):", requestData.ServiceInfors?.length || 0);
      console.log("- ServiceInfors:", requestData.ServiceInfors);
      console.log("🔍 FULL REQUEST DATA BEING SENT:");
      console.log(JSON.stringify(requestData, null, 2));

      let result;
      if (isEditMode) {
        console.log("📝 Updating contract ID:", selectedContract.id);
        result = await contractService.update(selectedContract.id, requestData);
      } else {
        console.log("✨ Creating new contract");
        result = await contractService.create(requestData);
      }

      toast.success(`Contract ${isEditMode ? 'updated' : 'created'} successfully with ${profiles.length} identity profile(s) and utility readings!`);

      // Reset form and close modal
      setShowCreateContractModal(false);
      setCreateStep(1);
      setModalType(''); // Reset modal type
      setCurrentEditingRoomId(null); // Reset current editing room
      setSelectedServices([]); // Reset selected services
      setContractData({
        tenantId: "",
        roomId: "",
        roomPrice: 0,
        checkinDate: "",
        checkoutDate: "",
        depositAmount: 0,
        numberOfOccupants: 1,
        notes: ""
      });
      setProfiles([{
        userId: null,
        gender: "Male",
        fullName: "",
        dateOfBirth: "",
        phoneNumber: "",
        email: "",
        gender: "Male", // Default gender
        provinceId: "",
        provinceName: "",
        wardId: "",
        wardName: "",
        address: "",
        temporaryResidence: "",
        citizenIdNumber: "",
        citizenIdIssuedDate: "",
        citizenIdIssuedPlace: "",
        notes: "",
        avatarUrl: "",
        frontImageUrl: "",
        backImageUrl: ""
      }]);
      setUtilityReadingData({
        electricityReading: {
          price: "",
          note: "",
          currentIndex: ""
        },
        waterReading: {
          price: "",
          note: "",
          currentIndex: ""
        }
      });

      // Refresh contracts list and rooms
      await fetchData();
      await fetchRooms(); // Re-fetch rooms to get updated availability

    } catch (error) {
      console.error(`❌ Error ${isEditMode ? 'updating' : 'creating'} contract:`, error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      console.error("❌ FULL ERROR RESPONSE:");
      console.error("Status:", error.response?.status);
      console.error("Response Data:", JSON.stringify(error.response?.data, null, 2));
      console.error("Request that was sent:", JSON.stringify(requestData, null, 2));

      // Show detailed error message
      let errorMessage = `Error ${isEditMode ? 'updating' : 'creating'} contract: `;
      if (error.response?.status === 400) {
        if (error.response.data?.message) {
          // Backend custom error message (like "Không tìm thấy thông tin chủ trọ")
          errorMessage = error.response.data.message;

          // Provide helpful hint for owner profile error
          if (errorMessage.includes('chủ trọ') || errorMessage.includes('owner')) {
            errorMessage += '\n\n💡 Tip: Please make sure your owner profile is complete with all required information (Name, Phone, Email, Address, Citizen ID, etc.) before creating a contract.';
          }
        } else if (error.response.data?.errors) {
          // ASP.NET Core validation errors
          const validationErrors = Object.entries(error.response.data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          errorMessage += `\nValidation errors:\n${validationErrors}`;
        } else if (error.response.data?.title) {
          errorMessage += error.response.data.title;
        } else if (error.response.data) {
          errorMessage += JSON.stringify(error.response.data);
        } else {
          errorMessage += "Bad request - please check all required fields";
        }
      } else {
        errorMessage += error.message || error;
      }

      toast.error(errorMessage);
    } finally {
      setCreatingContract(false);
    }
  };



  const handleConfirmDelete = async () => {
    try {
      await contractService.delete(selectedContract.id);
      await fetchData(); // Refresh data
      setShowModal(false);
      toast.success("Contract deleted successfully!");
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast.error("Error deleting contract: " + (error.message || "Unknown error"));
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.warning("Please provide a reason for cancellation");
      return;
    }

    try {
      setProcessingAction(true);
      await contractService.terminate(selectedContract.id, cancelReason);
      await fetchData(); // Refresh data
      setShowModal(false);
      setCancelReason("");
      toast.success("Contract cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling contract:", error);
      toast.error("Error cancelling contract: " + (error.message || "Unknown error"));
    } finally {
      setProcessingAction(false);
    }
  };

  const handleConfirmExtend = async () => {
    if (!extendDate) {
      toast.warning("Please select a new end date");
      return;
    }

    const currentEndDate = new Date(selectedContract.checkoutDate);
    const newEndDate = new Date(extendDate);

    if (newEndDate <= currentEndDate) {
      toast.warning("New end date must be after the current end date");
      return;
    }

    try {
      setProcessingAction(true);
      await contractService.extend(selectedContract.id, extendDate);
      await fetchData(); // Refresh data
      setShowModal(false);
      setExtendDate("");
      toast.success("Contract extended successfully!");
    } catch (error) {
      console.error("Error extending contract:", error);
      toast.error("Error extending contract: " + (error.message || "Unknown error"));
    } finally {
      setProcessingAction(false);
    }
  };

  // Utility Reading Modal Handlers
  const handleOpenUtilityModal = async (contract) => {
    try {
      console.log('⚡ Opening utility modal for contract:', contract?.id);
      setSelectedContract(contract);
      setShowUtilityModal(true);
      setShowUtilityForm(false);
      setEditingUtilityReading(null);
      setActiveUtilityTab('electric');

      // Fetch utility readings for this contract (both types)
      await fetchUtilityReadingsByType(contract.id);
    } catch (error) {
      console.error('❌ Error opening utility modal:', error);
      toast.error('Failed to load utility readings');
    }
  };

  const fetchUtilityReadingsByType = async (contractId) => {
    try {
      setLoadingUtilityReadings(true);
      console.log('⚡ Fetching utility readings by type for contract:', contractId);

      // Fetch Electric readings (type = 1)
      const electricData = await utilityReadingService.getByContractAndType(contractId, 1);
      console.log('⚡ Electric readings fetched:', electricData);

      // Fetch Water readings (type = 0)
      const waterData = await utilityReadingService.getByContractAndType(contractId, 0);
      console.log('💧 Water readings fetched:', waterData);

      // Sort by reading date (newest first)
      const sortedElectric = (electricData || []).sort((a, b) =>
        new Date(b.readingDate) - new Date(a.readingDate)
      );
      const sortedWater = (waterData || []).sort((a, b) =>
        new Date(b.readingDate) - new Date(a.readingDate)
      );

      setElectricReadings(sortedElectric);
      setWaterReadings(sortedWater);
    } catch (error) {
      console.error('❌ Error fetching utility readings:', error);
      setElectricReadings([]);
      setWaterReadings([]);
      toast.error('Failed to load utility readings');
    } finally {
      setLoadingUtilityReadings(false);
    }
  };

  const handleAddUtilityReading = () => {
    setEditingUtilityReading(null);
    setEditingUtilityType(null);
    setElectricFormData({ price: '', note: '', currentIndex: '' });
    setWaterFormData({ price: '', note: '', currentIndex: '' });
    setShowUtilityForm(true);
  };

  const handleEditUtilityReading = (reading) => {
    console.log('✏️ Editing utility reading:', reading);
    const isElectric = reading.type === 'Electric' || reading.type === 1;
    setEditingUtilityReading(reading);
    setEditingUtilityType(isElectric ? 'electric' : 'water');

    if (isElectric) {
      setElectricFormData({
        price: reading.price?.toString() || '',
        note: reading.note || '',
        currentIndex: reading.currentIndex?.toString() || ''
      });
      setWaterFormData({ price: '', note: '', currentIndex: '' });
    } else {
      setWaterFormData({
        price: reading.price?.toString() || '',
        note: reading.note || '',
        currentIndex: reading.currentIndex?.toString() || ''
      });
      setElectricFormData({ price: '', note: '', currentIndex: '' });
    }
    setShowUtilityForm(true);
  };

  const handleDeleteUtilityReading = async (readingId) => {
    if (!confirm('Are you sure you want to delete this utility reading?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting utility reading:', readingId);
      await utilityReadingService.delete(readingId);
      toast.success('Utility reading deleted successfully');

      // Refresh list
      await fetchUtilityReadingsByType(selectedContract.id);
    } catch (error) {
      console.error('❌ Error deleting utility reading:', error);
      toast.error('Failed to delete utility reading');
    }
  };

  // Save Electric reading
  const handleSaveElectricReading = async () => {
    if (!electricFormData.currentIndex || parseFloat(electricFormData.currentIndex) < 0) {
      toast.error('Electric: Current index is required and must be >= 0');
      return;
    }
    if (!electricFormData.price || parseFloat(electricFormData.price) < 0) {
      toast.error('Electric: Price is required and must be >= 0');
      return;
    }

    try {
      setSavingElectric(true);

      if (editingUtilityReading && editingUtilityType === 'electric') {
        console.log('📝 Updating electric reading:', editingUtilityReading.id);
        await utilityReadingService.update(editingUtilityReading.id, {
          price: electricFormData.price,
          note: electricFormData.note,
          currentIndex: electricFormData.currentIndex
        });
        toast.success('Electric reading updated successfully');
        setShowUtilityForm(false);
        setEditingUtilityReading(null);
        setEditingUtilityType(null);
      } else {
        console.log('➕ Creating new electric reading');
        await utilityReadingService.create(selectedContract.id, 1, {
          price: electricFormData.price,
          note: electricFormData.note,
          currentIndex: electricFormData.currentIndex
        });
        toast.success('Electric reading created successfully');
        setElectricFormData({ price: '', note: '', currentIndex: '' });
      }

      await fetchUtilityReadingsByType(selectedContract.id);
      setActiveUtilityTab('electric'); // Switch to electric tab after save
    } catch (error) {
      console.error('❌ Error saving electric reading:', error);
      console.log('🚨 Error object:', { data: error.data, message: error.message });
      // Get error message from backend - error.data.message or error.message
      const errorMessage = error.data?.message || error.data?.Message || error.message || 'Failed to save electric reading';
      console.log('🚨 Showing toast error:', errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSavingElectric(false);
    }
  };

  // Save Water reading
  const handleSaveWaterReading = async () => {
    if (!waterFormData.currentIndex || parseFloat(waterFormData.currentIndex) < 0) {
      toast.error('Water: Current index is required and must be >= 0');
      return;
    }
    if (!waterFormData.price || parseFloat(waterFormData.price) < 0) {
      toast.error('Water: Price is required and must be >= 0');
      return;
    }

    try {
      setSavingWater(true);

      if (editingUtilityReading && editingUtilityType === 'water') {
        console.log('📝 Updating water reading:', editingUtilityReading.id);
        await utilityReadingService.update(editingUtilityReading.id, {
          price: waterFormData.price,
          note: waterFormData.note,
          currentIndex: waterFormData.currentIndex
        });
        toast.success('Water reading updated successfully');
        setShowUtilityForm(false);
        setEditingUtilityReading(null);
        setEditingUtilityType(null);
      } else {
        console.log('➕ Creating new water reading');
        await utilityReadingService.create(selectedContract.id, 0, {
          price: waterFormData.price,
          note: waterFormData.note,
          currentIndex: waterFormData.currentIndex
        });
        toast.success('Water reading created successfully');
        setWaterFormData({ price: '', note: '', currentIndex: '' });
      }

      await fetchUtilityReadingsByType(selectedContract.id);
      setActiveUtilityTab('water'); // Switch to water tab after save
    } catch (error) {
      console.error('❌ Error saving water reading:', error);
      console.log('🚨 Error object:', { data: error.data, message: error.message });
      // Get error message from backend - error.data.message or error.message
      const errorMessage = error.data?.message || error.data?.Message || error.message || 'Failed to save water reading';
      console.log('🚨 Showing toast error:', errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSavingWater(false);
    }
  };

  const handleCloseUtilityModal = () => {
    setShowUtilityModal(false);
    setShowUtilityForm(false);
    setEditingUtilityReading(null);
    setEditingUtilityType(null);
    setElectricReadings([]);
    setWaterReadings([]);
    setElectricFormData({ price: '', note: '', currentIndex: '' });
    setWaterFormData({ price: '', note: '', currentIndex: '' });
    setActiveUtilityTab('electric');
    setSelectedContract(null);
  };

  // Signature Modal Handlers
  const handleOpenSignatureModal = async (contract) => {
    try {
      console.log('📝 Opening signature modal for contract:', contract?.id);

      // Fetch full contract details from backend
      const contractId = contract?.id || contract?.Id;
      if (!contractId) {
        toast.error(t('ownerContracts.toast.contractIdNotFound'));
        return;
      }

      console.log('🔍 Fetching contract details for ID:', contractId);
      const fullContract = await contractService.getById(contractId);
      console.log('✅ Contract details loaded:', fullContract);
      console.log('📋 Identity profiles:', fullContract.identityProfiles);

      // Kiểm tra xem người thuê đã ký chưa - Owner chỉ được ký sau khi Tenant đã ký
      const tenantSignature = fullContract.tenantSignature || fullContract.TenantSignature;
      if (!tenantSignature) {
        toast.error(t('ownerContracts.toast.tenantNotSigned') || 'Người thuê chưa ký hợp đồng. Vui lòng đợi người thuê ký trước.');
        return;
      }

      // Kiểm tra xem Owner đã ký chưa
      const ownerSignature = fullContract.ownerSignature || fullContract.OwnerSignature;
      if (ownerSignature) {
        toast.warning(t('ownerContracts.toast.alreadySigned') || 'Bạn đã ký hợp đồng này rồi');
        return;
      }

      // Get owner info from contract position [1] (owner profile)
      const ownerProfile = fullContract.identityProfiles?.[1];
      const ownerName = ownerProfile?.fullName || ownerProfile?.FullName || user?.fullName || user?.name || '';
      const ownerPhone = ownerProfile?.phone || ownerProfile?.Phone || ownerProfile?.phoneNumber || user?.phone || user?.phoneNumber || '';
      const ownerEmail = ownerProfile?.email || ownerProfile?.Email || user?.email || user?.Email || '';

      setSelectedContract(fullContract);
      setShowSignatureModal(true);
      setSignatureStep(1); // Reset to step 1
      setSignatureName(ownerName);
      setSignaturePhone(ownerPhone);
      setSignatureEmail(ownerEmail); // Set OWNER email from contract position [1]
      setSignaturePreview('');
      setOtpCode('');
      setOtpTimer(300);
      setCanResendOtp(false);

      console.log('👤 Owner info set for signature (from contract position [1]):');
      console.log('  - Name:', ownerName);
      console.log('  - Phone:', ownerPhone);
      console.log('  - Email:', ownerEmail);

      // Update URL to reflect contract ID
      router.push(`/owner/boarding-houses/${houseId}/contracts?contractId=${contractId}`, undefined, { shallow: true });

    } catch (error) {
      console.error('❌ Error loading contract:', error);
      toast.error(t('ownerContracts.toast.loadContractFailed'));
    }
  };

  // Handle Continue to OTP step (Step 1 → Step 2)
  const handleContinueToOtp = async () => {
    console.log('🔔 handleContinueToOtp called!');
    console.log('📝 signaturePreview:', signaturePreview);
    console.log('👤 signatureName:', signatureName);

    if (!signaturePreview) {
      console.log('❌ No signature preview');
      toast.error(t('ownerContracts.toast.createSignatureFirst'));
      return;
    }

    if (!signatureName.trim()) {
      console.log('❌ No signature name');
      toast.error(t('ownerContracts.toast.enterFullName'));
      return;
    }

    try {
      setSendingOtp(true);
      console.log('📝 Sending OTP...');

      // Get OWNER email from contract at position [1] (owner profile), NOT [0] (tenant)
      const ownerEmail = selectedContract?.identityProfiles?.[1]?.email ||
        selectedContract?.identityProfiles?.[1]?.Email ||
        user?.email ||
        user?.Email;

      if (!ownerEmail) {
        toast.error(t('ownerContracts.toast.emailNotFound'));
        setSendingOtp(false);
        return;
      }

      console.log('📧 Sending OTP to OWNER email (from contract position [1]):', ownerEmail);

      // Get contract ID
      const contractId = selectedContract?.id || selectedContract?.Id;
      if (!contractId) {
        toast.error(t('ownerContracts.toast.contractInfoNotFound'));
        setSendingOtp(false);
        return;
      }

      console.log('📧 Sending OTP to email:', ownerEmail);
      console.log('📝 Contract ID:', contractId);

      // Send OTP via MailAPI - Backend will generate OTP and return otpId
      const otpResult = await otpService.sendContractOtp(contractId, ownerEmail);
      console.log('✅ OTP sent, result:', otpResult);

      // Extract otpId from response
      const otpId = otpResult?.otpId || otpResult?.data?.otpId;

      console.log('🔍 Extracted OTP ID:', otpId);

      if (!otpId) {
        console.error('❌ No OTP ID in response:', otpResult);
        toast.error(t('ownerContracts.toast.otpCreateError'));
        setSendingOtp(false);
        return;
      }

      console.log('🔑 OTP ID:', otpId);

      // Store otpId and email for verification
      setCurrentOtpId(otpId);
      setSignatureEmail(ownerEmail);

      toast.success(t('ownerContracts.toast.otpSent', { email: ownerEmail }));

      // Move to OTP verification step
      setSignatureStep(2);
      setOtpTimer(300); // 5 minutes
      setCanResendOtp(false);

    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(t('ownerContracts.toast.otpSendError'));
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      setSendingOtp(true);
      console.log('📝 Resending OTP...');

      // Get contract ID
      const contractId = selectedContract?.id || selectedContract?.Id;
      if (!contractId || !signatureEmail) {
        toast.error(t('ownerContracts.toast.invalidInfo'));
        setSendingOtp(false);
        return;
      }

      // Resend OTP
      const otpResult = await otpService.sendContractOtp(contractId, signatureEmail);
      const otpId = otpResult?.otpId || otpResult?.id || otpResult?.Id || otpResult?.data?.id;

      if (!otpId) {
        toast.error(t('ownerContracts.toast.otpSendError'));
        setSendingOtp(false);
        return;
      }

      // Update otpId
      setCurrentOtpId(otpId);

      setOtpTimer(300); // Reset timer to 5 minutes
      setCanResendOtp(false);
      toast.success(t('ownerContracts.toast.newOtpSent'));

    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      toast.error(t('ownerContracts.toast.resendOtpError'));
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Confirm OTP and save signature (Step 2 → Complete)
  const handleConfirmSignature = async () => {
    if (!otpCode.trim()) {
      toast.error(t('ownerContracts.toast.enterOtp'));
      return;
    }

    if (otpCode.length !== 6) {
      toast.error(t('ownerContracts.toast.otpMustBe6'));
      return;
    }

    try {
      setVerifyingOtp(true);
      console.log('✅ Verifying OTP:', otpCode);
      console.log('🔑 OTP ID:', currentOtpId);

      if (!currentOtpId) {
        toast.error(t('ownerContracts.toast.otpInfoNotFound'));
        setVerifyingOtp(false);
        return;
      }

      const contractId = selectedContract?.id || selectedContract?.Id;
      if (!contractId) {
        toast.error(t('ownerContracts.toast.contractInfoNotFound'));
        setVerifyingOtp(false);
        return;
      }

      // Step 1: Verify OTP using otpId (backend will set IsUsed = true)
      console.log('1️⃣ Verifying OTP with backend...');
      const verifyResult = await otpService.verifyContractOtp(currentOtpId, otpCode);
      console.log('✅ OTP verified:', verifyResult);

      if (!verifyResult || !verifyResult.success) {
        toast.error(verifyResult?.message || t('ownerContracts.toast.invalidOtp'));
        setVerifyingOtp(false);
        return;
      }

      // Step 2: Use base64 signature directly (no upload needed)
      console.log('2️⃣ Using base64 signature directly...');
      console.log('� Signature preview length:', signaturePreview?.length);

      if (!signaturePreview) {
        toast.error(t('ownerContracts.toast.signatureNotFound'));
        setVerifyingOtp(false);
        return;
      }

      // Step 3: Sign contract with base64 signature (saves to OwnerSignature or TenantSignature)
      console.log('3️⃣ Signing contract...');
      console.log('📝 Contract ID:', contractId);
      console.log('🖼️ Signature (base64):', signaturePreview.substring(0, 50) + '...');
      const result = await contractService.signContract(contractId, signaturePreview);
      console.log('✅ Contract signed:', result);

      toast.success(t('ownerContracts.toast.contractSigned'));

      // Reset states and close modal
      setShowSignatureModal(false);
      setSignatureStep(1);
      setOtpCode('');
      setCurrentOtpId(null);
      setSignatureEmail('');
      setSignaturePreview(null);
      setSignatureName('');

      // Refresh contracts list
      await fetchData();

    } catch (error) {
      console.error('❌ Error confirming signature:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || t('ownerContracts.toast.confirmSignatureError'));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCloseSignatureModal = () => {
    setShowSignatureModal(false);
    setSignatureStep(1);
    setSignatureName('');
    setSignaturePreview(null);
    setSignatureFile(null);
    setSignatureTab('draw');
    setSignatureEmail('');
    setCurrentOtpId(null);
    setOtpCode('');
    setOtpTimer(300);
    setCanResendOtp(false);
    setSelectedContract(null);
  };

  const generateManualSignature = () => {
    if (!signatureName.trim()) {
      toast.error(t('ownerContracts.toast.enterFullName'));
      return;
    }

    // Generate signature text with unique code
    const uniqueCode = Math.random().toString(36).substring(2, 15).toUpperCase();
    const signatureText = `Được ký bởi/ Signed by:\n${signatureName}\n${uniqueCode}`;

    // Convert text to image using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text lines
    const lines = signatureText.split('\n');
    const lineHeight = 25;
    const startY = (canvas.height - (lines.length * lineHeight)) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight) + lineHeight / 2);
    });

    // Convert canvas to base64 image
    const base64Image = canvas.toDataURL('image/png');
    setSignaturePreview(base64Image);

    console.log('✅ Manual signature generated as base64 image');
  };

  const handleSignatureFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('ownerContracts.toast.uploadImageFile'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureFile(file);
        setSignaturePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Drawing Functions
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!canvasRef.current) return;
    setIsDrawing(false);
    const dataUrl = canvasRef.current.toDataURL();
    setSignaturePreview(dataUrl);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignaturePreview('');
  };

  // handleConfirmEdit REMOVED - Edit now uses the full 3-step modal via handleCreateContract

  const handleCreateContractSuccess = async () => {
    // Close the modal
    setShowCreateContractModal(false);
    // Refresh contracts list
    await fetchData();
    toast.success("Contract created successfully!");
  };

  // Wrapper functions for PDF generation with signatures and complete data
  const generateContractPDF = async (contract) => {
    try {
      console.log('📄 Preparing contract PDF with complete data...');

      // Fetch signatures
      let signatures = null;
      try {
        signatures = await contractService.getSignatures(contract.id);
      } catch (error) {
        console.log('No signatures found, will generate PDF without signatures');
      }

      // Enrich contract with room details if not already present
      let enrichedContract = { ...contract };
      if (contract.roomId && !contract.roomDetails) {
        try {
          const roomDetails = await roomService.getById(contract.roomId);
          enrichedContract.roomDetails = roomDetails;
          enrichedContract.roomName = roomDetails?.name || roomDetails?.roomName || contract.roomName;
          console.log('✅ Room details fetched for PDF:', roomDetails);
        } catch (error) {
          console.error('❌ Error fetching room details for PDF:', error);
        }
      }

      // Fetch identity profiles if not already present
      if (!enrichedContract.identityProfiles || enrichedContract.identityProfiles.length === 0) {
        console.log('🔍 Identity profiles not found in contract, fetching...');
        try {
          const profiles = await contractService.getIdentityProfiles(contract.id);
          if (profiles && profiles.length > 0) {
            enrichedContract.identityProfiles = profiles;
            console.log('✅ Identity profiles fetched for PDF:', profiles);
          } else {
            console.warn('⚠️ No identity profiles found for this contract');
          }
        } catch (error) {
          console.error('❌ Error fetching identity profiles for PDF:', error);
        }
      }

      downloadContractPDF(enrichedContract, signatures?.ownerSignature || null, signatures?.tenantSignature || null);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: generate with available data
      downloadContractPDF(contract, null, null);
    }
  };

  const previewContractPDF = async (contract) => {
    try {
      console.log('👁️ Preparing contract preview with complete data...');
      console.log('📋 Contract ID:', contract.id);

      // Fetch FULL contract data from API GET /api/Contract/{id}
      let fullContract = null;
      try {
        fullContract = await contractService.getById(contract.id);
        console.log('✅ Full contract data fetched:', fullContract);
        console.log('📋 Full contract keys:', Object.keys(fullContract || {}));
        console.log('👤 Identity profiles from API:', fullContract?.identityProfiles || fullContract?.IdentityProfiles);
      } catch (error) {
        console.error('❌ Error fetching full contract:', error);
        fullContract = contract; // Fallback to passed contract
      }

      // Use full contract data or fallback
      let enrichedContract = fullContract ? { ...fullContract } : { ...contract };

      // Add current user (owner) info if not present in contract
      if (user && (!enrichedContract.owner && !enrichedContract.Owner)) {
        enrichedContract.owner = {
          fullName: user.fullName || user.name || user.FullName || user.Name,
          email: user.email || user.Email,
          phone: user.phone || user.phoneNumber || user.Phone || user.PhoneNumber,
          address: user.address || user.Address
        };
        console.log('👤 Added current user as owner:', enrichedContract.owner);
      }

      // Fetch signatures
      let signatures = null;
      try {
        signatures = await contractService.getSignatures(contract.id);
        console.log('✅ Signatures fetched:', signatures);
      } catch (error) {
        console.log('No signatures found, will preview PDF without signatures');
      }

      // Also check if signatures are in the contract itself
      if (!signatures || (!signatures.ownerSignature && !signatures.tenantSignature)) {
        signatures = {
          ownerSignature: enrichedContract.ownerSignature || enrichedContract.OwnerSignature || null,
          tenantSignature: enrichedContract.tenantSignature || enrichedContract.TenantSignature || null
        };
      }

      // Enrich contract with room details if not already present
      if (enrichedContract.roomId && !enrichedContract.roomDetails) {
        try {
          const roomDetails = await roomService.getById(enrichedContract.roomId);
          enrichedContract.roomDetails = roomDetails;
          enrichedContract.roomName = roomDetails?.name || roomDetails?.roomName || enrichedContract.roomName;
          console.log('✅ Room details fetched for preview:', roomDetails);
        } catch (error) {
          console.error('❌ Error fetching room details for preview:', error);
        }
      }

      // Try to fetch owner info if ownerId exists but no owner details
      if (enrichedContract.ownerId && !enrichedContract.owner?.fullName) {
        try {
          const ownerData = await userService.getById(enrichedContract.ownerId);
          if (ownerData) {
            enrichedContract.owner = ownerData;
            console.log('✅ Owner data fetched:', ownerData);
          }
        } catch (error) {
          console.log('Could not fetch owner data, using current user info');
        }
      }

      console.log('📄 Final enriched contract for PDF:', enrichedContract);
      console.log('👤 Final identity profiles:', enrichedContract.identityProfiles || enrichedContract.IdentityProfiles);
      console.log('👤 Owner info:', enrichedContract.owner);

      previewPDF(enrichedContract, signatures?.ownerSignature || null, signatures?.tenantSignature || null);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      previewPDF(contract, null, null);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const tenantName = contract.identityProfiles?.[0]?.fullName || '';
    const matchesSearch =
      contract.tenantId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenantName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || contract.contractStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!mounted) {
    return <div>{t('common.loading')}</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('ownerContracts.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('ownerContracts.subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => {
                isLoadingProfilesRef.current = false; // Reset ref for create mode
                setShowCreateContractModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('ownerContracts.addContract')}
            </button>
            <button
              onClick={() => router.push('/owner/boarding-houses')}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              ← {t('ownerContracts.backToProperties')}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('ownerContracts.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('ownerContracts.filters.allStatus')}</option>
            <option value="Active">{t('ownerContracts.filters.active')}</option>
            <option value="Expired">{t('ownerContracts.filters.expired')}</option>
            <option value="Terminated">{t('ownerContracts.filters.terminated')}</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('ownerContracts.emptyState.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {contracts.length === 0
                ? t('ownerContracts.emptyState.noContracts')
                : t('ownerContracts.emptyState.noMatchingFilters')
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('ownerContracts.contract')} #{contract.id?.slice(0, 8) || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${contract.contractStatus === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : contract.contractStatus === 'Expired'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {contract.contractStatus || 'Unknown'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <strong>{t('ownerContracts.room')}:</strong> {contract.roomName || 'N/A'}
                      </div>
                      <div>
                        <strong>{t('ownerContracts.tenant')}:</strong> {
                          contract.identityProfiles?.[0]?.fullName ||
                          contract.tenantId ||
                          'N/A'
                        }
                      </div>
                      <div>
                        <strong>{t('ownerContracts.period')}:</strong> {
                          contract.checkinDate && contract.checkoutDate
                            ? `${new Date(contract.checkinDate).toLocaleDateString()} - ${new Date(contract.checkoutDate).toLocaleDateString()}`
                            : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewContract(contract)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium"
                    >
                      {t('common.view')}
                    </button>

                    {/* Edit - Hidden for Active contracts */}
                    {contract.contractStatus !== 'Active' && (
                      <button
                        onClick={() => handleEditContract(contract)}
                        className="px-3 py-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => previewContractPDF(contract)}
                      className="px-3 py-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 text-sm font-medium"
                    >
                      {t('ownerContracts.actions.previewPdf')}
                    </button>
                    <button
                      onClick={() => generateContractPDF(contract)}
                      className="px-3 py-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 text-sm font-medium"
                    >
                      {t('ownerContracts.actions.printPdf')}
                    </button>

                    {/* Cancel Contract - Only for Active contracts */}
                    {contract.contractStatus === 'Active' && (
                      <button
                        onClick={() => handleCancelContract(contract)}
                        className="px-3 py-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
                      >
                        {t('ownerContracts.actions.cancelContract')}
                      </button>
                    )}

                    {/* Extend Contract - Only for Active contracts */}
                    {contract.contractStatus === 'Active' && (
                      <button
                        onClick={() => handleExtendContract(contract)}
                        className="px-3 py-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 text-sm font-medium"
                      >
                        {t('ownerContracts.actions.extendContract')}
                      </button>
                    )}

                    {/* Add Signature Button - Hidden for Active contracts */}
                    {contract.contractStatus !== 'Active' && (
                      <button
                        onClick={() => handleOpenSignatureModal(contract)}
                        className="px-3 py-1 text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200 text-sm font-medium"
                        title="Add electronic signature"
                      >
                        ✍️ Signature
                      </button>
                    )}

                    {/* Utility Reading Management - Only for Active contracts */}
                    {contract.contractStatus === 'Active' && (
                      <button
                        onClick={() => {
                          const contractId = contract.id || contract.Id;
                          console.log('🔗 Navigating to utilities page:', {
                            boardingHouseId: houseId,
                            contractId: contractId,
                            url: `/owner/boarding-houses/${houseId}/contracts/${contractId}/utilities`
                          });
                          router.push(`/owner/boarding-houses/${houseId}/contracts/${contractId}/utilities`);
                        }}
                        className="px-3 py-1 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200 text-sm font-medium"
                        title="Manage electricity and water readings"
                      >
                        Utility Bill
                      </button>
                    )}

                    {/* Upload Contract Images - For Pending and Active contracts */}
                    {(contract.contractStatus === 'Pending' || contract.contractStatus === 'Active') && (
                      <button
                        onClick={() => handleUploadContractImages(contract)}
                        className="px-3 py-1 text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-200 text-sm font-medium"
                      >
                        {t('ownerContracts.actions.uploadImages')}
                      </button>
                    )}

                    {/* Delete - Hidden for Active contracts */}
                    {contract.contractStatus !== 'Active' && (
                      <button
                        onClick={() => handleDeleteContract(contract)}
                        className="px-3 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && t('ownerContracts.modal.contractDetails')}
                  {modalType === 'delete' && t('ownerContracts.modal.deleteContract')}
                  {modalType === 'cancel' && t('ownerContracts.modal.cancelContract')}
                  {modalType === 'extend' && t('ownerContracts.modal.extendContract')}
                  {modalType === 'uploadImages' && t('ownerContracts.modal.uploadImages')}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCancelReason("");
                    setExtendDate("");

                    // Cleanup object URLs to prevent memory leaks
                    contractImagePreviews.forEach(url => {
                      if (url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                      }
                    });

                    setContractImages([]);
                    setContractImagePreviews([]);
                    setUploadProgress(0);
                    setIsUploading(false);
                    setProcessingAction(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {modalType === 'view' && selectedContract && (
                <div className="space-y-6">
                  {/* Contract Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                      Contract Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract ID</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedContract.id || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedContract.contractStatus || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedContract.roomName || 'N/A'}</p>
                        {selectedContract.roomDetails && (
                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                            <p><strong>Price:</strong> {selectedContract.roomDetails.price ? `${selectedContract.roomDetails.price} VND` : 'N/A'}</p>
                            <p><strong>Area:</strong> {selectedContract.roomDetails.area ? `${selectedContract.roomDetails.area} m²` : 'N/A'}</p>
                            <p><strong>Max Occupants:</strong> {selectedContract.roomDetails.maxOccupants || 'N/A'}</p>
                            {selectedContract.roomDetails.description && (
                              <p><strong>Description:</strong> {selectedContract.roomDetails.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenant ID</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedContract.tenantId || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-in Date</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedContract.checkinDate ? new Date(selectedContract.checkinDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-out Date</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedContract.checkoutDate ? new Date(selectedContract.checkoutDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deposit Amount</label>
                        <p className="text-sm text-gray-900 dark:text-white">${selectedContract.depositAmount || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Occupants</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedContract.numberOfOccupants || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedContract.notes || 'No notes'}</p>
                    </div>
                  </div>

                  {/* Identity Profiles Information */}
                  {selectedContract.identityProfiles && selectedContract.identityProfiles.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                        Tenant Information
                      </h4>
                      {selectedContract.identityProfiles.map((profile, index) => (
                        <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                            {profile.fullName || `Tenant ${index + 1}`}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Full Name:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.fullName || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Date of Birth:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.phoneNumber || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.email || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Citizen ID:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.citizenIdNumber || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">ID Issued Date:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {profile.citizenIdIssuedDate ? new Date(profile.citizenIdIssuedDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">ID Issued Place:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.citizenIdIssuedPlace || 'N/A'}</span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Address:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.address || 'N/A'}</span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Temporary Residence:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.temporaryResidence || 'N/A'}</span>
                            </div>

                            {/* Province and Ward Information */}
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Province:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {profile.provinceName || profile.provinceId || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Ward:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {profile.wardName || profile.wardId || 'N/A'}
                              </span>
                            </div>

                            {/* ID Images */}
                            {(profile.frontImageUrl || profile.backImageUrl) && (
                              <div className="md:col-span-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">ID Card Images:</span>
                                <div className="flex gap-4">
                                  {profile.frontImageUrl && (
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500 mb-1">Front</p>
                                      <img
                                        src={profile.frontImageUrl}
                                        alt="Front ID"
                                        className="w-full h-32 object-cover rounded border"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'block';
                                        }}
                                      />
                                      <p className="text-xs text-red-500 hidden">Image not available</p>
                                    </div>
                                  )}
                                  {profile.backImageUrl && (
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-500 mb-1">Back</p>
                                      <img
                                        src={profile.backImageUrl}
                                        alt="Back ID"
                                        className="w-full h-32 object-cover rounded border"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'block';
                                        }}
                                      />
                                      <p className="text-xs text-red-500 hidden">Image not available</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Avatar */}
                            {profile.avatarUrl && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">Avatar:</span>
                                <img
                                  src={profile.avatarUrl}
                                  alt="Avatar"
                                  className="w-20 h-20 object-cover rounded-full border"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                                <p className="text-xs text-red-500 hidden">Image not available</p>
                              </div>
                            )}

                            {profile.notes && (
                              <div className="md:col-span-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{profile.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contract Images Section */}
                  {selectedContract.contractImage && selectedContract.contractImage.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                        📄 Contract Images
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedContract.contractImage.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-xl transition-shadow">
                              <img
                                src={imageUrl}
                                alt={`Contract Image ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                onClick={() => window.open(imageUrl, '_blank')}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="hidden w-full h-full items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <div className="text-center p-4">
                                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Image not available</p>
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                              Page {index + 1}
                            </div>
                            <div className="mt-2 text-center">
                              <button
                                onClick={() => window.open(imageUrl, '_blank')}
                                className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                              >
                                🔍 View Full Size
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          <strong>ℹ️ Note:</strong> These are the scanned images of the signed contract. Click on any image to view it in full size.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Simple Edit Modal - REMOVED - Use 3-step modal instead via handleEditContract */}

              {modalType === 'delete' && selectedContract && (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Are you sure you want to delete this contract?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Contract #{selectedContract.id?.slice(0, 8)} - This action cannot be undone.
                  </p>
                </div>
              )}

              {modalType === 'cancel' && selectedContract && (
                <div className="py-4">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🚫</div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Cancel Contract
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Contract #{selectedContract.id?.slice(0, 8)} - {selectedContract.roomName}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Tenant: {selectedContract.identityProfiles?.[0]?.fullName || selectedContract.tenantId}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reason for Cancellation *
                      </label>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Please provide a reason for contract cancellation..."
                        required
                      />
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-amber-700 dark:text-amber-200">
                            <strong>Warning:</strong> Cancelling this contract will change its status to "Terminated".
                            This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'extend' && selectedContract && (
                <div className="py-4">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">📅</div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Extend Contract
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Contract #{selectedContract.id?.slice(0, 8)} - {selectedContract.roomName}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Tenant: {selectedContract.identityProfiles?.[0]?.fullName || selectedContract.tenantId}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current End Date
                        </label>
                        <input
                          type="text"
                          value={selectedContract.checkoutDate ? new Date(selectedContract.checkoutDate).toLocaleDateString() : 'N/A'}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New End Date *
                        </label>
                        <input
                          type="date"
                          value={extendDate}
                          onChange={(e) => setExtendDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          min={selectedContract.checkoutDate ? new Date(new Date(selectedContract.checkoutDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700 dark:text-blue-200">
                            <strong>Note:</strong> Extending the contract will update the end date.
                            The tenant will be notified of the extension.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'uploadImages' && selectedContract && (
                <div className="py-2">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">�</div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                      Upload Contract Images
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      #{selectedContract.id?.slice(0, 8)} - {selectedContract.roomName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Status: {selectedContract.contractStatus}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors bg-gray-50 dark:bg-gray-700/30">
                      <input
                        type="file"
                        id="contract-images"
                        multiple
                        accept="image/*"
                        onChange={handleContractImageSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="contract-images"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg
                          className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                            Click to upload
                          </span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          PNG, JPG, JPEG up to 10MB each
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Multiple files supported
                        </p>
                      </label>
                    </div>

                    {contractImages.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                            {contractImages.length} file(s) selected
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setContractImages([]);
                            setContractImagePreviews([]);
                          }}
                          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    )}

                    {contractImagePreviews.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Preview</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-1">
                          {contractImagePreviews.map((preview, index) => (
                            <div
                              key={index}
                              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors shadow-sm"
                            >
                              <img
                                src={preview}
                                alt={`Contract page ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => handleRemoveContractImage(index)}
                                  className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 transition-all transform hover:scale-110 shadow-lg"
                                  title="Remove image"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs py-2 px-2 text-center">
                                <span className="font-medium">Page {index + 1}</span>
                                <span className="text-gray-300 text-[10px] block">{contractImages[index]?.name?.substring(0, 20)}...</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isUploading && uploadProgress > 0 && (
                      <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <svg className="animate-spin h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Uploading...</span>
                          </div>
                          <span className="text-cyan-600 dark:text-cyan-400 font-bold">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Please wait...</p>
                      </div>
                    )}

                    {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Important Information</h5>
                          <p className="text-sm text-blue-700 dark:text-blue-200">
                            Upload scanned images of the <strong>signed contract</strong>. Once uploaded:
                          </p>
                          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-200 mt-2 space-y-1 ml-2">
                            <li>Contract status → <strong className="text-green-600 dark:text-green-400">Active</strong></li>
                            <li>Room status → <strong className="text-orange-600 dark:text-orange-400">Occupied</strong></li>
                            <li>Tenant will be notified</li>
                          </ul>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCancelReason("");
                    setExtendDate("");
                    setContractImages([]);
                    setContractImagePreviews([]);
                    setUploadProgress(0);
                    setIsUploading(false);
                    setProcessingAction(false);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                {/* Edit button removed - use 3-step modal instead */}
                {modalType === 'delete' && (
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete Contract
                  </button>
                )}
                {modalType === 'cancel' && (
                  <button
                    onClick={handleConfirmCancel}
                    disabled={processingAction || !cancelReason.trim()}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {processingAction ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </span>
                    ) : (
                      'Cancel Contract'
                    )}
                  </button>
                )}
                {modalType === 'extend' && (
                  <button
                    onClick={handleConfirmExtend}
                    disabled={processingAction || !extendDate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {processingAction ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extending...
                      </span>
                    ) : (
                      'Extend Contract'
                    )}
                  </button>
                )}
                {modalType === 'uploadImages' && (
                  <button
                    onClick={handleConfirmUploadImages}
                    disabled={isUploading || contractImages.length === 0}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isUploading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading {uploadProgress}%
                      </span>
                    ) : (
                      'Upload Contract Images'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal - 3 Steps */}
      {showCreateContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {modalType === 'edit' ? ' Edit Contract' : '📝 Create New Contract'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateContractModal(false);
                    setCreateStep(1);
                    setModalType(''); // Reset modal type
                    setCurrentEditingRoomId(null); // Reset current editing room
                    isLoadingProfilesRef.current = false; // Reset ref
                    // Re-fetch rooms to remove edit mode filter
                    fetchRooms();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${createStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                    1
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${createStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${createStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                    2
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${createStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${createStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                    3
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${createStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${createStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                    4
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Contract Details</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Identity Profile</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Utility</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Services</span>
                </div>
              </div>

              {/* Step 1: Contract Details */}
              {createStep === 1 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    📋 Contract Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Room *
                      </label>
                      {roomsLoading ? (
                        <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading rooms...
                        </div>
                      ) : (
                        <select
                          value={contractData.roomId}
                          onChange={(e) => {
                            const selectedRoomId = e.target.value;
                            console.log("🏠 Room selected:", selectedRoomId);

                            // Find selected room to get price
                            const selectedRoom = rooms.find(r => r.id === selectedRoomId);
                            const roomPrice = selectedRoom?.price || selectedRoom?.roomPrice || 0;

                            console.log("💰 Room price:", roomPrice);

                            setContractData({
                              ...contractData,
                              roomId: selectedRoomId,
                              roomPrice: roomPrice
                            });
                          }}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${contractErrors.roomId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                        >
                          <option value="">Select a room...</option>
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.roomName || room.name || `Room ${room.id}`}
                            </option>
                          ))}
                        </select>
                      )}
                      {contractErrors.roomId && (
                        <p className="text-red-500 text-xs mt-1">{contractErrors.roomId}</p>
                      )}
                      {rooms.length === 0 && !roomsLoading && (
                        <p className="text-amber-500 text-xs mt-1">No rooms available. Please create rooms first.</p>
                      )}
                      {process.env.NODE_ENV === 'development' && (
                        <p className="text-gray-500 text-xs mt-1">
                          Debug: {rooms.length} rooms loaded for house {houseId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Check-in Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={contractData.checkinDate}
                        onChange={(e) => setContractData({
                          ...contractData,
                          checkinDate: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${contractErrors.checkinDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                      />
                      {contractErrors.checkinDate && (
                        <p className="text-red-500 text-xs mt-1">{contractErrors.checkinDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Check-out Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={contractData.checkoutDate}
                        onChange={(e) => setContractData({
                          ...contractData,
                          checkoutDate: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${contractErrors.checkoutDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                      />
                      {contractErrors.checkoutDate && (
                        <p className="text-red-500 text-xs mt-1">{contractErrors.checkoutDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deposit Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={contractData.depositAmount}
                        onChange={(e) => setContractData({
                          ...contractData,
                          depositAmount: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${contractErrors.depositAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        placeholder="0"
                      />
                      {contractErrors.depositAmount && (
                        <p className="text-red-500 text-xs mt-1">{contractErrors.depositAmount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Occupants *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="9"
                        value={contractData.numberOfOccupants}
                        onChange={(e) => setContractData({
                          ...contractData,
                          numberOfOccupants: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${contractErrors.numberOfOccupants ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        placeholder="1"
                      />
                      {contractErrors.numberOfOccupants && (
                        <p className="text-red-500 text-xs mt-1">{contractErrors.numberOfOccupants}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={contractData.notes}
                        onChange={(e) => setContractData({
                          ...contractData,
                          notes: e.target.value
                        })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                        rows="3"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowCreateContractModal(false);
                        setCreateStep(1);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Next: Identity Profile →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Identity Profiles (All Occupants) */}
              {/* Step 2: Identity Profile */}
              {createStep === 2 && (
                <div>
                  {/* Debug logging */}
                  {console.log("🔍 Step 2 - Current profiles state:", profiles)}
                  {console.log("🔍 Step 2 - Profiles count:", profiles.length)}
                  {console.log("🔍 Step 2 - Modal type:", modalType)}

                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    👥 Identity Profiles for All Occupants ({profiles.length} {profiles.length === 1 ? 'person' : 'people'})
                  </h4>

                  {/* Loop through all profiles */}
                  {profiles.map((profile, profileIndex) => (
                    <div key={profileIndex} className="mb-8 p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h5 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          {profileIndex + 1}
                        </span>
                        Profile {profileIndex + 1} of {profiles.length}
                        {profileIndex === 0 && <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Representative)</span>}
                      </h5>

                      {/* SEARCH CCCD - AT TOP OF FORM */}
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
                          🔍 Quick Search by Citizen ID (CCCD/CMND)
                          <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">(Enter CCCD to auto-fill all fields)</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={profile.citizenIdNumber || ''}
                            onChange={(e) => updateProfile(profileIndex, 'citizenIdNumber', e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                searchIdentityProfileByCCCD(profileIndex, profile.citizenIdNumber);
                              }
                            }}
                            className="flex-1 p-3 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                            placeholder="Enter Citizen ID (9-18 digits)"
                            maxLength="18"
                          />
                          <button
                            type="button"
                            onClick={() => searchIdentityProfileByCCCD(profileIndex, profile.citizenIdNumber)}
                            disabled={searchingCCCD[profileIndex] || !profile.citizenIdNumber || profile.citizenIdNumber.length < 9}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                            title="Search existing profile by Citizen ID"
                          >
                            {searchingCCCD[profileIndex] ? (
                              <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search Profile
                              </>
                            )}
                          </button>
                        </div>
                        {/* <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          💡 Tip: Press Enter or click Search to find and auto-fill profile information
                        </p> */}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                          <input type="text" value={profile.fullName} onChange={(e) => updateProfile(profileIndex, 'fullName', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_fullName`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Enter full name" />
                          {profileErrors[`profile${profileIndex}_fullName`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_fullName`]}</p>}
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
                          <select
                            value={profile.gender || "Male"}
                            onChange={(e) => updateProfile(profileIndex, 'gender', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth *</label>
                          <input type="date" value={profile.dateOfBirth} onChange={(e) => updateProfile(profileIndex, 'dateOfBirth', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_dateOfBirth`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                          {profileErrors[`profile${profileIndex}_dateOfBirth`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_dateOfBirth`]}</p>}
                        </div>

                        {/* Phone Number - Now without search button */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                          <input
                            type="tel"
                            value={profile.phoneNumber}
                            onChange={(e) => updateProfile(profileIndex, 'phoneNumber', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_phoneNumber`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Enter phone number"
                          />
                          {profileErrors[`profile${profileIndex}_phoneNumber`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_phoneNumber`]}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                          <input type="email" value={profile.email} onChange={(e) => updateProfile(profileIndex, 'email', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                            placeholder="Enter email (optional)" />
                        </div>

                        {/* Province */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Province *</label>
                          {console.log(`🔍 Rendering Province Select - Profile ${profileIndex} provinceId:`, profile.provinceId, 'type:', typeof profile.provinceId)}
                          <select value={profile.provinceId} onChange={(e) => handleProvinceChange(profileIndex, e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_provinceId`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            <option value="">Select province...</option>
                            {provinces.map((p) => {
                              const isSelected = String(p.code) === String(profile.provinceId);
                              if (isSelected) console.log(`✅ This option should be selected:`, p.name, p.code);
                              return <option key={p.code} value={String(p.code)}>{p.name}</option>;
                            })}
                          </select>
                          {profileErrors[`profile${profileIndex}_provinceId`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_provinceId`]}</p>}
                        </div>

                        {/* Ward */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ward *</label>
                          <select value={profile.wardId} onChange={(e) => handleWardChange(profileIndex, e.target.value)}
                            disabled={!profile.provinceId}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_wardId`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${!profile.provinceId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <option value="">{!profile.provinceId ? 'Select province first...' : 'Select ward...'}</option>
                            {(wardsByProfile[profileIndex] || []).map((w) => <option key={w.code} value={String(w.code)}>{w.name}</option>)}
                          </select>
                          {profileErrors[`profile${profileIndex}_wardId`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_wardId`]}</p>}
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address *</label>
                          <input type="text" value={profile.address} onChange={(e) => updateProfile(profileIndex, 'address', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_address`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Enter detailed address" />
                          {profileErrors[`profile${profileIndex}_address`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_address`]}</p>}
                        </div>

                        {/* Temporary Residence */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Temporary Residence *</label>
                          <input type="text" value={profile.temporaryResidence} onChange={(e) => updateProfile(profileIndex, 'temporaryResidence', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_temporaryResidence`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Enter temporary residence" />
                          {profileErrors[`profile${profileIndex}_temporaryResidence`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_temporaryResidence`]}</p>}
                        </div>

                        {/* Citizen ID Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Citizen ID Number *</label>
                          <input type="text" value={profile.citizenIdNumber} onChange={(e) => updateProfile(profileIndex, 'citizenIdNumber', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_citizenIdNumber`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Enter citizen ID" />
                          {profileErrors[`profile${profileIndex}_citizenIdNumber`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_citizenIdNumber`]}</p>}
                        </div>

                        {/* Citizen ID Issued Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Citizen ID Issued Date *</label>
                          <input type="date" value={profile.citizenIdIssuedDate} onChange={(e) => updateProfile(profileIndex, 'citizenIdIssuedDate', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_citizenIdIssuedDate`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                          {profileErrors[`profile${profileIndex}_citizenIdIssuedDate`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_citizenIdIssuedDate`]}</p>}
                        </div>

                        {/* Citizen ID Issued Place */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Citizen ID Issued Place *</label>
                          <input type="text" value={profile.citizenIdIssuedPlace} onChange={(e) => updateProfile(profileIndex, 'citizenIdIssuedPlace', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_citizenIdIssuedPlace`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Enter place of issue" />
                          {profileErrors[`profile${profileIndex}_citizenIdIssuedPlace`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_citizenIdIssuedPlace`]}</p>}
                        </div>

                        {/* Front Image URL */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Front ID Image URL *</label>
                          <input type="url" value={profile.frontImageUrl} onChange={(e) => updateProfile(profileIndex, 'frontImageUrl', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_frontImageUrl`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="https://..." />
                          {profileErrors[`profile${profileIndex}_frontImageUrl`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_frontImageUrl`]}</p>}
                        </div>

                        {/* Back Image URL */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Back ID Image URL *</label>
                          <input type="url" value={profile.backImageUrl} onChange={(e) => updateProfile(profileIndex, 'backImageUrl', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${profileErrors[`profile${profileIndex}_backImageUrl`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="https://..." />
                          {profileErrors[`profile${profileIndex}_backImageUrl`] && <p className="text-red-500 text-xs mt-1">{profileErrors[`profile${profileIndex}_backImageUrl`]}</p>}
                        </div>

                        {/* Avatar URL */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar URL (Optional)</label>
                          <input type="url" value={profile.avatarUrl} onChange={(e) => updateProfile(profileIndex, 'avatarUrl', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                            placeholder="https://... (optional)" />
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                          <textarea value={profile.notes} onChange={(e) => updateProfile(profileIndex, 'notes', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                            rows="2" placeholder="Additional notes (optional)" />
                        </div>

                        {/* Image Previews */}
                        {(profile.avatarUrl || profile.frontImageUrl || profile.backImageUrl) && (
                          <div className="md:col-span-2">
                            <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📷 Image Previews</h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Avatar Preview */}
                              {profile.avatarUrl && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Avatar</p>
                                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden aspect-square">
                                    <img
                                      src={profile.avatarUrl}
                                      alt="Avatar"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs">Image not available</div>';
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              {/* Front ID Preview */}
                              {profile.frontImageUrl && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Front ID</p>
                                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden aspect-video">
                                    <img
                                      src={profile.frontImageUrl}
                                      alt="Front ID"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs">Image not available</div>';
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              {/* Back ID Preview */}
                              {profile.backImageUrl && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Back ID</p>
                                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden aspect-video">
                                    <img
                                      src={profile.backImageUrl}
                                      alt="Back ID"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs">Image not available</div>';
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Step 2 Actions */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handlePreviousStep}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Utility Readings */}
              {createStep === 3 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ⚡ Utility Readings (Electricity & Water)
                  </h4>

                  <div className="space-y-6">
                    {/* Electricity Reading */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h5 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <span className="mr-2">⚡</span>
                        Electricity Reading
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Index * (kWh)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={utilityReadingData.electricityReading.currentIndex}
                            onChange={(e) => setUtilityReadingData({
                              ...utilityReadingData,
                              electricityReading: {
                                ...utilityReadingData.electricityReading,
                                currentIndex: e.target.value
                              }
                            })}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${utilityErrors.electricityCurrentIndex ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="Enter electricity reading"
                          />
                          {utilityErrors.electricityCurrentIndex && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.electricityCurrentIndex}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price (VND/kWh)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={utilityReadingData.electricityReading.price}
                            onChange={(e) => setUtilityReadingData({
                              ...utilityReadingData,
                              electricityReading: {
                                ...utilityReadingData.electricityReading,
                                price: e.target.value
                              }
                            })}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${utilityErrors.electricityPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="Enter electricity price"
                          />
                          {utilityErrors.electricityPrice && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.electricityPrice}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Note
                          </label>
                          <input
                            type="text"
                            maxLength={100}
                            value={utilityReadingData.electricityReading.note}
                            onChange={(e) => setUtilityReadingData({
                              ...utilityReadingData,
                              electricityReading: {
                                ...utilityReadingData.electricityReading,
                                note: e.target.value
                              }
                            })}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${utilityErrors.electricityNote ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="Add note (max 100 chars)"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {utilityReadingData.electricityReading.note.length}/100 characters
                          </div>
                          {utilityErrors.electricityNote && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.electricityNote}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Water Reading */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h5 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <span className="mr-2">💧</span>
                        Water Reading1
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Index * (m³)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={utilityReadingData.waterReading.currentIndex}
                            onChange={(e) => setUtilityReadingData({
                              ...utilityReadingData,
                              waterReading: {
                                ...utilityReadingData.waterReading,
                                currentIndex: e.target.value
                              }
                            })}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${utilityErrors.waterCurrentIndex ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="Enter water reading"
                          />
                          {utilityErrors.waterCurrentIndex && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.waterCurrentIndex}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price (VND/m³)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={utilityReadingData.waterReading.price}
                            onChange={(e) => setUtilityReadingData({
                              ...utilityReadingData,
                              waterReading: {
                                ...utilityReadingData.waterReading,
                                price: e.target.value
                              }
                            })}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${utilityErrors.waterPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="Enter water price"
                          />
                          {utilityErrors.waterPrice && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.waterPrice}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Note
                          </label>
                          <input
                            type="text"
                            maxLength={100}
                            value={utilityReadingData.waterReading.note}
                            onChange={(e) => setUtilityReadingData({
                              ...utilityReadingData,
                              waterReading: {
                                ...utilityReadingData.waterReading,
                                note: e.target.value
                              }
                            })}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${utilityErrors.waterNote ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="Add note (max 100 chars)"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {utilityReadingData.waterReading.note.length}/100 characters
                          </div>
                          {utilityErrors.waterNote && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.waterNote}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Information Box */}
                    {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                    
                      </div> */}
                    {/* </div> */}
                  </div>

                  {/* Step 3 Actions */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handlePreviousStep}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Services */}
              {createStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      🛎️ Select Services (Optional)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Choose the services that will be included in this contract
                    </p>

                    {loadingServices ? (
                      <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading services...</span>
                      </div>
                    ) : availableServices.length === 0 ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                        <svg className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">No Services Available</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Please create services in the Services Management page first
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {selectedServices.length} of {availableServices.length} selected
                            </span>
                            {selectedServices.length > 0 && (
                              <button
                                onClick={() => setSelectedServices([])}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                              >
                                Clear All
                              </button>
                            )}
                          </div>

                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {availableServices.map((service) => {
                              const isSelected = selectedServices.some(s => s.id === service.id);
                              return (
                                <label
                                  key={service.id}
                                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedServices([...selectedServices, service]);
                                      } else {
                                        setSelectedServices(selectedServices.filter(s => s.id !== service.id));
                                      }
                                    }}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {service.serviceName}
                                      </span>
                                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {service.price?.toLocaleString('vi-VN')} ₫
                                      </span>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Information Box
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Service Information
                          </h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Services are optional - you can skip this step if no services are needed</li>
                              <li>Selected services will be billed monthly along with the rent</li>
                              <li>Service prices are fixed and defined in Services Management</li>
                              <li>You can modify services later by editing the contract</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </div>

                  {/* Step 4 Actions */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handlePreviousStep}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={handleCreateContract}
                      className={`px-6 py-2 ${modalType === 'edit' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={creatingContract}
                    >
                      {creatingContract ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {modalType === 'edit' ? 'Updating Contract...' : 'Creating Contract...'}
                        </span>
                      ) : (
                        modalType === 'edit' ? 'Update Contract' : 'Create Contract'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
      }

      {/* Signature Setting Modal */}
      {
        showSignatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {signatureStep === 1 ? 'Sign Contract - Create Signature' : 'Sign Contract - OTP Verification'}
                  </h2>
                  <button
                    onClick={handleCloseSignatureModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Step Indicator */}
                <div className="mb-6 flex items-center justify-center">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${signatureStep === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>
                      {signatureStep === 1 ? '1' : '✓'}
                    </div>
                    <div className={`w-24 h-1 ${signatureStep === 2 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${signatureStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'}`}>
                      2
                    </div>
                  </div>
                </div>

                {/* STEP 1: Create Signature */}
                {signatureStep === 1 && (
                  <>
                    {/* Full Name Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Draw Signature */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Draw your signature below:
                      </p>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <canvas
                          ref={canvasRef}
                          width={800}
                          height={200}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white cursor-crosshair"
                        />
                        <button
                          onClick={clearCanvas}
                          className="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Agreement Checkbox
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="flex items-start space-x-3">
                      <div className="flex items-center h-5 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        I agree that my signature will be the electronic representation of my signature for all purposes when I use it on documents, including legally binding contracts.
                      </span>
                    </label>
                  </div> */}

                    {/* Action Buttons - Step 1 */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleCloseSignatureModal}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleContinueToOtp}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!signaturePreview || sendingOtp}
                      >
                        {sendingOtp ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending OTP...
                          </span>
                        ) : (
                          'Continue →'
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 2: OTP Verification */}
                {signatureStep === 2 && (
                  <>
                    <div className="mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          OTP code has been sent to email: <strong>{signatureEmail}</strong>
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          Please check your inbox or spam folder
                        </p>
                      </div>

                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Enter OTP Code (6 digits) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtpCode(value);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                        maxLength={6}
                      />

                      {/* Timer and Resend */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {otpTimer > 0 ? (
                            <span>Code expires in: <strong className="text-blue-600">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong></span>
                          ) : (
                            <span className="text-red-600">OTP code expired</span>
                          )}
                        </div>
                        <button
                          onClick={handleResendOtp}
                          disabled={!canResendOtp || sendingOtp}
                          className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                          {sendingOtp ? 'Sending...' : 'Resend OTP'}
                        </button>
                      </div>
                    </div>

                    {/* Signature Preview in Step 2 */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Your signature:</h4>
                      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 flex items-center justify-center min-h-[100px]">
                        {signaturePreview && (
                          <img
                            src={signaturePreview}
                            alt="Signature"
                            className="max-w-full max-h-[80px] object-contain"
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Signer: <strong>{signatureName}</strong>
                      </p>
                    </div>

                    {/* Action Buttons - Step 2 */}
                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setSignatureStep(1)}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                        disabled={verifyingOtp}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleConfirmSignature}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={otpCode.length !== 6 || verifyingOtp}
                      >
                        {verifyingOtp ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                          </span>
                        ) : (
                          '✓ Confirm & Sign'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Create Contract Modal - 3 Steps */}
    </div >
  );
}