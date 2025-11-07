# Tích Hợp Ranking & Analytics với Python ML

## 📋 Tổng Quan

Đã tích hợp đầy đủ các API ranking và analytics cho boarding houses, bao gồm:
- **Xếp hạng theo Rating** (dựa trên đánh giá sao)
- **Xếp hạng theo Sentiment** (phân tích cảm xúc bằng Python ML)
- **Thống kê chi tiết** về rating và sentiment

## 🔧 Backend APIs Đã Tích Hợp

### 1. GET /api/BoardingHouses/rank
**Mô tả**: Lấy danh sách nhà trọ được xếp hạng cao nhất

**Query Parameters**:
- `type` (enum): "Rating" hoặc "Sentiment"
- `order` (string): "desc" hoặc "asc" (mặc định: "desc")
- `limit` (number): Số lượng kết quả (mặc định: 10)

**Response Format**:
```json
[
  {
    "boardingHouseId": "guid",
    "houseName": "string",
    "fullAddress": "string",
    "score": 4.8, // hoặc phần trăm sentiment
    "type": "Rating" // hoặc "Sentiment"
  }
]
```

### 2. GET /api/BoardingHouses/{id}/rating-feedback
**Mô tả**: Lấy thống kê rating chi tiết cho 1 nhà trọ

**Response Format**:
```json
{
  "data": {
    "boardingHouseId": "guid",
    "totalReviews": 150,
    "averageRating": 4.5,
    "oneStarCount": 2,
    "twoStarCount": 5,
    "threeStarCount": 20,
    "fourStarCount": 50,
    "fiveStarCount": 73,
    "details": [
      {
        "id": "guid",
        "rating": 5,
        "content": "Phòng đẹp, sạch sẽ"
      }
    ]
  },
  "isSuccess": true,
  "message": "Success"
}
```

### 3. GET /api/BoardingHouses/{id}/sentiment-feedback
**Mô tả**: Lấy phân tích sentiment bằng Python ML

**Response Format**:
```json
{
  "data": {
    "boardingHouseId": "guid",
    "totalReviews": 150,
    "positiveCount": 120,
    "neutralCount": 20,
    "negativeCount": 10,
    "details": [
      {
        "message": "Phòng rất tuyệt vời",
        "label": "positive",
        "confidence": 98.5
      }
    ]
  },
  "isSuccess": true,
  "message": "Success"
}
```

## 🎨 Frontend Components Đã Tạo

### 1. TopRankedHouses Component
**File**: `src/components/TopRankedHouses.js`

**Tính năng**:
- ✅ Hiển thị top 6 nhà trọ được xếp hạng cao nhất
- ✅ Toggle giữa "Xếp Hạng Sao" và "Cảm Xúc Tích Cực (AI)"
- ✅ Huy chương vàng/bạc/đồng cho top 3
- ✅ Responsive design với dark mode support
- ✅ Click vào card để xem chi tiết nhà trọ
- ✅ Hiển thị điểm số với icon phù hợp (⭐ hoặc 😊)

**Đã thêm vào Homepage**: Đặt giữa SearchBar và LatestPosts

### 2. BoardingHouseStatistics Component
**File**: `src/components/BoardingHouseStatistics.js`

**Tính năng**:
- ✅ Tabs: "Xếp Hạng Sao" và "Phân Tích Cảm Xúc (AI)"
- ✅ **Rating Tab**:
  - Hiển thị điểm trung bình lớn với stars
  - Phân bố đánh giá theo sao (1-5 stars) với thanh tiến trình
  - Preview 3 đánh giá gần nhất
- ✅ **Sentiment Tab**:
  - Hiển thị % cảm xúc tích cực
  - Phân bố: Tích cực/Trung lập/Tiêu cực với icon và colors
  - Preview 3 mẫu phân tích với confidence score
- ✅ Loading states và empty states
- ✅ Dark mode support

**Sử dụng**: Có thể thêm vào trang reviews/rental-posts để hiển thị thống kê

## 📦 Service Layer Updates

### boardingHouseService.js
Đã thêm 3 methods mới:

```javascript
// Lấy nhà trọ được xếp hạng cao nhất
async getRankedHouses(type = "Rating", order = "desc", limit = 10)

// Lấy thống kê rating chi tiết
async getRatingSummary(id)

// Lấy phân tích sentiment bằng Python ML
async getSentimentSummary(id)
```

### api.js (boardingHouseAPI)
Đã thêm 3 endpoints:

```javascript
// GET /api/BoardingHouses/rank?type={type}&order={order}&limit={limit}
getRanked: (type, order, limit)

// GET /api/BoardingHouses/{id}/rating-feedback
getRatingSummary: (id)

// GET /api/BoardingHouses/{id}/sentiment-feedback
getSentimentSummary: (id)
```

## 🤖 Python ML Integration

### Sentiment Analysis Service
Backend sử dụng Python FastAPI service để phân tích sentiment:

**Endpoint**: POST http://localhost:8000/predict-sentiment

**Request**:
```json
{
  "message": ["Phòng đẹp", "Tệ quá"]
}
```

**Response**:
```json
[
  {
    "message": "Phòng đẹp",
    "label": "positive",
    "confidence": 95.5
  },
  {
    "message": "Tệ quá",
    "label": "negative",
    "confidence": 92.3
  }
]
```

**Model**: Logistic Regression trained on Vietnamese reviews
- Labels: negative (0), neutral (1), positive (2)
- Vectorizer: TF-IDF
- Files: `models/vectorizer.joblib`, `models/logistic_regression.joblib`

## 🎯 Cách Sử Dụng

### 1. Homepage - Top Ranked Houses
```jsx
import TopRankedHouses from '../components/TopRankedHouses';

export default function Home() {
  return (
    <div>
      <Hero />
      <SearchBar />
      <TopRankedHouses /> {/* Tự động fetch và hiển thị */}
      <LatestPosts />
    </div>
  );
}
```

### 2. Reviews Page - Statistics
```jsx
import BoardingHouseStatistics from '@/components/BoardingHouseStatistics';

export default function ReviewsPage({ boardingHouseId }) {
  return (
    <div>
      <h1>Đánh Giá</h1>
      <BoardingHouseStatistics boardingHouseId={boardingHouseId} />
      {/* Review list below */}
    </div>
  );
}
```

### 3. Manual API Calls
```javascript
import boardingHouseService from '@/services/boardingHouseService';

// Lấy top 10 nhà trọ theo rating
const topRated = await boardingHouseService.getRankedHouses("Rating", "desc", 10);

// Lấy top 5 nhà trọ có sentiment tích cực nhất
const topSentiment = await boardingHouseService.getRankedHouses("Sentiment", "desc", 5);

// Lấy thống kê rating cho 1 nhà trọ
const ratingStats = await boardingHouseService.getRatingSummary(houseId);

// Lấy phân tích sentiment cho 1 nhà trọ
const sentimentStats = await boardingHouseService.getSentimentSummary(houseId);
```

## 📊 Data Flow

```
Frontend Component
    ↓ (call service)
boardingHouseService.js
    ↓ (API wrapper)
api.js (boardingHouseAPI)
    ↓ (HTTP request)
API Gateway (port 7278)
    ↓ (route to)
BoardingHouseAPI
    ↓ (queries MongoDB + calls Python service)
Python ML Service (port 8000)
    ↓ (returns sentiment analysis)
Response back to Frontend
```

## 🎨 UI Features

### TopRankedHouses
- **Layout**: 3 columns grid (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- **Toggle Buttons**: Blue for Rating, Green for Sentiment
- **Rank Badges**: Gold/Silver/Bronze medals for top 3, numbers for others
- **Cards**: 
  - Hover effects (shadow + scale)
  - Ring borders for top 3
  - House name + address + score
  - View Details button
- **Colors**: 
  - Rating: Yellow stars
  - Sentiment: Green (positive), Yellow (neutral), Red (negative) faces

### BoardingHouseStatistics
- **Tabs**: Switch between Rating and Sentiment analysis
- **Rating Tab**:
  - Large average score with 5 stars
  - Horizontal bar charts for star distribution
  - Recent reviews preview cards
- **Sentiment Tab**:
  - Large percentage with smile icon
  - Horizontal bar charts (Green/Yellow/Red)
  - Detailed analysis with confidence badges
- **Responsive**: Mobile-friendly with proper spacing
- **Dark Mode**: Full support with proper color transitions

## ✅ Testing Checklist

- [ ] Homepage hiển thị TopRankedHouses component
- [ ] Toggle giữa Rating và Sentiment hoạt động
- [ ] Click vào card chuyển đến trang chi tiết
- [ ] BoardingHouseStatistics hiển thị đúng dữ liệu
- [ ] Tab switching hoạt động smooth
- [ ] Loading states xuất hiện khi fetch data
- [ ] Empty states hiển thị khi không có data
- [ ] Dark mode hoạt động đúng
- [ ] Responsive trên mobile/tablet/desktop
- [ ] API calls không lỗi CORS
- [ ] Backend Python ML service running (port 8000)
- [ ] Backend BoardingHouseAPI running (port 7278)

## 🚀 Next Steps

1. **Thêm BoardingHouseStatistics vào trang reviews**:
   - Tìm file reviews page
   - Import và sử dụng component với boardingHouseId

2. **Tối ưu hóa**:
   - Thêm caching cho ranked houses (sử dụng React Query)
   - Lazy load images trong cards
   - Debounce API calls

3. **Mở rộng**:
   - Thêm filter theo location trong TopRankedHouses
   - Export statistics thành PDF
   - Realtime updates khi có review mới

## 📝 Notes

- **Port Configuration**: Đang dùng port 7278 trực tiếp (tạm thời), nên chuyển về API Gateway port 7000 sau khi cấu hình xong
- **Python Service**: Cần chạy `python app.py` trong folder `feedback-sentiment-analysis` trước khi test sentiment
- **Error Handling**: Tất cả APIs đều có try-catch, trả về empty state nếu lỗi
- **Performance**: APIs có thể chậm nếu database lớn, nên thêm caching ở backend

## 🔗 Related Files

**Services**:
- `src/services/boardingHouseService.js`
- `src/utils/api.js`

**Components**:
- `src/components/TopRankedHouses.js`
- `src/components/BoardingHouseStatistics.js`

**Pages**:
- `src/app/page.js` (homepage)

**Backend**:
- `SEP490_Ezstay/BoardingHouseAPI/Controllers/BoardingHousesController.cs`
- `feedback-sentiment-analysis/app.py`
- `feedback-sentiment-analysis/sentiment_service.py`
