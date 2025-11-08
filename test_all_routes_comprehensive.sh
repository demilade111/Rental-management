#!/bin/bash

# Comprehensive API Testing Script for Rental Management System
# Tests all POST, GET, PUT, PATCH, and DELETE endpoints

BASE_URL="http://localhost:4000"
TIMESTAMP=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "=========================================="
echo "COMPREHENSIVE API ROUTE TESTING"
echo "Base URL: $BASE_URL"
echo "Started at: $(date)"
echo "=========================================="
echo ""

# Test function with improved output
test_endpoint() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    local description=$5
    local expected_status=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}[TEST #$TOTAL_TESTS]${NC} $description"
    echo "  Method: $method"
    echo "  Endpoint: $endpoint"
    
    # Build curl command
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "$data" 2>&1)
        else
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token" 2>&1)
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" 2>&1)
        else
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" 2>&1)
        fi
    fi
    
    http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    # Check if status matches expected
    if [ -n "$expected_status" ] && [ "$http_status" = "$expected_status" ]; then
        echo -e "  ${GREEN}✓ Status: $http_status (Expected)${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ -z "$expected_status" ]; then
        echo "  Status: $http_status"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}✗ Status: $http_status (Expected: $expected_status)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Show response preview
    if [ -n "$body" ]; then
        echo "$body" | head -3 | sed 's/^/  Response: /'
    fi
    echo ""
}

# ==========================================
# STEP 1: AUTHENTICATION & TOKEN SETUP
# ==========================================
echo -e "${YELLOW}=== AUTHENTICATION SETUP ===${NC}"

# Register a new user
REGISTER_EMAIL="test${TIMESTAMP}@test.com"
REGISTER_USERNAME="testuser${TIMESTAMP}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$REGISTER_EMAIL\",\"username\":\"$REGISTER_USERNAME\",\"firstName\":\"Test\",\"lastName\":\"User\",\"password\":\"test123456\",\"role\":\"ADMIN\"}")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Also create a tenant user for tenant-specific tests
TENANT_EMAIL="tenant${TIMESTAMP}@test.com"
TENANT_USERNAME="tenant${TIMESTAMP}"
TENANT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TENANT_EMAIL\",\"username\":\"$TENANT_USERNAME\",\"firstName\":\"Tenant\",\"lastName\":\"User\",\"password\":\"test123456\",\"role\":\"TENANT\"}")

TENANT_TOKEN=$(echo $TENANT_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
TENANT_ID=$(echo $TENANT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}ERROR: Could not get authentication token${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Got authentication token for LANDLORD${NC}"
echo "User ID: $USER_ID"

if [ -z "$TENANT_TOKEN" ]; then
    echo -e "${YELLOW}WARNING: Could not get tenant token${NC}"
else
    echo -e "${GREEN}✓ Got authentication token for TENANT${NC}"
    echo "Tenant ID: $TENANT_ID"
fi
echo ""

# ==========================================
# AUTH ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== AUTH ROUTES ===${NC}"

test_endpoint "GET" "/" "" "" "Root endpoint - check API status" "200"

test_endpoint "POST" "/api/v1/auth/register" "" \
    "{\"email\":\"newuser${TIMESTAMP}@test.com\",\"username\":\"newuser${TIMESTAMP}\",\"firstName\":\"New\",\"lastName\":\"User\",\"password\":\"test123456\",\"role\":\"ADMIN\"}" \
    "Register new user" "201"

test_endpoint "POST" "/api/v1/auth/login" "" \
    "{\"email\":\"$REGISTER_EMAIL\",\"password\":\"test123456\"}" \
    "Login with valid credentials" "200"

test_endpoint "POST" "/api/v1/auth/login" "" \
    "{\"email\":\"wrong@email.com\",\"password\":\"wrongpass\"}" \
    "Login with invalid credentials (should fail)" "401"

test_endpoint "POST" "/api/v1/auth/request-reset" "" \
    "{\"email\":\"$REGISTER_EMAIL\"}" \
    "Request password reset" "200"

test_endpoint "POST" "/api/v1/auth/refresh-token" "" \
    "{\"token\":\"$TOKEN\"}" \
    "Refresh authentication token" ""

test_endpoint "PATCH" "/api/v1/auth/reset-password" "" \
    "{\"token\":\"invalid_token\",\"newPassword\":\"newpass123\"}" \
    "Reset password with invalid token (should fail)" "400"

# ==========================================
# USER ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== USER ROUTES ===${NC}"

test_endpoint "GET" "/api/v1/user/profile" "$TOKEN" "" \
    "Get authenticated user profile" "200"

test_endpoint "GET" "/api/v1/user/profile" "" "" \
    "Get user profile without auth (should fail)" "401"

# ==========================================
# LISTING ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== LISTING ROUTES ===${NC}"

# Create a listing
LISTING_DATA='{
  "title": "Beautiful 2BR Apartment",
  "description": "Spacious apartment in downtown",
  "propertyType": "APARTMENT",
  "bedrooms": 2,
  "bathrooms": 1,
  "totalSquareFeet": 1200,
  "rentAmount": 1500,
  "securityDeposit": 1500,
  "streetAddress": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "rentCycle": "MONTHLY",
  "availableDate": "2025-01-01T00:00:00.000Z",
  "status": "ACTIVE"
}'

CREATE_LISTING_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/listings" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$LISTING_DATA")

LISTING_ID=$(echo $CREATE_LISTING_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

test_endpoint "POST" "/api/v1/listings" "$TOKEN" "$LISTING_DATA" \
    "Create new listing" "201"

test_endpoint "GET" "/api/v1/listings" "$TOKEN" "" \
    "Get all listings" "200"

if [ -n "$LISTING_ID" ]; then
    echo "Created Listing ID: $LISTING_ID"
    
    test_endpoint "GET" "/api/v1/listings/$LISTING_ID" "$TOKEN" "" \
        "Get listing by ID" "200"
    
    test_endpoint "GET" "/api/v1/listings/$LISTING_ID/check-leases" "" "" \
        "Check listing leases (public endpoint)" "200"
    
    test_endpoint "PUT" "/api/v1/listings/$LISTING_ID" "$TOKEN" \
        "{\"title\":\"Updated Beautiful 2BR Apartment\",\"rentAmount\":1600}" \
        "Update listing" "200"
fi

test_endpoint "GET" "/api/v1/listings/invalid-id-123" "$TOKEN" "" \
    "Get listing with invalid ID (should fail)" "404"

test_endpoint "POST" "/api/v1/listings" "$TOKEN" \
    "{\"title\":\"Incomplete Listing\"}" \
    "Create listing with missing required fields (should fail)" "400"

# ==========================================
# APPLICATION ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== APPLICATION ROUTES ===${NC}"

# Create application
APPLICATION_DATA="{
  \"listingId\": \"$LISTING_ID\",
  \"fullName\": \"John Applicant\",
  \"email\": \"john${TIMESTAMP}@test.com\",
  \"phone\": \"555-0123\",
  \"monthlyIncome\": 5000,
  \"currentAddress\": \"456 Oak Ave\",
  \"moveInDate\": \"2025-02-01T00:00:00Z\",
  \"message\": \"I am interested in this property\"
}"

CREATE_APP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/applications" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$APPLICATION_DATA")

APPLICATION_ID=$(echo $CREATE_APP_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
PUBLIC_ID=$(echo $CREATE_APP_RESPONSE | grep -o '"publicId":"[^"]*' | cut -d'"' -f4)

if [ -n "$APPLICATION_ID" ]; then
    test_endpoint "POST" "/api/v1/applications" "$TOKEN" "$APPLICATION_DATA" \
        "Create new application" "201"
    
    echo "Created Application ID: $APPLICATION_ID"
    echo "Public ID: $PUBLIC_ID"
fi

test_endpoint "GET" "/api/v1/applications" "$TOKEN" "" \
    "Get all applications" "200"

if [ -n "$PUBLIC_ID" ]; then
    test_endpoint "GET" "/api/v1/applications/$PUBLIC_ID" "" "" \
        "Get application by public ID (no auth)" "200"
    
    test_endpoint "PUT" "/api/v1/applications/public/$PUBLIC_ID" "" \
        "{\"fullName\":\"John Updated\",\"phone\":\"555-9999\"}" \
        "Submit/update public application" "200"
fi

if [ -n "$APPLICATION_ID" ]; then
    test_endpoint "PATCH" "/api/v1/applications/$APPLICATION_ID/status" "$TOKEN" \
        "{\"status\":\"APPROVED\",\"decisionNotes\":\"Good candidate\"}" \
        "Update application status to APPROVED" "200"
fi

test_endpoint "POST" "/api/v1/applications/bulk-delete" "$TOKEN" \
    "{\"ids\":[]}" \
    "Bulk delete applications (empty array)" "200"

test_endpoint "GET" "/api/v1/applications/invalid-public-id-123" "" "" \
    "Get application with invalid public ID (should fail)" "404"

# ==========================================
# LEASE ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== LEASE ROUTES ===${NC}"

# Create lease
LEASE_DATA="{
  \"listingId\": \"$LISTING_ID\",
  \"tenantId\": \"$TENANT_ID\",
  \"startDate\": \"2025-01-01T00:00:00Z\",
  \"endDate\": \"2025-12-31T23:59:59Z\",
  \"rentAmount\": 1500,
  \"paymentFrequency\": \"MONTHLY\",
  \"securityDeposit\": 1500,
  \"leaseStatus\": \"ACTIVE\"
}"

CREATE_LEASE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/leases" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$LEASE_DATA")

LEASE_ID=$(echo $CREATE_LEASE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$LEASE_ID" ]; then
    test_endpoint "POST" "/api/v1/leases" "$TOKEN" "$LEASE_DATA" \
        "Create new lease" "201"
    
    echo "Created Lease ID: $LEASE_ID"
fi

test_endpoint "GET" "/api/v1/leases" "$TOKEN" "" \
    "Get all leases" "200"

test_endpoint "GET" "/api/v1/leases?leaseStatus=ACTIVE" "$TOKEN" "" \
    "Get leases with filter (status=ACTIVE)" "200"

test_endpoint "GET" "/api/v1/leases?listingId=$LISTING_ID" "$TOKEN" "" \
    "Get leases filtered by listing ID" "200"

if [ -n "$TENANT_TOKEN" ]; then
    test_endpoint "GET" "/api/v1/leases/tenant" "$TENANT_TOKEN" "" \
        "Get tenant leases (tenant user)" "200"
fi

if [ -n "$LEASE_ID" ]; then
    test_endpoint "GET" "/api/v1/leases/$LEASE_ID" "$TOKEN" "" \
        "Get lease by ID" "200"
    
    test_endpoint "PUT" "/api/v1/leases/$LEASE_ID" "$TOKEN" \
        "{\"rentAmount\":1600,\"notes\":\"Rent increased\"}" \
        "Update lease" "200"
fi

test_endpoint "GET" "/api/v1/leases/invalid-lease-id-123" "$TOKEN" "" \
    "Get lease with invalid ID (should fail)" "404"

# ==========================================
# CUSTOM LEASE ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== CUSTOM LEASE ROUTES ===${NC}"

CUSTOM_LEASE_DATA="{
  \"listingId\": \"$LISTING_ID\",
  \"clauseTitle\": \"Pet Policy\",
  \"clauseContent\": \"Tenant is allowed to keep one small dog or cat\",
  \"clauseType\": \"ADDITIONAL\"
}"

CREATE_CUSTOM_LEASE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/customleases" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$CUSTOM_LEASE_DATA")

CUSTOM_LEASE_ID=$(echo $CREATE_CUSTOM_LEASE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$CUSTOM_LEASE_ID" ]; then
    test_endpoint "POST" "/api/v1/customleases" "$TOKEN" "$CUSTOM_LEASE_DATA" \
        "Create custom lease clause" "201"
    
    echo "Created Custom Lease ID: $CUSTOM_LEASE_ID"
fi

test_endpoint "GET" "/api/v1/customleases" "$TOKEN" "" \
    "Get all custom lease clauses" "200"

if [ -n "$LISTING_ID" ]; then
    test_endpoint "GET" "/api/v1/customleases/by-listing/$LISTING_ID" "$TOKEN" "" \
        "Get custom leases by listing ID" "200"
fi

if [ -n "$CUSTOM_LEASE_ID" ]; then
    test_endpoint "GET" "/api/v1/customleases/$CUSTOM_LEASE_ID" "$TOKEN" "" \
        "Get custom lease by ID" "200"
    
    test_endpoint "PUT" "/api/v1/customleases/$CUSTOM_LEASE_ID" "$TOKEN" \
        "{\"clauseContent\":\"Updated: Tenant is allowed to keep up to two small pets\"}" \
        "Update custom lease" "200"
    
    test_endpoint "DELETE" "/api/v1/customleases/$CUSTOM_LEASE_ID" "$TOKEN" "" \
        "Delete custom lease" "200"
fi

# ==========================================
# LEASE INVITE ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== LEASE INVITE ROUTES ===${NC}"

if [ -n "$LEASE_ID" ]; then
    INVITE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/leases-invite/$LEASE_ID/invite" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    INVITE_TOKEN=$(echo $INVITE_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    test_endpoint "POST" "/api/v1/leases-invite/$LEASE_ID/invite" "$TOKEN" "" \
        "Generate lease invite" "201"
    
    if [ -n "$INVITE_TOKEN" ] && [ -n "$TENANT_TOKEN" ]; then
        echo "Invite Token: $INVITE_TOKEN"
        
        test_endpoint "GET" "/api/v1/leases-invite/invite/$INVITE_TOKEN" "$TENANT_TOKEN" "" \
            "Get lease invite by token" "200"
        
        test_endpoint "POST" "/api/v1/leases-invite/sign/$INVITE_TOKEN" "$TENANT_TOKEN" \
            "{\"signature\":\"John Tenant\"}" \
            "Sign lease" "200"
    fi
fi

test_endpoint "GET" "/api/v1/leases-invite/invite/invalid-token-123" "$TOKEN" "" \
    "Get invite with invalid token (should fail)" "404"

# ==========================================
# MAINTENANCE ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== MAINTENANCE ROUTES ===${NC}"

MAINTENANCE_DATA="{
  \"listingId\": \"$LISTING_ID\",
  \"title\": \"Broken Faucet\",
  \"description\": \"Kitchen faucet is leaking\",
  \"category\": \"PLUMBING\",
  \"priority\": \"HIGH\"
}"

CREATE_MAINT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/maintenance" \
    -H "Authorization: Bearer $TENANT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$MAINTENANCE_DATA")

MAINTENANCE_ID=$(echo $CREATE_MAINT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$TENANT_TOKEN" ]; then
    test_endpoint "POST" "/api/v1/maintenance" "$TENANT_TOKEN" "$MAINTENANCE_DATA" \
        "Create maintenance request (tenant)" "201"
    
    if [ -n "$MAINTENANCE_ID" ]; then
        echo "Created Maintenance ID: $MAINTENANCE_ID"
    fi
fi

test_endpoint "GET" "/api/v1/maintenance" "$TOKEN" "" \
    "Get all maintenance requests" "200"

test_endpoint "GET" "/api/v1/maintenance?status=OPEN" "$TOKEN" "" \
    "Get maintenance requests (filter by status)" "200"

test_endpoint "GET" "/api/v1/maintenance?priority=HIGH" "$TOKEN" "" \
    "Get maintenance requests (filter by priority)" "200"

test_endpoint "GET" "/api/v1/maintenance?category=PLUMBING" "$TOKEN" "" \
    "Get maintenance requests (filter by category)" "200"

if [ -n "$MAINTENANCE_ID" ]; then
    test_endpoint "GET" "/api/v1/maintenance/$MAINTENANCE_ID" "$TOKEN" "" \
        "Get maintenance request by ID" "200"
    
    test_endpoint "PATCH" "/api/v1/maintenance/$MAINTENANCE_ID" "$TOKEN" \
        "{\"status\":\"IN_PROGRESS\",\"priority\":\"MEDIUM\"}" \
        "Update maintenance request" "200"
    
    test_endpoint "GET" "/api/v1/maintenance/$MAINTENANCE_ID/messages" "$TOKEN" "" \
        "Get maintenance messages" "200"
    
    test_endpoint "POST" "/api/v1/maintenance/$MAINTENANCE_ID/messages" "$TOKEN" \
        "{\"content\":\"I will fix this tomorrow\",\"images\":[]}" \
        "Post maintenance message" "201"
fi

test_endpoint "GET" "/api/v1/maintenance/invalid-id-123" "$TOKEN" "" \
    "Get maintenance with invalid ID (should fail)" "404"

# ==========================================
# NOTIFICATION ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== NOTIFICATION ROUTES ===${NC}"

test_endpoint "GET" "/api/v1/notifications" "$TOKEN" "" \
    "Get all notifications" "200"

test_endpoint "GET" "/api/v1/notifications?isRead=false" "$TOKEN" "" \
    "Get unread notifications" "200"

test_endpoint "GET" "/api/v1/notifications?limit=10&offset=0" "$TOKEN" "" \
    "Get notifications with pagination" "200"

test_endpoint "GET" "/api/v1/notifications/unread-count" "$TOKEN" "" \
    "Get unread notification count" "200"

test_endpoint "PATCH" "/api/v1/notifications" "$TOKEN" "" \
    "Mark all notifications as read" "200"

test_endpoint "DELETE" "/api/v1/notifications" "$TOKEN" "" \
    "Delete all read notifications" "200"

# Test with a specific notification ID (if any exist)
NOTIF_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/notifications?limit=1" \
    -H "Authorization: Bearer $TOKEN")
NOTIF_ID=$(echo $NOTIF_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$NOTIF_ID" ]; then
    echo "Testing with Notification ID: $NOTIF_ID"
    
    test_endpoint "PATCH" "/api/v1/notifications/$NOTIF_ID" "$TOKEN" "" \
        "Mark specific notification as read" "200"
    
    test_endpoint "DELETE" "/api/v1/notifications/$NOTIF_ID" "$TOKEN" "" \
        "Delete specific notification" "200"
fi

# ==========================================
# UPLOAD ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== UPLOAD ROUTES ===${NC}"

test_endpoint "GET" "/api/v1/upload/s3-url?fileName=test.jpg&fileType=image/jpeg" "$TOKEN" "" \
    "Get S3 presigned upload URL" "200"

test_endpoint "GET" "/api/v1/upload/s3-url?fileName=document.pdf&fileType=application/pdf&category=listings" "$TOKEN" "" \
    "Get S3 upload URL with category" "200"

test_endpoint "GET" "/api/v1/upload/s3-download-url?key=test/test.jpg" "$TOKEN" "" \
    "Get S3 download URL" "200"

test_endpoint "GET" "/api/v1/upload/application-proof-url" "" "" \
    "Get application proof upload URL (public)" "200"

if [ -n "$PUBLIC_ID" ]; then
    test_endpoint "POST" "/api/v1/upload/$PUBLIC_ID/submit" "" \
        "{\"fullName\":\"Test Applicant\",\"email\":\"test@example.com\"}" \
        "Submit application via upload endpoint" "200"
fi

test_endpoint "GET" "/api/v1/upload/s3-url" "$TOKEN" "" \
    "Get S3 URL without required params (should fail)" "400"

# ==========================================
# PAYMENT ROUTES TESTING
# ==========================================
echo -e "${YELLOW}=== PAYMENT ROUTES ===${NC}"

if [ -n "$TENANT_TOKEN" ]; then
    test_endpoint "GET" "/api/v1/payments/tenant" "$TENANT_TOKEN" "" \
        "Get tenant payments" "200"
    
    # Note: Payment proof upload requires multipart/form-data, not JSON
    echo "[TEST] POST /api/v1/payments/upload-proof/:paymentId"
    echo "  Note: Requires multipart/form-data file upload - skipping in script"
    echo ""
fi

# ==========================================
# API DOCUMENTATION
# ==========================================
echo -e "${YELLOW}=== API DOCUMENTATION ===${NC}"

test_endpoint "GET" "/api-docs" "" "" \
    "Access Swagger API documentation" "200"

# ==========================================
# CLEANUP & DELETE TESTS
# ==========================================
echo -e "${YELLOW}=== CLEANUP - DELETE OPERATIONS ===${NC}"

if [ -n "$MAINTENANCE_ID" ]; then
    test_endpoint "DELETE" "/api/v1/maintenance/$MAINTENANCE_ID" "$TOKEN" "" \
        "Delete maintenance request" "200"
fi

if [ -n "$APPLICATION_ID" ]; then
    test_endpoint "DELETE" "/api/v1/applications/$APPLICATION_ID" "$TOKEN" "" \
        "Delete application" "200"
fi

if [ -n "$LEASE_ID" ]; then
    test_endpoint "DELETE" "/api/v1/leases/$LEASE_ID" "$TOKEN" "" \
        "Delete lease" "200"
fi

if [ -n "$LISTING_ID" ]; then
    test_endpoint "DELETE" "/api/v1/listings/$LISTING_ID" "$TOKEN" "" \
        "Delete listing" "200"
fi

# ==========================================
# FINAL SUMMARY
# ==========================================
echo "=========================================="
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""
echo "Success Rate: $(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%"
echo ""
echo "Completed at: $(date)"
echo "=========================================="

# Exit with appropriate code
if [ $FAILED_TESTS -gt 0 ]; then
    exit 1
else
    exit 0
fi

