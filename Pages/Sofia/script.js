(() => {
  // Dark Mode Functionality
  function toggleDarkMode() {
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
      darkModeIcon.className = 'bi bi-sun-fill';
      darkModeText.textContent = 'Light Mode';
      localStorage.setItem('darkMode', 'enabled');
    } else {
      darkModeIcon.className = 'bi bi-moon-fill';
      darkModeText.textContent = 'Dark Mode';
      localStorage.setItem('darkMode', 'disabled');
    }
  }

  // Initialize dark mode on page load
  function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    
    if (darkMode === 'enabled') {
      body.classList.add('dark-mode');
      darkModeIcon.className = 'bi bi-sun-fill';
      darkModeText.textContent = 'Light Mode';
    } else {
      darkModeIcon.className = 'bi bi-moon-fill';
      darkModeText.textContent = 'Dark Mode';
    }
  }

  // Make toggleDarkMode globally available
  window.toggleDarkMode = toggleDarkMode;

  // Initialize dark mode when DOM is loaded
  document.addEventListener('DOMContentLoaded', initializeDarkMode);

  // Default groups data - Expanded with more variety and availability
  const defaultGroups = [
    { id: 1, name: 'MIS321 Exam Prep', course: 'MIS321', size: '4-6', time: 'evening', location: 'library', focus: 'exam-prep', desc: 'Review sessions and practice exams for the final.', specific: 'Library 3A', members: 4, max: 6, joined: false },
    { id: 2, name: 'CS101 Homework Help', course: 'CS101', size: '2-3', time: 'afternoon', location: 'campus', focus: 'homework-help', desc: 'Weekly problem set support and debugging.', specific: 'Comp Lab B', members: 2, max: 3, joined: false },
    { id: 3, name: 'MATH200 Concepts', course: 'MATH200', size: '7-10', time: 'morning', location: 'campus', focus: 'concept-review', desc: 'Core concepts and proofs review.', specific: 'Math 205', members: 8, max: 10, joined: false },
    { id: 4, name: 'ENG101 Peer Review', course: 'ENG101', size: '4-6', time: 'afternoon', location: 'online', focus: 'homework-help', desc: 'Essay critique and writing tips.', specific: 'Zoom', members: 5, max: 6, joined: false },
    { id: 5, name: 'CHEM101 Study Buddy', course: 'CHEM101', size: '2-3', time: 'evening', location: 'coffee-shop', focus: 'study-buddy', desc: 'Light sessions + flashcards.', specific: 'Starbucks Main', members: 1, max: 3, joined: false },
    { id: 6, name: 'MIS321 Project Team', course: 'MIS321', size: '4-6', time: 'weekend', location: 'study-room', focus: 'project-work', desc: 'Working on the final group project together.', specific: 'Study Room 2B', members: 3, max: 6, joined: false },
    { id: 7, name: 'CS101 Coding Practice', course: 'CS101', size: '2-3', time: 'morning', location: 'campus', focus: 'homework-help', desc: 'Practice coding problems and algorithms.', specific: 'Comp Lab A', members: 1, max: 3, joined: false },
    { id: 8, name: 'MATH200 Problem Solving', course: 'MATH200', size: '4-6', time: 'evening', location: 'library', focus: 'homework-help', desc: 'Tackle challenging problems together.', specific: 'Library 2C', members: 4, max: 6, joined: false },
    { id: 9, name: 'PHYS101 Lab Prep', course: 'PHYS101', size: '2-3', time: 'afternoon', location: 'campus', focus: 'concept-review', desc: 'Prepare for upcoming lab experiments.', specific: 'Physics Lab 101', members: 2, max: 3, joined: false },
    { id: 10, name: 'ENG101 Creative Writing', course: 'ENG101', size: '4-6', time: 'evening', location: 'coffee-shop', focus: 'study-buddy', desc: 'Share creative writing and get feedback.', specific: 'Crimson Cafe', members: 3, max: 6, joined: false },
    { id: 11, name: 'CHEM101 Lab Reports', course: 'CHEM101', size: '2-3', time: 'morning', location: 'campus', focus: 'homework-help', desc: 'Help with lab report writing and analysis.', specific: 'Chem Lab 205', members: 1, max: 3, joined: false },
    { id: 12, name: 'MIS321 Database Design', course: 'MIS321', size: '4-6', time: 'afternoon', location: 'online', focus: 'project-work', desc: 'Database design and implementation help.', specific: 'Microsoft Teams', members: 5, max: 6, joined: false },
    { id: 13, name: 'CS101 Midterm Review', course: 'CS101', size: '7-10', time: 'weekend', location: 'library', focus: 'exam-prep', desc: 'Comprehensive midterm exam preparation.', specific: 'Library 4A', members: 7, max: 10, joined: false },
    { id: 14, name: 'MATH200 Calculus Club', course: 'MATH200', size: '4-6', time: 'morning', location: 'campus', focus: 'concept-review', desc: 'Deep dive into calculus concepts.', specific: 'Math 301', members: 3, max: 6, joined: false },
    { id: 15, name: 'PHYS101 Formula Review', course: 'PHYS101', size: '2-3', time: 'evening', location: 'study-room', focus: 'exam-prep', desc: 'Memorize and understand physics formulas.', specific: 'Study Room 1A', members: 2, max: 3, joined: false },
    { id: 16, name: 'ENG101 Grammar Workshop', course: 'ENG101', size: '4-6', time: 'afternoon', location: 'campus', focus: 'homework-help', desc: 'Improve grammar and writing mechanics.', specific: 'English 105', members: 4, max: 6, joined: false },
    { id: 17, name: 'CHEM101 Organic Chemistry', course: 'CHEM101', size: '2-3', time: 'morning', location: 'library', focus: 'concept-review', desc: 'Focus on organic chemistry reactions.', specific: 'Library 1B', members: 1, max: 3, joined: false },
    { id: 18, name: 'MIS321 System Analysis', course: 'MIS321', size: '4-6', time: 'weekend', location: 'online', focus: 'project-work', desc: 'System analysis and design project.', specific: 'Discord Voice Chat', members: 4, max: 6, joined: false },
    { id: 19, name: 'CS101 Debugging Squad', course: 'CS101', size: '2-3', time: 'evening', location: 'campus', focus: 'homework-help', desc: 'Help each other debug code issues.', specific: 'Comp Lab C', members: 2, max: 3, joined: false },
    { id: 20, name: 'MATH200 Statistics Help', course: 'MATH200', size: '4-6', time: 'afternoon', location: 'coffee-shop', focus: 'homework-help', desc: 'Statistics and probability problem solving.', specific: 'Campus Coffee', members: 3, max: 6, joined: false },
    { id: 21, name: 'MIS321 Final Project', course: 'MIS321', size: '4-6', time: 'morning', location: 'study-room', focus: 'project-work', desc: 'Final project collaboration and development.', specific: 'Study Room 3A', members: 2, max: 6, joined: false },
    { id: 22, name: 'CS101 Algorithm Study', course: 'CS101', size: '2-3', time: 'afternoon', location: 'library', focus: 'concept-review', desc: 'Understanding algorithms and data structures.', specific: 'Library 1C', members: 1, max: 3, joined: false },
    { id: 23, name: 'MATH200 Linear Algebra', course: 'MATH200', size: '4-6', time: 'evening', location: 'campus', focus: 'homework-help', desc: 'Linear algebra problem solving sessions.', specific: 'Math 207', members: 2, max: 6, joined: false },
    { id: 24, name: 'PHYS101 Mechanics Review', course: 'PHYS101', size: '2-3', time: 'morning', location: 'coffee-shop', focus: 'exam-prep', desc: 'Classical mechanics and problem solving.', specific: 'Crimson Cafe', members: 1, max: 3, joined: false },
    { id: 25, name: 'ENG101 Research Methods', course: 'ENG101', size: '4-6', time: 'afternoon', location: 'online', focus: 'homework-help', desc: 'Research paper writing and citation help.', specific: 'Google Meet', members: 3, max: 6, joined: false },
    { id: 26, name: 'CHEM101 Stoichiometry', course: 'CHEM101', size: '2-3', time: 'evening', location: 'campus', focus: 'concept-review', desc: 'Master stoichiometry calculations.', specific: 'Chem Lab 203', members: 1, max: 3, joined: false },
    { id: 27, name: 'MIS321 Web Development', course: 'MIS321', size: '4-6', time: 'weekend', location: 'campus', focus: 'project-work', desc: 'Web development project collaboration.', specific: 'Comp Lab D', members: 2, max: 6, joined: false },
    { id: 28, name: 'CS101 Python Programming', course: 'CS101', size: '7-10', time: 'morning', location: 'library', focus: 'homework-help', desc: 'Python programming and syntax help.', specific: 'Library 2A', members: 4, max: 10, joined: false },
    { id: 29, name: 'MATH200 Differential Equations', course: 'MATH200', size: '4-6', time: 'afternoon', location: 'study-room', focus: 'concept-review', desc: 'Differential equations and applications.', specific: 'Study Room 2C', members: 2, max: 6, joined: false },
    { id: 30, name: 'PHYS101 Thermodynamics', course: 'PHYS101', size: '2-3', time: 'evening', location: 'campus', focus: 'homework-help', desc: 'Thermodynamics laws and problem solving.', specific: 'Physics Lab 103', members: 1, max: 3, joined: false },
    { id: 31, name: 'ENG101 Literature Analysis', course: 'ENG101', size: '4-6', time: 'morning', location: 'coffee-shop', focus: 'study-buddy', desc: 'Analyze literature and discuss themes.', specific: 'Starbucks Campus', members: 2, max: 6, joined: false },
    { id: 32, name: 'CHEM101 Periodic Table', course: 'CHEM101', size: '2-3', time: 'afternoon', location: 'library', focus: 'concept-review', desc: 'Periodic table trends and properties.', specific: 'Library 3B', members: 1, max: 3, joined: false },
    { id: 33, name: 'MIS321 Data Analysis', course: 'MIS321', size: '4-6', time: 'evening', location: 'online', focus: 'project-work', desc: 'Data analysis and visualization projects.', specific: 'Teams Meeting', members: 3, max: 6, joined: false },
    { id: 34, name: 'CS101 Java Basics', course: 'CS101', size: '2-3', time: 'morning', location: 'campus', focus: 'homework-help', desc: 'Java programming fundamentals.', specific: 'Comp Lab E', members: 1, max: 3, joined: false },
    { id: 35, name: 'MATH200 Trigonometry', course: 'MATH200', size: '4-6', time: 'weekend', location: 'coffee-shop', focus: 'concept-review', desc: 'Trigonometric functions and identities.', specific: 'Campus Coffee', members: 2, max: 6, joined: false },
    { id: 36, name: 'PHYS101 Electricity & Magnetism', course: 'PHYS101', size: '2-3', time: 'afternoon', location: 'campus', focus: 'homework-help', desc: 'Electric and magnetic field problems.', specific: 'Physics Lab 201', members: 1, max: 3, joined: false },
    { id: 37, name: 'ENG101 Technical Writing', course: 'ENG101', size: '4-6', time: 'evening', location: 'study-room', focus: 'homework-help', desc: 'Technical writing and documentation.', specific: 'Study Room 1B', members: 2, max: 6, joined: false },
    { id: 38, name: 'CHEM101 Acid-Base Chemistry', course: 'CHEM101', size: '2-3', time: 'morning', location: 'campus', focus: 'concept-review', desc: 'Acid-base reactions and pH calculations.', specific: 'Chem Lab 207', members: 1, max: 3, joined: false },
    { id: 39, name: 'MIS321 Business Analysis', course: 'MIS321', size: '4-6', time: 'afternoon', location: 'library', focus: 'project-work', desc: 'Business process analysis and modeling.', specific: 'Library 4B', members: 2, max: 6, joined: false },
    { id: 40, name: 'CS101 C++ Programming', course: 'CS101', size: '7-10', time: 'evening', location: 'campus', focus: 'homework-help', desc: 'C++ programming and object-oriented concepts.', specific: 'Comp Lab F', members: 3, max: 10, joined: false }
  ];

  // Load groups from localStorage or use default
  let groups;
  const savedGroups = localStorage.getItem('studyGroups');
  if (savedGroups) {
    groups = JSON.parse(savedGroups);
  } else {
    groups = defaultGroups;
    saveGroups(); // Save default groups to localStorage
  }

  const els = {
    course: document.getElementById('sg-course'),
    size: document.getElementById('sg-size'),
    time: document.getElementById('sg-time'),
    location: document.getElementById('sg-location'),
    focus: document.getElementById('sg-focus'),
    search: document.getElementById('sg-search'),
    clear: document.getElementById('sg-clear'),
    list: document.getElementById('sg-list'),
    empty: document.getElementById('sg-empty'),
    count: document.getElementById('sg-count'),
    nameIn: document.getElementById('sg-name'),
    courseIn: document.getElementById('sg-course-input'),
    courseOther: document.getElementById('sg-course-other'),
    sizeIn: document.getElementById('sg-size-input'),
    timeIn: document.getElementById('sg-time-input'),
    locIn: document.getElementById('sg-location-input'),
    locOther: document.getElementById('sg-location-other'),
    focusIn: document.getElementById('sg-focus-input'),
    focusOther: document.getElementById('sg-focus-other'),
    descIn: document.getElementById('sg-desc-input'),
    specIn: document.getElementById('sg-specific-input'),
    save: document.getElementById('sg-save')
  };

  // Save groups to localStorage
  function saveGroups() {
    localStorage.setItem('studyGroups', JSON.stringify(groups));
  }

  attachEvents();
  render(groups);

  function attachEvents() {
    if (els.search) els.search.addEventListener('click', applyFilters);
    if (els.clear) els.clear.addEventListener('click', () => {
      els.course.value = '';
      els.size.value = '';
      els.time.value = '';
      els.location.value = '';
      els.focus.value = '';
      render(groups);
    });
    [els.course, els.size, els.time, els.location, els.focus].forEach(x => x && x.addEventListener('change', applyFilters));
    if (els.save) {
      // Handle form submit so native submit works
      const formEl = document.getElementById('sg-form');
      if (formEl) formEl.addEventListener('submit', (e) => { e.preventDefault(); createGroup(); });
      // Also keep click for safety if needed
      els.save.addEventListener('click', (e) => { e.preventDefault(); createGroup(); });
    }
    
    // Handle "Other" dropdown selections
    if (els.courseIn) els.courseIn.addEventListener('change', () => toggleOtherField('course'));
    if (els.locIn) els.locIn.addEventListener('change', () => toggleOtherField('location'));
    if (els.focusIn) els.focusIn.addEventListener('change', () => toggleOtherField('focus'));
  }

  function applyFilters() {
    const filtered = groups.filter(g =>
      (!els.course.value || g.course === els.course.value) &&
      (!els.size.value || g.size === els.size.value) &&
      (!els.time.value || g.time === els.time.value) &&
      (!els.location.value || g.location === els.location.value) &&
      (!els.focus.value || g.focus === els.focus.value)
    );
    render(filtered);
  }

  function render(items) {
    if (!els.list) return;
    if (!items.length) {
      els.list.innerHTML = '';
      els.count.textContent = '0 groups found';
      els.empty.classList.remove('d-none');
      return;
    }
    els.empty.classList.add('d-none');
    els.count.textContent = `${items.length} group${items.length !== 1 ? 's' : ''} found`;
    els.list.innerHTML = items.map(cardHtml).join('');
    els.list.querySelectorAll('[data-join]').forEach(btn => btn.addEventListener('click', () => showJoinConfirmation(parseInt(btn.dataset.join,10))));
    els.list.querySelectorAll('[data-leave]').forEach(btn => btn.addEventListener('click', () => leaveGroup(parseInt(btn.dataset.leave,10))));
    els.list.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => view(parseInt(btn.dataset.view,10))));
  }

  function cardHtml(g) {
    const availClass = g.members >= g.max ? 'danger' : (g.members >= Math.floor(g.max*0.8) ? 'warning' : 'success');
    const availText = g.members >= g.max ? 'Full' : (g.members >= Math.floor(g.max*0.8) ? 'Almost Full' : 'Open');
    const isJoined = g.joined || false;
    const canJoin = !isJoined && g.members < g.max;
    
    return `
      <div class="card study-card ${isJoined ? 'border-success' : ''}">
        <div class="card-body">
          <div class="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div class="flex-grow-1">
              <h5 class="mb-2">
                <i class="bi bi-people-fill me-2 text-primary"></i>${escapeHtml(g.name)}
                ${isJoined ? '<span class="badge bg-success ms-2"><i class="bi bi-check-circle me-1"></i>Joined</span>' : ''}
              </h5>
              <div class="row text-muted small">
                <div class="col-6 col-md-3 mb-1"><i class="bi bi-book me-1"></i><b>Course:</b> ${g.course}</div>
                <div class="col-6 col-md-3 mb-1"><i class="bi bi-people me-1"></i><b>Size:</b> ${g.size}</div>
                <div class="col-6 col-md-3 mb-1"><i class="bi bi-clock me-1"></i><b>Time:</b> ${timeLabel(g.time)}</div>
                <div class="col-6 col-md-3 mb-1"><i class="bi bi-geo-alt me-1"></i><b>Location:</b> ${locationLabel(g.location)}</div>
                <div class="col-6 col-md-3 mb-1"><i class="bi bi-target me-1"></i><b>Focus:</b> ${focusLabel(g.focus)}</div>
                <div class="col-6 col-md-3 mb-1"><i class="bi bi-person-plus me-1"></i><b>Members:</b> ${g.members}/${g.max}</div>
              </div>
              <p class="mt-2 mb-0">${escapeHtml(g.desc || '')}</p>
              ${g.specific ? `<div class="text-muted small mt-1"><i class="bi bi-geo-alt-fill me-1"></i>${escapeHtml(g.specific)}</div>` : ''}
            </div>
            <div class="text-end">
              <div class="mb-2"><span class="badge bg-${availClass}">${availText}</span></div>
              <div class="d-grid">
                ${canJoin ? 
                  `<button class="btn btn-primary btn-sm" data-join="${g.id}"><i class="bi bi-person-plus me-1"></i>Join</button>` :
                  isJoined ? 
                  `<button class="btn btn-outline-danger btn-sm" data-leave="${g.id}"><i class="bi bi-person-dash me-1"></i>Leave Group</button>` :
                  `<button class="btn btn-secondary btn-sm" disabled><i class="bi bi-x-circle me-1"></i>Group Full</button>`
                }
                <button class="btn btn-outline-secondary btn-sm mt-1" data-view="${g.id}"><i class="bi bi-info-circle me-1"></i>Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function toggleOtherField(type) {
    const fieldMap = {
      'course': { other: 'courseOther', input: 'courseIn' },
      'location': { other: 'locOther', input: 'locIn' },
      'focus': { other: 'focusOther', input: 'focusIn' }
    };
    const otherField = els[fieldMap[type].other];
    const selectField = els[fieldMap[type].input];
    if (selectField.value === 'OTHER') {
      otherField.style.display = 'block';
      otherField.required = true;
    } else {
      otherField.style.display = 'none';
      otherField.required = false;
      otherField.value = '';
    }
  }

  function createGroup(){
    const name = els.nameIn.value.trim();
    const course = els.courseIn.value === 'OTHER' ? els.courseOther.value.trim() : els.courseIn.value;
    const size = els.sizeIn.value;
    const time = els.timeIn.value;
    const location = els.locIn.value === 'OTHER' ? els.locOther.value.trim() : els.locIn.value;
    const focus = els.focusIn.value === 'OTHER' ? els.focusOther.value.trim() : els.focusIn.value;
    const desc = els.descIn.value.trim();
    const specific = els.specIn.value.trim();
    if(!name||!course||!size||!time||!location||!focus) return;
    const max = parseInt(size.split('-')[1] || size.replace('+',''),10) || 10;
    groups.unshift({ id: Date.now(), name, course, size, time, location, focus, desc, specific, members:1, max, joined: true });
    saveGroups(); // Save to localStorage
    
    // Save to shared data service
    if (window.sharedDataService) {
      window.sharedDataService.updateProfileData('studyProfile', {
        course: course,
        preferredTime: time,
        location: location,
        studyStyle: focus
      });
    }

  
    
    document.getElementById('sg-form').reset();

    // Hide all other fields when form resets
    [els.courseOther, els.locOther, els.focusOther].forEach(field => {
      if (field) field.style.display = 'none';
    });
    // Prepare confirmation modal content BEFORE showing
    const createdHtml = `
      <div class="vstack gap-2">
        <div><strong>Group Name:</strong> ${escapeHtml(name)}</div>
        <div><strong>Course:</strong> ${escapeHtml(course)}</div>
        <div><strong>Group Size:</strong> ${escapeHtml(size)} (max ${max})</div>
        <div><strong>Meeting Time:</strong> ${timeLabel(time)}</div>
        <div><strong>Location:</strong> ${locationLabel(location)}</div>
        <div><strong>Focus Type:</strong> ${focusLabel(focus)}</div>
        ${desc ? `<div><strong>Description:</strong> ${escapeHtml(desc)}</div>` : ''}
        ${specific ? `<div><strong>Specific Location:</strong> ${escapeHtml(specific)}</div>` : ''}
      </div>`;
    const createdContentEl = document.getElementById('group-created-content');
    if (createdContentEl) createdContentEl.innerHTML = createdHtml;

    // Clear any active filters and re-render full list so the new group is visible immediately
    if (els.course) els.course.value = '';
    if (els.size) els.size.value = '';
    if (els.time) els.time.value = '';
    if (els.location) els.location.value = '';
    if (els.focus) els.focus.value = '';
    render(groups);

    // Show confirmation modal (robust) and ensure create modal closes
    const createModalEl = document.getElementById('sg-create-modal');
    const createdModalEl = document.getElementById('group-created-modal');


    const showCreated = () => {
      if (!createdModalEl) return;
      const m = (bootstrap.Modal.getInstance(createdModalEl) || (bootstrap.Modal.getOrCreateInstance ? bootstrap.Modal.getOrCreateInstance(createdModalEl) : new bootstrap.Modal(createdModalEl)));
      m.show();
    };
    if (createModalEl) {
      const onHidden = () => {
        createModalEl.removeEventListener('hidden.bs.modal', onHidden);
        showCreated();
      };
      createModalEl.addEventListener('hidden.bs.modal', onHidden, { once: true });
      const createModal = (bootstrap.Modal.getInstance(createModalEl) || (bootstrap.Modal.getOrCreateInstance ? bootstrap.Modal.getOrCreateInstance(createModalEl) : new bootstrap.Modal(createModalEl)));
      createModal.hide();
      // Fallback in case hidden event doesn't fire (edge timing)
      setTimeout(() => {
        if (!createModalEl.classList.contains('show')) {
          showCreated();
        }
      }, 400);
    } else {
      showCreated();
    }

    // Optional toast success
    showAlert(`Successfully created study group "${name}"!`, 'success');
  }

  function showJoinConfirmation(id) {
    const g = groups.find(x => x.id === id);
    if (!g || g.members >= g.max) return;
    
    // Populate group details in modal
    const detailsHtml = `
      <h6 class="mb-2">${escapeHtml(g.name)}</h6>
      <div class="row small">
        <div class="col-6"><strong>Course:</strong> ${g.course}</div>
        <div class="col-6"><strong>Size:</strong> ${g.size}</div>
        <div class="col-6"><strong>Time:</strong> ${timeLabel(g.time)}</div>
        <div class="col-6"><strong>Location:</strong> ${locationLabel(g.location)}</div>
        <div class="col-6"><strong>Focus:</strong> ${focusLabel(g.focus)}</div>
        <div class="col-6"><strong>Members:</strong> ${g.members}/${g.max}</div>
      </div>
      ${g.desc ? `<p class="mt-2 mb-0 small">${escapeHtml(g.desc)}</p>` : ''}
      ${g.specific ? `<div class="mt-1 small text-muted"><i class="bi bi-geo-alt-fill me-1"></i>${escapeHtml(g.specific)}</div>` : ''}
    `;
    
    document.getElementById('join-group-details').innerHTML = detailsHtml;
    
    // Set up confirm button
    const confirmBtn = document.getElementById('confirm-join-btn');
    confirmBtn.onclick = () => {
      joinGroup(id);
      bootstrap.Modal.getInstance(document.getElementById('join-confirm-modal')).hide();
    };
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('join-confirm-modal'));
    modal.show();
  }

  function joinGroup(id) {
    const g = groups.find(x => x.id === id);
    if (!g || g.members >= g.max) return;
    
    g.members++;
    g.joined = true;
    saveGroups();
    applyFilters();
    
    // Show success message
    showAlert(`Successfully joined ${g.name}!`, 'success');
  }

  function leaveGroup(id) {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    
    if (confirm(`Are you sure you want to leave "${g.name}"?`)) {
      g.members = Math.max(0, g.members - 1);
      g.joined = false;
      saveGroups();
      applyFilters();
      
      // Show success message
      showAlert(`You have left ${g.name}.`, 'info');
    }
  }

  function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }
  function view(id){
    const g = groups.find(x=>x.id===id); if(!g) return;
    
    const availClass = g.members >= g.max ? 'danger' : (g.members >= Math.floor(g.max*0.8) ? 'warning' : 'success');
    const availText = g.members >= g.max ? 'Full' : (g.members >= Math.floor(g.max*0.8) ? 'Almost Full' : 'Open');
    const isJoined = g.joined || false;
    
    const detailsHtml = `
      <div class="row">
        <div class="col-12">
          <div class="text-center mb-5">
            <h4 class="mb-3">
              <i class="bi bi-people-fill me-2 text-primary"></i>${escapeHtml(g.name)}
            </h4>
            <div class="d-flex justify-content-center gap-2">
              <span class="badge bg-${availClass} fs-6 px-3 py-2">
                <i class="bi bi-${availClass === 'success' ? 'check-circle' : availClass === 'warning' ? 'exclamation-triangle' : 'x-circle'} me-1"></i>${availText}
              </span>
              ${isJoined ? '<span class="badge bg-success fs-6 px-3 py-2"><i class="bi bi-check-circle me-1"></i>You\'re a member</span>' : ''}
            </div>
          </div>
        </div>
      </div>
      
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card h-100 border-0 shadow-sm" style="background: rgba(158, 27, 50, 0.05);">
            <div class="card-body p-4">
              <h6 class="card-title text-primary mb-4 d-flex align-items-center">
                <i class="bi bi-book-fill me-2 fs-5"></i>Course Information
              </h6>
              <div class="mb-3 d-flex align-items-center">
                <i class="bi bi-mortarboard-fill text-primary me-3 fs-6"></i>
                <div>
                  <strong>Course:</strong><br>
                  <span class="text-muted">${g.course}</span>
                </div>
              </div>
              <div class="mb-3 d-flex align-items-center">
                <i class="bi bi-search text-primary me-3 fs-6"></i>
                <div>
                  <strong>Focus Type:</strong><br>
                  <span class="text-muted">${focusLabel(g.focus)}</span>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="bi bi-people-fill text-primary me-3 fs-6"></i>
                <div>
                  <strong>Group Size:</strong><br>
                  <span class="text-muted">${g.size} (${g.members}/${g.max} members)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card h-100 border-0 shadow-sm" style="background: rgba(158, 27, 50, 0.05);">
            <div class="card-body p-4">
              <h6 class="card-title text-primary mb-4 d-flex align-items-center">
                <i class="bi bi-calendar-event-fill me-2 fs-5"></i>Meeting Details
              </h6>
              <div class="mb-3 d-flex align-items-center">
                <i class="bi bi-clock-fill text-primary me-3 fs-6"></i>
                <div>
                  <strong>Time:</strong><br>
                  <span class="text-muted">${timeLabel(g.time)}</span>
                </div>
              </div>
              <div class="mb-3 d-flex align-items-center">
                <i class="bi bi-geo-alt-fill text-primary me-3 fs-6"></i>
                <div>
                  <strong>Location:</strong><br>
                  <span class="text-muted">${locationLabel(g.location)}</span>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <i class="bi bi-pin-map-fill text-primary me-3 fs-6"></i>
                <div>
                  <strong>Specific Location:</strong><br>
                  <span class="text-muted">${g.specific || 'To be determined'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      ${g.desc ? `
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm" style="background: rgba(158, 27, 50, 0.05);">
              <div class="card-body p-4">
                <h6 class="card-title text-primary mb-4 d-flex align-items-center">
                  <i class="bi bi-chat-text-fill me-2 fs-5"></i>Description
                </h6>
                <div class="d-flex align-items-start">
                  <i class="bi bi-quote text-primary me-3 fs-4 mt-1"></i>
                  <p class="mb-0 lh-lg">${escapeHtml(g.desc)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div class="row">
        <div class="col-12">
          <div class="alert alert-info border-0 shadow-sm">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle-fill me-3 fs-5"></i>
              <div>
                <strong>Need more information?</strong><br>
                <span class="small">Contact the group organizer or join the group to get started!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('group-details-content').innerHTML = detailsHtml;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('group-details-modal'));
    modal.show();
  }
  function timeLabel(t){return({morning:'Morning (8-12)',afternoon:'Afternoon (12-5)',evening:'Evening (5-10)',weekend:'Weekend'})[t]||t}
  function locationLabel(l){return({library:'Library',campus:'Campus Building',online:'Online','coffee-shop':'Coffee Shop','study-room':'Study Room'})[l]||l}
  function focusLabel(f){return({'exam-prep':'Exam Prep','homework-help':'Homework Help','project-work':'Project Work','concept-review':'Concept Review','study-buddy':'Study Buddy'})[f]||f}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]))}
})();