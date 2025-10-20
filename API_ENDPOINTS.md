# Rental Management API Endpoints

Base URL: `http://localhost:8000`

## 📋 Table of Contents

- [Authentication](#authentication)
- [User](#user)
- [Listings](#listings)
- [Leases](#leases)
- [Maintenance](#maintenance)
- [Upload](#upload)

---

## Authentication

### 1. Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant@example.com",
    "username": "tenant123",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant@example.com",
    "password": "password123"
  }'
```

### 3. Request Password Reset

```bash
curl -X POST http://localhost:8000/api/v1/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant@example.com"
  }'
```

### 4. Reset Password

```bash
curl -X PATCH http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "newpassword123"
  }'
```

---

## User

### Get User Profile

```bash
curl -X GET http://localhost:8000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Listings

### 1. Create Listing (Landlord Only)

```bash
curl -X POST http://localhost:8000/api/v1/listings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern 2BR Apartment",
    "description": "Beautiful apartment in downtown",
    "category": "RESIDENTIAL",
    "residentialType": "APARTMENT",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001",
    "bedrooms": 2,
    "bathrooms": 2,
    "size": 1200,
    "yearBuilt": 2020,
    "rentAmount": 2500,
    "rentCycle": "MONTHLY",
    "securityDeposit": 2500,
    "availableDate": "2025-02-01T00:00:00Z",
    "amenities": ["Pool", "Gym", "Parking"],
    "images": ["https://example.com/image1.jpg"]
  }'
```

### 2. Get All Listings

```bash
curl -X GET http://localhost:8000/api/v1/listings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Listing by ID

```bash
curl -X GET http://localhost:8000/api/v1/listings/LISTING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Listing (Landlord Only)

```bash
curl -X PUT http://localhost:8000/api/v1/listings/LISTING_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rentAmount": 2600,
    "availableDate": "2025-03-01T00:00:00Z"
  }'
```

### 5. Delete Listing (Landlord Only)

```bash
curl -X DELETE http://localhost:8000/api/v1/listings/LISTING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Leases

### Update Lease (Landlord Only)

```bash
curl -X PUT http://localhost:8000/api/v1/leases/LEASE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endDate": "2026-01-01",
    "rentAmount": 2700,
    "leaseStatus": "ACTIVE",
    "notes": "Extended lease by 6 months"
  }'
```

---

## Maintenance

### 1. Create Maintenance Request (Tenant Only)

```bash
curl -X POST http://localhost:8000/api/v1/maintenance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "LISTING_ID",
    "title": "Leaking Kitchen Sink",
    "description": "Water is dripping from the pipe under the kitchen sink",
    "category": "PLUMBING",
    "priority": "HIGH",
    "images": [
      "https://bucket.s3.amazonaws.com/maintenance/123-leak.jpg"
    ]
  }'
```

### 2. Get All Maintenance Requests

```bash
# Get all (tenant sees their own, landlord sees their properties)
curl -X GET http://localhost:8000/api/v1/maintenance \
  -H "Authorization: Bearer YOUR_TOKEN"

# With filters
curl -X GET "http://localhost:8000/api/v1/maintenance?status=OPEN&priority=URGENT&category=PLUMBING" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Maintenance Request by ID

```bash
curl -X GET http://localhost:8000/api/v1/maintenance/REQUEST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Maintenance Request

```bash
# Tenant can update: description, priority
curl -X PATCH http://localhost:8000/api/v1/maintenance/REQUEST_ID \
  -H "Authorization: Bearer TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "The leak is getting worse",
    "priority": "URGENT"
  }'

# Landlord can update: status, priority, description
curl -X PATCH http://localhost:8000/api/v1/maintenance/REQUEST_ID \
  -H "Authorization: Bearer LANDLORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### 5. Delete Maintenance Request

```bash
curl -X DELETE http://localhost:8000/api/v1/maintenance/REQUEST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Upload

### 1. Get S3 Upload URL

```bash
# For maintenance images
curl -X GET "http://localhost:8000/api/v1/upload/s3-url?fileName=leak.jpg&fileType=image/jpeg&category=maintenance" \
  -H "Authorization: Bearer YOUR_TOKEN"

# For listing images
curl -X GET "http://localhost:8000/api/v1/upload/s3-url?fileName=house.jpg&fileType=image/jpeg&category=listings" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
# {
#   "uploadURL": "https://s3.amazonaws.com/presigned-url...",
#   "key": "maintenance/1234567890-leak.jpg",
#   "fileUrl": "https://bucket.s3.amazonaws.com/maintenance/1234567890-leak.jpg"
# }
```

### 2. Upload File to S3 (Use the uploadURL from step 1)

```bash
curl -X PUT "UPLOAD_URL_FROM_STEP_1" \
  -H "Content-Type: image/jpeg" \
  --data-binary @leak.jpg
```

### 3. Get S3 Download URL

```bash
curl -X GET "http://localhost:8000/api/v1/upload/s3-download-url?key=maintenance/1234567890-leak.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Complete Workflow Examples

### Example 1: Tenant Creates Maintenance Request with Image

```bash
# Step 1: Get upload URL
UPLOAD_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/upload/s3-url?fileName=leak.jpg&fileType=image/jpeg&category=maintenance" \
  -H "Authorization: Bearer $TENANT_TOKEN")

UPLOAD_URL=$(echo $UPLOAD_RESPONSE | jq -r '.data.uploadURL')
FILE_URL=$(echo $UPLOAD_RESPONSE | jq -r '.data.fileUrl')

# Step 2: Upload file
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @leak.jpg

# Step 3: Create maintenance request
curl -X POST http://localhost:8000/api/v1/maintenance \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"listingId\": \"$LISTING_ID\",
    \"title\": \"Leaking Sink\",
    \"description\": \"Water dripping from pipe\",
    \"category\": \"PLUMBING\",
    \"priority\": \"HIGH\",
    \"images\": [\"$FILE_URL\"]
  }"
```

### Example 2: Landlord Accepts and Completes Maintenance Request

```bash
# Step 1: View all open requests
curl -X GET "http://localhost:8000/api/v1/maintenance?status=OPEN" \
  -H "Authorization: Bearer $LANDLORD_TOKEN"

# Step 2: Accept request (change status to IN_PROGRESS)
curl -X PATCH http://localhost:8000/api/v1/maintenance/REQUEST_ID \
  -H "Authorization: Bearer $LANDLORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'

# Step 3: Mark as completed
curl -X PATCH http://localhost:8000/api/v1/maintenance/REQUEST_ID \
  -H "Authorization: Bearer $LANDLORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

---

## Notes

- All authenticated endpoints require `Authorization: Bearer YOUR_TOKEN` header
- Replace `YOUR_TOKEN`, `LISTING_ID`, `REQUEST_ID`, etc. with actual values
- Swagger documentation available at: `http://localhost:8000/api-docs`
- Base URL for all API v1 endpoints: `http://localhost:8000/api/v1`
