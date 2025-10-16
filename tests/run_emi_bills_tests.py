#!/usr/bin/env python3
"""
Test runner for EMI and Bills functionality
This script runs all EMI and Bills related tests and provides detailed reporting
"""

import unittest
import sys
import os
import time
from io import StringIO

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from test_emi_bills import TestEMIAndBills
from test_emi_bills_edge_cases import TestEMIAndBillsEdgeCases

class TestResult(unittest.TextTestResult):
    """Custom test result class for better reporting"""
    
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.test_results = []
        self.start_time = time.time()
    
    def startTest(self, test):
        super().startTest(test)
        self.test_start_time = time.time()
    
    def addSuccess(self, test):
        super().addSuccess(test)
        duration = time.time() - self.test_start_time
        self.test_results.append({
            'test': str(test),
            'status': 'PASSED',
            'duration': duration
        })
    
    def addError(self, test, err):
        super().addError(test, err)
        duration = time.time() - self.test_start_time
        self.test_results.append({
            'test': str(test),
            'status': 'ERROR',
            'duration': duration,
            'error': str(err[1])
        })
    
    def addFailure(self, test, err):
        super().addFailure(test, err)
        duration = time.time() - self.test_start_time
        self.test_results.append({
            'test': str(test),
            'status': 'FAILED',
            'duration': duration,
            'error': str(err[1])
        })
    
    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        duration = time.time() - self.test_start_time
        self.test_results.append({
            'test': str(test),
            'status': 'SKIPPED',
            'duration': duration,
            'reason': reason
        })

def run_emi_bills_tests():
    """Run all EMI and Bills tests with detailed reporting"""
    
    print("=" * 80)
    print("EMI AND BILLS FUNCTIONALITY TEST SUITE")
    print("=" * 80)
    print()
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestEMIAndBills,
        TestEMIAndBillsEdgeCases
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    stream = StringIO()
    runner = unittest.TextTestRunner(
        stream=stream,
        verbosity=2,
        resultclass=TestResult
    )
    
    print("Running tests...")
    print("-" * 40)
    
    result = runner.run(test_suite)
    
    # Print detailed results
    print("\n" + "=" * 80)
    print("TEST EXECUTION SUMMARY")
    print("=" * 80)
    
    total_tests = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    skipped = len(result.skipped)
    passed = total_tests - failures - errors - skipped
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed}")
    print(f"Failed: {failures}")
    print(f"Errors: {errors}")
    print(f"Skipped: {skipped}")
    print(f"Success Rate: {(passed/total_tests)*100:.1f}%")
    
    # Print detailed test results
    if hasattr(result, 'test_results'):
        print("\n" + "=" * 80)
        print("DETAILED TEST RESULTS")
        print("=" * 80)
        
        for test_result in result.test_results:
            status_symbol = {
                'PASSED': '✓',
                'FAILED': '✗',
                'ERROR': '⚠',
                'SKIPPED': '⊘'
            }.get(test_result['status'], '?')
            
            print(f"{status_symbol} {test_result['test']} ({test_result['duration']:.3f}s)")
            
            if test_result['status'] in ['FAILED', 'ERROR']:
                print(f"   Error: {test_result.get('error', 'Unknown error')}")
            elif test_result['status'] == 'SKIPPED':
                print(f"   Reason: {test_result.get('reason', 'Unknown reason')}")
    
    # Print failures and errors
    if failures > 0 or errors > 0:
        print("\n" + "=" * 80)
        print("FAILURES AND ERRORS")
        print("=" * 80)
        
        for test, traceback in result.failures + result.errors:
            print(f"\nFAILED: {test}")
            print("-" * 40)
            print(traceback)
    
    # Print test coverage summary
    print("\n" + "=" * 80)
    print("TEST COVERAGE SUMMARY")
    print("=" * 80)
    
    coverage_areas = {
        'EMI Model Tests': [
            'EMI creation and validation',
            'EMI calculation logic',
            'Payment processing',
            'Status management',
            'Auto-pay functionality',
            'Progress tracking',
            'Serialization'
        ],
        'Bill Model Tests': [
            'Bill creation and validation',
            'Payment processing',
            'Overdue detection',
            'Auto-pay functionality',
            'Recurring bills',
            'Status management',
            'Serialization'
        ],
        'API Endpoint Tests': [
            'EMI CRUD operations',
            'Bill CRUD operations',
            'Payment processing APIs',
            'Calculator functionality',
            'Summary endpoints',
            'Filtering and pagination',
            'Error handling'
        ],
        'Edge Case Tests': [
            'Zero interest rates',
            'High interest rates',
            'Single month tenure',
            'Maximum tenure',
            'Overpayment scenarios',
            'Multiple payments',
            'Invalid data handling',
            'Boundary conditions'
        ]
    }
    
    for area, features in coverage_areas.items():
        print(f"\n{area}:")
        for feature in features:
            print(f"  • {feature}")
    
    # Print recommendations
    print("\n" + "=" * 80)
    print("RECOMMENDATIONS")
    print("=" * 80)
    
    if passed == total_tests:
        print("🎉 All tests passed! The EMI and Bills functionality is working correctly.")
        print("\nRecommendations:")
        print("• Consider adding performance tests for large datasets")
        print("• Add integration tests with external payment gateways")
        print("• Consider adding load testing for concurrent users")
    else:
        print("⚠️  Some tests failed. Please review the failures above.")
        print("\nRecommendations:")
        print("• Fix failing tests before deploying to production")
        print("• Review error messages for common patterns")
        print("• Consider adding more edge case tests for failed scenarios")
    
    print("\n" + "=" * 80)
    print("TEST EXECUTION COMPLETED")
    print("=" * 80)
    
    return result.wasSuccessful()

def run_specific_test_class(test_class_name):
    """Run tests for a specific test class"""
    
    test_classes = {
        'emi_bills': TestEMIAndBills,
        'edge_cases': TestEMIAndBillsEdgeCases
    }
    
    if test_class_name not in test_classes:
        print(f"Error: Unknown test class '{test_class_name}'")
        print(f"Available test classes: {', '.join(test_classes.keys())}")
        return False
    
    print(f"Running tests for {test_class_name}...")
    
    test_suite = unittest.TestSuite()
    tests = unittest.TestLoader().loadTestsFromTestCase(test_classes[test_class_name])
    test_suite.addTests(tests)
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result.wasSuccessful()

def main():
    """Main function to run tests"""
    
    if len(sys.argv) > 1:
        test_class = sys.argv[1]
        success = run_specific_test_class(test_class)
    else:
        success = run_emi_bills_tests()
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
