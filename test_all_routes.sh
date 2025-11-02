#!/bin/bash

BASE_URL="http://localhost"
echo "=========================================="
echo "COMPREHENSIVE API ROUTE TESTING"
echo "=========================================="
echo ""

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    local description=$5
    
    echo "[TEST] $description"
    echo "  Endpoint: $method $endpoint"
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint")
        fi
    fi
    
    http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    echo "  Status: $http_status"
    echo "$body" | head -3 | sed 's/^/  Response: /'
    echo ""
}

# Register and get token
echo "=== STEP 1: Authentication ==="
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"apitest'$(date +%s)'@test.com","username":"apitest'$(date +%s)'","firstName":"API","lastName":"Test","password":"test123456","role":"TENANT"}')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to get token, trying login..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"apitest@test.com","password":"test123456"}')
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "ERROR: Could not get authentication token"
    exit 1
fi

echo "✓ Got authentication token"
echo ""

# AUTH ROUTES
echo "=== AUTH ROUTES ==="
test_endpoint "GET" "/" "" "" "Root endpoint"
test_endpoint "POST" "/api/v1/auth/register" "" '{"email":"test'$(date +%s)'@example.com","username":"testuser'$(date +%s)'","firstName":"Test","lastName":"User","password":"test123","role":"TENANT"}' "Register new user"
test_endpoint "POST" "/api/v1/auth/login" "" '{"email":"wrong@email.com","password":"wrong"}' "Login with wrong credentials (should fail)"
test_endpoint "POST" "/api/v1/auth/request-reset" "" '{"email":"test@example.com"}' "Request password reset"
test_endpoint "POST" "/api/v1/auth/refresh-token" "" '{"token":"invalid"}' "Refresh token"
echo ""

# USER ROUTES
echo "=== USER ROUTES ==="
test_endpoint "GET" "/api/v1/user/profile" "$TOKEN" "" "Get user profile"
echo ""

# LISTING ROUTES
echo "=== LISTING ROUTES ==="
test_endpoint "GET" "/api/v1/listings" "$TOKEN" "" "Get all listings"
test_endpoint "GET" "/api/v1/listings/invalid-id" "$TOKEN" "" "Get listing by ID (invalid)"
test_endpoint "GET" "/api/v1/listings/test-id/check-leases" "" "" "Check listing leases (public)"
test_endpoint "POST" "/api/v1/listings" "$TOKEN" '{"title":"Test"}' "Create listing (should fail - no full data)"
test_endpoint "PUT" "/api/v1/listings/test-id" "$TOKEN" '{"title":"Updated"}' "Update listing"
test_endpoint "DELETE" "/api/v1/listings/test-id" "$TOKEN" "" "Delete listing"
echo ""

# APPLICATION ROUTES
echo "=== APPLICATION ROUTES ==="
test_endpoint "GET" "/api/v1/applications" "$TOKEN" "" "Get all applications"
test_endpoint "GET" "/api/v1/applications/invalid-public-id" "" "" "Get application by public ID (no auth)"
test_endpoint "POST" "/api/v1/applications" "$TOKEN" '{"listingId":"test","fullName":"Test","email":"test@test.com"}' "Create application"
test_endpoint "PUT" "/api/v1/applications/public/invalid-public-id" "" '{"data":"test"}' "Submit public application"
test_endpoint "PATCH" "/api/v1/applications/test-id/status" "$TOKEN" '{"status":"APPROVED"}' "Update application status"
test_endpoint "DELETE" "/api/v1/applications/test-id" "$TOKEN" "" "Delete application"
echo ""

# LEASE ROUTES
echo "=== LEASE ROUTES ==="
test_endpoint "GET" "/api/v1/leases" "$TOKEN" "" "Get all leases"
test_endpoint "GET" "/api/v1/leases?leaseStatus=ACTIVE" "$TOKEN" "" "Get leases with filter"
test_endpoint "GET" "/api/v1/leases/invalid-id" "$TOKEN" "" "Get lease by ID"
test_endpoint "POST" "/api/v1/leases" "$TOKEN" '{"listingId":"test","tenantId":"test","startDate":"2024-01-01","endDate":"2024-12-31","rentAmount":1000,"paymentFrequency":"MONTHLY"}' "Create lease"
test_endpoint "PUT" "/api/v1/leases/test-id" "$TOKEN" '{"rentAmount":1200}' "Update lease"
test_endpoint "DELETE" "/api/v1/leases/test-id" "$TOKEN" "" "Delete lease"
echo ""

# MAINTENANCE ROUTES
echo "=== MAINTENANCE ROUTES ==="
test_endpoint "GET" "/api/v1/maintenance" "$TOKEN" "" "Get all maintenance requests"
test_endpoint "GET" "/api/v1/maintenance?status=OPEN" "$TOKEN" "" "Get maintenance with filter"
test_endpoint "GET" "/api/v1/maintenance/invalid-id" "$TOKEN" "" "Get maintenance by ID"
test_endpoint "POST" "/api/v1/maintenance" "$TOKEN" '{"listingId":"test","title":"Test","description":"Test issue","category":"PLUMBING"}' "Create maintenance request"
test_endpoint "PATCH" "/api/v1/maintenance/test-id" "$TOKEN" '{"status":"IN_PROGRESS"}' "Update maintenance request"
test_endpoint "DELETE" "/api/v1/maintenance/test-id" "$TOKEN" "" "Delete maintenance request"
echo ""

# UPLOAD ROUTES
echo "=== UPLOAD ROUTES ==="
test_endpoint "GET" "/api/v1/upload/s3-url?fileName=test.jpg&fileType=image/jpeg" "$TOKEN" "" "Get S3 presigned URL"
test_endpoint "GET" "/api/v1/upload/s3-download-url?key=test.jpg" "$TOKEN" "" "Get S3 download URL"
test_endpoint "GET" "/api/v1/upload/application-proof-url" "" "" "Get application proof upload URL (public)"
test_endpoint "POST" "/api/v1/upload/invalid-public-id/submit" "" '{"data":"test"}' "Submit public application via upload"
echo ""

# API DOCS
echo "=== API DOCUMENTATION ==="
test_endpoint "GET" "/api-docs" "" "" "API Documentation (Swagger)"
echo ""

echo "=========================================="
echo "TESTING COMPLETE"
echo "=========================================="
