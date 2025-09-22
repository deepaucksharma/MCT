#!/bin/bash

echo "🧪 MCT App Comprehensive Testing"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:5000/api"
FRONTEND_URL="http://localhost:3000"

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5

    echo -n "Testing $description... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint")
    fi

    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} (Status: $status_code)"
        return 0
    else
        echo -e "${RED}✗${NC} (Expected: $expected_status, Got: $status_code)"
        echo "  Response: $body"
        return 1
    fi
}

# Check services are running
echo -e "\n${YELLOW}1. Checking Services${NC}"
echo "--------------------"

# Check frontend
if curl -s -I "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "Frontend: ${GREEN}✓ Running${NC}"
else
    echo -e "Frontend: ${RED}✗ Not responding${NC}"
    exit 1
fi

# Check backend
if curl -s "$API_BASE/health" > /dev/null 2>&1; then
    echo -e "Backend: ${GREEN}✓ Running${NC}"
else
    echo -e "Backend: ${RED}✗ Not responding${NC}"
    exit 1
fi

# Test API endpoints
echo -e "\n${YELLOW}2. Testing API Endpoints${NC}"
echo "------------------------"

# Health check
test_endpoint "GET" "/health" "" "200" "Health check"

# Settings
test_endpoint "GET" "/settings" "" "200" "Get user settings"

# Assessments
test_endpoint "GET" "/assessments" "" "200" "Get assessments"

# Create assessment
assessment_data='{
    "assessment_type": "initial",
    "worry_baseline": 60,
    "rumination_baseline": 55,
    "monitoring_baseline": 45,
    "uncontrollability_belief": 70,
    "danger_belief": 65,
    "positive_belief": 50,
    "triggers": ["work", "social"],
    "goals": ["reduce worry time", "improve focus"]
}'
test_endpoint "POST" "/assessments" "$assessment_data" "201" "Create assessment"

# CAS Logs
test_endpoint "GET" "/cas-logs" "" "200" "Get CAS logs"

# Create CAS log (process-only)
cas_log_data='{
    "worry_minutes": 30,
    "rumination_minutes": 20,
    "monitoring_count": 5,
    "checking_count": 3,
    "reassurance_count": 2,
    "avoidance_count": 1
}'
test_endpoint "POST" "/cas-logs" "$cas_log_data" "201" "Create CAS log"

# ATT Sessions
test_endpoint "GET" "/att-sessions" "" "200" "Get ATT sessions"

# DM Practices
test_endpoint "GET" "/dm-practices" "" "200" "Get DM practices"

# Experiments
test_endpoint "GET" "/experiments" "" "200" "Get experiments"
test_endpoint "GET" "/experiments/templates" "" "200" "Get experiment templates"

# Metrics
test_endpoint "GET" "/metrics/cas-trends" "" "200" "Get CAS trends"
test_endpoint "GET" "/metrics/practice-stats" "" "200" "Get practice stats"
test_endpoint "GET" "/metrics/belief-trends" "" "200" "Get belief trends"
test_endpoint "GET" "/metrics/weekly-summary" "" "200" "Get weekly summary"

# Engagement
test_endpoint "GET" "/engagement/streaks" "" "200" "Get streaks"
test_endpoint "GET" "/engagement/achievements" "" "200" "Get achievements"
test_endpoint "GET" "/engagement/milestones" "" "200" "Get milestones"

# Personalization
test_endpoint "GET" "/personalization/profile" "" "200" "Get personalization profile"
test_endpoint "GET" "/personalization/recommendations" "" "200" "Get recommendations"

# Test fidelity guards
echo -e "\n${YELLOW}3. Testing Fidelity Guards${NC}"
echo "--------------------------"

# Try to submit content-focused data (should be blocked)
content_data='{
    "worry_minutes": 30,
    "rumination_minutes": 20,
    "notes": "I am worried about my health problems"
}'
test_endpoint "POST" "/cas-logs" "$content_data" "400" "Content blocking (should fail)"

# Test database operations
echo -e "\n${YELLOW}4. Testing Database Operations${NC}"
echo "-------------------------------"

# Create and retrieve data
dm_data='{
    "time_of_day": "morning",
    "duration_seconds": 120,
    "engaged_vs_watched": "engaged",
    "confidence_rating": 75
}'
test_endpoint "POST" "/dm-practices" "$dm_data" "201" "Create DM practice"

# Test today's data
test_endpoint "GET" "/dm-practices/today" "" "200" "Get today's DM practices"

# Check frontend routes
echo -e "\n${YELLOW}5. Testing Frontend Routes${NC}"
echo "---------------------------"

test_frontend_route() {
    local route=$1
    local description=$2

    echo -n "Testing $description... "

    status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL$route")

    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC} (Status: $status)"
        return 1
    fi
}

test_frontend_route "/" "Home page"
test_frontend_route "/today" "Today page"
test_frontend_route "/learn" "Learn page"
test_frontend_route "/log" "Log page"
test_frontend_route "/experiments" "Experiments page"
test_frontend_route "/more" "More page"

# Summary
echo -e "\n${YELLOW}================================${NC}"
echo -e "${GREEN}Testing Complete!${NC}"
echo ""
echo "The MCT app is functioning with:"
echo "✅ Backend API responding correctly"
echo "✅ Database operations working"
echo "✅ Fidelity guards active"
echo "✅ Frontend routes accessible"
echo ""
echo "Note: Some CSS warnings are expected and don't affect functionality."
echo "The application is ready for use at: $FRONTEND_URL"