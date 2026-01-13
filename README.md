# Gwent Reviews Service - NodeJS API

NodeJS + TypeScript service for managing card reviews with MongoDB storage.


This service provides REST API endpoints for managing reviews of Gwent cards. It integrates with the Spring Boot backend to validate card existence before creating reviews.


##  Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+ (running locally or remote)
- Spring Boot backend (gwent-service) running on `http://localhost:8080`

##  Quick Start

### 1. Clone and Install
```bash
cd gwent-reviews-service
npm install
```

### 2. Environment Configuration

Create `.env` file:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/gwent-reviews
SPRING_BOOT_API_URL=http://localhost:8080/api
NODE_ENV=development
```

### 3. Start MongoDB

**Windows:**
```bash
mongod
```

**Linux/macOS:**
```bash
sudo systemctl start mongod
```

**Or use Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 4. Run the Service

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

**Service will be available at:**
- API: `http://localhost:3001/api/reviews`
- Health check: `http://localhost:3001/health`

##  API Endpoints

### 1. Create Review

**POST** `/api/reviews`

Creates a new review for a card.

**Request Body:**
```json
{
  "cardId": 1,
  "rating": 5,
  "comment": "Excellent card! Very powerful in current meta.",
  "author": "PlayerName"
}
```

**Validation:**
- `cardId`: positive integer, must exist in Spring Boot API
- `rating`: integer between 1 and 5
- `comment`: string, 10-1000 characters
- `author`: string, 2-100 characters

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "cardId": 1,
    "rating": 5,
    "comment": "Excellent card! Very powerful in current meta.",
    "author": "PlayerName",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Rating must be between 1 and 5",
      "param": "rating",
      "location": "body"
    }
  ]
}
```

---

### 2. Get Reviews

**GET** `/api/reviews?cardId={id}&size={size}&from={from}`

Returns paginated list of reviews for a specific card, sorted by creation date (newest first).

**Query Parameters:**
- `cardId` (required): Card ID (positive integer)
- `size` (optional): Number of reviews to return (default: 5, max: 100)
- `from` (optional): Offset for pagination (default: 0)

**Example Request:**
```bash
GET /api/reviews?cardId=1&size=10&from=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "65a1b2c3d4e5f6a7b8c9d0e1",
      "cardId": 1,
      "rating": 5,
      "comment": "Great card!",
      "author": "User1",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "id": "65a1b2c3d4e5f6a7b8c9d0e2",
      "cardId": 1,
      "rating": 4,
      "comment": "Good card but needs synergy.",
      "author": "User2",
      "createdAt": "2024-01-14T10:30:00.000Z",
      "updatedAt": "2024-01-14T10:30:00.000Z"
    }
  ],
  "total": 15,
  "cardId": 1,
  "size": 10,
  "from": 0
}
```

---

### 3. Get Review Counts

**POST** `/api/reviews/_counts`

Returns the count of reviews for multiple cards using MongoDB aggregation pipeline.

**Request Body:**
```json
{
  "cardIds": [1, 2, 3, 4, 5]
}
```

**Validation:**
- `cardIds`: array of positive integers (1-100 elements)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "1": 15,
    "2": 8,
    "3": 0,
    "4": 23,
    "5": 5
  }
}
```

**Note:** Cards without reviews will have count `0`.

---

##  Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Coverage

Tests use `mongodb-memory-server` to create an in-memory MongoDB instance, so no external database is needed for testing.

**Coverage includes:**
-  Create review (success and validation errors)
-  Card existence validation via Spring Boot API
-  Get reviews with pagination
-  Review counts using aggregation
-  All edge cases and error scenarios

**Example output:**
```
PASS  tests/review.test.ts
  Review API Integration Tests
    POST /api/reviews
      ✓ should create a new review successfully (150ms)
      ✓ should return 400 for invalid rating (45ms)
      ✓ should return 500 when card does not exist (60ms)
    GET /api/reviews
      ✓ should get reviews for a specific card (80ms)
      ✓ should respect pagination parameters (70ms)
    POST /api/reviews/_counts
      ✓ should return review counts for multiple cards (90ms)
      ✓ should use aggregation pipeline (75ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Coverage:    95.2% statements, 92.8% branches
```

---

##  Integration with Spring Boot

The service validates card existence before creating reviews:

1. Client sends `POST /api/reviews` with `cardId`
2. NodeJS service calls Spring Boot API: `GET http://localhost:8080/api/cards/{cardId}`
3. If card exists → create review in MongoDB
4. If card doesn't exist → return error

**Spring Boot must be running** for the validation to work!


##  Data Model

### Review Schema
```typescript
{
  cardId: Number,      // Reference to Card in Spring Boot
  rating: Number,      // 1-5 stars
  comment: String,     // 10-1000 characters
  author: String,      // 2-100 characters
  createdAt: Date,     // Auto-generated
  updatedAt: Date      // Auto-generated
}
```

**Indexes:**
- `{ cardId: 1, createdAt: -1 }` - For efficient queries sorted by date

---

##  CORS Configuration

The service accepts requests from:
- `http://localhost:3050` (Frontend)
- `http://localhost:8080` (Spring Boot)

Modify in `src/index.ts` if needed.

---

##  Example Usage Flow

### Frontend Integration Example
```javascript
// 1. Get reviews for card
const reviews = await fetch('http://localhost:3001/api/reviews?cardId=1&size=5');

// 2. Get review counts for multiple cards
const counts = await fetch('http://localhost:3001/api/reviews/_counts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cardIds: [1, 2, 3, 4, 5] })
});

// 3. Create new review
const newReview = await fetch('http://localhost:3001/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cardId: 1,
    rating: 5,
    comment: 'Amazing card! Highly recommend for Monster decks.',
    author: 'ProPlayer123'
  })
});
```

---

##  Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Start MongoDB
```bash
# Windows
mongod

# Linux/macOS
sudo systemctl start mongod

# Check status
mongo --eval "db.adminCommand('ping')"
```

---

### Card Validation Fails
```
Error: Card with ID 1 not found
```

**Solution:** Ensure Spring Boot backend is running on `http://localhost:8080`
```bash
# In gwent-service directory
mvn spring-boot:run
```

---

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:** Change port in `.env` or kill the process
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3001 | xargs kill -9
```

---

##  Development Commands
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

---

##  Deployment

### Build and Run
```bash
# Build TypeScript to JavaScript
npm run build

# Run production server
NODE_ENV=production npm start
```

### Environment Variables for Production
```env
PORT=3001
MONGODB_URI=mongodb://production-server:27017/gwent-reviews
SPRING_BOOT_API_URL=https://api.production.com/api
NODE_ENV=production
```

##  Related Projects

- **gwent-service** - Spring Boot REST API for Cards and Decks
- **gwent-ui** - React Frontend for card management
