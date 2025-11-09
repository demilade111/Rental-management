#!/bin/bash

# Auto-detect server port and run tests
# This script tries common ports and tests the one that works

echo "🔍 Auto-detecting server port..."

# Common ports to try
PORTS=(4000 3000 3001 3002 3003 3004 3005 3006 3007 3008 5000 8000 8080)

FOUND_PORT=""

for port in "${PORTS[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/" 2>/dev/null)
    if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "401" ]; then
        # Check if it responds with JSON (our API)
        content=$(curl -s "http://localhost:$port/" 2>/dev/null)
        if echo "$content" | grep -q "Rental Management\|API"; then
            FOUND_PORT=$port
            echo "✅ Found server on port $port"
            break
        fi
    fi
done

if [ -z "$FOUND_PORT" ]; then
    echo "❌ Could not find running server on common ports"
    echo ""
    echo "Please start your server first:"
    echo "  cd server"
    echo "  npm run dev"
    echo ""
    echo "Then check the terminal output to see which port it's using."
    echo "You can then run: ./quick_test.sh PORT_NUMBER"
    exit 1
fi

echo ""
echo "🚀 Running tests on port $FOUND_PORT..."
echo ""

./quick_test.sh $FOUND_PORT

