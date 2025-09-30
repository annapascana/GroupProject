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
        
        await loadMyGroups();
    }

    // Initialize test data if not already present
    function initializeTestData() {
        // Check if test data already exists
        const existingGroups = localStorage.getItem('allGroups');
        const existingProfiles = localStorage.getItem('allProfiles');
        
        if (!existingGroups || !existingProfiles) {
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

            // Sample groups with diverse names and categories
            const testGroups = [
                {
                    group_id: 'group_001',
                    name: 'Crimson Code Warriors',
                    description: 'A competitive programming group for students who love solving algorithmic challenges and participating in coding contests.',
                    category: 'Programming',
                    max_members: 20,
                    current_members: 14,
                    created_by: 'user_001',
                    created_at: new Date('2024-01-15').toISOString(),
                    tags: ['competitive programming', 'algorithms', 'data structures', 'coding contests', 'leetcode'],
                    requirements: 'Basic programming knowledge in any language',
                    meeting_schedule: 'Every Monday 7:00 PM - 9:00 PM',
                    location: 'Computer Science Building, Room 205'
                },
                {
                    group_id: 'group_002',
                    name: 'Data Dragons',
                    description: 'Exploring the world of data science, machine learning, and artificial intelligence through hands-on projects and research.',
                    category: 'Data Science',
                    max_members: 25,
                    current_members: 18,
                    created_by: 'user_002',
                    created_at: new Date('2024-01-20').toISOString(),
                    tags: ['data science', 'machine learning', 'python', 'statistics', 'analytics'],
                    requirements: 'Python or R programming experience preferred',
                    meeting_schedule: 'Every Wednesday 6:00 PM - 8:00 PM',
                    location: 'Business School, Room 301'
                },
                {
                    group_id: 'group_003',
                    name: 'Tech Titans',
                    description: 'Building innovative tech solutions and exploring emerging technologies. Perfect for students passionate about technology innovation.',
                    category: 'Technology',
                    max_members: 30,
                    current_members: 22,
                    created_by: 'user_003',
                    created_at: new Date('2024-01-25').toISOString(),
                    tags: ['innovation', 'emerging tech', 'startups', 'product development', 'tech trends'],
                    requirements: 'Open to all majors with tech interest',
                    meeting_schedule: 'Every Friday 5:00 PM - 7:00 PM',
                    location: 'Engineering Building, Innovation Lab'
                },
                {
                    group_id: 'group_004',
                    name: 'Web Wizards',
                    description: 'Mastering modern web development technologies including React, Node.js, and full-stack development.',
                    category: 'Web Development',
                    max_members: 18,
                    current_members: 12,
                    created_by: 'user_004',
                    created_at: new Date('2024-02-01').toISOString(),
                    tags: ['web development', 'react', 'node.js', 'javascript', 'full-stack'],
                    requirements: 'Basic HTML, CSS, and JavaScript knowledge',
                    meeting_schedule: 'Every Tuesday 6:30 PM - 8:30 PM',
                    location: 'Computer Science Building, Room 180'
                },
                {
                    group_id: 'group_005',
                    name: 'MIS Mavericks',
                    description: 'Connecting Management Information Systems students for networking, career development, and academic excellence.',
                    category: 'Academic',
                    max_members: 35,
                    current_members: 28,
                    created_by: 'user_002',
                    created_at: new Date('2024-02-05').toISOString(),
                    tags: ['mis', 'business', 'networking', 'career', 'academic support'],
                    requirements: 'Must be an MIS major or minor',
                    meeting_schedule: 'Every Thursday 6:00 PM - 7:30 PM',
                    location: 'Business School, Conference Room B'
                },
                {
                    group_id: 'group_006',
                    name: 'Startup Squad',
                    description: 'For aspiring entrepreneurs and startup enthusiasts. Learn about business development, pitching, and building successful companies.',
                    category: 'Entrepreneurship',
                    max_members: 25,
                    current_members: 19,
                    created_by: 'user_007',
                    created_at: new Date('2024-02-10').toISOString(),
                    tags: ['entrepreneurship', 'startups', 'business', 'pitching', 'venture capital'],
                    requirements: 'Open to all majors with entrepreneurial interest',
                    meeting_schedule: 'Every Saturday 10:00 AM - 12:00 PM',
                    location: 'Business School, Entrepreneurship Center'
                },
                {
                    group_id: 'group_007',
                    name: 'Cyber Guardians',
                    description: 'Learning cybersecurity, ethical hacking, and digital forensics. Preparing for careers in information security.',
                    category: 'Security',
                    max_members: 20,
                    current_members: 15,
                    created_by: 'user_005',
                    created_at: new Date('2024-02-15').toISOString(),
                    tags: ['cybersecurity', 'ethical hacking', 'digital forensics', 'penetration testing', 'security'],
                    requirements: 'Basic networking and programming knowledge',
                    meeting_schedule: 'Every Sunday 2:00 PM - 4:00 PM',
                    location: 'Computer Science Building, Security Lab'
                },
                {
                    group_id: 'group_008',
                    name: 'Mobile Masters',
                    description: 'Creating innovative mobile applications for iOS and Android platforms using cutting-edge technologies.',
                    category: 'Mobile Development',
                    max_members: 22,
                    current_members: 16,
                    created_by: 'user_001',
                    created_at: new Date('2024-02-20').toISOString(),
                    tags: ['mobile development', 'ios', 'android', 'react native', 'flutter', 'swift'],
                    requirements: 'JavaScript or Swift/Java experience helpful',
                    meeting_schedule: 'Every Wednesday 7:00 PM - 9:00 PM',
                    location: 'Computer Science Building, Mobile Lab'
                },
                {
                    group_id: 'group_009',
                    name: 'AI Architects',
                    description: 'Advanced artificial intelligence research group focusing on deep learning, computer vision, and natural language processing.',
                    category: 'Research',
                    max_members: 15,
                    current_members: 11,
                    created_by: 'user_004',
                    created_at: new Date('2024-02-25').toISOString(),
                    tags: ['artificial intelligence', 'deep learning', 'computer vision', 'nlp', 'research'],
                    requirements: 'Strong programming skills and machine learning background',
                    meeting_schedule: 'Every Monday 4:00 PM - 6:00 PM',
                    location: 'Computer Science Building, AI Research Lab'
                },
                {
                    group_id: 'group_010',
                    name: 'Game Dev Guild',
                    description: 'Creating video games, learning game development tools, and exploring interactive media design.',
                    category: 'Game Development',
                    max_members: 20,
                    current_members: 13,
                    created_by: 'user_006',
                    created_at: new Date('2024-03-01').toISOString(),
                    tags: ['game development', 'unity', 'unreal engine', 'game design', 'interactive media'],
                    requirements: 'Basic programming knowledge and creativity',
                    meeting_schedule: 'Every Friday 6:00 PM - 8:00 PM',
                    location: 'Engineering Building, Game Development Lab'
                },
                {
                    group_id: 'group_011',
                    name: 'Cloud Commanders',
                    description: 'Mastering cloud computing technologies including AWS, Azure, and Google Cloud Platform.',
                    category: 'Cloud Computing',
                    max_members: 18,
                    current_members: 12,
                    created_by: 'user_007',
                    created_at: new Date('2024-03-05').toISOString(),
                    tags: ['cloud computing', 'aws', 'azure', 'google cloud', 'devops', 'containers'],
                    requirements: 'Basic programming and system administration knowledge',
                    meeting_schedule: 'Every Tuesday 5:00 PM - 7:00 PM',
                    location: 'Computer Science Building, Cloud Lab'
                },
                {
                    group_id: 'group_012',
                    name: 'Blockchain Builders',
                    description: 'Exploring blockchain technology, cryptocurrency, and decentralized applications (DApps).',
                    category: 'Blockchain',
                    max_members: 16,
                    current_members: 9,
                    created_by: 'user_008',
                    created_at: new Date('2024-03-10').toISOString(),
                    tags: ['blockchain', 'cryptocurrency', 'smart contracts', 'defi', 'web3'],
                    requirements: 'Basic programming knowledge and interest in blockchain',
                    meeting_schedule: 'Every Thursday 7:00 PM - 9:00 PM',
                    location: 'Business School, FinTech Lab'
                },
                {
                    group_id: 'group_013',
                    name: 'Robotics Revolution',
                    description: 'Building robots, drones, and autonomous systems. Perfect for engineering students passionate about robotics.',
                    category: 'Robotics',
                    max_members: 14,
                    current_members: 8,
                    created_by: 'user_003',
                    created_at: new Date('2024-03-15').toISOString(),
                    tags: ['robotics', 'drones', 'autonomous systems', 'arduino', 'raspberry pi'],
                    requirements: 'Basic programming and electronics knowledge',
                    meeting_schedule: 'Every Saturday 1:00 PM - 3:00 PM',
                    location: 'Engineering Building, Robotics Lab'
                },
                {
                    group_id: 'group_014',
                    name: 'UX/UI Designers',
                    description: 'Creating beautiful and functional user interfaces and experiences. Learning design principles and prototyping tools.',
                    category: 'Design',
                    max_members: 20,
                    current_members: 14,
                    created_by: 'user_005',
                    created_at: new Date('2024-03-20').toISOString(),
                    tags: ['ux design', 'ui design', 'figma', 'prototyping', 'user research'],
                    requirements: 'Creative mindset and interest in design',
                    meeting_schedule: 'Every Monday 6:00 PM - 8:00 PM',
                    location: 'Art Building, Design Studio'
                },
                {
                    group_id: 'group_015',
                    name: 'Database Dynamos',
                    description: 'Mastering database design, SQL, and data management systems. Perfect for students interested in data architecture.',
                    category: 'Database',
                    max_members: 16,
                    current_members: 10,
                    created_by: 'user_002',
                    created_at: new Date('2024-03-25').toISOString(),
                    tags: ['database', 'sql', 'data modeling', 'mysql', 'postgresql', 'mongodb'],
                    requirements: 'Basic programming knowledge and interest in data',
                    meeting_schedule: 'Every Wednesday 5:00 PM - 7:00 PM',
                    location: 'Computer Science Building, Database Lab'
                }
            ];

            // Store test data in localStorage
            if (!existingProfiles) {
                localStorage.setItem('allProfiles', JSON.stringify(testProfiles));
            }
            if (!existingGroups) {
                localStorage.setItem('allGroups', JSON.stringify(testGroups));
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
            if (myGroups.length === 0) {
                myGroupsList.innerHTML = '<p class="no-groups">You haven\'t joined any groups yet. Create or search for groups to get started!</p>';
                return;
            }

            let groupsHTML = '';
            myGroups.forEach(group => {
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
                            <button class="btn-small btn-primary" onclick="openGroupChat('${group.group_id}', '${group.name}')">Chat</button>
                            <button class="btn-small btn-join" onclick="leaveGroup('${group.group_id}')">Leave Group</button>
                        </div>
                    </div>
                `;
            });

            myGroupsList.innerHTML = groupsHTML;
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
                        messageDiv.innerHTML = `
                            <div class="chat-message-header">${message.userId} • ${timestamp}</div>
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
            const userProfile = JSON.parse(localStorage.getItem('uaInnovateProfile') || '{}');
            const userName = userProfile.name || 'Anonymous';
            
            const message = {
                message: messageText,
                messageType: 'user',
                userId: userName
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
            const userProfile = JSON.parse(localStorage.getItem('uaInnovateProfile') || '{}');
            const userName = userProfile.name || 'A new member';
            
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
                    const userProfile = JSON.parse(localStorage.getItem('uaInnovateProfile') || '{}');
                    const userName = userProfile.name || 'A member';
                    
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
