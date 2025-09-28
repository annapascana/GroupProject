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

    // Load user profile and initialize dashboard
    async function initializeDashboard() {
        const profile = await loadUserProfile();
        displayProfileSummary(profile);
        await loadMyGroups();
    }

    // Load user profile from API (with fallback to localStorage)
    async function loadUserProfile() {
        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) {
            window.location.href = 'innovate.html';
            return null;
        }

        try {
            const response = await innovateAPI.getUser(userId);
            return response.user;
        } catch (error) {
            console.warn('API not available, using localStorage fallback:', error);
            
            // Fallback to localStorage when API is not available
            const profileData = localStorage.getItem('uaInnovateProfile');
            if (profileData) {
                return JSON.parse(profileData);
            } else {
                window.location.href = 'innovate.html';
                return null;
            }
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
        if (!skills.trim()) return 'None specified';
        
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

        try {
            const response = await innovateAPI.getUserGroups(userId);
            const myGroups = response.groups || [];
            
            // Persist groups data for offline access
            myGroups.forEach(group => {
                persistGroupData(group.group_id, group);
            });
            
            // Track memberships
            const membershipKey = `groupMemberships_${userId}`;
            const memberships = myGroups.map(g => g.group_id);
            localStorage.setItem(membershipKey, JSON.stringify(memberships));
            
            // Update user's groups
            localStorage.setItem('myGroups', JSON.stringify(myGroups));
            
            displayMyGroups(myGroups);
        } catch (error) {
            console.warn('API not available, using localStorage fallback for groups:', error);
            
            // Fallback to localStorage when API is not available
            const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
            displayMyGroups(myGroups);
        }
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

        try {
            const response = await innovateAPI.createGroup(groupData);
            showMessage('Group created successfully!', 'success');

            // Store group ID for messaging
            if (response.groupId) {
                storeCurrentGroupId(response.groupId);
                // Load any existing messages
                loadGroupMessages(response.groupId);
            }

            // Also save to shared data service
            try {
                if (window.sharedDataService) {
                    await window.sharedDataService.saveGroup({
                        id: response.groupId,
                        name: groupData.name,
                        description: groupData.description,
                        focus: groupData.focus,
                        size_preference: groupData.sizePreference,
                        required_skills: groupData.requiredSkills,
                        created_by: userId
                    });
                }
            } catch (sharedError) {
                console.warn('Failed to save group to shared service:', sharedError);
            }

            // Reset form and close modal
            createGroupForm.reset();
            hideModal(createGroupModal);
            await loadMyGroups();
        } catch (error) {
            console.warn('API not available, using localStorage fallback for group creation:', error);
            
            // Fallback to localStorage when API is not available
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

            // Persist group data
            persistGroupData(groupId, newGroup);
            
            // Track membership for creator
            trackGroupMembership(groupId, userId, 'join');
            
            // Update user's groups
            updateUserGroups(userId, groupId, 'add');

            // Store group ID for messaging
            storeCurrentGroupId(groupId);

            showMessage('Group created successfully!', 'success');

            // Reset form and close modal
            createGroupForm.reset();
            hideModal(createGroupModal);
            await loadMyGroups();
        }
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

        try {
            const response = await innovateAPI.searchGroups(filters);
            displaySearchResults(response.groups);
        } catch (error) {
            console.warn('API not available, using localStorage fallback for search:', error);
            
            // Fallback to localStorage when API is not available
            const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
            const userId = localStorage.getItem('uaInnovateUserId');
            const membershipKey = `groupMemberships_${userId}`;
            const userMemberships = JSON.parse(localStorage.getItem(membershipKey) || '[]');
            
            // Filter groups
            let filteredGroups = allGroups.filter(group => {
                // Don't show groups user is already in
                if (userMemberships.includes(group.group_id)) return false;
                
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
        }
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

        try {
            const response = await innovateAPI.searchProfiles(filters);
            displayProfileSearchResults(response.profiles);
        } catch (error) {
            console.warn('API not available, using localStorage fallback for profile search:', error);
            
            // Fallback to localStorage when API is not available
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
        }
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

    // Global functions for group actions
    window.joinGroup = async function(groupId) {
        const userId = localStorage.getItem('uaInnovateUserId');
        if (!userId) {
            showMessage('Please log in to join a group.', 'error');
            return;
        }

        // Check if user is already in this group
        const membershipKey = `groupMemberships_${userId}`;
        const currentMemberships = JSON.parse(localStorage.getItem(membershipKey) || '[]');
        if (currentMemberships.includes(groupId)) {
            showMessage('You are already a member of this group.', 'info');
            return;
        }

        try {
            await innovateAPI.joinGroup(groupId, userId);
            
            // Track membership
            trackGroupMembership(groupId, userId, 'join');
            
            // Update user's groups
            updateUserGroups(userId, groupId, 'add');
            
            showMessage('Successfully joined the group!', 'success');
            await loadMyGroups();
        } catch (error) {
            console.warn('API not available, using localStorage fallback for join:', error);
            
            // Fallback to localStorage when API is not available
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
            
            // Track membership
            trackGroupMembership(groupId, userId, 'join');
            
            // Update user's groups
            updateUserGroups(userId, groupId, 'add');
            
            // Update group member count and persist data
            const updatedGroup = { ...group, current_members: (group.current_members || 1) + 1 };
            persistGroupData(groupId, updatedGroup);
            
            showMessage('Successfully joined the group!', 'success');
            await loadMyGroups();
        }
    };

    window.leaveGroup = async function(groupId) {
        if (confirm('Are you sure you want to leave this group?')) {
            const userId = localStorage.getItem('uaInnovateUserId');
            if (!userId) {
                showMessage('Please log in to leave a group.', 'error');
                return;
            }

            try {
                await innovateAPI.leaveGroup(groupId, userId);
                
                // Track membership removal
                trackGroupMembership(groupId, userId, 'leave');
                
                // Update user's groups
                updateUserGroups(userId, groupId, 'remove');
                
                showMessage('Left the group successfully.', 'info');
                await loadMyGroups();
            } catch (error) {
                console.warn('API not available, using localStorage fallback for leave:', error);
                
                // Fallback to localStorage when API is not available
                const membershipKey = `groupMemberships_${userId}`;
                const currentMemberships = JSON.parse(localStorage.getItem(membershipKey) || '[]');
                
                if (!currentMemberships.includes(groupId)) {
                    showMessage('You are not a member of this group.', 'error');
                    return;
                }
                
                // Track membership removal
                trackGroupMembership(groupId, userId, 'leave');
                
                // Update user's groups
                updateUserGroups(userId, groupId, 'remove');
                
                // Update group member count and persist data
                const allGroups = JSON.parse(localStorage.getItem('allGroups') || '[]');
                const group = allGroups.find(g => g.group_id === groupId);
                if (group) {
                    const updatedGroup = { ...group, current_members: Math.max(1, (group.current_members || 1) - 1) };
                    persistGroupData(groupId, updatedGroup);
                }
                
                showMessage('Left the group successfully.', 'info');
                await loadMyGroups();
            }
        }
    };

    window.viewGroup = async function(groupId) {
        try {
            const response = await innovateAPI.getGroup(groupId);
            const group = response.group;
            
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
        } catch (error) {
            console.error('Error viewing group:', error);
            showMessage('Failed to load group details. Please try again.', 'error');
        }
    };

    window.viewProfile = async function(userId) {
        try {
            const response = await innovateAPI.getUser(userId);
            const profile = response.user;
            
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
        } catch (error) {
            console.error('Error viewing profile:', error);
            showMessage('Failed to load profile details. Please try again.', 'error');
        }
    };

    window.connectWithProfile = async function(userId) {
        const currentUserId = localStorage.getItem('uaInnovateUserId');
        if (!currentUserId) {
            showMessage('Please log in to connect with profiles.', 'error');
            return;
        }

        // Find and update the connect button
        const connectButton = document.querySelector(`button[onclick="connectWithProfile('${userId}')"]`);
        if (connectButton) {
            const originalText = connectButton.textContent;
            connectButton.textContent = 'Connection Sent';
            connectButton.disabled = true;
            connectButton.classList.remove('btn-join');
            connectButton.classList.add('btn-view');
        }

        try {
            await innovateAPI.connectWithUser(userId, currentUserId);
            showMessage('Connection request sent successfully!', 'success');
        } catch (error) {
            console.warn('API not available, using localStorage fallback for connection:', error);
            
            // Fallback to localStorage when API is not available
            const connections = JSON.parse(localStorage.getItem('profileConnections') || '[]');
            const connectionExists = connections.find(conn => 
                (conn.fromUserId === currentUserId && conn.toUserId === userId) ||
                (conn.fromUserId === userId && conn.toUserId === currentUserId)
            );
            
            if (connectionExists) {
                showMessage('You are already connected with this user.', 'info');
                // Reset button if already connected
                if (connectButton) {
                    connectButton.textContent = 'Already Connected';
                    connectButton.disabled = true;
                }
                return;
            }
            
            const newConnection = {
                id: 'conn_' + Date.now(),
                fromUserId: currentUserId,
                toUserId: userId,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            connections.push(newConnection);
            localStorage.setItem('profileConnections', JSON.stringify(connections));
            
            showMessage('Connection request sent successfully!', 'success');
        }
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

        try {
            // Try to update via API first
            await innovateAPI.updateUser(userId, updatedProfileData);
            showMessage('Profile updated successfully!', 'success');
        } catch (error) {
            console.warn('API not available, using localStorage fallback for profile update:', error);
            
            // Fallback to localStorage when API is not available
            localStorage.setItem('uaInnovateProfile', JSON.stringify(updatedProfileData));
            
            // Update in allProfiles array
            const allProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]');
            const profileIndex = allProfiles.findIndex(p => p.userId === userId);
            if (profileIndex !== -1) {
                allProfiles[profileIndex] = { ...allProfiles[profileIndex], ...updatedProfileData };
                localStorage.setItem('allProfiles', JSON.stringify(allProfiles));
            }
            
            showMessage('Profile updated successfully!', 'success');
        }

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
    
    // Initialize test groups
    initializeTestGroups();

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

    // Initialize Group Messaging Functionality
    initializeGroupMessaging();
});

// Group Messaging Functions
function initializeGroupMessaging() {
    const groupNameInput = document.getElementById('groupName');
    const messagingSection = document.getElementById('groupMessagingSection');
    const messageInput = document.getElementById('groupMessageInput');
    const sendMessageBtn = document.getElementById('sendGroupMessage');
    const messageList = document.getElementById('groupMessageList');
    const inviteEmailInput = document.getElementById('inviteEmail');
    const sendInviteBtn = document.getElementById('sendInvite');

    // Show messaging section when user starts typing group name
    if (groupNameInput && messagingSection) {
        groupNameInput.addEventListener('input', function() {
            if (this.value.trim().length > 0) {
                messagingSection.style.display = 'block';
                addSystemMessage('Group creation started! You can now invite members and discuss the group.');
            } else {
                messagingSection.style.display = 'none';
                if (messageList) messageList.innerHTML = '';
            }
        });
    }

    // Send message functionality
    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', function() {
            sendGroupMessage();
        });

        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendGroupMessage();
            }
        });
    }

    // Send invite functionality
    if (sendInviteBtn && inviteEmailInput) {
        sendInviteBtn.addEventListener('click', function() {
            sendGroupInvite();
        });

        inviteEmailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendGroupInvite();
            }
        });
    }
}

function sendGroupMessage() {
    const messageInput = document.getElementById('groupMessageInput');
    const message = messageInput.value.trim();

    if (message) {
        const currentUser = localStorage.getItem('uaInnovateUserId') || 'demo_user';
        const currentGroupId = localStorage.getItem('currentGroupId');
        
        if (!currentGroupId) {
            showMessage('Please create a group first', 'error');
            return;
        }

        // Send message via API
        innovateAPI.sendGroupMessage(currentGroupId, currentUser, message, 'user')
            .then(response => {
                if (response.success) {
                    const timestamp = new Date().toLocaleTimeString();
                    addMessage(message, 'You', timestamp, 'user');
                    messageInput.value = '';
                    
                    // Load recent messages to show any responses
                    loadGroupMessages(currentGroupId);
                } else {
                    showMessage('Failed to send message', 'error');
                }
            })
            .catch(error => {
                console.warn('API not available, using demo mode:', error);
                // Fallback to demo mode
                const timestamp = new Date().toLocaleTimeString();
                addMessage(message, 'You', timestamp, 'user');
                messageInput.value = '';
                
                // Simulate other users responding (for demo purposes)
                setTimeout(() => {
                    const responses = [
                        "This sounds interesting! I'd love to join.",
                        "What technologies are you planning to use?",
                        "I have experience in that area. Count me in!",
                        "When do you plan to start this project?"
                    ];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    const randomUser = ['Alice', 'Bob', 'Charlie', 'Diana'][Math.floor(Math.random() * 4)];
                    addMessage(randomResponse, randomUser, new Date().toLocaleTimeString(), 'other');
                }, 2000);
            });
    }
}

function sendGroupInvite() {
    const inviteEmailInput = document.getElementById('inviteEmail');
    const email = inviteEmailInput.value.trim();

    if (email && isValidEmail(email)) {
        const currentUser = localStorage.getItem('uaInnovateUserId') || 'demo_user';
        const currentGroupId = localStorage.getItem('currentGroupId');
        
        if (!currentGroupId) {
            showMessage('Please create a group first', 'error');
            return;
        }

        // Send invite via API
        innovateAPI.sendGroupInvite(currentGroupId, currentUser, email)
            .then(response => {
                if (response.success) {
                    const timestamp = new Date().toLocaleTimeString();
                    addMessage(`Invited ${email} to join the group`, 'You', timestamp, 'invite');
                    inviteEmailInput.value = '';
                    showMessage(`Invitation sent to ${email}!`, 'success');
                } else {
                    showMessage(response.error || 'Failed to send invitation', 'error');
                }
            })
            .catch(error => {
                console.warn('API not available, using demo mode:', error);
                // Fallback to demo mode
                const timestamp = new Date().toLocaleTimeString();
                addMessage(`Invited ${email} to join the group`, 'You', timestamp, 'invite');
                inviteEmailInput.value = '';
                showMessage(`Invitation sent to ${email}!`, 'success');
            });
    } else {
        showMessage('Please enter a valid email address', 'error');
    }
}

function addMessage(content, sender, timestamp, type = 'user') {
    const messageList = document.getElementById('groupMessageList');
    if (!messageList) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-item ${type}`;
    
    messageDiv.innerHTML = `
        <div>${content}</div>
        <div class="message-meta">${sender} • ${timestamp}</div>
    `;
    
    messageList.appendChild(messageDiv);
    messageList.scrollTop = messageList.scrollHeight;
}

function addSystemMessage(content) {
    const messageList = document.getElementById('groupMessageList');
    if (!messageList) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item system';
    
    messageDiv.innerHTML = `
        <div>${content}</div>
        <div class="message-meta">System • ${new Date().toLocaleTimeString()}</div>
    `;
    
    messageList.appendChild(messageDiv);
    messageList.scrollTop = messageList.scrollHeight;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function loadGroupMessages(groupId) {
    if (!groupId) return;
    
    innovateAPI.getGroupMessages(groupId, 20, 0)
        .then(response => {
            if (response.success && response.messages) {
                const messageList = document.getElementById('groupMessageList');
                if (messageList) {
                    // Clear existing messages
                    messageList.innerHTML = '';
                    
                    // Add messages from API
                    response.messages.forEach(msg => {
                        const sender = msg.username || 'Unknown User';
                        const timestamp = new Date(msg.created_at).toLocaleTimeString();
                        addMessage(msg.message, sender, timestamp, msg.message_type);
                    });
                }
            }
        })
        .catch(error => {
            console.warn('Failed to load group messages:', error);
        });
}

function storeCurrentGroupId(groupId) {
    localStorage.setItem('currentGroupId', groupId);
}

// Initialize test groups for UA Innovate
function initializeTestGroups() {
    // Clear existing test groups to avoid duplicates
    localStorage.removeItem('allGroups');
    
    const testGroups = [
        {
            group_id: 'test_group_1',
            name: 'FinTech Innovation Lab',
            description: 'Building the next generation of financial technology solutions. Focus on blockchain, digital payments, and AI-driven financial services.',
            focus: 'fintech',
            size_preference: '3-4 members',
            required_skills: 'JavaScript, Python, Blockchain, Financial APIs',
            current_members: 2,
            max_members: 4,
            created_by: 'test_user_1',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_2',
            name: 'Social Impact Analytics',
            description: 'Using data science to solve social problems. Projects include education analytics, healthcare accessibility, and environmental monitoring.',
            focus: 'data-analytics',
            size_preference: '4-5 members',
            required_skills: 'Python, R, SQL, Machine Learning, Statistics',
            current_members: 3,
            max_members: 5,
            created_by: 'test_user_2',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_3',
            name: 'Cybersecurity Defense Team',
            description: 'Developing security solutions and conducting penetration testing. Focus on web security, network protection, and threat analysis.',
            focus: 'cybersecurity',
            size_preference: '3-4 members',
            required_skills: 'C++, Python, Network Security, Ethical Hacking',
            current_members: 1,
            max_members: 4,
            created_by: 'test_user_3',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_4',
            name: 'Full Stack Web Innovators',
            description: 'Creating modern web applications with cutting-edge technologies. Projects include e-commerce platforms, social networks, and productivity tools.',
            focus: 'full-stack-development',
            size_preference: '4-6 members',
            required_skills: 'React, Node.js, MongoDB, AWS, Docker',
            current_members: 4,
            max_members: 6,
            created_by: 'test_user_4',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_5',
            name: 'Community Health App',
            description: 'Building a mobile app to connect community health resources. Focus on accessibility, user experience, and health data privacy.',
            focus: 'social-innovation',
            size_preference: '3-5 members',
            required_skills: 'React Native, Firebase, Healthcare APIs, UI/UX Design',
            current_members: 2,
            max_members: 5,
            created_by: 'test_user_5',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_6',
            name: 'AI-Powered Learning Platform',
            description: 'Developing an intelligent tutoring system that adapts to individual learning styles. Using machine learning and natural language processing.',
            focus: 'prototype-innovation',
            size_preference: '4-5 members',
            required_skills: 'Python, TensorFlow, NLP, Educational Technology',
            current_members: 3,
            max_members: 5,
            created_by: 'test_user_6',
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_7',
            name: 'Sustainable Tech Solutions',
            description: 'Creating technology solutions for environmental sustainability. Projects include energy monitoring, waste reduction, and carbon footprint tracking.',
            focus: 'social-innovation',
            size_preference: '3-4 members',
            required_skills: 'IoT, Arduino, Data Visualization, Environmental Science',
            current_members: 1,
            max_members: 4,
            created_by: 'test_user_7',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_8',
            name: 'Blockchain Supply Chain',
            description: 'Implementing blockchain technology for supply chain transparency and traceability. Focus on logistics, authentication, and smart contracts.',
            focus: 'fintech',
            size_preference: '4-5 members',
            required_skills: 'Solidity, Web3, Supply Chain Management, Smart Contracts',
            current_members: 2,
            max_members: 5,
            created_by: 'test_user_8',
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_9',
            name: 'Data Visualization Studio',
            description: 'Creating interactive dashboards and data stories. Focus on business intelligence, real-time analytics, and user-friendly data presentation.',
            focus: 'data-analytics',
            size_preference: '3-4 members',
            required_skills: 'D3.js, Tableau, Python, Data Storytelling',
            current_members: 2,
            max_members: 4,
            created_by: 'test_user_9',
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_10',
            name: 'Mobile Security Framework',
            description: 'Developing security frameworks for mobile applications. Focus on encryption, secure communication, and vulnerability assessment.',
            focus: 'cybersecurity',
            size_preference: '3-5 members',
            required_skills: 'Android/iOS Development, Cryptography, Security Testing',
            current_members: 3,
            max_members: 5,
            created_by: 'test_user_10',
            created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_11',
            name: 'E-Learning Platform',
            description: 'Building a comprehensive online learning management system. Features include video streaming, quizzes, progress tracking, and collaborative tools.',
            focus: 'full-stack-development',
            size_preference: '5-6 members',
            required_skills: 'Vue.js, Laravel, MySQL, Video Streaming, WebRTC',
            current_members: 4,
            max_members: 6,
            created_by: 'test_user_11',
            created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            group_id: 'test_group_12',
            name: 'Smart City IoT Network',
            description: 'Designing IoT solutions for smart city infrastructure. Projects include traffic management, air quality monitoring, and energy optimization.',
            focus: 'prototype-innovation',
            size_preference: '4-5 members',
            required_skills: 'Arduino, Raspberry Pi, MQTT, Cloud Computing, Sensors',
            current_members: 2,
            max_members: 5,
            created_by: 'test_user_12',
            created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    // Store test groups in localStorage
    localStorage.setItem('allGroups', JSON.stringify(testGroups));
    
    // Create test profiles for the groups
    const testProfiles = [
        {
            userId: 'test_user_1',
            year: 'senior',
            major: 'Management Information Systems',
            misSemester: '6',
            technicalSkills: 'JavaScript, Python, Blockchain, React, Node.js',
            interests: 'Financial technology, cryptocurrency, decentralized applications'
        },
        {
            userId: 'test_user_2',
            year: 'junior',
            major: 'Computer Science',
            technicalSkills: 'Python, R, SQL, Machine Learning, Statistics, Tableau',
            interests: 'Data science, social impact, healthcare analytics'
        },
        {
            userId: 'test_user_3',
            year: 'senior',
            major: 'Cybersecurity',
            technicalSkills: 'C++, Python, Network Security, Ethical Hacking, Linux',
            interests: 'Penetration testing, security research, threat intelligence'
        },
        {
            userId: 'test_user_4',
            year: 'junior',
            major: 'Management Information Systems',
            misSemester: '4',
            technicalSkills: 'React, Node.js, MongoDB, AWS, Docker, TypeScript',
            interests: 'Web development, cloud computing, DevOps'
        },
        {
            userId: 'test_user_5',
            year: 'sophomore',
            major: 'Computer Science',
            technicalSkills: 'React Native, Firebase, UI/UX Design, Swift, Kotlin',
            interests: 'Mobile development, healthcare technology, accessibility'
        },
        {
            userId: 'test_user_6',
            year: 'senior',
            major: 'Management Information Systems',
            misSemester: '8',
            technicalSkills: 'Python, TensorFlow, NLP, Educational Technology, AI/ML',
            interests: 'Artificial intelligence, educational technology, natural language processing'
        },
        {
            userId: 'test_user_7',
            year: 'junior',
            major: 'Environmental Science',
            technicalSkills: 'IoT, Arduino, Data Visualization, Python, Sensors',
            interests: 'Environmental technology, sustainability, green energy'
        },
        {
            userId: 'test_user_8',
            year: 'senior',
            major: 'Management Information Systems',
            misSemester: '7',
            technicalSkills: 'Solidity, Web3, Supply Chain Management, Smart Contracts, Ethereum',
            interests: 'Blockchain technology, supply chain, decentralized finance'
        },
        {
            userId: 'test_user_9',
            year: 'junior',
            major: 'Data Science',
            technicalSkills: 'D3.js, Tableau, Python, Data Storytelling, Statistics',
            interests: 'Data visualization, business intelligence, data journalism'
        },
        {
            userId: 'test_user_10',
            year: 'senior',
            major: 'Cybersecurity',
            technicalSkills: 'Android/iOS Development, Cryptography, Security Testing, Java, Swift',
            interests: 'Mobile security, cryptography, secure communication'
        },
        {
            userId: 'test_user_11',
            year: 'junior',
            major: 'Management Information Systems',
            misSemester: '5',
            technicalSkills: 'Vue.js, Laravel, MySQL, Video Streaming, WebRTC, PHP',
            interests: 'Web development, educational technology, video streaming'
        },
        {
            userId: 'test_user_12',
            year: 'senior',
            major: 'Computer Engineering',
            technicalSkills: 'Arduino, Raspberry Pi, MQTT, Cloud Computing, Sensors, C++',
            interests: 'IoT, smart cities, embedded systems, cloud computing'
        }
    ];
    
    // Store test profiles in localStorage
    const existingProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]');
    const updatedProfiles = [...existingProfiles, ...testProfiles];
    localStorage.setItem('allProfiles', JSON.stringify(updatedProfiles));
    
    console.log('Test groups and profiles initialized for UA Innovate');
}

// Mock API for offline development
class MockAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.isOnline = false; // Set to false to use mock responses
    }

    async request(endpoint, options = {}) {
        if (this.isOnline) {
            // Real API call
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            return response.json();
        } else {
            // Mock response
            return this.getMockResponse(endpoint, options);
        }
    }

    getMockResponse(endpoint, options) {
        const method = options.method || 'GET';
        
        // Mock responses for different endpoints
        if (endpoint === '/groups' && method === 'GET') {
            const groups = JSON.parse(localStorage.getItem('allGroups') || '[]');
            return Promise.resolve({ success: true, groups });
        }
        
        if (endpoint === '/groups' && method === 'POST') {
            const groupData = JSON.parse(options.body || '{}');
            const newGroup = {
                group_id: 'mock_' + Date.now(),
                ...groupData,
                current_members: 1,
                max_members: 4,
                created_at: new Date().toISOString()
            };
            return Promise.resolve({ success: true, groupId: newGroup.group_id, message: 'Group created successfully' });
        }
        
        if (endpoint.startsWith('/users/') && method === 'GET') {
            const userId = endpoint.split('/')[2];
            const profile = JSON.parse(localStorage.getItem('uaInnovateProfile') || '{}');
            return Promise.resolve({ success: true, user: { ...profile, userId } });
        }
        
        if (endpoint.startsWith('/users/') && method === 'PUT') {
            return Promise.resolve({ success: true, message: 'Profile updated successfully' });
        }
        
        if (endpoint.startsWith('/users/') && endpoint.endsWith('/groups') && method === 'GET') {
            const myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
            return Promise.resolve({ success: true, groups: myGroups });
        }
        
        if (endpoint.startsWith('/groups/') && endpoint.endsWith('/join') && method === 'POST') {
            return Promise.resolve({ success: true, message: 'Successfully joined the group' });
        }
        
        if (endpoint.startsWith('/groups/') && endpoint.endsWith('/leave') && method === 'DELETE') {
            return Promise.resolve({ success: true, message: 'Successfully left the group' });
        }
        
        if (endpoint.startsWith('/groups/') && endpoint.endsWith('/messages') && method === 'POST') {
            return Promise.resolve({ success: true, messageId: 'mock_msg_' + Date.now() });
        }
        
        if (endpoint.startsWith('/groups/') && endpoint.endsWith('/messages') && method === 'GET') {
            return Promise.resolve({ success: true, messages: [] });
        }
        
        // Default response
        return Promise.resolve({ success: true, message: 'Mock response' });
    }

    // User methods
    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getUser(userId) {
        return this.request(`/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Group methods
    async createGroup(groupData) {
        return this.request('/groups', {
            method: 'POST',
            body: JSON.stringify(groupData)
        });
    }

    async searchGroups(filters) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/groups?${queryParams}`);
    }

    async getGroup(groupId) {
        return this.request(`/groups/${groupId}`);
    }

    async getUserGroups(userId) {
        return this.request(`/users/${userId}/groups`);
    }

    async joinGroup(groupId, userId) {
        return this.request(`/groups/${groupId}/join`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async leaveGroup(groupId, userId) {
        return this.request(`/groups/${groupId}/leave`, {
            method: 'DELETE',
            body: JSON.stringify({ userId })
        });
    }

    // Messaging methods
    async sendGroupMessage(groupId, userId, message, messageType = 'user') {
        return this.request(`/groups/${groupId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ userId, message, messageType })
        });
    }

    async getGroupMessages(groupId, limit = 50, offset = 0) {
        return this.request(`/groups/${groupId}/messages?limit=${limit}&offset=${offset}`);
    }

    async sendGroupInvite(groupId, inviterId, email) {
        return this.request(`/groups/${groupId}/invites`, {
            method: 'POST',
            body: JSON.stringify({ inviterId, inviteeEmail: email })
        });
    }

    // Connection methods
    async connectWithUser(userId, currentUserId) {
        return Promise.resolve({ success: true, message: 'Connection request sent successfully' });
    }
}

// Initialize mock API
window.mockAPI = new MockAPI();

// Override the existing API to use mock when offline
if (window.innovateAPI) {
    const originalAPI = window.innovateAPI;
    
    // Override methods to use mock API
    window.innovateAPI.request = window.mockAPI.request.bind(window.mockAPI);
    window.innovateAPI.createUser = window.mockAPI.createUser.bind(window.mockAPI);
    window.innovateAPI.getUser = window.mockAPI.getUser.bind(window.mockAPI);
    window.innovateAPI.updateUser = window.mockAPI.updateUser.bind(window.mockAPI);
    window.innovateAPI.createGroup = window.mockAPI.createGroup.bind(window.mockAPI);
    window.innovateAPI.searchGroups = window.mockAPI.searchGroups.bind(window.mockAPI);
    window.innovateAPI.getGroup = window.mockAPI.getGroup.bind(window.mockAPI);
    window.innovateAPI.getUserGroups = window.mockAPI.getUserGroups.bind(window.mockAPI);
    window.innovateAPI.joinGroup = window.mockAPI.joinGroup.bind(window.mockAPI);
    window.innovateAPI.leaveGroup = window.mockAPI.leaveGroup.bind(window.mockAPI);
    window.innovateAPI.sendGroupMessage = window.mockAPI.sendGroupMessage.bind(window.mockAPI);
    window.innovateAPI.getGroupMessages = window.mockAPI.getGroupMessages.bind(window.mockAPI);
    window.innovateAPI.sendGroupInvite = window.mockAPI.sendGroupInvite.bind(window.mockAPI);
    window.innovateAPI.connectWithUser = window.mockAPI.connectWithUser.bind(window.mockAPI);
    
    console.log('Mock API initialized - using offline mode');
}
