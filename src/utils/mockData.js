// src/utils/mockData.js
// Mock data theo MongoDB schema mới

export const mockBoardingHouses = [
  {
    id: "67438a1f9b2d8c4e5f123456", // ObjectId format
    owner_id: "67438a1f9b2d8c4e5f123450",
    name: "Sunrise Villa",
    description: "Nhà trọ cao cấp gần trường đại học",
    metadata: {
      totalRooms: 6,
      occupiedRooms: 4,
      vacantRooms: 2,
      monthlyRevenue: 18000000,
      averageRating: 4.8,
      totalReviews: 42,
      amenities: ["WiFi", "Parking", "Gym", "Laundry", "Security"]
    },
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T08:00:00Z"
  },
  {
    id: "67438a1f9b2d8c4e5f123457",
    owner_id: "67438a1f9b2d8c4e5f123450",
    name: "Golden Residence",
    description: "Nhà trọ tiện nghi hiện đại",
    metadata: {
      totalRooms: 8,
      occupiedRooms: 6,
      vacantRooms: 2,
      monthlyRevenue: 24000000,
      averageRating: 4.6,
      totalReviews: 28,
      amenities: ["WiFi", "AC", "Elevator", "Security"]
    },
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-02-01T08:00:00Z",
    updated_at: "2024-02-01T08:00:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439013",
    name: "Nhà Trọ Sinh Viên Gò Vấp",
    description: "Nhà trọ giá rẻ dành cho sinh viên, gần các trường đại học",
    address: {
      street: "123 Đường Phan Văn Trị",
      ward: "Phường 5",
      district: "Quận Gò Vấp", 
      city: "TP.HCM",
      full_address: "123 Đường Phan Văn Trị, Phường 5, Quận Gò Vấp, TP.HCM"
    },
    location: {
      type: "Point",
      coordinates: [106.6758, 10.8385]
    },
    owner_id: "507f1f77bcf86cd799439011",
    house_location_id: "507f1f77bcf86cd799439021",
    images: ["/api/placeholder/400/300"],
    contact: {
      phone: "0987654321",
      email: "contact@govap.com",
      zalo: "0987654321"
    },
    rules: [
      "Không hút thuốc trong phòng",
      "Giữ vệ sinh chung",
      "Không nuôi thú cưng",
      "Về trước 22h"
    ],
    utilities: {
      electricity_price: 3500,
      water_price: 20000,
      wifi_included: true,
      parking_included: false,
      cleaning_service: false
    },
    business_license: "BL789012345",
    verification_status: "verified",
    status: "active",
    metadata: {
      totalRooms: 12,
      occupiedRooms: 10,
      vacantRooms: 2,
      monthlyRevenue: 18000000,
      averageRating: 4.2,
      totalReviews: 45,
      amenities: ["WiFi", "Security", "Parking"]
    },
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-15T09:00:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439014",
    name: "Khách Sạn Mini Tân Bình",
    description: "Khách sạn mini cao cấp gần sân bay Tân Sơn Nhất",
    address: {
      street: "789 Đường Cộng Hòa",
      ward: "Phường 13",
      district: "Quận Tân Bình",
      city: "TP.HCM", 
      full_address: "789 Đường Cộng Hòa, Phường 13, Quận Tân Bình, TP.HCM"
    },
    location: {
      type: "Point",
      coordinates: [106.6517, 10.8017]
    },
    owner_id: "507f1f77bcf86cd799439012",
    house_location_id: "507f1f77bcf86cd799439022",
    images: ["/api/placeholder/400/300"],
    contact: {
      phone: "0912345678",
      email: "info@tanbinhhotel.com",
      zalo: "0912345678"
    },
    rules: [
      "Check-in sau 14h",
      "Check-out trước 12h",
      "Không hút thuốc",
      "Giữ yên lặng sau 22h"
    ],
    utilities: {
      electricity_price: 4000,
      water_price: 25000,
      wifi_included: true,
      parking_included: true,
      cleaning_service: true
    },
    business_license: "BL345678901",
    verification_status: "verified",
    status: "active",
    metadata: {
      totalRooms: 15,
      occupiedRooms: 12,
      vacantRooms: 3,
      monthlyRevenue: 45000000,
      averageRating: 4.8,
      totalReviews: 67,
      amenities: ["WiFi", "AC", "Elevator", "Security", "Parking", "Breakfast"]
    },
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-20T10:30:00Z",
    updated_at: "2024-01-20T10:30:00Z"
  }
];

export const mockRooms = [
  {
    _id: "507f1f77bcf86cd799439031",
    room_number: "101",
    boarding_house_id: "507f1f77bcf86cd799439012",
    room_type: "single",
    area: 25,
    price: 3500000,
    deposit: 3500000,
    max_tenants: 2,
    description: "Phòng đơn thoáng mát, đầy đủ tiện nghi",
    images: ["/api/placeholder/300/200"],
    amenities: ["bed", "wardrobe", "air_conditioner", "wifi"],
    rental_conditions: [
      "Không hút thuốc trong phòng",
      "Không nuôi thú cưng",
      "Giữ vệ sinh phòng"
    ],
    utilities: {
      electricity_included: false,
      water_included: true,
      wifi_included: true,
      cleaning_included: false
    },
    availability_status: "available",
    occupancy_status: "vacant",
    current_tenant_count: 0,
    lease_terms: {
      minimum_lease_months: 3,
      payment_schedule: "monthly",
      late_fee: 100000
    },
    metadata: {
      floor: 1,
      facing_direction: "east",
      furnished: true,
      pet_allowed: false,
      smoking_allowed: false
    },
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-15T09:00:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439032",
    room_number: "102",
    boarding_house_id: "507f1f77bcf86cd799439012",
    room_type: "double",
    area: 30,
    price: 4000000,
    deposit: 4000000,
    max_tenants: 2,
    description: "Phòng đôi rộng rãi, view đẹp",
    images: ["/api/placeholder/300/200"],
    amenities: ["bed", "wardrobe", "air_conditioner", "wifi", "balcony"],
    rental_conditions: [
      "Sinh viên nữ ưu tiên",
      "Không hút thuốc",
      "Về trước 22h"
    ],
    utilities: {
      electricity_included: false,
      water_included: true,
      wifi_included: true,
      cleaning_included: true
    },
    availability_status: "occupied",
    occupancy_status: "full",
    current_tenant_count: 2,
    lease_terms: {
      minimum_lease_months: 6,
      payment_schedule: "monthly",
      late_fee: 150000
    },
    metadata: {
      floor: 1,
      facing_direction: "west",
      furnished: true,
      pet_allowed: false,
      smoking_allowed: false
    },
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439033",
    room_number: "201",
    boarding_house_id: "507f1f77bcf86cd799439013",
    room_type: "studio",
    area: 28,
    price: 3800000,
    deposit: 3800000,
    max_tenants: 1,
    description: "Phòng studio có ban công, view đẹp",
    images: ["/api/placeholder/300/200"],
    amenities: ["bed", "wardrobe", "air_conditioner", "wifi", "balcony", "kitchen"],
    rental_conditions: [
      "Có ban công riêng",
      "View đẹp",
      "Không hút thuốc"
    ],
    utilities: {
      electricity_included: false,
      water_included: true,
      wifi_included: true,
      cleaning_included: false
    },
    availability_status: "available",
    occupancy_status: "vacant",
    current_tenant_count: 0,
    lease_terms: {
      minimum_lease_months: 3,
      payment_schedule: "monthly",
      late_fee: 120000
    },
    metadata: {
      floor: 2,
      facing_direction: "south",
      furnished: true,
      pet_allowed: false,
      smoking_allowed: false
    },
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-02-01T11:00:00Z",
    updated_at: "2024-02-01T11:00:00Z"
  }
];

export const mockAmenities = [
  {
    _id: "507f1f77bcf86cd799439041",
    name: "WiFi tốc độ cao",
    description: "Internet WiFi tốc độ cao, ổn định 24/7",
    category: "internet",
    icon: "wifi",
    is_premium: false,
    status: "active",
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439042",
    name: "Điều hòa",
    description: "Máy lạnh inverter tiết kiệm điện",
    category: "climate_control",
    icon: "air_conditioner",
    is_premium: true,
    status: "active",
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439043",
    name: "Chỗ đậu xe miễn phí",
    description: "Khu vực đậu xe rộng rãi, an toàn",
    category: "parking",
    icon: "parking",
    is_premium: false,
    status: "active",
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439044",
    name: "Máy giặt chung",
    description: "Khu vực giặt ủi tiện lợi",
    category: "laundry",
    icon: "washing_machine",
    is_premium: false,
    status: "active",
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

export const mockLocations = [
  {
    _id: "507f1f77bcf86cd799439021",
    boarding_house_id: "507f1f77bcf86cd799439012",
    address: {
      street: "123 Đường Nguyễn Huệ",
      ward: "Phường Bến Nghé",
      district: "Quận 1",
      city: "TP.HCM",
      full_address: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
    },
    coordinates: {
      type: "Point",
      coordinates: [106.7000, 10.7769]
    },
    landmarks: [
      "Bến Nghé Market",
      "Saigon River",
      "Nguyen Hue Walking Street"
    ],
    transportation: {
      bus_routes: ["1", "19", "36"],
      nearest_bus_stop: "Nguyễn Huệ",
      distance_to_bus_stop: 100
    },
    amenities_nearby: [
      "Shopping mall",
      "Hospital", 
      "School",
      "Bank"
    ],
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-15T09:00:00Z"
  },
  {
    _id: "507f1f77bcf86cd799439022",
    boarding_house_id: "507f1f77bcf86cd799439013",
    address: {
      street: "456 Đường Lê Lợi",
      ward: "Phường Phạm Ngũ Lão",
      district: "Quận 1", 
      city: "TP.HCM",
      full_address: "456 Đường Lê Lợi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM"
    },
    coordinates: {
      type: "Point",
      coordinates: [106.6956, 10.7691]
    },
    landmarks: [
      "Ben Thanh Market",
      "Backpacker Area",
      "War Remnants Museum"
    ],
    transportation: {
      bus_routes: ["3", "8", "26"],
      nearest_bus_stop: "Lê Lợi",
      distance_to_bus_stop: 50
    },
    amenities_nearby: [
      "Market",
      "Restaurant",
      "Tourist area",
      "ATM"
    ],
    deletedAt: null,
    deletedBy: null,
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z"
  }
];

// Helper function để sử dụng mock data
export const useMockData = () => {
  return {
    boardingHouses: mockBoardingHouses,
    rooms: mockRooms,
    amenities: mockAmenities,
    locations: mockLocations,
  };
};

// Function để check xem có nên dùng mock data không
export const shouldUseMockData = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("useMockData") === "true";
  }
  return false;
};

// Function để toggle mock data mode
export const toggleMockData = (enable) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("useMockData", enable ? "true" : "false");
  }
};
