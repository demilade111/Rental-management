#!/bin/bash

# Insurance Endpoints Testing Script
# Make sure the server is running before executing this script

BASE_URL="http://localhost:4000/api/v1"
echo "========================================="
echo "Testing Insurance Endpoints"
echo "========================================="
echo ""

# Step 1: Login as Tenant to get token
echo "1. Logging in as TENANT..."
TENANT_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tenant@test.com", "password": "password123"}')

TENANT_TOKEN=$(echo $TENANT_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TENANT_TOKEN" ]; then
  echo "❌ Failed to get tenant token. Response:"
  echo $TENANT_RESPONSE
  echo ""
  echo "Note: You may need to create a test tenant user first."
  echo "Creating test tenant..."
  
  # Try to register a tenant
  curl -s -X POST ${BASE_URL}/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "tenant@test.com",
      "password": "password123",
      "firstName": "Test",
      "lastName": "Tenant",
      "role": "TENANT"
    }' | python3 -m json.tool
  echo ""
  
  # Try login again
  TENANT_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "tenant@test.com", "password": "password123"}')
  TENANT_TOKEN=$(echo $TENANT_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo "✅ Tenant Token: ${TENANT_TOKEN:0:50}..."
echo ""

# Step 2: Login as Admin (Landlord)
echo "2. Logging in as ADMIN..."
ADMIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token"
  echo "Creating test admin..."
  
  curl -s -X POST ${BASE_URL}/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@test.com",
      "password": "password123",
      "firstName": "Test",
      "lastName": "Admin",
      "role": "ADMIN"
    }' | python3 -m json.tool
  echo ""
  
  ADMIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@test.com", "password": "password123"}')
  ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo "✅ Admin Token: ${ADMIN_TOKEN:0:50}..."
echo ""

# Step 3: Test GET Presigned Upload URL (TENANT)
echo "3. Testing GET /insurance/presign (Get Upload URL)..."
echo "Request: GET ${BASE_URL}/insurance/presign?fileName=test-policy.pdf&fileType=application/pdf"
curl -s -X GET "${BASE_URL}/insurance/presign?fileName=test-policy.pdf&fileType=application/pdf" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo ""
echo "========================================="
echo ""

# Step 4: Test POST Create Insurance (TENANT)
echo "4. Testing POST /insurance (Create Insurance Record)..."
CREATE_RESPONSE=$(curl -s -X POST ${BASE_URL}/insurance \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerName": "State Farm",
    "policyNumber": "SF-TEST-12345",
    "coverageType": "Standard Renters Insurance",
    "coverageAmount": 50000,
    "monthlyCost": 45.99,
    "startDate": "2024-01-01",
    "expiryDate": "2025-01-01",
    "documentUrl": "https://example.com/test-policy.pdf",
    "documentKey": "insurance/test-policy.pdf",
    "notes": "Test insurance policy created via API"
  }')

echo $CREATE_RESPONSE | python3 -m json.tool
INSURANCE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo ""
echo "✅ Created Insurance ID: $INSURANCE_ID"
echo ""
echo "========================================="
echo ""

# Step 5: Test GET All Insurances (TENANT)
echo "5. Testing GET /insurance (Get All Insurances as Tenant)..."
curl -s -X GET ${BASE_URL}/insurance \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo ""
echo "========================================="
echo ""

# Step 6: Test GET Insurance by ID (TENANT)
if [ ! -z "$INSURANCE_ID" ]; then
  echo "6. Testing GET /insurance/:id (Get Insurance by ID)..."
  curl -s -X GET ${BASE_URL}/insurance/$INSURANCE_ID \
    -H "Authorization: Bearer $TENANT_TOKEN" \
    -H "Content-Type: application/json" | python3 -m json.tool
  echo ""
  echo "========================================="
  echo ""
fi

# Step 7: Test PATCH Update Insurance (TENANT)
if [ ! -z "$INSURANCE_ID" ]; then
  echo "7. Testing PATCH /insurance/:id (Update Insurance)..."
  curl -s -X PATCH ${BASE_URL}/insurance/$INSURANCE_ID \
    -H "Authorization: Bearer $TENANT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "monthlyCost": 49.99,
      "notes": "Updated monthly cost via API test"
    }' | python3 -m json.tool
  echo ""
  echo "========================================="
  echo ""
fi

# Step 8: Test GET All Insurances (ADMIN)
echo "8. Testing GET /insurance (Get All Insurances as Admin)..."
curl -s -X GET ${BASE_URL}/insurance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo ""
echo "========================================="
echo ""

# Step 9: Test PATCH Verify Insurance (ADMIN)
if [ ! -z "$INSURANCE_ID" ]; then
  echo "9. Testing PATCH /insurance/:id/verify (Verify Insurance - Admin Only)..."
  curl -s -X PATCH ${BASE_URL}/insurance/$INSURANCE_ID/verify \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" | python3 -m json.tool
  echo ""
  echo "========================================="
  echo ""
fi

# Step 10: Test POST Send Notification (ADMIN)
if [ ! -z "$INSURANCE_ID" ]; then
  echo "10. Testing POST /insurance/:id/notify (Send Reminder - Admin Only)..."
  curl -s -X POST ${BASE_URL}/insurance/$INSURANCE_ID/notify \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "message": "Please renew your insurance policy soon."
    }' | python3 -m json.tool
  echo ""
  echo "========================================="
  echo ""
fi

# Step 11: Test GET Download URL
if [ ! -z "$INSURANCE_ID" ]; then
  echo "11. Testing GET /insurance/download (Get Document Download URL)..."
  curl -s -X GET "${BASE_URL}/insurance/download?key=insurance/test-policy.pdf" \
    -H "Authorization: Bearer $TENANT_TOKEN" \
    -H "Content-Type: application/json" | python3 -m json.tool
  echo ""
  echo "========================================="
  echo ""
fi

# Step 12: Test POST Extract Insurance Data (OCR)
echo "12. Testing POST /insurance/extract (OCR Extraction)..."
curl -s -X POST ${BASE_URL}/insurance/extract \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrl": "https://example.com/sample-insurance.pdf",
    "fileType": "application/pdf"
  }' | python3 -m json.tool
echo ""
echo "========================================="
echo ""

# Step 13: Create another insurance to test rejection
echo "13. Creating another insurance for rejection test..."
REJECT_RESPONSE=$(curl -s -X POST ${BASE_URL}/insurance \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerName": "Allstate",
    "policyNumber": "AL-TEST-67890",
    "coverageType": "Basic Coverage",
    "coverageAmount": 25000,
    "monthlyCost": 30.00,
    "startDate": "2024-06-01",
    "expiryDate": "2025-06-01",
    "documentUrl": "https://example.com/test-policy-2.pdf",
    "documentKey": "insurance/test-policy-2.pdf"
  }')

INSURANCE_ID_2=$(echo $REJECT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Created second insurance ID: $INSURANCE_ID_2"
echo ""

# Step 14: Test PATCH Reject Insurance (ADMIN)
if [ ! -z "$INSURANCE_ID_2" ]; then
  echo "14. Testing PATCH /insurance/:id/reject (Reject Insurance - Admin Only)..."
  curl -s -X PATCH ${BASE_URL}/insurance/$INSURANCE_ID_2/reject \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "rejectionReason": "Coverage amount too low. Minimum $50,000 required."
    }' | python3 -m json.tool
  echo ""
  echo "========================================="
  echo ""
fi

# Step 15: Test Filtering
echo "15. Testing GET /insurance with filters..."
echo "Filter by status=VERIFIED:"
curl -s -X GET "${BASE_URL}/insurance?status=VERIFIED" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo ""
echo "========================================="
echo ""

echo "✅ All Insurance Endpoint Tests Complete!"
echo ""
echo "Summary of tested endpoints:"
echo "  1. GET  /insurance/presign         - Get presigned upload URL"
echo "  2. POST /insurance/extract         - OCR extraction"
echo "  3. POST /insurance                 - Create insurance"
echo "  4. GET  /insurance                 - Get all insurances"
echo "  5. GET  /insurance/:id             - Get insurance by ID"
echo "  6. PATCH /insurance/:id            - Update insurance"
echo "  7. PATCH /insurance/:id/verify     - Verify insurance (Admin)"
echo "  8. PATCH /insurance/:id/reject     - Reject insurance (Admin)"
echo "  9. POST /insurance/:id/notify      - Send reminder (Admin)"
echo " 10. GET  /insurance/download        - Get download URL"
echo ""





