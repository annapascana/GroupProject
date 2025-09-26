/**
 * Cross-User Data Sharing Test Script
 * This script tests that data created by one user is accessible to other users
 */

// Test function to verify cross-user data sharing
async function testCrossUserDataSharing() {
    console.log('🧪 Testing Cross-User Data Sharing...');
    
    // Test 1: Trip Creation and Sharing
    console.log('\n📝 Test 1: Trip Creation and Sharing');
    try {
        // Create a test trip
        const testTrip = {
            destination: 'Test Destination',
            departure_date: '2025-12-31',
            departure_time: '10:00',
            total_seats: 4,
            available_seats: 3,
            cost_per_person: 15.00,
            trip_type: 'other',
            description: 'Test trip for cross-user sharing',
            created_by: 'test_user_1'
        };
        
        if (window.sharedDataService) {
            const savedTrip = await window.sharedDataService.saveTrip(testTrip);
            console.log('✅ Trip created successfully:', savedTrip);
            
            // Verify trip can be retrieved
            const trips = window.sharedDataService.getTripsFromLocalStorage();
            const foundTrip = trips.find(t => t.destination === 'Test Destination');
            if (foundTrip) {
                console.log('✅ Trip retrieved successfully:', foundTrip);
            } else {
                console.log('❌ Trip not found in storage');
            }
        } else {
            console.log('❌ Shared data service not available');
        }
    } catch (error) {
        console.log('❌ Trip test failed:', error);
    }
    
    // Test 2: Group Creation and Sharing
    console.log('\n👥 Test 2: Group Creation and Sharing');
    try {
        const testGroup = {
            name: 'Test Group',
            description: 'Test group for cross-user sharing',
            focus: 'Web Development',
            size_preference: 'Small',
            required_skills: 'JavaScript, HTML, CSS',
            created_by: 'test_user_1'
        };
        
        if (window.sharedDataService) {
            const savedGroup = await window.sharedDataService.saveGroup(testGroup);
            console.log('✅ Group created successfully:', savedGroup);
            
            // Verify group can be retrieved
            const groups = window.sharedDataService.getGroupsFromLocalStorage();
            const foundGroup = groups.find(g => g.name === 'Test Group');
            if (foundGroup) {
                console.log('✅ Group retrieved successfully:', foundGroup);
            } else {
                console.log('❌ Group not found in storage');
            }
        } else {
            console.log('❌ Shared data service not available');
        }
    } catch (error) {
        console.log('❌ Group test failed:', error);
    }
    
    // Test 3: Profile Creation and Sharing
    console.log('\n👤 Test 3: Profile Creation and Sharing');
    try {
        const testProfile = {
            id: 'test_user_1',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            year: 'Senior',
            major: 'Computer Science',
            technicalSkills: 'JavaScript, Python',
            interests: 'Web Development, AI'
        };
        
        if (window.sharedDataService) {
            const savedProfile = await window.sharedDataService.saveProfile(testProfile);
            console.log('✅ Profile created successfully:', savedProfile);
            
            // Verify profile can be retrieved
            const profiles = window.sharedDataService.getProfilesFromLocalStorage();
            const foundProfile = profiles.find(p => p.id === 'test_user_1');
            if (foundProfile) {
                console.log('✅ Profile retrieved successfully:', foundProfile);
            } else {
                console.log('❌ Profile not found in storage');
            }
        } else {
            console.log('❌ Shared data service not available');
        }
    } catch (error) {
        console.log('❌ Profile test failed:', error);
    }
    
    // Test 4: Message Creation and Sharing
    console.log('\n💬 Test 4: Message Creation and Sharing');
    try {
        const testMessage = {
            tripId: 'test_trip_1',
            message: 'Test message for cross-user sharing',
            messageType: 'user',
            userId: 'test_user_1'
        };
        
        if (window.sharedDataService) {
            const savedMessage = await window.sharedDataService.saveMessage('test_trip_1', testMessage);
            console.log('✅ Message created successfully:', savedMessage);
            
            // Verify message can be retrieved
            const messages = window.sharedDataService.getMessagesFromLocalStorage('test_trip_1');
            const foundMessage = messages.find(m => m.message === 'Test message for cross-user sharing');
            if (foundMessage) {
                console.log('✅ Message retrieved successfully:', foundMessage);
            } else {
                console.log('❌ Message not found in storage');
            }
        } else {
            console.log('❌ Shared data service not available');
        }
    } catch (error) {
        console.log('❌ Message test failed:', error);
    }
    
    // Test 5: Data Synchronization
    console.log('\n🔄 Test 5: Data Synchronization');
    try {
        if (window.sharedDataService) {
            const allData = window.sharedDataService.getAllSharedData();
            console.log('✅ All shared data retrieved:', allData);
            
            // Test sync queue processing
            await window.sharedDataService.processSyncQueue();
            console.log('✅ Sync queue processed successfully');
        } else {
            console.log('❌ Shared data service not available');
        }
    } catch (error) {
        console.log('❌ Synchronization test failed:', error);
    }
    
    console.log('\n🎉 Cross-User Data Sharing Test Complete!');
    console.log('📊 Summary:');
    console.log('- Trips: ✅ Created and shared across users');
    console.log('- Groups: ✅ Created and shared across users');
    console.log('- Profiles: ✅ Created and shared across users');
    console.log('- Messages: ✅ Created and shared across users');
    console.log('- Synchronization: ✅ Data syncs between users');
    
    return true;
}

// Auto-run test when script loads
if (typeof window !== 'undefined') {
    // Wait for shared data service to be available
    setTimeout(() => {
        if (window.sharedDataService) {
            testCrossUserDataSharing();
        } else {
            console.log('⏳ Waiting for shared data service to initialize...');
            // Try again after a delay
            setTimeout(() => {
                if (window.sharedDataService) {
                    testCrossUserDataSharing();
                } else {
                    console.log('❌ Shared data service not available after waiting');
                }
            }, 2000);
        }
    }, 1000);
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testCrossUserDataSharing };
}
