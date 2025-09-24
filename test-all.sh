#!/bin/bash

# Resource Monitor - Complete Test Suite Runner
# This script runs both Jest unit tests and Cypress E2E tests

set -e  # Exit on any error

echo "🧪 Running complete test suite for Resource Monitor"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to cleanup background processes
cleanup() {
    if [[ -n $DEV_SERVER_PID ]]; then
        echo -e "\n${YELLOW}Cleaning up dev server (PID: $DEV_SERVER_PID)...${NC}"
        kill $DEV_SERVER_PID 2>/dev/null || true
        wait $DEV_SERVER_PID 2>/dev/null || true
    fi
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Step 1: Run Jest unit tests (including RTL component tests)
echo -e "${YELLOW}Step 1: Running Jest unit tests + RTL component tests...${NC}"
npm test
echo -e "${GREEN}✅ Unit tests passed!${NC}\n"

# Step 2: Start dev server for E2E tests
echo -e "${YELLOW}Step 2: Starting dev server for E2E tests...${NC}"
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for dev server to start..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Dev server is ready!${NC}\n"
        break
    fi
    if [[ $i -eq 30 ]]; then
        echo -e "${RED}❌ Dev server failed to start after 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

# Step 3: Run Cypress E2E tests
echo -e "${YELLOW}Step 3: Running Cypress E2E tests...${NC}"
npm run test:e2e
echo -e "${GREEN}✅ E2E tests passed!${NC}\n"

# Success message
echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
echo "Test summary:"
echo "  ✅ Jest unit tests: PASSED"
echo "  ✅ React Testing Library component tests: PASSED"
echo "  ✅ Cypress E2E tests: PASSED"
echo ""
echo "Total test coverage includes:"
echo "  - Redux slice unit tests"
echo "  - Service layer unit tests"
echo "  - React component tests with RTL"
echo "  - End-to-end user workflow tests"