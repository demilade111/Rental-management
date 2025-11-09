#!/bin/bash

PORT=${1:-4000}
BASE_URL="http://localhost:$PORT"

echo "========================================="
echo "  Rental Management API Test Suite"
echo "  Testing on port: $PORT"
echo "========================================="
echo ""

success_count=0
fail_count=0

test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_code=$4
    local data=$5
    local token=$6
    
    echo -n "Testing: $description... "
    
    if [ -n "$token" ]; then
        auth_header="-H \"Authorization: Bearer $token\""
    else
        auth_header=""
    fi
    
    if [ -n "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            $auth_header \
            -d "$data")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" $auth_header)
    fi
    
    if [ "$response" = "$expected_code" ]; then
        echo "✅ PASS (HTTP $response)"
        ((success_count++))
    else
        echo "❌ FAIL (Expected: $expected_code, Got: $response)"
        ((fail_count++))
    fi
}

echo "1️⃣  HEALTH CHECK"
echo "-----------------------------------"
test_endpoint "GET" "/" "API root endpoint" "200"
echo ""

echo "2️⃣  AUTHENTICATION ENDPOINTS"
echo "-----------------------------------"
test_endpoint "POST" "/api/v1/auth/register" "Register without auth (should fail validation)" "400" '{"email":"test"}'
test_endpoint "POST" "/api/v1/auth/login" "Login without credentials (should fail)" "400"
echo ""

echo "3️⃣  INSURANCE ENDPOINTS (Without Auth)"
echo "-----------------------------------"
test_endpoint "GET" "/api/v1/insurance" "List insurance without token" "401"
test_endpoint "GET" "/api/v1/insurance/presign?fileName=test.pdf&fileType=application/pdf" "Get presigned URL without token" "401"
test_endpoint "POST" "/api/v1/insurance" "Create insurance without token" "401"
echo ""

echo "4️⃣  USER ENDPOINTS"
echo "-----------------------------------"
test_endpoint "GET" "/api/v1/user/profile" "Get profile without token" "401"
echo ""

echo "5️⃣  LISTING ENDPOINTS"
echo "-----------------------------------"
test_endpoint "GET" "/api/v1/listings" "Get listings without token" "401"
test_endpoint "POST" "/api/v1/listings" "Create listing without token" "401"
echo ""

echo "6️⃣  LEASE ENDPOINTS"
echo "-----------------------------------"
test_endpoint "GET" "/api/v1/leases" "Get leases without token" "401"
test_endpoint "POST" "/api/v1/leases" "Create lease without token" "401"
echo ""

echo "7️⃣  MAINTENANCE ENDPOINTS"
echo "-----------------------------------"
test_endpoint "GET" "/api/v1/maintenance" "Get maintenance requests without token" "401"
test_endpoint "POST" "/api/v1/maintenance" "Create maintenance without token" "401"
echo ""

echo "8️⃣  PAYMENT ENDPOINTS"
echo "-----------------------------------"
test_endpoint "GET" "/api/v1/payments/tenant" "Get tenant payments without token" "401"
echo ""

echo "9️⃣  NOTIFICATION ENDPOINTS"
echo "-----------------------------------"
test_endpoint "GET" "/api/v1/notifications" "Get notifications without token" "401"
echo ""

echo "🔟 UPLOAD ENDPOINTS"
echo "-----------------------------------"
test_endpoint "GET" "/api/v1/upload/s3-url?fileName=test.pdf&fileType=application/pdf" "Get S3 URL without token" "401"
echo ""

echo "========================================="
echo "  TEST SUMMARY"
echo "========================================="
echo "✅ Passed: $success_count"
echo "❌ Failed: $fail_count"
echo "📊 Total:  $((success_count + fail_count))"
echo ""

if [ $fail_count -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed"
    exit 1
fi

