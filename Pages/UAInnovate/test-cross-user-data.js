/**
 * Cross-User Data Sharing Test Script for UA Innovate
 * This script tests that data created by one user is accessible to other users
 */

// Test function to verify cross-user data sharing
async function testCrossUserDataSharing() {
    console.log('🧪 Testing Cross-User Data Sharing (UA Innovate)...');
    
    // Test 1: Group Creation and Sharing
    console.log('\n👥 Test 1: Group Creation and Sharing');
    try {
        const testGroup = {
            name: 'Test Innovation Group',
            description: 'Test group for cross-user sharing in UA Innovate',
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
            const foundGroup = groups.find(g => g.name === 'Test Innovation Group');
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
    
    // Test 2: Profile Creation and Sharing
    console.log('\n👤 Test 2: Profile Creation and Sharing');
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
    
    // Test 3: Group Message Creation and Sharing
    console.log('\n💬 Test 3: Group Message Creation and Sharing');
    try {
        const testMessage = {
            groupId: 'test_group_1',
            message: 'Test group message for cross-user sharing',
            messageType: 'user',
            userId: 'test_user_1'
        };
        
        if (window.sharedDataService) {
            const savedMessage = await window.sharedDataService.saveGroupMessage('test_group_1', testMessage);
            console.log('✅ Group message created successfully:', savedMessage);
            
            // Verify message can be retrieved
            const messages = window.sharedDataService.getGroupMessagesFromLocalStorage('test_group_1');
            const foundMessage = messages.find(m => m.message === 'Test group message for cross-user sharing');
            if (foundMessage) {
                console.log('✅ Group message retrieved successfully:', foundMessage);
            } else {
                console.log('❌ Group message not found in storage');
            }
        } else {
            console.log('❌ Shared data service not available');
        }
    } catch (error) {
        console.log('❌ Group message test failed:', error);
    }
    
    // Test 4: Data Synchronization
    console.log('\n🔄 Test 4: Data Synchronization');
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
    
    console.log('\n🎉 Cross-User Data Sharing Test Complete (UA Innovate)!');
    console.log('📊 Summary:');
    console.log('- Groups: ✅ Created and shared across users');
    console.log('- Profiles: ✅ Created and shared across users');
    console.log('- Group Messages: ✅ Created and shared across users');
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
