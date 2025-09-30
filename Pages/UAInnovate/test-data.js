// UA Innovate Test Data Generator
// This script populates localStorage with sample groups and profiles for testing

function generateTestData() {
    console.log('Generating test data for UA Innovate...');
    
    // Sample user profiles
    const testProfiles = [
        {
            user_id: 'user_001',
            name: 'Alex Johnson',
            email: 'alex.johnson@crimson.ua.edu',
            year: 'junior',
            major: 'Computer Science',
            technical_skills: 'Python, JavaScript, React, Node.js, SQL, Git',
            interests: 'Web Development, Machine Learning, Mobile Apps',
            created_at: new Date('2024-01-15').toISOString()
        },
        {
            user_id: 'user_002',
            name: 'Sarah Chen',
            email: 'sarah.chen@crimson.ua.edu',
            year: 'senior',
            major: 'Management Information Systems',
            mis_semester: '4',
            technical_skills: 'Java, Python, SQL, Tableau, Power BI, Excel',
            interests: 'Data Analytics, Business Intelligence, Project Management',
            created_at: new Date('2024-01-20').toISOString()
        },
        {
            user_id: 'user_003',
            name: 'Marcus Williams',
            email: 'marcus.williams@crimson.ua.edu',
            year: 'sophomore',
            major: 'Electrical Engineering',
            technical_skills: 'C++, MATLAB, Arduino, Python, Circuit Design',
            interests: 'IoT, Robotics, Embedded Systems, Renewable Energy',
            created_at: new Date('2024-02-01').toISOString()
        },
        {
            user_id: 'user_004',
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@crimson.ua.edu',
            year: 'graduate',
            major: 'Computer Science',
            technical_skills: 'Python, TensorFlow, PyTorch, R, Docker, AWS',
            interests: 'Artificial Intelligence, Deep Learning, Computer Vision',
            created_at: new Date('2024-02-10').toISOString()
        },
        {
            user_id: 'user_005',
            name: 'David Kim',
            email: 'david.kim@crimson.ua.edu',
            year: 'freshman',
            major: 'Management Information Systems',
            mis_semester: '1',
            technical_skills: 'HTML, CSS, JavaScript, Excel, PowerPoint',
            interests: 'Web Design, Database Management, Cybersecurity',
            created_at: new Date('2024-02-15').toISOString()
        },
        {
            user_id: 'user_006',
            name: 'Jessica Taylor',
            email: 'jessica.taylor@crimson.ua.edu',
            year: 'junior',
            major: 'Mechanical Engineering',
            technical_skills: 'SolidWorks, MATLAB, Python, AutoCAD, 3D Printing',
            interests: 'Product Design, Manufacturing, Sustainable Engineering',
            created_at: new Date('2024-02-20').toISOString()
        },
        {
            user_id: 'user_007',
            name: 'Ryan O\'Connor',
            email: 'ryan.oconnor@crimson.ua.edu',
            year: 'senior',
            major: 'Computer Science',
            technical_skills: 'Java, Spring Boot, React, PostgreSQL, Docker, Kubernetes',
            interests: 'Full-Stack Development, DevOps, Cloud Computing',
            created_at: new Date('2024-03-01').toISOString()
        },
        {
            user_id: 'user_008',
            name: 'Maya Patel',
            email: 'maya.patel@crimson.ua.edu',
            year: 'graduate',
            major: 'Management Information Systems',
            mis_semester: '5',
            technical_skills: 'Python, R, SQL, Tableau, Power BI, SAP, ERP Systems',
            interests: 'Business Analytics, Supply Chain Management, Digital Transformation',
            created_at: new Date('2024-03-05').toISOString()
        }
    ];

    // Sample groups
    const testGroups = [
        {
            group_id: 'group_001',
            name: 'Web Development Enthusiasts',
            description: 'A group for students interested in web development, sharing resources, and collaborating on projects.',
            category: 'Technology',
            max_members: 15,
            current_members: 8,
            created_by: 'user_001',
            created_at: new Date('2024-01-20').toISOString(),
            tags: ['web development', 'javascript', 'react', 'frontend', 'backend'],
            requirements: 'Basic knowledge of HTML, CSS, and JavaScript',
            meeting_schedule: 'Every Tuesday 6:00 PM - 7:30 PM',
            location: 'Computer Science Building, Room 205'
        },
        {
            group_id: 'group_002',
            name: 'Data Science & Analytics Club',
            description: 'Exploring data science, machine learning, and business analytics through hands-on projects and competitions.',
            category: 'Data Science',
            max_members: 20,
            current_members: 12,
            created_by: 'user_002',
            created_at: new Date('2024-01-25').toISOString(),
            tags: ['data science', 'python', 'machine learning', 'analytics', 'statistics'],
            requirements: 'Python or R programming experience preferred',
            meeting_schedule: 'Every Thursday 5:00 PM - 6:30 PM',
            location: 'Business School, Room 301'
        },
        {
            group_id: 'group_003',
            name: 'IoT & Robotics Innovation',
            description: 'Building smart devices, robots, and IoT solutions. Perfect for engineering students passionate about hardware and software integration.',
            category: 'Engineering',
            max_members: 12,
            current_members: 6,
            created_by: 'user_003',
            created_at: new Date('2024-02-05').toISOString(),
            tags: ['iot', 'robotics', 'arduino', 'embedded systems', 'engineering'],
            requirements: 'Basic programming knowledge (C++, Python, or Arduino)',
            meeting_schedule: 'Every Saturday 10:00 AM - 12:00 PM',
            location: 'Engineering Building, Lab 150'
        },
        {
            group_id: 'group_004',
            name: 'AI Research & Development',
            description: 'Advanced AI research group focusing on deep learning, computer vision, and natural language processing.',
            category: 'Research',
            max_members: 10,
            current_members: 7,
            created_by: 'user_004',
            created_at: new Date('2024-02-12').toISOString(),
            tags: ['artificial intelligence', 'deep learning', 'computer vision', 'nlp', 'research'],
            requirements: 'Strong programming skills and machine learning background',
            meeting_schedule: 'Every Monday 4:00 PM - 6:00 PM',
            location: 'Computer Science Building, Research Lab'
        },
        {
            group_id: 'group_005',
            name: 'MIS Student Network',
            description: 'Connecting MIS students across all semesters for mentorship, career guidance, and academic support.',
            category: 'Academic',
            max_members: 25,
            current_members: 18,
            created_by: 'user_002',
            created_at: new Date('2024-02-18').toISOString(),
            tags: ['mis', 'business', 'networking', 'mentorship', 'career'],
            requirements: 'Must be an MIS major or minor',
            meeting_schedule: 'Every Wednesday 6:00 PM - 7:00 PM',
            location: 'Business School, Conference Room A'
        },
        {
            group_id: 'group_006',
            name: 'Startup & Entrepreneurship Hub',
            description: 'For students interested in starting their own tech companies, learning about entrepreneurship, and networking with industry professionals.',
            category: 'Entrepreneurship',
            max_members: 30,
            current_members: 22,
            created_by: 'user_007',
            created_at: new Date('2024-03-03').toISOString(),
            tags: ['startup', 'entrepreneurship', 'business', 'innovation', 'networking'],
            requirements: 'Open to all majors with entrepreneurial interest',
            meeting_schedule: 'Every Friday 5:30 PM - 7:00 PM',
            location: 'Business School, Innovation Lab'
        },
        {
            group_id: 'group_007',
            name: 'Cybersecurity & Ethical Hacking',
            description: 'Learning cybersecurity fundamentals, ethical hacking techniques, and preparing for security certifications.',
            category: 'Security',
            max_members: 15,
            current_members: 9,
            created_by: 'user_005',
            created_at: new Date('2024-03-08').toISOString(),
            tags: ['cybersecurity', 'ethical hacking', 'security', 'penetration testing', 'certifications'],
            requirements: 'Basic networking and programming knowledge',
            meeting_schedule: 'Every Sunday 2:00 PM - 4:00 PM',
            location: 'Computer Science Building, Security Lab'
        },
        {
            group_id: 'group_008',
            name: 'Mobile App Development',
            description: 'Creating iOS and Android applications using modern frameworks and tools. Great for students interested in mobile technology.',
            category: 'Mobile Development',
            max_members: 18,
            current_members: 11,
            created_by: 'user_001',
            created_at: new Date('2024-03-12').toISOString(),
            tags: ['mobile development', 'ios', 'android', 'react native', 'flutter'],
            requirements: 'JavaScript or Swift/Java experience helpful',
            meeting_schedule: 'Every Tuesday 7:00 PM - 8:30 PM',
            location: 'Computer Science Building, Room 180'
        }
    ];

    // Store test data in localStorage
    localStorage.setItem('allProfiles', JSON.stringify(testProfiles));
    localStorage.setItem('allGroups', JSON.stringify(testGroups));
    
    console.log('Test data generated successfully!');
    console.log(`Created ${testProfiles.length} user profiles`);
    console.log(`Created ${testGroups.length} groups`);
    
    return {
        profiles: testProfiles,
        groups: testGroups
    };
}

// Function to clear all test data
function clearTestData() {
    console.log('Clearing all test data...');
    
    // Clear all UA Innovate related data
    localStorage.removeItem('allProfiles');
    localStorage.removeItem('allGroups');
    localStorage.removeItem('myGroups');
    localStorage.removeItem('uaInnovateUserId');
    localStorage.removeItem('uaInnovateProfile');
    localStorage.removeItem('currentGroupId');
    
    console.log('Test data cleared successfully!');
}

// Function to clear user session only (keeps test data but forces fresh profile)
function clearUserSession() {
    console.log('Clearing user session for fresh start...');
    
    // Clear only user-specific data, keep test data
    localStorage.removeItem('uaInnovateUserId');
    localStorage.removeItem('uaInnovateProfile');
    localStorage.removeItem('myGroups');
    localStorage.removeItem('currentGroupId');
    
    console.log('User session cleared - user will need to create a new profile');
}

// Function to add a specific user to groups (for testing group membership)
function addUserToGroups(userId, groupIds) {
    const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
    const myGroups = [];
    
    groupIds.forEach(groupId => {
        const group = allGroups.find(g => g.group_id === groupId);
        if (group) {
            myGroups.push(group);
        }
    });
    
    localStorage.setItem('myGroups', JSON.stringify(myGroups));
    console.log(`Added user ${userId} to ${myGroups.length} groups`);
}

// Function to set up a test user session
function setupTestUser(userId = 'user_001') {
    const allProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]');
    const userProfile = allProfiles.find(p => p.user_id === userId);
    
    if (userProfile) {
        localStorage.setItem('uaInnovateUserId', userId);
        localStorage.setItem('uaInnovateProfile', JSON.stringify(userProfile));
        console.log(`Test user session set up for: ${userProfile.name}`);
        return userProfile;
    } else {
        console.error(`User with ID ${userId} not found in test data`);
        return null;
    }
}

// Auto-generate test data when script loads (uncomment to enable)
// generateTestData();

// Export functions for use in console or other scripts
window.generateTestData = generateTestData;
window.clearTestData = clearTestData;
window.clearUserSession = clearUserSession;
window.addUserToGroups = addUserToGroups;
window.setupTestUser = setupTestUser;
