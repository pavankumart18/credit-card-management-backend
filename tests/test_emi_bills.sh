#!/bin/bash

# EMI and Bills Test Execution Script
# This script provides easy execution of EMI and Bills tests with various options

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to show usage
show_usage() {
    echo "EMI and Bills Test Runner"
    echo "========================="
    echo ""
    echo "Usage: $0 [OPTIONS] [TEST_TYPE]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Run tests with verbose output"
    echo "  -c, --coverage Run tests with coverage report"
    echo "  -q, --quick    Run only main tests (skip edge cases)"
    echo "  -e, --edge     Run only edge case tests"
    echo "  -a, --all      Run all tests (default)"
    echo ""
    echo "TEST_TYPE:"
    echo "  emi_bills      Run main EMI and Bills tests"
    echo "  edge_cases     Run edge case tests"
    echo "  all            Run all tests (default)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 -v                 # Run all tests with verbose output"
    echo "  $0 -q                 # Run only main tests"
    echo "  $0 -e                 # Run only edge case tests"
    echo "  $0 -c emi_bills       # Run main tests with coverage"
    echo ""
}

# Default values
VERBOSE=false
COVERAGE=false
QUICK=false
EDGE_ONLY=false
TEST_TYPE="all"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -q|--quick)
            QUICK=true
            shift
            ;;
        -e|--edge)
            EDGE_ONLY=true
            shift
            ;;
        -a|--all)
            TEST_TYPE="all"
            shift
            ;;
        emi_bills|edge_cases|all)
            TEST_TYPE="$1"
            shift
            ;;
        *)
            print_color $RED "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if we're in the right directory
if [ ! -f "test_emi_bills.py" ] || [ ! -f "test_emi_bills_edge_cases.py" ]; then
    print_color $RED "Error: Test files not found. Please run this script from the tests directory."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_color $RED "Error: Python3 is not installed or not in PATH."
    exit 1
fi

# Check if required packages are installed
print_color $BLUE "Checking dependencies..."
python3 -c "import unittest, json, uuid, datetime, mongoengine, flask" 2>/dev/null || {
    print_color $RED "Error: Required Python packages are not installed."
    print_color $YELLOW "Please install requirements: pip install -r requirements.txt"
    exit 1
}

# Function to run tests
run_tests() {
    local test_file=$1
    local test_name=$2
    local extra_args=$3
    
    print_color $BLUE "Running $test_name..."
    echo "----------------------------------------"
    
    if [ "$VERBOSE" = true ]; then
        extra_args="$extra_args -v"
    fi
    
    if [ "$COVERAGE" = true ]; then
        if command -v coverage &> /dev/null; then
            coverage run -m unittest $test_file $extra_args
            echo ""
            print_color $BLUE "Coverage Report:"
            coverage report
            echo ""
            print_color $BLUE "Coverage HTML Report (if available):"
            coverage html 2>/dev/null || echo "HTML report not available"
        else
            print_color $YELLOW "Warning: coverage package not found. Running tests without coverage."
            python3 -m unittest $test_file $extra_args
        fi
    else
        python3 -m unittest $test_file $extra_args
    fi
    
    if [ $? -eq 0 ]; then
        print_color $GREEN "✓ $test_name completed successfully"
    else
        print_color $RED "✗ $test_name failed"
        return 1
    fi
    echo ""
}

# Function to run comprehensive test suite
run_comprehensive_tests() {
    print_color $BLUE "Running comprehensive test suite..."
    echo "========================================"
    
    if [ "$COVERAGE" = true ]; then
        if command -v coverage &> /dev/null; then
            coverage run run_emi_bills_tests.py
            echo ""
            print_color $BLUE "Coverage Report:"
            coverage report
            echo ""
            print_color $BLUE "Coverage HTML Report (if available):"
            coverage html 2>/dev/null || echo "HTML report not available"
        else
            print_color $YELLOW "Warning: coverage package not found. Running tests without coverage."
            python3 run_emi_bills_tests.py
        fi
    else
        python3 run_emi_bills_tests.py
    fi
    
    if [ $? -eq 0 ]; then
        print_color $GREEN "✓ Comprehensive test suite completed successfully"
    else
        print_color $RED "✗ Comprehensive test suite failed"
        return 1
    fi
}

# Main execution
print_color $BLUE "EMI and Bills Test Suite"
print_color $BLUE "========================="
echo ""

# Determine which tests to run
if [ "$QUICK" = true ]; then
    print_color $YELLOW "Running quick test suite (main tests only)..."
    run_tests "test_emi_bills.py" "Main EMI and Bills Tests" ""
elif [ "$EDGE_ONLY" = true ]; then
    print_color $YELLOW "Running edge case tests only..."
    run_tests "test_emi_bills_edge_cases.py" "Edge Case Tests" ""
elif [ "$TEST_TYPE" = "emi_bills" ]; then
    run_tests "test_emi_bills.py" "Main EMI and Bills Tests" ""
elif [ "$TEST_TYPE" = "edge_cases" ]; then
    run_tests "test_emi_bills_edge_cases.py" "Edge Case Tests" ""
elif [ "$TEST_TYPE" = "all" ]; then
    if [ -f "run_emi_bills_tests.py" ]; then
        run_comprehensive_tests
    else
        print_color $YELLOW "Comprehensive test runner not found. Running individual test files..."
        run_tests "test_emi_bills.py" "Main EMI and Bills Tests" ""
        run_tests "test_emi_bills_edge_cases.py" "Edge Case Tests" ""
    fi
else
    print_color $RED "Invalid test type: $TEST_TYPE"
    show_usage
    exit 1
fi

# Final summary
echo ""
print_color $GREEN "Test execution completed!"
print_color $BLUE "For detailed documentation, see README_EMI_BILLS_TESTS.md"
