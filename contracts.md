# TourneyHub API Contracts

## Overview
Este documento define los contratos API entre el frontend y backend de TourneyHub, así como la migración de datos mock a datos reales.

## 1. Authentication Endpoints

### POST /api/auth/register
```json
Request: {
  "username": "string",
  "email": "string", 
  "password": "string"
}
Response: {
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "createdAt": "datetime"
  },
  "token": "string"
}
```

### POST /api/auth/login
```json
Request: {
  "email": "string",
  "password": "string" 
}
Response: {
  "user": {
    "id": "string",
    "username": "string", 
    "email": "string",
    "avatar": "string"
  },
  "token": "string"
}
```

### GET /api/auth/me
```json
Headers: { "Authorization": "Bearer <token>" }
Response: {
  "user": {
    "id": "string",
    "username": "string",
    "email": "string", 
    "avatar": "string"
  }
}
```

## 2. Tournament Endpoints

### GET /api/tournaments
```json
Query params: {
  "game": "string" (optional),
  "status": "string" (optional),
  "search": "string" (optional)
}
Response: {
  "tournaments": [
    {
      "id": "string",
      "name": "string",
      "game": "string",
      "organizer": "string",
      "participants": "number",
      "maxParticipants": "number", 
      "status": "registration|active|completed",
      "startDate": "datetime",
      "endDate": "datetime",
      "prize": "string",
      "description": "string",
      "rules": "string",
      "judges": ["string"],
      "createdAt": "datetime",
      "registrationDeadline": "datetime"
    }
  ]
}
```

### POST /api/tournaments
```json
Headers: { "Authorization": "Bearer <token>" }
Request: {
  "name": "string",
  "game": "string",
  "description": "string",
  "rules": "string",
  "maxParticipants": "number",
  "prize": "string",
  "startDate": "datetime",
  "endDate": "datetime", 
  "registrationDeadline": "datetime",
  "judges": ["string"]
}
Response: {
  "tournament": { /* same structure as GET */ }
}
```

### GET /api/tournaments/:id
```json
Response: {
  "tournament": { /* same structure as GET /tournaments */ }
}
```

### POST /api/tournaments/:id/join
```json
Headers: { "Authorization": "Bearer <token>" }
Response: {
  "message": "string",
  "tournament": { /* updated tournament */ }
}
```

## 3. User Endpoints

### GET /api/users/profile
```json
Headers: { "Authorization": "Bearer <token>" }
Response: {
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "createdAt": "datetime"
  },
  "stats": {
    "tournamentsCreated": "number",
    "tournamentsParticipated": "number", 
    "tournamentsWon": "number"
  },
  "tournaments": [ /* tournaments created by user */ ]
}
```

### GET /api/stats
```json
Response: {
  "totalTournaments": "number",
  "activeTournaments": "number",
  "totalPlayers": "number",
  "totalPrizePool": "string"
}
```

## 4. Database Models

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String (default avatar URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Tournament Model
```javascript
{
  _id: ObjectId,
  name: String,
  game: String,
  description: String,
  rules: String,
  organizer: ObjectId (ref: User),
  organizerName: String, // denormalized for performance
  participants: [ObjectId] (ref: User),
  maxParticipants: Number,
  status: String (enum: ['registration', 'active', 'completed']),
  startDate: Date,
  endDate: Date,
  registrationDeadline: Date,
  prize: String,
  judges: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 5. Mock Data Migration

### From mock.js to replace:
- `mockUser` -> Real user authentication
- `mockTournaments` -> Database tournaments
- `mockGames` -> Static list (can remain in frontend)
- `mockStats` -> Calculated from database

### Frontend Integration Changes:
1. **AuthContext**: Replace mock login/register with API calls
2. **Tournament pages**: Replace mockTournaments with API calls
3. **Profile page**: Replace mock user data with real profile API
4. **Statistics**: Replace mockStats with real stats API

## 6. Backend Implementation Plan

### Phase 1: Core Setup
- JWT authentication middleware
- User model and auth endpoints
- Password hashing with bcrypt

### Phase 2: Tournament System  
- Tournament model and CRUD operations
- Tournament join functionality
- Status management (registration -> active -> completed)

### Phase 3: Statistics & Integration
- Stats calculation endpoints  
- Frontend integration
- Error handling and validation

## 7. Frontend Integration Points

### Files to modify:
- `/src/context/AuthContext.js` - Replace mock with real API calls
- `/src/pages/Login.js` - Connect to real login endpoint
- `/src/pages/Register.js` - Connect to real register endpoint  
- `/src/pages/Tournaments.js` - Replace mockTournaments with API
- `/src/pages/CreateTournament.js` - Connect to create tournament API
- `/src/pages/TournamentDetails.js` - Connect to tournament details and join APIs
- `/src/pages/Profile.js` - Connect to real profile API
- `/src/pages/Home.js` - Connect to real stats API

### Environment Variables:
- Frontend already configured with `REACT_APP_BACKEND_URL`
- Backend will use existing `MONGO_URL` and `DB_NAME`

This contract ensures seamless integration between frontend mock data and real backend functionality.