// Sample data for rooms based on database schema
export const sampleRooms = [
  {
    room_id: 1,
    house_id: 1,
    house_location_id: 1,
    room_name: "Room A1",
    area: 25.5,
    price: 1500000,
    max_tenants: 2,
    rental_condition: "2 months deposit, payment due 5th of each month",
    is_available: true,
    created_at: "2024-01-15T08:00:00Z",
    // Related data
    house: {
      house_id: 1,
      house_name: "Happy Boarding House",
      description: "Clean boarding house with good security, near university",
      owner: {
        user_id: 2,
        full_name: "John Smith",
        phone_number: "+1-555-0123"
      }
    },
    location: {
      location_id: 1,
      full_address: "123 Nguyen Thi Thap Street, Tan Phu Ward, District 7, Ho Chi Minh City"
    },
    amenities: [
      { amenity_id: 1, amenity_name: "Air Conditioning" },
      { amenity_id: 2, amenity_name: "Refrigerator" },
      { amenity_id: 3, amenity_name: "Shared Washing Machine" },
      { amenity_id: 4, amenity_name: "Free WiFi" }
    ],
    images: [
      {
        image_id: 1,
        image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        is_primary: true
      },
      {
        image_id: 2,
        image_url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
        is_primary: false
      }
    ],
    reviews: [
      {
        review_id: 1,
        user_id: 3,
        rating: 4,
        content: "Clean room, friendly landlord. Convenient location for commuting.",
        user: {
          full_name: "Sarah Johnson",
          username: "sarahj"
        },
        created_at: "2024-01-20T10:30:00Z"
      }
    ],
    avg_rating: 4.2,
    total_reviews: 5
  },
  {
    room_id: 2,
    house_id: 1,
    house_location_id: 1,
    room_name: "Room A2",
    area: 30.0,
    price: 180,
    max_tenants: 2,
    rental_condition: "1 month deposit, no pets allowed",
    is_available: true,
    created_at: "2024-01-15T08:00:00Z",
    house: {
      house_id: 1,
      house_name: "Happy Boarding House",
      description: "Clean boarding house with good security, near university",
      owner: {
        user_id: 2,
        full_name: "John Smith",
        phone_number: "+1-555-0123"
      }
    },
    location: {
      location_id: 1,
      full_address: "123 Nguyen Thi Thap Street, Tan Phu Ward, District 7, Ho Chi Minh City"
    },
    amenities: [
      { amenity_id: 1, amenity_name: "Air Conditioning" },
      { amenity_id: 2, amenity_name: "Refrigerator" },
      { amenity_id: 5, amenity_name: "Balcony" },
      { amenity_id: 4, amenity_name: "Free WiFi" }
    ],
    images: [
      {
        image_id: 3,
        image_url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80",
        is_primary: true
      }
    ],
    reviews: [],
    avg_rating: 0,
    total_reviews: 0
  },
  {
    room_id: 3,
    house_id: 2,
    house_location_id: 2,
    room_name: "Studio B1",
    area: 35.0,
    price: 250,
    max_tenants: 1,
    rental_condition: "2 months deposit, small pets allowed",
    is_available: true,
    created_at: "2024-01-10T09:00:00Z",
    house: {
      house_id: 2,
      house_name: "Sunshine Mini Apartments",
      description: "Modern mini apartments with full amenities",
      owner: {
        user_id: 4,
        full_name: "Emily Chen",
        phone_number: "+1-555-0456"
      }
    },
    location: {
      location_id: 2,
      full_address: "456 Vo Van Ngan Street, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City"
    },
    amenities: [
      { amenity_id: 1, amenity_name: "Air Conditioning" },
      { amenity_id: 2, amenity_name: "Refrigerator" },
      { amenity_id: 6, amenity_name: "Private Kitchen" },
      { amenity_id: 7, amenity_name: "Private Bathroom" },
      { amenity_id: 4, amenity_name: "Free WiFi" }
    ],
    images: [
      {
        image_id: 4,
        image_url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
        is_primary: true
      },
      {
        image_id: 5,
        image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
        is_primary: false
      }
    ],
    reviews: [
      {
        review_id: 2,
        user_id: 5,
        rating: 5,
        content: "Beautiful and well-equipped apartment. Very helpful landlord.",
        user: {
          full_name: "Michael Brown",
          username: "mikeb"
        },
        created_at: "2024-01-25T14:20:00Z"
      }
    ],
    avg_rating: 4.8,
    total_reviews: 3
  },
  {
    room_id: 4,
    house_id: 3,
    house_location_id: 3,
    room_name: "Room C1",
    area: 20.0,
    price: 120,
    max_tenants: 1,
    rental_condition: "1 month deposit, no smoking in room",
    is_available: true,
    created_at: "2024-01-12T07:30:00Z",
    house: {
      house_id: 3,
      house_name: "Student Boarding House",
      description: "Affordable boarding house for students",
      owner: {
        user_id: 6,
        full_name: "David Wilson",
        phone_number: "+1-555-0789"
      }
    },
    location: {
      location_id: 3,
      full_address: "789 Dien Bien Phu Street, Ward 25, Binh Thanh District, Ho Chi Minh City"
    },
    amenities: [
      { amenity_id: 3, amenity_name: "Shared Washing Machine" },
      { amenity_id: 4, amenity_name: "Free WiFi" },
      { amenity_id: 8, amenity_name: "Parking Space" }
    ],
    images: [
      {
        image_id: 6,
        image_url: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80",
        is_primary: true
      }
    ],
    reviews: [
      {
        review_id: 3,
        user_id: 7,
        rating: 3,
        content: "Decent room for the price. Can be a bit noisy in the evenings.",
        user: {
          full_name: "Lisa Wang",
          username: "lisaw"
        },
        created_at: "2024-01-18T16:45:00Z"
      }
    ],
    avg_rating: 3.5,
    total_reviews: 2
  },
  {
    room_id: 5,
    house_id: 4,
    house_location_id: 4,
    room_name: "VIP Room D1",
    area: 40.0,
    price: 350,
    max_tenants: 2,
    rental_condition: "3 months deposit, stable income required",
    is_available: false,
    created_at: "2024-01-08T11:00:00Z",
    house: {
      house_id: 4,
      house_name: "Golden Luxury Apartments",
      description: "Luxury apartments with modern amenities",
      owner: {
        user_id: 8,
        full_name: "Robert Taylor",
        phone_number: "+1-555-0321"
      }
    },
    location: {
      location_id: 4,
      full_address: "321 Le Loi Street, Ben Nghe Ward, District 1, Ho Chi Minh City"
    },
    amenities: [
      { amenity_id: 1, amenity_name: "Air Conditioning" },
      { amenity_id: 2, amenity_name: "Refrigerator" },
      { amenity_id: 6, amenity_name: "Private Kitchen" },
      { amenity_id: 7, amenity_name: "Private Bathroom" },
      { amenity_id: 4, amenity_name: "Free WiFi" },
      { amenity_id: 9, amenity_name: "Swimming Pool" },
      { amenity_id: 10, amenity_name: "Gym" }
    ],
    images: [
      {
        image_id: 7,
        image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        is_primary: true
      },
      {
        image_id: 8,
        image_url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
        is_primary: false
      }
    ],
    reviews: [
      {
        review_id: 4,
        user_id: 9,
        rating: 5,
        content: "Amazing apartment! Full amenities, central location.",
        user: {
          full_name: "Jennifer Lee",
          username: "jenl"
        },
        created_at: "2024-01-22T09:15:00Z"
      }
    ],
    avg_rating: 4.9,
    total_reviews: 8
  },
  {
    room_id: 6,
    house_id: 5,
    house_location_id: 5,
    room_name: "Deluxe Studio E1",
    area: 28.0,
    price: 200,
    max_tenants: 2,
    rental_condition: "2 months deposit, couples welcome",
    is_available: true,
    created_at: "2024-01-05T14:00:00Z",
    house: {
      house_id: 5,
      house_name: "Modern Living Complex",
      description: "Contemporary living spaces with smart home features",
      owner: {
        user_id: 10,
        full_name: "Amanda Rodriguez",
        phone_number: "+1-555-0654"
      }
    },
    location: {
      location_id: 5,
      full_address: "555 Pham Van Dong Street, Linh Dong Ward, Thu Duc City, Ho Chi Minh City"
    },
    amenities: [
      { amenity_id: 1, amenity_name: "Air Conditioning" },
      { amenity_id: 2, amenity_name: "Refrigerator" },
      { amenity_id: 6, amenity_name: "Private Kitchen" },
      { amenity_id: 7, amenity_name: "Private Bathroom" },
      { amenity_id: 4, amenity_name: "Free WiFi" },
      { amenity_id: 11, amenity_name: "24/7 Security" },
      { amenity_id: 12, amenity_name: "Elevator" }
    ],
    images: [
      {
        image_id: 9,
        image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        is_primary: true
      }
    ],
    reviews: [
      {
        review_id: 5,
        user_id: 11,
        rating: 4,
        content: "Great modern apartment with excellent facilities. Good value for money.",
        user: {
          full_name: "Kevin Park",
          username: "kevinp"
        },
        created_at: "2024-01-28T11:15:00Z"
      }
    ],
    avg_rating: 4.3,
    total_reviews: 7
  }
];

export const sampleAmenities = [
  { amenity_id: 1, amenity_name: "Air Conditioning" },
  { amenity_id: 2, amenity_name: "Refrigerator" },
  { amenity_id: 3, amenity_name: "Shared Washing Machine" },
  { amenity_id: 4, amenity_name: "Free WiFi" },
  { amenity_id: 5, amenity_name: "Balcony" },
  { amenity_id: 6, amenity_name: "Private Kitchen" },
  { amenity_id: 7, amenity_name: "Private Bathroom" },
  { amenity_id: 8, amenity_name: "Parking Space" },
  { amenity_id: 9, amenity_name: "Swimming Pool" },
  { amenity_id: 10, amenity_name: "Gym" },
  { amenity_id: 11, amenity_name: "24/7 Security" },
  { amenity_id: 12, amenity_name: "Elevator" }
];

export const sampleLocations = [
  "District 1", "District 2", "District 3", "District 4", "District 5", "District 6", "District 7", 
  "District 8", "District 9", "District 10", "District 11", "District 12", "Binh Thanh District", 
  "Go Vap District", "Phu Nhuan District", "Tan Binh District", "Tan Phu District", 
  "Thu Duc City", "Binh Chanh District", "Hoc Mon District", "Nha Be District"
];