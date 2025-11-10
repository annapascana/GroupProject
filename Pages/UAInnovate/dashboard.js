// UA Innovate Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const profileSummary = document.getElementById('profileSummary');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const homeBtn = document.getElementById('homeBtn');
    const createGroupBtn = document.getElementById('createGroupBtn');
    const searchGroupsBtn = document.getElementById('searchGroupsBtn');
    const searchProfilesBtn = document.getElementById('searchProfilesBtn');
    const createGroupModal = document.getElementById('createGroupModal');
    const searchGroupsModal = document.getElementById('searchGroupsModal');
    const searchProfilesModal = document.getElementById('searchProfilesModal');
    const editProfileModal = document.getElementById('editProfileModal');
    const createGroupForm = document.getElementById('createGroupForm');
    const searchGroupsForm = document.getElementById('searchGroupsForm');
    const searchProfilesForm = document.getElementById('searchProfilesForm');
    const editProfileForm = document.getElementById('editProfileForm');
    const myGroupsList = document.getElementById('myGroupsList');
    const availableGroupsList = document.getElementById('availableGroupsList');

    // Modal close buttons
    const closeCreateModal = document.getElementById('closeCreateModal');
    const closeSearchModal = document.getElementById('closeSearchModal');
    const closeSearchProfilesModal = document.getElementById('closeSearchProfilesModal');
    const closeEditProfileModal = document.getElementById('closeEditProfileModal');
    const cancelCreateGroup = document.getElementById('cancelCreateGroup');
    const cancelSearch = document.getElementById('cancelSearch');
    const cancelSearchProfiles = document.getElementById('cancelSearchProfiles');
    const cancelEditProfile = document.getElementById('cancelEditProfile');
    
    // Chat modal elements
    const groupChatModal = document.getElementById('groupChatModal');
    const chatGroupName = document.getElementById('chatGroupName');
    const chatMessages = document.getElementById('chatMessages');
    const chatMessageInput = document.getElementById('chatMessageInput');
    const sendChatMessage = document.getElementById('sendChatMessage');
    const closeChatModal = document.getElementById('closeChatModal');
    
    let currentChatGroupId = null;

    // Check if user has a profile
    function checkUserProfile() {
        // Check localStorage for profile
        const existingProfile = localStorage.getItem('uaInnovateProfile');
        const existingUserId = localStorage.getItem('uaInnovateUserId');
        
        if (existingProfile && existingUserId) {
            try {
                JSON.parse(existingProfile);
                return true;
            } catch (error) {
                console.error('Error parsing existing profile:', error);
                // Clear corrupted data
                localStorage.removeItem('uaInnovateProfile');
                localStorage.removeItem('uaInnovateUserId');
                return false;
            }
        }
        
        // Check shared data service for profile
        if (window.sharedDataService) {
            const profiles = window.sharedDataService.getProfilesFromLocalStorage();
            const sharedProfile = profiles.find(p => p.userId === userId);
            if (sharedProfile) {
                // Load profile from shared data service to localStorage
                localStorage.setItem('uaInnovateUserId', sharedProfile.userId);
                localStorage.setItem('uaInnovateProfile', JSON.stringify(sharedProfile));
                console.log('Profile loaded from shared data service');
                return true;
            }
        }
        
        return false;
    }

    // Load user profile and initialize dashboard
    async function initializeDashboard() {
        // Check if user has a profile - redirect to profile creation if not
        if (!checkUserProfile()) {
            console.log('No profile found, redirecting to profile creation...');
            window.location.href = './innovate.html';
            return;
        }
        
        const profile = await loadUserProfile();
        displayProfileSummary(profile);
        
        // Initialize user's groups array if it doesn't exist
        if (!localStorage.getItem('myGroups')) {
            localStorage.setItem('myGroups', JSON.stringify([]));
        }
        
        // Initialize test data if not already present
        initializeTestData();
        
        // Clean up any groups with more than 4 members
        cleanupInvalidGroups();
        
        // Ensure demo groups are always available
        ensureDemoGroups();
        
        await loadMyGroups();
        await loadAvailableGroups();
    }

    // Clean up groups that have more than 4 members
    function cleanupInvalidGroups() {
        try {
            const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
            const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
            
            // Filter out groups with more than 4 members
            const validGroups = allGroups.filter(group => {
                const memberCount = group.current_members || 0;
                return memberCount <= 4;
            });
            
            // Also remove invalid groups from myGroups
            const validMyGroups = myGroups.filter(group => {
                const memberCount = group.current_members || 0;
                return memberCount <= 4;
            });
            
            // Check if any groups were removed
            if (allGroups.length !== validGroups.length) {
                const removedCount = allGroups.length - validGroups.length;
                console.log(`Removed ${removedCount} group(s) with more than 4 members`);
                
                // Update localStorage
                localStorage.setItem('allGroups', JSON.stringify(validGroups));
                localStorage.setItem('myGroups', JSON.stringify(validMyGroups));
            }
        } catch (error) {
            console.warn('Error cleaning up invalid groups:', error);
        }
    }

    // Ensure demo groups are always available for demo purposes
    function ensureDemoGroups() {
        try {
            const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
            const existingGroupIds = allGroups.map(g => g.group_id);
            
            // Define demo groups with varying member counts (1-4)
            const demoGroups = [
                {
                    group_id: 'demo_group_001',
                    name: 'AI Innovation Lab',
                    description: 'Exploring cutting-edge AI technologies and building innovative machine learning solutions. Perfect for students interested in artificial intelligence and data science.',
                    focus: 'data-analytics',
                    size_preference: '4 members',
                    required_skills: 'Python, Machine Learning basics, Data Analysis',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-01-15').toISOString()
                },
                {
                    group_id: 'demo_group_002',
                    name: 'Full Stack Developers',
                    description: 'Building modern web applications using React, Node.js, and cloud technologies. Join us to create real-world projects and enhance your portfolio.',
                    focus: 'full-stack-development',
                    size_preference: '3-4 members',
                    required_skills: 'JavaScript, React or Node.js experience',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-01-20').toISOString()
                },
                {
                    group_id: 'demo_group_003',
                    name: 'FinTech Pioneers',
                    description: 'Developing innovative financial technology solutions. Explore blockchain, payment systems, and digital banking technologies.',
                    focus: 'fintech',
                    size_preference: '2-3 members',
                    required_skills: 'Programming skills, Interest in finance/blockchain',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-02-01').toISOString()
                },
                {
                    group_id: 'demo_group_004',
                    name: 'Cybersecurity Squad',
                    description: 'Learning and implementing security best practices. Work on security projects, ethical hacking, and secure coding practices.',
                    focus: 'cybersecurity',
                    size_preference: '3-4 members',
                    required_skills: 'Networking basics, Programming, Security interest',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-02-10').toISOString()
                },
                {
                    group_id: 'demo_group_005',
                    name: 'Web Development Warriors',
                    description: 'Mastering modern web development technologies including React, Node.js, and full-stack development. Build portfolio projects together.',
                    focus: 'full-stack-development',
                    size_preference: '4 members',
                    required_skills: 'HTML, CSS, JavaScript basics',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-02-25').toISOString()
                },
                {
                    group_id: 'demo_group_006',
                    name: 'Blockchain Builders',
                    description: 'Exploring blockchain technology, cryptocurrency, and decentralized applications. Learn smart contracts and DeFi development.',
                    focus: 'fintech',
                    size_preference: '4 members',
                    required_skills: 'Programming, Interest in blockchain/crypto',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-03-05').toISOString()
                },
                {
                    group_id: 'demo_group_007',
                    name: 'Prototype Builders',
                    description: 'Rapid prototyping and MVP development. Learn to quickly build and test innovative product ideas using modern development tools.',
                    focus: 'prototype-innovation',
                    size_preference: '4 members',
                    required_skills: 'Basic programming, Design thinking',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-02-05').toISOString()
                },
                {
                    group_id: 'demo_group_008',
                    name: 'Mobile App Innovators',
                    description: 'Creating innovative mobile applications for iOS and Android. Learn cross-platform development and native app design.',
                    focus: 'prototype-innovation',
                    size_preference: '2-3 members',
                    required_skills: 'JavaScript or Swift/Java, Mobile development interest',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-02-20').toISOString()
                },
                {
                    group_id: 'demo_group_009',
                    name: 'Community Tech Solutions',
                    description: 'Building technology solutions for local community needs. Work on projects that help nonprofits and community organizations.',
                    focus: 'social-innovation',
                    size_preference: '3-4 members',
                    required_skills: 'Programming skills, Community engagement interest',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-03-01').toISOString()
                },
                {
                    group_id: 'demo_group_010',
                    name: 'Security Guardians',
                    description: 'Advanced cybersecurity and ethical hacking. Prepare for security certifications and work on real-world security challenges.',
                    focus: 'cybersecurity',
                    size_preference: '4 members',
                    required_skills: 'Networking, Programming, Security fundamentals',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-03-10').toISOString()
                },
                {
                    group_id: 'demo_group_011',
                    name: 'Social Impact Innovators',
                    description: 'Creating technology solutions that address real-world social challenges. We focus on projects that make a positive difference in our community.',
                    focus: 'social-innovation',
                    size_preference: '4 members',
                    required_skills: 'Any programming language, Passion for social good',
                    current_members: 3,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-01-25').toISOString()
                },
                {
                    group_id: 'demo_group_012',
                    name: 'Data Analytics Team',
                    description: 'Transforming data into insights. Work with real datasets, build dashboards, and create data-driven solutions for business problems.',
                    focus: 'data-analytics',
                    size_preference: '4 members',
                    required_skills: 'Python or R, SQL, Statistics basics',
                    current_members: 3,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-02-15').toISOString()
                },
                {
                    group_id: 'demo_group_013',
                    name: 'IoT Innovators',
                    description: 'Building Internet of Things solutions and smart devices. Work with sensors, microcontrollers, and connected systems.',
                    focus: 'prototype-innovation',
                    size_preference: '4 members',
                    required_skills: 'Electronics basics, Programming, Hardware interest',
                    current_members: 3,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-03-18').toISOString()
                },
                {
                    group_id: 'demo_group_014',
                    name: 'Game Development Studio',
                    description: 'Creating interactive games and learning game development engines. Build fun projects and learn game design principles.',
                    focus: 'prototype-innovation',
                    size_preference: '4 members',
                    required_skills: 'Programming, Game design interest',
                    current_members: 3,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-03-20').toISOString()
                },
                {
                    group_id: 'demo_group_015',
                    name: 'Machine Learning Masters',
                    description: 'Advanced machine learning and deep learning projects. Work on neural networks, computer vision, and NLP applications.',
                    focus: 'data-analytics',
                    size_preference: '4 members',
                    required_skills: 'Python, TensorFlow/PyTorch, ML experience',
                    current_members: 4,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-01-10').toISOString()
                },
                {
                    group_id: 'demo_group_016',
                    name: 'E-Commerce Solutions',
                    description: 'Building e-commerce platforms and payment systems. Learn about online business, digital payments, and marketplace development.',
                    focus: 'fintech',
                    size_preference: '4 members',
                    required_skills: 'Web development, Business interest',
                    current_members: 4,
                    max_members: 4,
                    created_by: 'demo_user',
                    created_at: new Date('2024-02-08').toISOString()
                }
            ];
            
            // Add demo groups that don't already exist
            let addedCount = 0;
            demoGroups.forEach(demoGroup => {
                if (!existingGroupIds.includes(demoGroup.group_id)) {
                    allGroups.push(demoGroup);
                    addedCount++;
                }
            });
            
            if (addedCount > 0) {
                localStorage.setItem('allGroups', JSON.stringify(allGroups));
                console.log(`Added ${addedCount} demo groups for your demo tomorrow! Total groups: ${allGroups.length}`);
            } else {
                console.log(`All ${demoGroups.length} demo groups are ready for your demo!`);
            }
        } catch (error) {
            console.warn('Error ensuring demo groups:', error);
        }
    }

    // Initialize test data if not already present
    function initializeTestData() {
        // Check if test data already exists
        const existingGroups = localStorage.getItem('allGroups');
        const existingProfiles = localStorage.getItem('allProfiles');
        
        // Always ensure groups exist for the "Groups" section
        let shouldInitializeGroups = false;
        if (!existingGroups) {
            shouldInitializeGroups = true;
        } else {
            try {
                const groups = JSON.parse(existingGroups);
                if (!Array.isArray(groups) || groups.length === 0) {
                    shouldInitializeGroups = true;
                }
            } catch (e) {
                shouldInitializeGroups = true;
            }
        }
        
        if (shouldInitializeGroups || !existingProfiles) {
            console.log('Initializing test data for UA Innovate...');
            
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

            // Sample groups with diverse focus areas and varying member counts (1-4 members)
            const testGroups = [
                // Groups with 1 member
                {
                    group_id: 'group_001',
                    name: 'AI Innovation Lab',
                    description: 'Exploring cutting-edge AI technologies and building innovative machine learning solutions. Perfect for students interested in artificial intelligence and data science.',
                    focus: 'data-analytics',
                    size_preference: '4 members',
                    required_skills: 'Python, Machine Learning basics, Data Analysis',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'user_001',
                    created_at: new Date('2024-01-15').toISOString()
                },
                {
                    group_id: 'group_002',
                    name: 'Full Stack Developers',
                    description: 'Building modern web applications using React, Node.js, and cloud technologies. Join us to create real-world projects and enhance your portfolio.',
                    focus: 'full-stack-development',
                    size_preference: '3-4 members',
                    required_skills: 'JavaScript, React or Node.js experience',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'user_002',
                    created_at: new Date('2024-01-20').toISOString()
                },
                {
                    group_id: 'group_003',
                    name: 'FinTech Pioneers',
                    description: 'Developing innovative financial technology solutions. Explore blockchain, payment systems, and digital banking technologies.',
                    focus: 'fintech',
                    size_preference: '2-3 members',
                    required_skills: 'Programming skills, Interest in finance/blockchain',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'user_004',
                    created_at: new Date('2024-02-01').toISOString()
                },
                {
                    group_id: 'group_004',
                    name: 'Cybersecurity Squad',
                    description: 'Learning and implementing security best practices. Work on security projects, ethical hacking, and secure coding practices.',
                    focus: 'cybersecurity',
                    size_preference: '3-4 members',
                    required_skills: 'Networking basics, Programming, Security interest',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'user_006',
                    created_at: new Date('2024-02-10').toISOString()
                },
                {
                    group_id: 'group_005',
                    name: 'Web Development Warriors',
                    description: 'Mastering modern web development technologies including React, Node.js, and full-stack development. Build portfolio projects together.',
                    focus: 'full-stack-development',
                    size_preference: '4 members',
                    required_skills: 'HTML, CSS, JavaScript basics',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'user_001',
                    created_at: new Date('2024-02-25').toISOString()
                },
                {
                    group_id: 'group_006',
                    name: 'Blockchain Builders',
                    description: 'Exploring blockchain technology, cryptocurrency, and decentralized applications. Learn smart contracts and DeFi development.',
                    focus: 'fintech',
                    size_preference: '4 members',
                    required_skills: 'Programming, Interest in blockchain/crypto',
                    current_members: 1,
                    max_members: 4,
                    created_by: 'user_003',
                    created_at: new Date('2024-03-05').toISOString()
                },
                // Groups with 2 members
                {
                    group_id: 'group_007',
                    name: 'Prototype Builders',
                    description: 'Rapid prototyping and MVP development. Learn to quickly build and test innovative product ideas using modern development tools.',
                    focus: 'prototype-innovation',
                    size_preference: '4 members',
                    required_skills: 'Basic programming, Design thinking',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'user_005',
                    created_at: new Date('2024-02-05').toISOString()
                },
                {
                    group_id: 'group_008',
                    name: 'Mobile App Innovators',
                    description: 'Creating innovative mobile applications for iOS and Android. Learn cross-platform development and native app design.',
                    focus: 'prototype-innovation',
                    size_preference: '2-3 members',
                    required_skills: 'JavaScript or Swift/Java, Mobile development interest',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'user_008',
                    created_at: new Date('2024-02-20').toISOString()
                },
                {
                    group_id: 'group_009',
                    name: 'Community Tech Solutions',
                    description: 'Building technology solutions for local community needs. Work on projects that help nonprofits and community organizations.',
                    focus: 'social-innovation',
                    size_preference: '3-4 members',
                    required_skills: 'Programming skills, Community engagement interest',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'user_002',
                    created_at: new Date('2024-03-01').toISOString()
                },
                {
                    group_id: 'group_010',
                    name: 'Security Guardians',
                    description: 'Advanced cybersecurity and ethical hacking. Prepare for security certifications and work on real-world security challenges.',
                    focus: 'cybersecurity',
                    size_preference: '4 members',
                    required_skills: 'Networking, Programming, Security fundamentals',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'user_004',
                    created_at: new Date('2024-03-10').toISOString()
                },
                {
                    group_id: 'group_011',
                    name: 'Cloud Computing Experts',
                    description: 'Mastering cloud platforms like AWS, Azure, and Google Cloud. Build scalable applications and learn DevOps practices.',
                    focus: 'full-stack-development',
                    size_preference: '4 members',
                    required_skills: 'Basic cloud knowledge, Programming experience',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'user_007',
                    created_at: new Date('2024-03-12').toISOString()
                },
                {
                    group_id: 'group_012',
                    name: 'Digital Health Innovators',
                    description: 'Creating technology solutions for healthcare and wellness. Explore telemedicine, health apps, and medical data analysis.',
                    focus: 'social-innovation',
                    size_preference: '4 members',
                    required_skills: 'Programming, Interest in healthcare technology',
                    current_members: 2,
                    max_members: 4,
                    created_by: 'user_005',
                    created_at: new Date('2024-03-15').toISOString()
                },
                // Groups with 3 members
                {
                    group_id: 'group_013',
                    name: 'Social Impact Innovators',
                    description: 'Creating technology solutions that address real-world social challenges. We focus on projects that make a positive difference in our community.',
                    focus: 'social-innovation',
                    size_preference: '4 members',
                    required_skills: 'Any programming language, Passion for social good',
                    current_members: 3,
                    max_members: 4,
                    created_by: 'user_003',
                    created_at: new Date('2024-01-25').toISOString()
                },
                {
                    group_id: 'group_014',
                    name: 'Data Analytics Team',
                    description: 'Transforming data into insights. Work with real datasets, build dashboards, and create data-driven solutions for business problems.',
                    focus: 'data-analytics',
                    size_preference: '4 members',
                    required_skills: 'Python or R, SQL, Statistics basics',
                    current_members: 3,
                    max_members: 4,
                    created_by: 'user_007',
                    created_at: new Date('2024-02-15').toISOString()
                },
                {
                    group_id: 'group_015',
                    name: 'IoT Innovators',
                    description: 'Building Internet of Things solutions and smart devices. Work with sensors, microcontrollers, and connected systems.',
                    focus: 'prototype-innovation',
                    size_preference: '4 members',
                    required_skills: 'Electronics basics, Programming, Hardware interest',
                    current_members: 3,
                    max_members: 4,
                    created_by: 'user_003',
                    created_at: new Date('2024-03-18').toISOString()
                },
                {
                    group_id: 'group_016',
                    name: 'Game Development Studio',
                    description: 'Creating interactive games and learning game development engines. Build fun projects and learn game design principles.',
                    focus: 'prototype-innovation',
                    size_preference: '4 members',
                    required_skills: 'Programming, Game design interest',
                    current_members: 3,
                    max_members: 4,
                    created_by: 'user_006',
                    created_at: new Date('2024-03-20').toISOString()
                },
                // Groups with 4 members (full)
                {
                    group_id: 'group_017',
                    name: 'Machine Learning Masters',
                    description: 'Advanced machine learning and deep learning projects. Work on neural networks, computer vision, and NLP applications.',
                    focus: 'data-analytics',
                    size_preference: '4 members',
                    required_skills: 'Python, TensorFlow/PyTorch, ML experience',
                    current_members: 4,
                    max_members: 4,
                    created_by: 'user_004',
                    created_at: new Date('2024-01-10').toISOString()
                },
                {
                    group_id: 'group_018',
                    name: 'E-Commerce Solutions',
                    description: 'Building e-commerce platforms and payment systems. Learn about online business, digital payments, and marketplace development.',
                    focus: 'fintech',
                    size_preference: '4 members',
                    required_skills: 'Web development, Business interest',
                    current_members: 4,
                    max_members: 4,
                    created_by: 'user_002',
                    created_at: new Date('2024-02-08').toISOString()
                },
                {
                    group_id: 'group_019',
                    name: 'Open Source Contributors',
                    description: 'Contributing to open source projects and building community-driven software. Learn collaboration and version control best practices.',
                    focus: 'full-stack-development',
                    size_preference: '4 members',
                    required_skills: 'Git, Programming, Open source interest',
                    current_members: 4,
                    max_members: 4,
                    created_by: 'user_001',
                    created_at: new Date('2024-02-12').toISOString()
                },
                {
                    group_id: 'group_020',
                    name: 'Sustainable Tech Solutions',
                    description: 'Developing technology for environmental sustainability. Work on green tech, renewable energy systems, and eco-friendly applications.',
                    focus: 'social-innovation',
                    size_preference: '4 members',
                    required_skills: 'Programming, Environmental interest',
                    current_members: 4,
                    max_members: 4,
                    created_by: 'user_008',
                    created_at: new Date('2024-03-22').toISOString()
                }
            ];

            // Store test data in localStorage
            if (!existingProfiles) {
                localStorage.setItem('allProfiles', JSON.stringify(testProfiles));
            }
            if (shouldInitializeGroups) {
                localStorage.setItem('allGroups', JSON.stringify(testGroups));
                console.log(`Initialized ${testGroups.length} groups for browsing`);
            }
            
            // Add some sample groups to "My Groups" for demo purposes (if user has no groups)
            const existingMyGroups = localStorage.getItem('myGroups');
            let myGroups = [];
            try {
                myGroups = existingMyGroups ? JSON.parse(existingMyGroups) : [];
            } catch (e) {
                myGroups = [];
            }
            
            if (myGroups.length === 0) {
                // Get all groups (either newly created or existing)
                let allGroups = [];
                try {
                    const allGroupsStr = localStorage.getItem('allGroups');
                    allGroups = allGroupsStr ? JSON.parse(allGroupsStr) : [];
                } catch (e) {
                    allGroups = testGroups; // Fallback to test groups if parsing fails
                }
                
                // Select a few diverse groups to show in the user's groups section
                if (allGroups.length >= 3) {
                    const demoMyGroups = [
                        allGroups[0], // AI Innovation Lab
                        allGroups[1], // Full Stack Developers
                        allGroups[2]  // Social Impact Innovators
                    ];
                    localStorage.setItem('myGroups', JSON.stringify(demoMyGroups));
                    console.log('Added demo groups to My Groups section');
                }
            }
            
            console.log('Test data initialized successfully!');
        }
    }

    // Load user profile from localStorage
    async function loadUserProfile() {
        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) {
            window.location.href = 'innovate.html';
            return null;
        }

            const profileData = localStorage.getItem('uaInnovateProfile');
            if (profileData) {
                return JSON.parse(profileData);
            } else {
                window.location.href = 'innovate.html';
                return null;
        }
    }

    // Display profile summary
    function displayProfileSummary(profile) {
        if (!profile) {
            profileSummary.innerHTML = '<div class="profile-placeholder">No profile found. Click "Edit Profile" to create your profile.</div>';
            profileSummary.classList.add('show');
            return;
        }

        // Display detailed profile information similar to home page
        const isMIS = profile.major.toLowerCase().includes('mis') || 
                     profile.major.toLowerCase().includes('management information systems') ||
                     profile.major.toLowerCase().includes('information systems');

        let profileHTML = `
            <div class="profile-detail-item">
                <span class="profile-detail-label">Academic Year</span>
                <span class="profile-detail-value">${profile.year.charAt(0).toUpperCase() + profile.year.slice(1)}</span>
            </div>
            <div class="profile-detail-item">
                <span class="profile-detail-label">Major</span>
                <span class="profile-detail-value">${profile.major}</span>
            </div>
        `;

        if (isMIS && profile.misSemester) {
            profileHTML += `
                <div class="profile-detail-item">
                    <span class="profile-detail-label">MIS Program Semester</span>
                    <span class="profile-detail-value">Semester ${profile.misSemester}</span>
                </div>
            `;
        }

        profileHTML += `
            <div class="profile-detail-item">
                <span class="profile-detail-label">Technical Skills</span>
                <span class="profile-detail-value">${formatTechnicalSkills(profile.technicalSkills)}</span>
            </div>
        `;

        if (profile.interests && profile.interests.trim()) {
            profileHTML += `
                <div class="profile-detail-item">
                    <span class="profile-detail-label">Innovation Interests</span>
                    <span class="profile-detail-value">${profile.interests}</span>
                </div>
            `;
        }

        profileSummary.innerHTML = profileHTML;
        profileSummary.classList.add('show');
    }

    // Format technical skills
    function formatTechnicalSkills(skills) {
        if (!skills || !skills.trim()) return 'None specified';
        
        const skillsArray = skills.split(/[,\n]/)
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        
        return skillsArray.length > 0 ? skillsArray.join(', ') : 'None specified';
    }

    // Get focus area display name
    function getFocusAreaName(focus) {
        const focusAreas = {
            'social-innovation': 'Social Innovation',
            'data-analytics': 'Data Analytics',
            'fintech': 'FinTech',
            'prototype-innovation': 'Prototype Innovation',
            'full-stack-development': 'Full Stack Development',
            'cybersecurity': 'Cybersecurity'
        };
        return focusAreas[focus] || 'General';
    }

    // Enhanced group membership tracking
    function trackGroupMembership(groupId, userId, action = 'join') {
        const membershipKey = `groupMemberships_${userId}`;
        const memberships = JSON.parse(localStorage.getItem(membershipKey) || '[]');
        
        if (action === 'join') {
            // Add membership if not already exists
            if (!memberships.includes(groupId)) {
                memberships.push(groupId);
                localStorage.setItem(membershipKey, JSON.stringify(memberships));
            }
        } else if (action === 'leave') {
            // Remove membership
            const updatedMemberships = memberships.filter(id => id !== groupId);
            localStorage.setItem(membershipKey, JSON.stringify(updatedMemberships));
        }
        
        return memberships;
    }

    // Enhanced group data persistence
    function persistGroupData(groupId, groupData) {
        const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
        const existingGroupIndex = allGroups.findIndex(g => g.group_id === groupId);
        
        if (existingGroupIndex !== -1) {
            // Update existing group
            allGroups[existingGroupIndex] = { ...allGroups[existingGroupIndex], ...groupData };
        } else {
            // Add new group
            allGroups.push(groupData);
        }
        
        localStorage.setItem('allGroups', JSON.stringify(allGroups));
        return allGroups;
    }

    // Enhanced user groups tracking
    function updateUserGroups(userId, groupId, action = 'add') {
        const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
        const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
        
        if (action === 'add') {
            // Add group to user's groups if not already present
            const groupExists = myGroups.some(g => g.group_id === groupId);
            if (!groupExists) {
                const group = allGroups.find(g => g.group_id === groupId);
                if (group) {
                    myGroups.push(group);
                    localStorage.setItem('myGroups', JSON.stringify(myGroups));
                }
            }
        } else if (action === 'remove') {
            // Remove group from user's groups
            const updatedMyGroups = myGroups.filter(g => g.group_id !== groupId);
            localStorage.setItem('myGroups', JSON.stringify(updatedMyGroups));
        }
        
        return myGroups;
    }

    // Load user's groups
    async function loadMyGroups() {
        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) return;

        // Ensure myGroups exists and is an array
        let myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
        if (!Array.isArray(myGroups)) {
            myGroups = [];
            localStorage.setItem('myGroups', JSON.stringify(myGroups));
        }
            
            displayMyGroups(myGroups);
    }
            
    // Display user's groups
    function displayMyGroups(myGroups) {
            // Filter out invalid groups (more than 4 members)
            const validGroups = myGroups.filter(group => {
                const memberCount = group.current_members || 0;
                return memberCount <= 4;
            });
            
            // Update myGroups if any were filtered out
            if (validGroups.length !== myGroups.length) {
                localStorage.setItem('myGroups', JSON.stringify(validGroups));
            }
            
            if (validGroups.length === 0) {
                myGroupsList.innerHTML = '<p class="no-groups">You haven\'t joined any groups yet. Create or search for groups to get started!</p>';
                return;
            }

            let groupsHTML = '';
            validGroups.forEach(group => {
                const memberCount = Math.min(group.current_members || 1, 4); // Cap at 4 for display
                groupsHTML += `
                    <div class="group-item">
                        <h5>${group.name}</h5>
                        <p>${group.description}</p>
                        <div class="group-meta">
                            <span>${getFocusAreaName(group.focus)}</span>
                            <span>${group.size_preference || 'Any size'}</span>
                            <span>${memberCount}/4 members</span>
                        </div>
                        <div class="group-actions">
                            <button class="btn-small btn-view" onclick="viewGroup('${group.group_id}')">View Details</button>
                            <button class="btn-small btn-primary" onclick="openGroupChat('${group.group_id}', '${group.name}')">Chat</button>
                            <button class="btn-small btn-join" onclick="leaveGroup('${group.group_id}')">Leave Group</button>
                        </div>
                    </div>
                `;
            });

            myGroupsList.innerHTML = groupsHTML;
    }

    // Load available groups (groups user hasn't joined)
    async function loadAvailableGroups() {
        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) return;

        try {
            const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
            const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
            const myGroupIds = myGroups.map(g => g.group_id);
            
            // Filter out groups user has already joined and invalid groups
            const availableGroups = allGroups.filter(group => {
                const memberCount = group.current_members || 0;
                // Only show groups with at least 1 member, max 4 members, and user hasn't joined
                const hasMembers = memberCount >= 1;
                const validMemberCount = memberCount <= 4;
                const notFull = memberCount < 4;
                const notJoined = !myGroupIds.includes(group.group_id);
                
                return hasMembers && validMemberCount && notFull && notJoined;
            });
            
            displayAvailableGroups(availableGroups);
        } catch (error) {
            console.warn('Failed to load available groups:', error);
            availableGroupsList.innerHTML = '<p class="no-groups">Failed to load groups.</p>';
        }
    }

    // Display available groups
    function displayAvailableGroups(groups) {
        if (groups.length === 0) {
            availableGroupsList.innerHTML = '<p class="no-groups">No available groups at the moment. Create a new group to get started!</p>';
            return;
        }

        let groupsHTML = '';
        groups.forEach(group => {
            // Check if group is full
            const isFull = (group.current_members || 0) >= 4;
            const joinButtonText = isFull ? 'Group Full' : 'Join Group';
            const joinButtonClass = isFull ? 'btn-small btn-view' : 'btn-small btn-join';
            const joinButtonDisabled = isFull ? 'disabled' : '';
            
            groupsHTML += `
                <div class="group-item">
                    <h5>${group.name}</h5>
                    <p>${group.description}</p>
                    <div class="group-meta">
                        <span>${getFocusAreaName(group.focus)}</span>
                        <span>${group.size_preference || 'Any size'}</span>
                        <span>${group.current_members || 1}/4 members</span>
                    </div>
                    <div class="group-actions">
                        <button class="btn-small btn-view" onclick="viewGroup('${group.group_id}')">View Details</button>
                        <button class="${joinButtonClass}" onclick="joinGroup('${group.group_id}')" ${joinButtonDisabled}>${joinButtonText}</button>
                    </div>
                </div>
            `;
        });

        availableGroupsList.innerHTML = groupsHTML;
    }

    // Show modal
    function showModal(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    function hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Event listeners for modals
    createGroupBtn.addEventListener('click', () => showModal(createGroupModal));
    searchGroupsBtn.addEventListener('click', () => showModal(searchGroupsModal));
    searchProfilesBtn.addEventListener('click', () => showModal(searchProfilesModal));

    closeCreateModal.addEventListener('click', () => hideModal(createGroupModal));
    closeSearchModal.addEventListener('click', () => hideModal(searchGroupsModal));
    closeSearchProfilesModal.addEventListener('click', () => hideModal(searchProfilesModal));
    closeEditProfileModal.addEventListener('click', () => hideModal(editProfileModal));
    closeChatModal.addEventListener('click', () => hideModal(groupChatModal));
    cancelCreateGroup.addEventListener('click', () => hideModal(createGroupModal));
    cancelSearch.addEventListener('click', () => hideModal(searchGroupsModal));
    cancelSearchProfiles.addEventListener('click', () => hideModal(searchProfilesModal));
    cancelEditProfile.addEventListener('click', () => hideModal(editProfileModal));

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === createGroupModal) hideModal(createGroupModal);
        if (e.target === searchGroupsModal) hideModal(searchGroupsModal);
        if (e.target === searchProfilesModal) hideModal(searchProfilesModal);
        if (e.target === editProfileModal) hideModal(editProfileModal);
    });

    // Handle create group form submission
    createGroupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(createGroupForm);
        
        // Validate required fields
        if (!formData.get('groupFocus')) {
            showMessage('Please select a focus area for your group.', 'error');
            return;
        }

        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) {
            showMessage('Please log in to create a group.', 'error');
            return;
        }

        const groupData = {
            name: formData.get('groupName'),
            description: formData.get('groupDescription'),
            focus: formData.get('groupFocus'),
            sizePreference: formData.get('groupSize'),
            requiredSkills: formData.get('groupSkills'),
            createdBy: userId
        };

            const groupId = 'group_' + Date.now();
            const newGroup = {
                group_id: groupId,
                name: groupData.name,
                description: groupData.description,
                focus: groupData.focus,
                size_preference: groupData.sizePreference,
                required_skills: groupData.requiredSkills,
                current_members: 1,
                max_members: 4,
                created_by: userId,
                created_at: new Date().toISOString()
            };

        // Add to all groups
        const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
        allGroups.push(newGroup);
        localStorage.setItem('allGroups', JSON.stringify(allGroups));
        
        // Add to user's groups
        const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
        myGroups.push(newGroup);
        localStorage.setItem('myGroups', JSON.stringify(myGroups));
        
        // Store current group ID for tracking
        localStorage.setItem('currentGroupId', groupId);

            showMessage('Group created successfully!', 'success');

            // Reset form and close modal
            createGroupForm.reset();
            hideModal(createGroupModal);
            await loadMyGroups();
            await loadAvailableGroups(); // Refresh available groups
    });

    // Handle search groups form submission
    searchGroupsForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(searchGroupsForm);
        const filters = {
            searchQuery: formData.get('searchQuery'),
            focus: formData.get('searchFocus'),
            year: formData.get('searchYear')
        };

            const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
            const userId = localStorage.getItem('uaInnovateUserId');
        const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
        const myGroupIds = myGroups.map(g => g.group_id);
            
            // Filter groups
            let filteredGroups = allGroups.filter(group => {
                // Don't show groups user is already in
                if (myGroupIds.includes(group.group_id)) return false;
                
                // Only show groups with valid member counts (1-4 members)
                const memberCount = group.current_members || 0;
                if (memberCount < 1 || memberCount > 4) return false;
                
                // Text search
                if (filters.searchQuery) {
                    const searchText = (group.name + ' ' + group.description + ' ' + (group.required_skills || '')).toLowerCase();
                    if (!searchText.includes(filters.searchQuery.toLowerCase())) return false;
                }
                
                // Focus area filter
                if (filters.focus && group.focus !== filters.focus) return false;
                
                return true;
            });
            
            displaySearchResults(filteredGroups);
    });

    // Handle search profiles form submission
    searchProfilesForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(searchProfilesForm);
        const filters = {
            searchQuery: formData.get('profileSearchQuery'),
            major: formData.get('profileSearchMajor'),
            year: formData.get('profileSearchYear'),
            skills: formData.get('profileSearchSkills')
        };

            const allProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]');
            const currentUserId = localStorage.getItem('uaInnovateUserId');
            
            // Filter profiles (exclude current user)
            let filteredProfiles = allProfiles.filter(profile => {
                if (profile.userId === currentUserId) return false;
                
                // Text search
                if (filters.searchQuery) {
                    const searchText = (profile.major + ' ' + profile.technicalSkills + ' ' + profile.interests).toLowerCase();
                    if (!searchText.includes(filters.searchQuery.toLowerCase())) return false;
                }
                
                // Major filter
                if (filters.major && !profile.major.toLowerCase().includes(filters.major.toLowerCase())) return false;
                
                // Year filter
                if (filters.year && profile.year !== filters.year) return false;
                
                // Skills filter
                if (filters.skills) {
                    const profileSkills = profile.technicalSkills.toLowerCase();
                    const searchSkills = filters.skills.toLowerCase();
                    if (!profileSkills.includes(searchSkills)) return false;
                }
                
                return true;
            });
            
            displayProfileSearchResults(filteredProfiles);
    });

    // Display search results
    function displaySearchResults(groups) {
        const searchResults = document.getElementById('searchResults');
        const groupsList = document.getElementById('groupsList');

        if (groups.length === 0) {
            groupsList.innerHTML = '<p class="no-groups">No groups found matching your criteria.</p>';
        } else {
            let resultsHTML = '';
            groups.forEach(group => {
                // Check if group is full
                const isFull = group.current_members >= 4;
                const joinButtonText = isFull ? 'Group Full' : 'Join Group';
                const joinButtonClass = isFull ? 'btn-small btn-view' : 'btn-small btn-join';
                const joinButtonDisabled = isFull ? 'disabled' : '';
                
                resultsHTML += `
                    <div class="group-item">
                        <h5>${group.name}</h5>
                        <p>${group.description}</p>
                        <div class="group-meta">
                            <span>${getFocusAreaName(group.focus)}</span>
                            <span>${group.size_preference || 'Any size'}</span>
                            <span>${group.current_members}/4 members</span>
                        </div>
                        <div class="group-actions">
                            <button class="btn-small btn-view" onclick="viewGroup('${group.group_id}')">View Details</button>
                            <button class="${joinButtonClass}" onclick="joinGroup('${group.group_id}')" ${joinButtonDisabled}>${joinButtonText}</button>
                        </div>
                    </div>
                `;
            });
            groupsList.innerHTML = resultsHTML;
        }

        searchResults.style.display = 'block';
    }

    // Display profile search results
    function displayProfileSearchResults(profiles) {
        const profileSearchResults = document.getElementById('profileSearchResults');
        const profilesList = document.getElementById('profilesList');
        const currentUserId = localStorage.getItem('uaInnovateUserId');

        if (profiles.length === 0) {
            profilesList.innerHTML = '<p class="no-groups">No profiles found matching your criteria.</p>';
        } else {
            let resultsHTML = '';
            profiles.forEach(profile => {
                const isMIS = profile.major.toLowerCase().includes('mis') || 
                             profile.major.toLowerCase().includes('management information systems') ||
                             profile.major.toLowerCase().includes('information systems');
                
                // Check if connection already exists
                const connections = JSON.parse(localStorage.getItem('profileConnections') || '[]');
                const connectionExists = connections.find(conn => 
                    (conn.fromUserId === currentUserId && conn.toUserId === profile.userId) ||
                    (conn.fromUserId === profile.userId && conn.toUserId === currentUserId)
                );
                
                const connectButtonText = connectionExists ? 'Already Connected' : 'Connect';
                const connectButtonClass = connectionExists ? 'btn-view' : 'btn-join';
                const connectButtonDisabled = connectionExists ? 'disabled' : '';
                
                resultsHTML += `
                    <div class="group-item profile-item">
                        <h5>${profile.major} Student</h5>
                        <div class="profile-meta">
                            <span>${profile.year.charAt(0).toUpperCase() + profile.year.slice(1)}</span>
                            ${isMIS && profile.misSemester ? `<span>MIS Semester ${profile.misSemester}</span>` : ''}
                        </div>
                        <div class="profile-skills">
                            <strong>Skills:</strong> ${formatTechnicalSkills(profile.technicalSkills)}
                        </div>
                        ${profile.interests.trim() ? `
                            <div class="profile-interests">
                                <strong>Interests:</strong> ${profile.interests}
                            </div>
                        ` : ''}
                        <div class="group-actions">
                            <button class="btn-small btn-view" onclick="viewProfile('${profile.userId}')">View Profile</button>
                            <button class="btn-small ${connectButtonClass}" onclick="connectWithProfile('${profile.userId}')" ${connectButtonDisabled}>${connectButtonText}</button>
                        </div>
                    </div>
                `;
            });
            profilesList.innerHTML = resultsHTML;
        }

        profileSearchResults.style.display = 'block';
    }

    // Show message
    function showMessage(text, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;

        document.querySelector('.main-content').insertBefore(messageDiv, document.querySelector('.main-content').firstChild);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Chat functionality
    window.openGroupChat = async function(groupId, groupName) {
        currentChatGroupId = groupId;
        chatGroupName.textContent = `${groupName} Chat`;
        showModal(groupChatModal);
        await loadGroupMessages(groupId);
    };

    // Helper function to get user's display name from profile
    function getUserDisplayName(userId) {
        // If this is the current user, try to get their name from session first
        const currentUserId = localStorage.getItem('uaInnovateUserId');
        if (userId === currentUserId) {
            // Try to get from main profile system (userManager)
            try {
                if (typeof userManager !== 'undefined') {
                    const session = userManager.getCurrentSession();
                    if (session) {
                        const name = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                        if (name) return name;
                    }
                }
            } catch (e) {
                console.warn('Could not access userManager:', e);
            }
            
            // Fallback: try localStorage session
            try {
                const session = JSON.parse(localStorage.getItem('crimsonCollab_session') || '{}');
                if (session.firstName || session.lastName) {
                    const name = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                    if (name) return name;
                }
            } catch (e) {
                console.warn('Could not access session:', e);
            }
        }
        
        // Try to get from main profile system (userManager) by userId
        try {
            if (typeof userManager !== 'undefined') {
                const user = userManager.findUserById(userId);
                if (user) {
                    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    if (name) return name;
                }
            }
        } catch (e) {
            console.warn('Could not access userManager:', e);
        }
        
        // Try to get from localStorage session by userId
        try {
            const session = JSON.parse(localStorage.getItem('crimsonCollab_session') || '{}');
            if (session && (session.userId === userId || session.id === userId)) {
                const name = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                if (name) return name;
            }
        } catch (e) {
            console.warn('Could not access session:', e);
        }
        
        // Try to get from shared data service
        try {
            if (window.sharedDataService) {
                const profiles = window.sharedDataService.getProfilesFromLocalStorage();
                const profile = profiles.find(p => p.userId === userId || p.id === userId);
                if (profile && profile.name) {
                    return profile.name;
                }
            }
        } catch (e) {
            console.warn('Could not access shared profiles:', e);
        }
        
        // Fallback: return a formatted version of userId or "User"
        if (userId && userId !== 'system') {
            return userId.replace(/^user_/, '').replace(/_/g, ' ') || 'User';
        }
        
        return 'User';
    }

    async function loadGroupMessages(groupId) {
        try {
            chatMessages.innerHTML = '';
            
            if (window.sharedDataService) {
                const messages = window.sharedDataService.getGroupMessagesFromLocalStorage(groupId);
                
                if (messages.length === 0) {
                    chatMessages.innerHTML = '<div class="chat-message system">No messages yet. Start the conversation!</div>';
                    return;
                }
                
                // Sort messages by timestamp
                messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                messages.forEach(message => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `chat-message ${message.messageType === 'system' ? 'system' : 'other'}`;
                    
                    if (message.messageType === 'system') {
                        messageDiv.innerHTML = message.message;
                    } else {
                        const timestamp = new Date(message.timestamp).toLocaleTimeString();
                        // Use stored userName if available, otherwise look it up
                        const displayName = message.userName || getUserDisplayName(message.userId);
                        messageDiv.innerHTML = `
                            <div class="chat-message-header">${displayName} • ${timestamp}</div>
                            ${message.message}
                        `;
                    }
                    
                    chatMessages.appendChild(messageDiv);
                });
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } catch (error) {
            console.warn('Failed to load group messages:', error);
            chatMessages.innerHTML = '<div class="chat-message system">Failed to load messages.</div>';
        }
    }

    // Send chat message
    sendChatMessage.addEventListener('click', async function() {
        const messageText = chatMessageInput.value.trim();
        if (!messageText || !currentChatGroupId) return;
        
        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) {
            showMessage('Please log in to send messages.', 'error');
            return;
        }
        
        try {
            // Get user's display name from their profile
            let userName = 'User';
            
            // Try to get from main profile system (userManager)
            try {
                if (typeof userManager !== 'undefined') {
                    const session = userManager.getCurrentSession();
                    if (session) {
                        userName = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                    }
                }
            } catch (e) {
                console.warn('Could not access userManager:', e);
            }
            
            // Fallback: try localStorage session
            if (!userName || userName === 'User') {
                try {
                    const session = JSON.parse(localStorage.getItem('crimsonCollab_session') || '{}');
                    if (session.firstName || session.lastName) {
                        userName = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                    }
                } catch (e) {
                    console.warn('Could not access session:', e);
                }
            }
            
            // Final fallback
            if (!userName || userName === 'User') {
                userName = getUserDisplayName(userId);
            }
            
            const message = {
                message: messageText,
                messageType: 'user',
                userId: userId,
                userName: userName  // Store the name so we don't have to look it up later
            };
            
            if (window.sharedDataService) {
                await window.sharedDataService.saveGroupMessage(currentChatGroupId, message);
                chatMessageInput.value = '';
                await loadGroupMessages(currentChatGroupId);
            }
        } catch (error) {
            console.warn('Failed to send message:', error);
            showMessage('Failed to send message.', 'error');
        }
    });
    
    // Send message on Enter key
    chatMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage.click();
        }
    });

    // Global functions for group actions
    window.joinGroup = async function(groupId) {
        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) {
            showMessage('Please log in to join a group.', 'error');
            return;
        }

            const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
            const group = allGroups.find(g => g.group_id === groupId);
            
            if (!group) {
                showMessage('Group not found.', 'error');
                return;
            }
            
            if (group.current_members >= 4) {
                showMessage('This group is full (maximum 4 members).', 'error');
                return;
            }
            
        // Check if user is already in this group
        const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
        const alreadyInGroup = myGroups.some(g => g.group_id === groupId);
        
        if (alreadyInGroup) {
            showMessage('You are already a member of this group.', 'info');
            return;
        }
        
        // Add to user's groups
        myGroups.push(group);
        localStorage.setItem('myGroups', JSON.stringify(myGroups));
        
        // Update group member count
            const updatedGroup = { ...group, current_members: (group.current_members || 1) + 1 };
        const updatedAllGroups = allGroups.map(g => g.group_id === groupId ? updatedGroup : g);
        localStorage.setItem('allGroups', JSON.stringify(updatedAllGroups));
        
        // Send welcome message to group
        try {
            let userName = 'A new member';
            
            // Try to get from main profile system (userManager)
            try {
                if (typeof userManager !== 'undefined') {
                    const session = userManager.getCurrentSession();
                    if (session) {
                        userName = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                    }
                }
            } catch (e) {
                console.warn('Could not access userManager:', e);
            }
            
            // Fallback: try localStorage session
            if (!userName || userName === 'A new member') {
                try {
                    const session = JSON.parse(localStorage.getItem('crimsonCollab_session') || '{}');
                    if (session.firstName || session.lastName) {
                        userName = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                    }
                } catch (e) {
                    console.warn('Could not access session:', e);
                }
            }
            
            // Final fallback
            if (!userName || userName === 'A new member') {
                userName = getUserDisplayName(userId);
            }
            
            const joinMessage = {
                message: `${userName} has joined the group! Welcome to ${group.name}! 🎉`,
                messageType: 'system',
                userId: 'system'
            };

            if (window.sharedDataService) {
                await window.sharedDataService.saveGroupMessage(groupId, joinMessage);
                console.log('Join message sent to group:', groupId);
            }
        } catch (error) {
            console.warn('Failed to send join message:', error);
        }
            
            showMessage('Successfully joined the group!', 'success');
            await loadMyGroups();
            await loadAvailableGroups(); // Refresh available groups
    };

    window.leaveGroup = async function(groupId) {
        if (confirm('Are you sure you want to leave this group?')) {
            const userId = localStorage.getItem('uaInnovateUserId');
            if (!userId) {
                showMessage('Please log in to leave a group.', 'error');
                return;
            }

            // Remove from user's groups
            const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
            const updatedMyGroups = myGroups.filter(g => g.group_id !== groupId);
            localStorage.setItem('myGroups', JSON.stringify(updatedMyGroups));
            
            // Update group member count
                const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
                const group = allGroups.find(g => g.group_id === groupId);
                if (group) {
                    const updatedGroup = { ...group, current_members: Math.max(1, (group.current_members || 1) - 1) };
                const updatedAllGroups = allGroups.map(g => g.group_id === groupId ? updatedGroup : g);
                localStorage.setItem('allGroups', JSON.stringify(updatedAllGroups));
                
                // Send departure message to group
                try {
                    let userName = 'A member';
                    
                    // Try to get from main profile system (userManager)
                    try {
                        if (typeof userManager !== 'undefined') {
                            const session = userManager.getCurrentSession();
                            if (session) {
                                userName = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                            }
                        }
                    } catch (e) {
                        console.warn('Could not access userManager:', e);
                    }
                    
                    // Fallback: try localStorage session
                    if (!userName || userName === 'A member') {
                        try {
                            const session = JSON.parse(localStorage.getItem('crimsonCollab_session') || '{}');
                            if (session.firstName || session.lastName) {
                                userName = `${session.firstName || ''} ${session.lastName || ''}`.trim();
                            }
                        } catch (e) {
                            console.warn('Could not access session:', e);
                        }
                    }
                    
                    // Final fallback
                    if (!userName || userName === 'A member') {
                        userName = getUserDisplayName(userId);
                    }
                    
                    const leaveMessage = {
                        message: `${userName} has left the group. Good luck with your future endeavors! 👋`,
                        messageType: 'system',
                        userId: 'system'
                    };

                    if (window.sharedDataService) {
                        await window.sharedDataService.saveGroupMessage(groupId, leaveMessage);
                        console.log('Leave message sent to group:', groupId);
                    }
                } catch (error) {
                    console.warn('Failed to send leave message:', error);
                }
                }
                
                showMessage('Left the group successfully.', 'info');
                await loadMyGroups();
                await loadAvailableGroups(); // Refresh available groups
        }
    };

    window.viewGroup = async function(groupId) {
        const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
        const group = allGroups.find(g => g.group_id === groupId);
            
        if (group) {
            const details = `
                Group: ${group.name}
                Description: ${group.description}
                Focus: ${getFocusAreaName(group.focus)}
                Size: ${group.size_preference || 'Any size'}
                Members: ${group.current_members}/4
                Required Skills: ${group.required_skills || 'None specified'}
                Created: ${new Date(group.created_at).toLocaleDateString()}
            `;
            alert(details);
        } else {
            showMessage('Group not found.', 'error');
        }
    };

    window.viewProfile = async function(userId) {
        const allProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]');
        const profile = allProfiles.find(p => p.userId === userId);
            
        if (profile) {
            const isMIS = profile.major.toLowerCase().includes('mis') || 
                         profile.major.toLowerCase().includes('management information systems') ||
                         profile.major.toLowerCase().includes('information systems');
            
            let details = `
                Major: ${profile.major}
                Academic Year: ${profile.year.charAt(0).toUpperCase() + profile.year.slice(1)}
                Technical Skills: ${formatTechnicalSkills(profile.technicalSkills)}
            `;
            
            if (isMIS && profile.misSemester) {
                details += `\nMIS Semester: ${profile.misSemester}`;
            }
            
            if (profile.interests.trim()) {
                details += `\nInnovation Interests: ${profile.interests}`;
            }
            
            alert(details);
        } else {
            showMessage('Profile not found.', 'error');
        }
    };

    window.connectWithProfile = async function(userId) {
        const currentUserId = localStorage.getItem('uaInnovateUserId');
        if (!currentUserId) {
            showMessage('Please log in to connect with profiles.', 'error');
            return;
        }

            showMessage('Connection request sent successfully!', 'success');
    };

    // Populate edit form with current profile data
    function populateEditForm(profile) {
        document.getElementById('editYear').value = profile.year || '';
        document.getElementById('editMajor').value = profile.major || '';
        document.getElementById('editTechnicalSkills').value = profile.technicalSkills || '';
        document.getElementById('editInterests').value = profile.interests || '';
        
        // Handle MIS semester
        const editMisSemesterGroup = document.getElementById('editMisSemesterGroup');
        const editMisSemesterSelect = document.getElementById('editMisSemester');
        
        if (profile.misSemester) {
            editMisSemesterSelect.value = profile.misSemester;
            editMisSemesterGroup.style.display = 'block';
            editMisSemesterSelect.required = true;
        } else {
            editMisSemesterGroup.style.display = 'none';
            editMisSemesterSelect.required = false;
            editMisSemesterSelect.value = '';
        }
        
        // Add event listener for major input to toggle MIS semester
        const editMajorInput = document.getElementById('editMajor');
        editMajorInput.addEventListener('input', function() {
            const majorValue = this.value.toLowerCase().trim();
            const isMIS = majorValue.includes('mis') || 
                         majorValue.includes('management information systems') ||
                         majorValue.includes('information systems');
            
            if (isMIS) {
                editMisSemesterGroup.style.display = 'block';
                editMisSemesterSelect.required = true;
            } else {
                editMisSemesterGroup.style.display = 'none';
                editMisSemesterSelect.required = false;
                editMisSemesterSelect.value = '';
            }
        });
    }

    // Handle edit profile form submission
    editProfileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(editProfileForm);
        
        // Validate required fields
        if (!formData.get('editYear')) {
            showMessage('Please select your academic year.', 'error');
            return;
        }

        if (!formData.get('editMajor')) {
            showMessage('Please enter your major.', 'error');
            return;
        }

        const majorValue = formData.get('editMajor').toLowerCase().trim();
        const isMIS = majorValue.includes('mis') || 
                     majorValue.includes('management information systems') ||
                     majorValue.includes('information systems');

        if (isMIS && !formData.get('editMisSemester')) {
            showMessage('Please select your semester in the MIS program.', 'error');
            return;
        }

        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) {
            showMessage('Please log in to update your profile.', 'error');
            return;
        }

        const updatedProfileData = {
            year: formData.get('editYear'),
            major: formData.get('editMajor').trim(),
            misSemester: formData.get('editMisSemester'),
            technicalSkills: formData.get('editTechnicalSkills').trim(),
            interests: formData.get('editInterests').trim()
        };

        // Update profile in localStorage
            localStorage.setItem('uaInnovateProfile', JSON.stringify(updatedProfileData));
            
            // Save to shared data service for cross-user access
            if (window.sharedDataService) {
                const uaInnovateProfile = {
                    ...updatedProfileData,
                    userId: userId,
                    profileType: 'uaInnovate',
                    lastUpdated: new Date().toISOString()
                };
                await window.sharedDataService.saveProfile(uaInnovateProfile);
                console.log('Profile updated in shared data service');
            }
            
            // Update in allProfiles array
            const allProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]');
            const profileIndex = allProfiles.findIndex(p => p.userId === userId);
            if (profileIndex !== -1) {
                allProfiles[profileIndex] = { ...allProfiles[profileIndex], ...updatedProfileData };
                localStorage.setItem('allProfiles', JSON.stringify(allProfiles));
            }
            
            showMessage('Profile updated successfully!', 'success');

        // Reset form and close modal
        editProfileForm.reset();
        hideModal(editProfileModal);
        
        // Refresh profile display
        const profile = await loadUserProfile();
        displayProfileSummary(profile);
    });

    // Home button
    homeBtn.addEventListener('click', function() {
        window.location.href = '../../Resources/dashboard.html';
    });

    // Edit profile button
    editProfileBtn.addEventListener('click', async function() {
        const profile = await loadUserProfile();
        if (profile) {
            populateEditForm(profile);
            showModal(editProfileModal);
        } else {
            showMessage('No profile found. Please create a profile first.', 'error');
        }
    });


    // Initialize dashboard
    initializeDashboard();

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('uaInnovateTheme') || 'light';
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'bi bi-sun-fill';
    }

    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeIcon.className = 'bi bi-moon-fill';
            localStorage.setItem('uaInnovateTheme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'bi bi-sun-fill';
            localStorage.setItem('uaInnovateTheme', 'dark');
        }
    });
});
