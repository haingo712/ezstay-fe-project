"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import contractService from "@/services/contractService";
import roomService from "@/services/roomService";
import { useAuth } from "@/hooks/useAuth";
import { jsPDF } from "jspdf";
import "jspdf-autotable";


export default function ContractsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const houseId = params.id; // Get boarding house ID from URL

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'delete', 'cancel', 'extend', 'addDependent'
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Cancel and Extend contract states
  const [cancelReason, setCancelReason] = useState("");
  const [extendDate, setExtendDate] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Add Dependent states - matching backend CreateIdentityProfileDto
  const [dependentData, setDependentData] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    provinceId: "",
    wardId: "",
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
  const [dependentErrors, setDependentErrors] = useState({});

  // New contract creation states
  const [createStep, setCreateStep] = useState(1); // 1: contract, 2: identity profile, 3: utility readings
  const [creatingContract, setCreatingContract] = useState(false);
  
  // Contract form data
  const [contractData, setContractData] = useState({
    tenantId: "", // Default or will be generated
    roomId: "", // Will be selected
    checkinDate: "",
    checkoutDate: "",
    depositAmount: 0,
    numberOfOccupants: 1,
    notes: ""
  });

  // Identity profiles form data
  const [identityProfileData, setIdentityProfileData] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    provinceId: "",
    wardId: "",
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
  const [addressLoading, setAddressLoading] = useState(false);

  // Dependent address selection states
  const [selectedDependentProvince, setSelectedDependentProvince] = useState("");
  const [selectedDependentWard, setSelectedDependentWard] = useState("");
  const [dependentWards, setDependentWards] = useState([]);
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

  useEffect(() => {
    // Load provinces data when component mounts
    fetchProvinces();
  }, []);

  const fetchData = async () => {
    if (!user || !user.id) {
      console.log("❌ No user ID available for fetching contracts");
      return;
    }

    try {
      setLoading(true);
      console.log("📄 Fetching contracts for owner:", user.id);
      
      // Fetch contracts for this owner (no need to pass user.id since it's from JWT token)
      const contractsResponse = await contractService.getByOwnerId();
      console.log("📄 Contracts fetched:", contractsResponse);
      
      // Enrich contracts with room information
      const enrichedContracts = await Promise.all(
        (contractsResponse || []).map(async (contract) => {
          try {
            if (contract.roomId) {
              const roomResponse = await roomService.getById(contract.roomId);
              console.log(`🏠 Room info for ${contract.roomId}:`, roomResponse);
              return {
                ...contract,
                roomName: roomResponse?.name || roomResponse?.roomName || 'Unknown Room',
                roomDetails: roomResponse
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
      
      console.log("📄 Enriched contracts:", enrichedContracts);
      setContracts(enrichedContracts);
      
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

  const handleProvinceChange = (provinceCode) => {
    console.log("🏛️ Province selected:", provinceCode);
    
    // Update provinceId in form data
    setIdentityProfileData({
      ...identityProfileData,
      provinceId: provinceCode,
      wardId: "" // Reset ward when province changes
    });

    // Find selected province and update wards
    const selectedProvince = provinces.find(p => p.code.toString() === provinceCode);
    if (selectedProvince) {
      setWards(selectedProvince.wards || []);
      console.log("🏘️ Wards updated:", selectedProvince.wards?.length);
    } else {
      setWards([]);
    }
  };

  const handleWardChange = (wardCode) => {
    console.log("🏘️ Ward selected:", wardCode);
    setIdentityProfileData({
      ...identityProfileData,
      wardId: wardCode
    });
  };

  // Handler to update wards when province changes in dependent form
  useEffect(() => {
    console.log("🔍 Debug - dependentData.provinceId:", dependentData.provinceId);
    console.log("🔍 Debug - vietnamProvinces length:", vietnamProvinces.length);
    
    if (dependentData.provinceId) {
      // Convert provinceId to number for comparison since JSON has numeric codes
      const provinceCode = parseInt(dependentData.provinceId);
      const selectedProvince = vietnamProvinces.find(p => p.code === provinceCode);
      
      console.log("🔍 Debug - searching for province code:", provinceCode);
      console.log("🔍 Debug - found province:", selectedProvince?.name);
      
      if (selectedProvince) {
        setDependentWards(selectedProvince.wards || []);
        console.log("🏘️ Dependent Wards updated:", selectedProvince.wards?.length, "wards");
      } else {
        console.log("❌ Province not found, clearing wards");
        setDependentWards([]);
      }
    } else {
      console.log("🔍 No provinceId selected, clearing wards");
      setDependentWards([]);
    }
  }, [dependentData.provinceId, vietnamProvinces]);

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditContract = async (contract) => {
    console.log("✏️ Opening edit contract modal for:", contract.id);
    console.log("📋 Contract data received:", contract);
    
    try {
      // Fetch full contract details to ensure we have all data
      console.log("🔄 Fetching full contract details...");
      const fullContract = await contractService.getById(contract.id);
      console.log("✅ Full contract data fetched:", fullContract);
      
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
    
      // Populate identity profile if exists
      if (fullContract.identityProfiles && fullContract.identityProfiles.length > 0) {
        const profile = fullContract.identityProfiles[0]; // Get first profile
        console.log("👤 Identity profile found:", profile);
        
        setIdentityProfileData({
          fullName: profile.fullName || "",
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : "",
          phoneNumber: profile.phoneNumber || "",
          email: profile.email || "",
          provinceId: profile.provinceId || "",
          wardId: profile.wardId || "",
          address: profile.address || "",
          temporaryResidence: profile.temporaryResidence || "",
          citizenIdNumber: profile.citizenIdNumber || "",
          citizenIdIssuedDate: profile.citizenIdIssuedDate ? profile.citizenIdIssuedDate.split('T')[0] : "",
          citizenIdIssuedPlace: profile.citizenIdIssuedPlace || "",
          notes: profile.notes || "",
          avatarUrl: profile.avatarUrl || "",
          frontImageUrl: profile.frontImageUrl || "",
          backImageUrl: profile.backImageUrl || ""
        });
        
        // Load wards for the selected province
        if (profile.provinceId) {
          const provinceCode = parseInt(profile.provinceId);
          const selectedProvince = provinces.find(p => p.code === provinceCode);
          if (selectedProvince) {
            setWards(selectedProvince.wards || []);
            console.log("🏘️ Wards loaded for province:", provinceCode, "count:", selectedProvince.wards?.length);
          }
        }
      } else {
        console.log("⚠️ No identity profiles found for this contract");
      }
      
      // Populate utility readings if exists
      if (fullContract.utilityReadings && fullContract.utilityReadings.length > 0) {
        console.log("⚡ Utility readings found:", fullContract.utilityReadings);
        
        const electricityReading = fullContract.utilityReadings.find(r => r.utilityType === 0 || r.utilityType === "Electricity");
        const waterReading = fullContract.utilityReadings.find(r => r.utilityType === 1 || r.utilityType === "Water");
        
        setUtilityReadingData({
          electricityReading: {
            price: electricityReading?.price?.toString() || "",
            note: electricityReading?.note || "",
            currentIndex: electricityReading?.currentIndex?.toString() || ""
          },
          waterReading: {
            price: waterReading?.price?.toString() || "",
            note: waterReading?.note || "",
            currentIndex: waterReading?.currentIndex?.toString() || ""
          }
        });
        
        console.log("⚡ Utility data populated:", {
          electricity: electricityReading?.currentIndex,
          water: waterReading?.currentIndex
        });
      } else {
        console.log("⚠️ No utility readings found for this contract");
      }
      
      // Set modal type and open modal
      setModalType('edit');
      setCreateStep(1); // Start from step 1
      setShowCreateContractModal(true);
      
      console.log("✅ Edit modal opened successfully");
      
    } catch (error) {
      console.error("❌ Error fetching contract details:", error);
      alert("Error loading contract details: " + (error.message || "Unknown error"));
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

  const handleAddDependent = (contract) => {
    setSelectedContract(contract);
    // Reset dependent form data
    setDependentData({
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      email: "",
      provinceId: "",
      wardId: "",
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
    setDependentErrors({});
    setWards([]); // Reset wards for address selection
    setModalType('addDependent');
    setShowModal(true);
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
    
    if (!identityProfileData.fullName.trim()) errors.fullName = "Full name is required";
    if (!identityProfileData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!identityProfileData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    if (!identityProfileData.provinceId) errors.provinceId = "Please select a province";
    if (!identityProfileData.wardId) errors.wardId = "Please select a ward";
    if (!identityProfileData.address.trim()) errors.address = "Address is required";
    if (!identityProfileData.temporaryResidence.trim()) errors.temporaryResidence = "Temporary residence is required";
    if (!identityProfileData.citizenIdNumber.trim()) errors.citizenIdNumber = "Citizen ID number is required";
    if (!identityProfileData.citizenIdIssuedDate) errors.citizenIdIssuedDate = "Citizen ID issued date is required";
    if (!identityProfileData.citizenIdIssuedPlace.trim()) errors.citizenIdIssuedPlace = "Citizen ID issued place is required";
    if (!identityProfileData.frontImageUrl.trim()) errors.frontImageUrl = "Front image of ID is required";
    if (!identityProfileData.backImageUrl.trim()) errors.backImageUrl = "Back image of ID is required";

    // Email validation
    if (identityProfileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identityProfileData.email)) {
      errors.email = "Invalid email format";
    }

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
    }
  };

  const handlePreviousStep = () => {
    if (createStep === 2) {
      setCreateStep(1);
    } else if (createStep === 3) {
      setCreateStep(2);
    }
  };

  const handleCreateContract = async () => {
    const isEditMode = modalType === 'edit';
    console.log(`🚀 Starting contract ${isEditMode ? 'update' : 'creation'}...`);
    console.log("📝 Current form data:", {
      contractData,
      identityProfileData,
      utilityReadingData
    });

    if (!validateAllSteps()) {
      console.log("❌ Validation failed - stopping operation");
      alert(`Please fix all validation errors before ${isEditMode ? 'updating' : 'creating'} the contract.`);
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
        alert("Invalid Room ID format. Please select a valid room.");
        return;
      }

      // Prepare request data
      const testSimpleData = {
        TenantId: contractData.tenantId || "00000000-0000-0000-0000-000000000000",
        RoomId: contractData.roomId,
        CheckinDate: new Date(contractData.checkinDate).toISOString(),
        CheckoutDate: new Date(contractData.checkoutDate).toISOString(),
        DepositAmount: parseFloat(contractData.depositAmount) || 0,
        NumberOfOccupants: parseInt(contractData.numberOfOccupants) || 1,
        Notes: contractData.notes || "",
        IdentityProfiles: {
          FullName: identityProfileData.fullName || "Test User",
          DateOfBirth: new Date(identityProfileData.dateOfBirth).toISOString(),
          PhoneNumber: identityProfileData.phoneNumber || "0123456789",
          Email: identityProfileData.email || "test@test.com",
          ProvinceId: identityProfileData.provinceId ? identityProfileData.provinceId.toString() : "1",
          WardId: identityProfileData.wardId ? identityProfileData.wardId.toString() : "1",
          Address: identityProfileData.address || "Test Address",
          TemporaryResidence: identityProfileData.temporaryResidence || "Test Residence",
          CitizenIdNumber: identityProfileData.citizenIdNumber || "123456789",
          CitizenIdIssuedDate: new Date(identityProfileData.citizenIdIssuedDate).toISOString(),
          CitizenIdIssuedPlace: identityProfileData.citizenIdIssuedPlace || "Test Place",
          Notes: identityProfileData.notes || "",
          AvatarUrl: identityProfileData.avatarUrl || "",
          FrontImageUrl: identityProfileData.frontImageUrl || "https://example.com/front.jpg",
          BackImageUrl: identityProfileData.backImageUrl || "https://example.com/back.jpg"
        },
        ElectricityReading: {
          Price: utilityReadingData.electricityReading.price ? parseFloat(utilityReadingData.electricityReading.price) : null,
          Note: utilityReadingData.electricityReading.note || "",
          CurrentIndex: parseFloat(utilityReadingData.electricityReading.currentIndex) || 0
        },
        WaterReading: {
          Price: utilityReadingData.waterReading.price ? parseFloat(utilityReadingData.waterReading.price) : null,
          Note: utilityReadingData.waterReading.note || "",
          CurrentIndex: parseFloat(utilityReadingData.waterReading.currentIndex) || 0
        }
      };

      // Use the test data with fallbacks
      const requestData = testSimpleData;

      console.log(`📋 ${isEditMode ? 'Updating' : 'Creating'} contract with profiles and utilities:`, requestData);
      console.log("📋 Request data JSON:", JSON.stringify(requestData, null, 2));
      console.log("📋 Request data structure validation:");
      console.log("- TenantId:", requestData.TenantId);
      console.log("- RoomId:", requestData.RoomId);
      console.log("- IdentityProfiles:", requestData.IdentityProfiles);
      console.log("- ElectricityReading:", requestData.ElectricityReading);
      console.log("- WaterReading:", requestData.WaterReading);
      
      let result;
      if (isEditMode) {
        console.log("📝 Updating contract ID:", selectedContract.id);
        result = await contractService.update(selectedContract.id, requestData);
      } else {
        console.log("✨ Creating new contract");
        result = await contractService.create(requestData);
      }
      
      alert(`Contract ${isEditMode ? 'updated' : 'created'} successfully with identity profiles and utility readings!`);
      
      // Reset form and close modal
      setShowCreateContractModal(false);
      setCreateStep(1);
      setModalType(''); // Reset modal type
      setCurrentEditingRoomId(null); // Reset current editing room
      setContractData({
        tenantId: "",
        roomId: "",
        checkinDate: "",
        checkoutDate: "",
        depositAmount: 0,
        numberOfOccupants: 1,
        notes: ""
      });
      setIdentityProfileData({
        fullName: "",
        dateOfBirth: "",
        phoneNumber: "",
        email: "",
        provinceId: "",
        wardId: "",
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
      
      // Show detailed error message
      let errorMessage = `Error ${isEditMode ? 'updating' : 'creating'} contract: `;
      if (error.response?.status === 400) {
        if (error.response.data?.errors) {
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
      
      alert(errorMessage);
    } finally {
      setCreatingContract(false);
    }
  };



  const handleConfirmDelete = async () => {
    try {
      await contractService.delete(selectedContract.id);
      await fetchData(); // Refresh data
      setShowModal(false);
      alert("Contract deleted successfully!");
    } catch (error) {
      console.error("Error deleting contract:", error);
      alert("Error deleting contract: " + (error.message || "Unknown error"));
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    try {
      setProcessingAction(true);
      await contractService.terminate(selectedContract.id, cancelReason);
      await fetchData(); // Refresh data
      setShowModal(false);
      setCancelReason("");
      alert("Contract cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling contract:", error);
      alert("Error cancelling contract: " + (error.message || "Unknown error"));
    } finally {
      setProcessingAction(false);
    }
  };

  const handleConfirmExtend = async () => {
    if (!extendDate) {
      alert("Please select a new end date");
      return;
    }

    const currentEndDate = new Date(selectedContract.checkoutDate);
    const newEndDate = new Date(extendDate);
    
    if (newEndDate <= currentEndDate) {
      alert("New end date must be after the current end date");
      return;
    }

    try {
      setProcessingAction(true);
      await contractService.extend(selectedContract.id, extendDate);
      await fetchData(); // Refresh data
      setShowModal(false);
      setExtendDate("");
      alert("Contract extended successfully!");
    } catch (error) {
      console.error("Error extending contract:", error);
      alert("Error extending contract: " + (error.message || "Unknown error"));
    } finally {
      setProcessingAction(false);
    }
  };

  const validateDependentData = () => {
    const errors = {};
    
    if (!dependentData.fullName.trim()) errors.fullName = "Full name is required";
    if (!dependentData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!dependentData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    if (!dependentData.provinceId) errors.provinceId = "Please select a province";
    if (!dependentData.wardId) errors.wardId = "Please select a ward";
    if (!dependentData.address.trim()) errors.address = "Address is required";
    if (!dependentData.temporaryResidence.trim()) errors.temporaryResidence = "Temporary residence is required";
    if (!dependentData.citizenIdNumber.trim()) errors.citizenIdNumber = "Citizen ID number is required";
    if (!dependentData.citizenIdIssuedDate) errors.citizenIdIssuedDate = "Citizen ID issued date is required";
    if (!dependentData.citizenIdIssuedPlace.trim()) errors.citizenIdIssuedPlace = "Citizen ID issued place is required";
    if (!dependentData.frontImageUrl.trim()) errors.frontImageUrl = "Front ID image URL is required";
    if (!dependentData.backImageUrl.trim()) errors.backImageUrl = "Back ID image URL is required";

    setDependentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmAddDependent = async () => {
    if (!validateDependentData()) {
      return;
    }

    // Check if adding this dependent would exceed numberOfOccupants
    const currentDependents = selectedContract.identityProfiles?.length || 0;
    const maxOccupants = selectedContract.numberOfOccupants || 1;
    
    if (currentDependents >= maxOccupants) {
      alert(`Cannot add more dependents. Maximum occupants allowed: ${maxOccupants}`);
      return;
    }

    try {
      setProcessingAction(true);
      await contractService.addDependent(selectedContract.id, dependentData);
      await fetchData(); // Refresh data
      setShowModal(false);
      // Reset form
      setDependentData({
        fullName: "",
        dateOfBirth: "",
        phoneNumber: "",
        email: "",
        provinceId: "",
        wardId: "",
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
      alert("Dependent added successfully!");
    } catch (error) {
      console.error("Error adding dependent:", error);
      alert("Error adding dependent: " + (error.message || "Unknown error"));
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCreateContractSuccess = async () => {
    // Close the modal
    setShowCreateContractModal(false);
    // Refresh contracts list
    await fetchData();
    alert("Contract created successfully!");
  };

  const generateContractPDF = (contract) => {
    const doc = new jsPDF();
    
    // Get tenant information from identity profiles
    const tenant = contract.identityProfiles?.[0] || {};
    const checkinDate = contract.checkinDate ? new Date(contract.checkinDate) : new Date();
    const checkoutDate = contract.checkoutDate ? new Date(contract.checkoutDate) : new Date();
    
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
    
    doc.text(`Contract No: ${contract.id?.slice(0, 8) || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 15;
    
    // Parties information
    doc.setFont(undefined, 'bold');
    doc.text('THE CONTRACTING PARTIES:', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.text('Party A (Lessor): EZStay Property Management', 20, yPos);
    yPos += 7;
    doc.text('Address: Ho Chi Minh City, Vietnam', 20, yPos);
    yPos += 7;
    doc.text('Phone: +84 xxx xxx xxx', 20, yPos);
    yPos += 10;
    
    doc.text(`Party B (Lessee): ${tenant.fullName || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`Address: ${tenant.address || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`Phone: ${tenant.phoneNumber || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`Citizen ID: ${tenant.citizenIdNumber || 'N/A'}`, 20, yPos);
    yPos += 15;
    
    // Introduction
    const introText = 'After discussion, the two parties have mutually agreed to enter into the house lease contract with the following agreement:';
    const introLines = doc.splitTextToSize(introText, 170);
    doc.text(introLines, 20, yPos);
    yPos += introLines.length * 7 + 10;
    
    // Article 1
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 1: THE HOUSE FOR LEASE, PURPOSES OF USE', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const article1Text = `Party A agrees to lease Party B the room "${contract.roomName || 'N/A'}" according to the property management system. The room is fully furnished and ready for residential use. Equipment and facilities are specifically listed in the minutes of handover between the two parties.`;
    const article1Lines = doc.splitTextToSize(article1Text, 170);
    doc.text(article1Lines, 20, yPos);
    yPos += article1Lines.length * 7 + 10;
    
    // Article 2
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 2: DURATION OF THE LEASE', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const durationMonths = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24 * 30));
    const article2Text = `Duration of the lease: ${durationMonths} months, commencing on ${checkinDate.toLocaleDateString('en-GB')} and ending on ${checkoutDate.toLocaleDateString('en-GB')}. After the duration, the two parties will renegotiate the rental fee, and Party B will be given priority to sign a new contract.`;
    const article2Lines = doc.splitTextToSize(article2Text, 170);
    doc.text(article2Lines, 20, yPos);
    yPos += article2Lines.length * 7 + 10;
    
    // Article 3
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 3: RENTAL FEE, SECURITY DEPOSIT AND PAYMENT METHOD', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const monthlyRent = contract.roomDetails?.price || 'TBD';
    const depositAmount = contract.depositAmount || 0;
    const article3Text = `Rental fee: ${monthlyRent} VND/month. Party B will pay Party A an amount of security deposit: ${depositAmount} VND. This amount will be returned by Party A to Party B after the contract liquidation and after deduction of expenses for electricity, water, and repair of the house and furniture damaged by Party B during the period of usage (if any). Payment method: Party B will pay Party A the rent on monthly basis. Payment is not later than 05 days of each month.`;
    const article3Lines = doc.splitTextToSize(article3Text, 170);
    doc.text(article3Lines, 20, yPos);
    yPos += article3Lines.length * 7 + 10;

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Article 4
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 4: RESPONSIBILITIES OF THE TWO PARTIES', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.text('1/ Party A\'s responsibilities:', 20, yPos);
    yPos += 7;
    const partyAResponsibilities = [
      'Ensuring and undertaking that the house is owned by Party A, Party A has full rights to lease it.',
      'Handing over the house, its equipment and facilities to Party B on the effective date of the contract.',
      'Supporting and creating favorable conditions for Party B to register temporary residence when Party B has a need to register.',
      'Ensuring the full and exclusive use rights for Party B.',
      'Undertaking to comply with the rent agreement under this contract during the lease term.',
      'If terminating the contract before its expiration, Party A must return the security deposit to Party B and make compensation equal to the deposit amount, except for force majeure cases as prescribed by the law.',
      'Before the expiry of the lease contract, Party A must notify Party B at least 01 (one) month in advance so that Party B arranges to re-sign the contract or liquidate the contract as agreed.',
      'Receiving the rent in full and on time as agreed.'
    ];
    
    partyAResponsibilities.forEach(resp => {
      const respLines = doc.splitTextToSize(resp, 170);
      doc.text(respLines, 20, yPos);
      yPos += respLines.length * 7 + 3;
    });
    yPos += 5;
    
    doc.text('2/ Party B\'s responsibilities:', 20, yPos);
    yPos += 7;
    const partyBResponsibilities = [
      'Using the house for the right purpose as agreed.',
      'Paying the rent on time according to the agreed method.',
      'If terminating the contract before its expiration, Party B will lose the security deposit.',
      'Paying costs of electricity, water and telephone on time as required on invoices, Party B is responsible for discontinuance of facilities due to delayed payment.',
      'Being entitled to use the house fully and separately during the lease term.',
      'Using the house for the right purpose.',
      'Taking responsibility for compensating for damage or loss compared to the status list attached to this contract. Maintaining and being responsible for Party B\'s belongings and damage caused to the third party when using the leased house.',
      'When the contract ends or the contract is terminated before the lease term, Party B is responsible for returning the house to Party A within 60 days.',
      'Being responsible under the law for all activities during the residential period.',
      'Not being allowed to use the house to organize illegal activities, harbor items prohibited by the State, and violators of the law.',
      'Being allowed to repair the house in accordance with its use needs, with the consent of Party A but without changes in the structure and architecture of the house.',
      'Before the expiry of the lease contract, Party B must notify Party A at least 01 (one) month in advance so that Party A can arrange to re-sign the contract or liquidate the contract as agreed.'
    ];
    
    partyBResponsibilities.forEach(resp => {
      const respLines = doc.splitTextToSize(resp, 170);
      doc.text(respLines, 20, yPos);
      yPos += respLines.length * 7 + 3;
    });
    yPos += 10;

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Article 5
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 5: THE TWO PARTIES UNDERTAKE:', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const article5Terms = [
      'Performing the right content of the contract.',
      'The personal information written in this contract is true.',
      'Entering into the contract is completely voluntary, not forced or treated.',
      'Expenses incurred during the course of contract performance (electricity, water, telephone, internet, amounts payable to budgets, and other expenses) shall be borne by the party generating the expenses.',
      'Party A: At the time of signing this contract, the house for lease is not in the state of dispute and not seized to ensure judgment execution. The information about the house is true.',
      'If a dispute arises or a breach of contract occurs, both parties will discuss and agree in the spirit of negotiation and solidarity. If the parties fail to reach an agreement, they may ask a competent authority for settlement.',
      'All attached lists and contract appendices are an inseparable and legally valid part of this contract.',
      'At the end of the contract, in case either party wants to extend the contract, the party must notify the other in writing at least one month in advance.',
      'In the course of contract performance, the two parties undertake not to unilaterally terminate the contract. If Party A unilaterally terminates the contract, Party A must return Party B\'s deposit amount to Party B, and at the same time compensate Party B with an amount equal to the deposit paid by Party B to Party A. Conversely, if Party B unilaterally terminates the contract, Party B will lose the deposit amount paid to Party A.'
    ];
    
    article5Terms.forEach(term => {
      const termLines = doc.splitTextToSize(term, 170);
      doc.text(termLines, 20, yPos);
      yPos += termLines.length * 7 + 3;
    });
    yPos += 10;

    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // Article 6
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 6: UNILATERAL TERMINATION OF THE CONTRACT', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.text('Party A has the right to unilaterally terminate the contract performance when Party B commits any of the following acts:', 20, yPos);
    yPos += 10;
    
    const partyATermination = [
      'Not paying the rent as agreed.',
      'Deliberately damaging the house.',
      'Seriously affecting environmental sanitation, fire protection safety, security and order.'
    ];
    
    partyATermination.forEach(term => {
      const termLines = doc.splitTextToSize(term, 170);
      doc.text(termLines, 20, yPos);
      yPos += termLines.length * 7 + 3;
    });
    yPos += 5;
    
    doc.text('Party B has the right to unilaterally terminate the lease contract performance when the lessor commits any of the following acts:', 20, yPos);
    yPos += 10;
    
    const partyBTermination = [
      'Increasing the rent at variance with the agreement.',
      'Causing difficulties or hindering Party B\'s business activities during the lease period.',
      'Issues related to ownership and disputes of the house.'
    ];
    
    partyBTermination.forEach(term => {
      const termLines = doc.splitTextToSize(term, 170);
      doc.text(termLines, 20, yPos);
      yPos += termLines.length * 7 + 3;
    });
    yPos += 10;

    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    // Article 7
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 7: CONTRACT TERMINATION', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.text('The contract will be terminated in the following cases:', 20, yPos);
    yPos += 10;
    
    const terminationCases = [
      'The lease term has expired;',
      'The leased house must be demolished due to serious damage that may make the house collapse or due to the implementation of the State\'s construction planning.'
    ];
    
    terminationCases.forEach(term => {
      const termLines = doc.splitTextToSize(term, 170);
      doc.text(termLines, 20, yPos);
      yPos += termLines.length * 7 + 3;
    });
    yPos += 10;

    // Article 8
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 8: GENERAL PROVISIONS', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const generalProvisions = [
      'All changes of this contract are valid only in writing and signed by both parties.',
      'In the course of contract performance, the two parties undertake to fully fulfill their obligations; if a dispute arises, they will negotiate and resolve it by themselves on the principle of mutual benefits; if the parties cannot resolve the problem, it will be settled by a competent court.',
      `This contract consists of multiple pages and is made into multiple originals of equal legal validity, each party keeps copies. This contract takes effect from the time Party A receives the security deposit and the rent of the first month in ${new Date().getFullYear()}.`
    ];
    
    generalProvisions.forEach(provision => {
      const provisionLines = doc.splitTextToSize(provision, 170);
      doc.text(provisionLines, 20, yPos);
      yPos += provisionLines.length * 7 + 5;
    });
    yPos += 10;

    // Signatures
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('SIGNATURES', 20, yPos);
    doc.line(20, yPos + 5, 190, yPos + 5);
    yPos += 20;
    
    doc.setFont(undefined, 'normal');
    doc.text('Party A (Lessor)', 30, yPos);
    doc.text('Party B (Lessee)', 130, yPos);
    yPos += 30;
    
    doc.text('_____________________', 30, yPos);
    doc.text('_____________________', 130, yPos);
    yPos += 10;
    
    doc.text('EZStay Management', 30, yPos);
    doc.text(tenant.fullName || 'Tenant Name', 130, yPos);
    yPos += 20;
    
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 30, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 130, yPos);

    // Footer
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 280, { align: 'center' });
    doc.text('EZStay - Property Management System', 105, 285, { align: 'center' });

    // Save the PDF
    doc.save(`Contract-${contract.id?.slice(0, 8) || 'unknown'}.pdf`);
  };

  const previewContractPDF = (contract) => {
    const doc = new jsPDF();
    
    // Get tenant information from identity profiles
    const tenant = contract.identityProfiles?.[0] || {};
    const checkinDate = contract.checkinDate ? new Date(contract.checkinDate) : new Date();
    const checkoutDate = contract.checkoutDate ? new Date(contract.checkoutDate) : new Date();
    
    // Header - Vietnam Republic format
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('SOCIALIST REPUBLIC OF VIETNAM', 105, 20, { align: 'center' });
    doc.text('Independence – Freedom – Happiness', 105, 30, { align: 'center' });
    
    // Divider line
    doc.line(75, 35, 135, 35);
    
    // Contract title with PREVIEW
    doc.setFontSize(18);
    doc.text('HOUSE LEASE CONTRACT (PREVIEW)', 105, 50, { align: 'center' });
    
    // Contract basic info
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    let yPos = 70;
    
    doc.text(`Contract No: ${contract.id?.slice(0, 8) || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, yPos);
    yPos += 15;
    
    // Parties information
    doc.setFont(undefined, 'bold');
    doc.text('THE CONTRACTING PARTIES:', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.text('Party A (Lessor): EZStay Property Management', 20, yPos);
    yPos += 7;
    doc.text('Address: Ho Chi Minh City, Vietnam', 20, yPos);
    yPos += 7;
    doc.text('Phone: +84 xxx xxx xxx', 20, yPos);
    yPos += 10;
    
    doc.text(`Party B (Lessee): ${tenant.fullName || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`Address: ${tenant.address || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`Phone: ${tenant.phoneNumber || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`Citizen ID: ${tenant.citizenIdNumber || 'N/A'}`, 20, yPos);
    yPos += 15;
    
    // Introduction
    const introText = 'After discussion, the two parties have mutually agreed to enter into the house lease contract with the following agreement:';
    const introLines = doc.splitTextToSize(introText, 170);
    doc.text(introLines, 20, yPos);
    yPos += introLines.length * 7 + 10;
    
    // Article 1
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 1: THE HOUSE FOR LEASE, PURPOSES OF USE', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const article1Text = `Party A agrees to lease Party B the room "${contract.roomName || 'N/A'}" according to the property management system. The room is fully furnished and ready for residential use.`;
    const article1Lines = doc.splitTextToSize(article1Text, 170);
    doc.text(article1Lines, 20, yPos);
    yPos += article1Lines.length * 7 + 10;
    
    // Add more articles as preview
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 2: DURATION OF THE LEASE', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const durationMonths = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24 * 30));
    const article2Text = `Duration: ${durationMonths} months, commencing on ${checkinDate.toLocaleDateString('en-GB')} and ending on ${checkoutDate.toLocaleDateString('en-GB')}. After the duration, the two parties will renegotiate the rental fee.`;
    const article2Lines = doc.splitTextToSize(article2Text, 170);
    doc.text(article2Lines, 20, yPos);
    yPos += article2Lines.length * 7 + 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 3: RENTAL FEE, SECURITY DEPOSIT AND PAYMENT METHOD', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const monthlyRent = contract.roomDetails?.price || 'TBD';
    const depositAmount = contract.depositAmount || 0;
    const article3Text = `Rental fee: ${monthlyRent} VND/month. Security deposit: ${depositAmount} VND. Payment method: Party B will pay Party A the rent on monthly basis. Payment is not later than 05 days of each month.`;
    const article3Lines = doc.splitTextToSize(article3Text, 170);
    doc.text(article3Lines, 20, yPos);
    yPos += article3Lines.length * 7 + 10;

    // Article 4 - Summary
    doc.setFont(undefined, 'bold');
    doc.text('ARTICLE 4: RESPONSIBILITIES OF THE TWO PARTIES', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const responsibilitiesText = 'Both parties agree to fulfill their obligations as outlined in the full contract, including timely rent payment, property maintenance, and adherence to all terms and conditions.';
    const responsibilitiesLines = doc.splitTextToSize(responsibilitiesText, 170);
    doc.text(responsibilitiesLines, 20, yPos);
    yPos += responsibilitiesLines.length * 7 + 10;

    // Additional articles summary
    doc.setFont(undefined, 'bold');
    doc.text('ADDITIONAL PROVISIONS', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    const additionalText = 'This contract includes comprehensive terms covering contract termination conditions, general provisions, and legal obligations as per Vietnamese law. Full details available in the complete contract document.';
    const additionalLines = doc.splitTextToSize(additionalText, 170);
    doc.text(additionalLines, 20, yPos);
    yPos += additionalLines.length * 7 + 15;

    // Preview notice
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    const previewNotice = '*** THIS IS A PREVIEW DOCUMENT - FOR FULL CONTRACT TERMS, PLEASE GENERATE THE COMPLETE PDF ***';
    doc.text(previewNotice, 105, yPos, { align: 'center' });
    
    // Open preview in new window
    const pdfDataUri = doc.output('datauristring');
    const newWindow = window.open();
    newWindow.document.write(`
      <iframe 
        width='100%' 
        height='100%' 
        src='${pdfDataUri}'
        frameborder='0'>
      </iframe>
    `);
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
    return <div>Loading...</div>;
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
              Contract Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all rental contracts across your properties
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateContractModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Contract
            </button>
            <button
              onClick={() => router.push('/owner/boarding-houses')}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              ← Back to Properties
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
              placeholder="Search contracts by tenant, room, or contract ID..."
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
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No contracts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {contracts.length === 0 
                ? "No contracts have been created for this house yet."
                : "No contracts match your current filters."
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
                        Contract #{contract.id?.slice(0, 8) || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        contract.contractStatus === 'Active' 
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
                        <strong>Room:</strong> {contract.roomName || 'N/A'}
                      </div>
                      <div>
                        <strong>Tenant:</strong> {
                          contract.identityProfiles?.[0]?.fullName || 
                          contract.tenantId || 
                          'N/A'
                        }
                      </div>
                      <div>
                        <strong>Period:</strong> {
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
                      View
                    </button>
                    <button
                      onClick={() => handleEditContract(contract)}
                      className="px-3 py-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => previewContractPDF(contract)}
                      className="px-3 py-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 text-sm font-medium"
                    >
                      Preview PDF
                    </button>
                    <button
                      onClick={() => generateContractPDF(contract)}
                      className="px-3 py-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 text-sm font-medium"
                    >
                      Print PDF
                    </button>
                    
                    {/* Cancel Contract - Only for Active contracts */}
                    {contract.contractStatus === 'Active' && (
                      <button
                        onClick={() => handleCancelContract(contract)}
                        className="px-3 py-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
                      >
                        Cancel Contract
                      </button>
                    )}
                    
                    {/* Extend Contract - Only for Active contracts */}
                    {contract.contractStatus === 'Active' && (
                      <button
                        onClick={() => handleExtendContract(contract)}
                        className="px-3 py-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 text-sm font-medium"
                      >
                        Extend Contract
                      </button>
                    )}
                    
                    {/* Add Dependent - Only for Active contracts and when numberOfOccupants > 1 */}
                    {contract.contractStatus === 'Active' && contract.numberOfOccupants > 1 && (
                      <button
                        onClick={() => handleAddDependent(contract)}
                        className="px-3 py-1 text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-200 text-sm font-medium"
                      >
                        Add Dependent
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteContract(contract)}
                      className="px-3 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium"
                    >
                      Delete
                    </button>
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
                  {modalType === 'view' && 'Contract Details'}
                  {modalType === 'edit' && 'Edit Contract'}
                  {modalType === 'delete' && 'Delete Contract'}
                  {modalType === 'cancel' && 'Cancel Contract'}
                  {modalType === 'extend' && 'Extend Contract'}
                  {modalType === 'addDependent' && 'Add Dependent'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCancelReason("");
                    setExtendDate("");
                    setDependentData({
                      fullName: "",
                      dateOfBirth: "",
                      phoneNumber: "",
                      email: "",
                      provinceId: "",
                      wardId: "",
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
                    setDependentErrors({});
                    setSelectedDependentProvince("");
                    setSelectedDependentWard("");
                    setDependentWards([]);
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
                              <span className="font-medium text-gray-700 dark:text-gray-300">Province ID:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.provinceId || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Ward ID:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{profile.wardId || 'N/A'}</span>
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
                </div>
              )}

              {modalType === 'edit' && selectedContract && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Check-in Date</label>
                      <input
                        type="date"
                        value={editData.checkinDate ? editData.checkinDate.split('T')[0] : ''}
                        onChange={(e) => setEditData({...editData, checkinDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Check-out Date</label>
                      <input
                        type="date"
                        value={editData.checkoutDate ? editData.checkoutDate.split('T')[0] : ''}
                        onChange={(e) => setEditData({...editData, checkoutDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deposit Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editData.depositAmount || ''}
                        onChange={(e) => setEditData({...editData, depositAmount: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Occupants</label>
                      <input
                        type="number"
                        min="1"
                        value={editData.numberOfOccupants || ''}
                        onChange={(e) => setEditData({...editData, numberOfOccupants: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                    <textarea
                      value={editData.notes || ''}
                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

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
                          min={selectedContract.checkoutDate ? new Date(new Date(selectedContract.checkoutDate).getTime() + 24*60*60*1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
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

              {modalType === 'addDependent' && selectedContract && (
                <div className="py-2">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">👥</div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                      Add Dependent to Contract
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      #{selectedContract.id?.slice(0, 8)} - {selectedContract.roomName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {selectedContract.identityProfiles?.length || 1} / {selectedContract.numberOfOccupants} occupants
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={dependentData.fullName}
                          onChange={(e) => setDependentData({ ...dependentData, fullName: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            dependentErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter full name"
                        />
                        {dependentErrors.fullName && (
                          <p className="text-red-500 text-xs mt-1">{dependentErrors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Citizen ID Number *
                        </label>
                        <input
                          type="text"
                          value={dependentData.citizenIdNumber}
                          onChange={(e) => setDependentData({ ...dependentData, citizenIdNumber: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            dependentErrors.citizenIdNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter citizen ID number"
                        />
                        {dependentErrors.citizenIdNumber && (
                          <p className="text-red-500 text-xs mt-1">{dependentErrors.citizenIdNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          value={dependentData.dateOfBirth}
                          onChange={(e) => setDependentData({ ...dependentData, dateOfBirth: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            dependentErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        {dependentErrors.dateOfBirth && (
                          <p className="text-red-500 text-xs mt-1">{dependentErrors.dateOfBirth}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={dependentData.phoneNumber}
                          onChange={(e) => setDependentData({ ...dependentData, phoneNumber: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            dependentErrors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter phone number"
                        />
                        {dependentErrors.phoneNumber && (
                          <p className="text-red-500 text-xs mt-1">{dependentErrors.phoneNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={dependentData.email}
                          onChange={(e) => setDependentData({ ...dependentData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    {/* ID Card Information */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">ID Card Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Citizen ID Issue Date *
                          </label>
                          <input
                            type="date"
                            value={dependentData.citizenIdIssuedDate}
                            onChange={(e) => setDependentData({ ...dependentData, citizenIdIssuedDate: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              dependentErrors.citizenIdIssuedDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {dependentErrors.citizenIdIssuedDate && (
                            <p className="text-red-500 text-xs mt-1">{dependentErrors.citizenIdIssuedDate}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Citizen ID Issue Place *
                          </label>
                          <input
                            type="text"
                            value={dependentData.citizenIdIssuedPlace}
                            onChange={(e) => setDependentData({ ...dependentData, citizenIdIssuedPlace: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              dependentErrors.citizenIdIssuedPlace ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter issue place"
                          />
                          {dependentErrors.citizenIdIssuedPlace && (
                            <p className="text-red-500 text-xs mt-1">{dependentErrors.citizenIdIssuedPlace}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Address Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Province *
                          </label>
                          <select
                            value={dependentData.provinceId}
                            onChange={(e) => {
                              console.log("🔍 Province changed to:", e.target.value);
                              setDependentData({ ...dependentData, provinceId: e.target.value, wardId: "" });
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              dependentErrors.provinceId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Select province</option>
                            {vietnamProvinces.map((province) => (
                              <option key={province.code} value={province.code}>
                                {province.name}
                              </option>
                            ))}
                          </select>
                          {dependentErrors.provinceId && (
                            <p className="text-red-500 text-xs mt-1">{dependentErrors.provinceId}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ward *
                          </label>
                          <select
                            value={dependentData.wardId}
                            onChange={(e) => setDependentData({ ...dependentData, wardId: e.target.value })}
                            disabled={!dependentData.provinceId}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
                              dependentErrors.wardId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Select ward</option>
                            {dependentWards.map((ward) => (
                              <option key={ward.code} value={ward.code}>
                                {ward.name}
                              </option>
                            ))}
                          </select>
                          {dependentErrors.wardId && (
                            <p className="text-red-500 text-xs mt-1">{dependentErrors.wardId}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Address *
                          </label>
                          <input
                            type="text"
                            value={dependentData.address}
                            onChange={(e) => setDependentData({ ...dependentData, address: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              dependentErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter address"
                          />
                          {dependentErrors.address && (
                            <p className="text-red-500 text-xs mt-1">{dependentErrors.address}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Temporary Residence *
                          </label>
                          <input
                            type="text"
                            value={dependentData.temporaryResidence}
                            onChange={(e) => setDependentData({ ...dependentData, temporaryResidence: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              dependentErrors.temporaryResidence ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter temporary residence"
                          />
                          {dependentErrors.temporaryResidence && (
                            <p className="text-red-500 text-xs mt-1">{dependentErrors.temporaryResidence}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Image URLs */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">ID Document Images</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Front ID Image URL *
                          </label>
                          <input
                            type="url"
                            value={dependentData.frontImageUrl}
                            onChange={(e) => setDependentData({ ...dependentData, frontImageUrl: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              dependentErrors.frontImageUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter front image URL"
                          />
                          {dependentErrors.frontImageUrl && (
                            <p className="text-red-500 text-xs mt-1">{dependentErrors.frontImageUrl}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Back ID Image URL *
                          </label>
                          <input
                            type="url"
                            value={dependentData.backImageUrl}
                            onChange={(e) => setDependentData({ ...dependentData, backImageUrl: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              dependentErrors.backImageUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter back image URL"
                          />
                          {dependentErrors.backImageUrl && (
                            <p className="text-red-500 text-xs mt-1">{dependentErrors.backImageUrl}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Avatar URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={dependentData.avatarUrl}
                            onChange={(e) => setDependentData({ ...dependentData, avatarUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter avatar URL (optional)"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={dependentData.notes}
                            onChange={(e) => setDependentData({ ...dependentData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows="2"
                            placeholder="Enter additional notes (optional)"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-4 w-4 text-cyan-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs text-cyan-700 dark:text-cyan-200">
                            <strong>Note:</strong> This will create a new identity profile for the contract. Ensure all information is accurate.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCancelReason("");
                    setExtendDate("");
                    setDependentData({
                      fullName: "",
                      dateOfBirth: "",
                      phoneNumber: "",
                      email: "",
                      provinceId: "",
                      wardId: "",
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
                    setDependentErrors({});
                    setSelectedDependentProvince("");
                    setSelectedDependentWard("");
                    setDependentWards([]);
                    setProcessingAction(false);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lng text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
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
                {modalType === 'addDependent' && (
                  <button
                    onClick={handleConfirmAddDependent}
                    disabled={processingAction}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {processingAction ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Dependent...
                      </span>
                    ) : (
                      'Add Dependent'
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
                  {modalType === 'edit' ? '✏️ Edit Contract' : '📝 Create New Contract'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateContractModal(false);
                    setCreateStep(1);
                    setModalType(''); // Reset modal type
                    setCurrentEditingRoomId(null); // Reset current editing room
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
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    createStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className={`flex-1 h-1 mx-4 ${
                    createStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    createStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    2
                  </div>
                  <div className={`flex-1 h-1 mx-4 ${
                    createStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    createStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    3
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Contract Details</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Identity Profile</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Utility Readings</span>
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
                        Tenant ID *
                      </label>
                      <input
                        type="text"
                        value={contractData.tenantId}
                        onChange={(e) => setContractData({
                          ...contractData,
                          tenantId: e.target.value
                        })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                        placeholder="Enter tenant ID"
                      />
                    </div>

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
                            console.log("🏠 Room selected:", e.target.value);
                            setContractData({
                              ...contractData,
                              roomId: e.target.value
                            });
                          }}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                            contractErrors.roomId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          contractErrors.checkinDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          contractErrors.checkoutDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          contractErrors.depositAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          contractErrors.numberOfOccupants ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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

              {/* Step 2: Identity Profile */}
              {createStep === 2 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    👤 Tenant Identity Profile
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={identityProfileData.fullName}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          fullName: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter full name"
                      />
                      {profileErrors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="datetime-local"
                        value={identityProfileData.dateOfBirth}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          dateOfBirth: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {profileErrors.dateOfBirth && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.dateOfBirth}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={identityProfileData.phoneNumber}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          phoneNumber: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter phone number"
                      />
                      {profileErrors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.phoneNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={identityProfileData.email}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          email: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter email"
                      />
                      {profileErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Province/City *
                      </label>
                      {addressLoading ? (
                        <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading provinces...
                        </div>
                      ) : (
                        <select
                          value={identityProfileData.provinceId}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                            profileErrors.provinceId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <option value="">Select province/city...</option>
                          {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {profileErrors.provinceId && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.provinceId}</p>
                      )}
                      {provinces.length === 0 && !addressLoading && (
                        <p className="text-amber-500 text-xs mt-1">Unable to load provinces data.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ward/District *
                      </label>
                      <select
                        value={identityProfileData.wardId}
                        onChange={(e) => handleWardChange(e.target.value)}
                        disabled={!identityProfileData.provinceId || wards.length === 0}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.wardId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${
                          !identityProfileData.provinceId || wards.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">
                          {!identityProfileData.provinceId 
                            ? "Select province first..." 
                            : wards.length === 0 
                            ? "No wards available" 
                            : "Select ward/district..."
                          }
                        </option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      {profileErrors.wardId && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.wardId}</p>
                      )}
                      {identityProfileData.provinceId && wards.length === 0 && (
                        <p className="text-amber-500 text-xs mt-1">No wards found for selected province.</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={identityProfileData.address}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          address: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter address"
                      />
                      {profileErrors.address && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.address}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Temporary Residence *
                      </label>
                      <input
                        type="text"
                        value={identityProfileData.temporaryResidence}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          temporaryResidence: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.temporaryResidence ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter temporary residence"
                      />
                      {profileErrors.temporaryResidence && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.temporaryResidence}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Citizen ID Number *
                      </label>
                      <input
                        type="text"
                        value={identityProfileData.citizenIdNumber}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          citizenIdNumber: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.citizenIdNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter citizen ID"
                      />
                      {profileErrors.citizenIdNumber && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.citizenIdNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Citizen ID Issued Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={identityProfileData.citizenIdIssuedDate}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          citizenIdIssuedDate: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.citizenIdIssuedDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {profileErrors.citizenIdIssuedDate && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.citizenIdIssuedDate}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Citizen ID Issued Place *
                      </label>
                      <input
                        type="text"
                        value={identityProfileData.citizenIdIssuedPlace}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          citizenIdIssuedPlace: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.citizenIdIssuedPlace ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter issued place"
                      />
                      {profileErrors.citizenIdIssuedPlace && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.citizenIdIssuedPlace}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Front Image URL *
                      </label>
                      <input
                        type="url"
                        value={identityProfileData.frontImageUrl}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          frontImageUrl: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.frontImageUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter front ID image URL"
                      />
                      {profileErrors.frontImageUrl && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.frontImageUrl}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Back Image URL *
                      </label>
                      <input
                        type="url"
                        value={identityProfileData.backImageUrl}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          backImageUrl: e.target.value
                        })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                          profileErrors.backImageUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter back ID image URL"
                      />
                      {profileErrors.backImageUrl && (
                        <p className="text-red-500 text-xs mt-1">{profileErrors.backImageUrl}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        value={identityProfileData.avatarUrl}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          avatarUrl: e.target.value
                        })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                        placeholder="Enter avatar URL (optional)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={identityProfileData.notes}
                        onChange={(e) => setIdentityProfileData({
                          ...identityProfileData,
                          notes: e.target.value
                        })}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                        rows="3"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>

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
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                              utilityErrors.electricityCurrentIndex ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter electricity reading"
                          />
                          {utilityErrors.electricityCurrentIndex && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.electricityCurrentIndex}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price (VND/kWh) - Optional
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
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                              utilityErrors.electricityPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter electricity price"
                          />
                          {utilityErrors.electricityPrice && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.electricityPrice}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Note - Optional
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
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                              utilityErrors.electricityNote ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
                        Water Reading
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
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                              utilityErrors.waterCurrentIndex ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter water reading"
                          />
                          {utilityErrors.waterCurrentIndex && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.waterCurrentIndex}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price (VND/m³) - Optional
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
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                              utilityErrors.waterPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter water price"
                          />
                          {utilityErrors.waterPrice && (
                            <p className="text-red-500 text-xs mt-1">{utilityErrors.waterPrice}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Note - Optional
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
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                              utilityErrors.waterNote ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Utility Reading Information
                          </h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Current Index is required for both electricity and water</li>
                              <li>Price is optional - if not set, default rates will be used</li>
                              <li>Notes are optional and limited to 100 characters</li>
                              <li>These readings will be used as the starting point for billing calculations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
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
                      onClick={handleCreateContract}
                      className={`px-6 py-2 ${modalType === 'edit' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={creatingContract}
                    >
                      {creatingContract ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
      )}
    </div>
  );
}