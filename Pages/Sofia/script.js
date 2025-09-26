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
    }
  }

  // Make toggleDarkMode globally available
  window.toggleDarkMode = toggleDarkMode;

  // Initialize dark mode when DOM is loaded
  document.addEventListener('DOMContentLoaded', initializeDarkMode);

  // Default groups data
  const defaultGroups = [
    { id: 1, name: 'MIS321 Exam Prep', course: 'MIS321', size: '4-6', time: 'evening', location: 'library', focus: 'exam-prep', desc: 'Review sessions and practice exams.', specific: 'Library 3A', members: 4, max: 6, joined: false },
    { id: 2, name: 'CS101 Homework Help', course: 'CS101', size: '2-3', time: 'afternoon', location: 'campus', focus: 'homework-help', desc: 'Weekly problem set support.', specific: 'Comp Lab B', members: 2, max: 3, joined: false },
    { id: 3, name: 'MATH200 Concepts', course: 'MATH200', size: '7-10', time: 'morning', location: 'campus', focus: 'concept-review', desc: 'Core concepts and proofs.', specific: 'Math 205', members: 8, max: 10, joined: false },
    { id: 4, name: 'ENG101 Peer Review', course: 'ENG101', size: '4-6', time: 'afternoon', location: 'online', focus: 'homework-help', desc: 'Essay critique and writing tips.', specific: 'Zoom', members: 5, max: 6, joined: false },
    { id: 5, name: 'CHEM101 Study Buddy', course: 'CHEM101', size: '2-3', time: 'evening', location: 'coffee-shop', focus: 'study-buddy', desc: 'Light sessions + flashcards.', specific: 'Starbucks Main', members: 1, max: 3, joined: false }
  ];

  // Load groups from localStorage or use default
  let groups = JSON.parse(localStorage.getItem('studyGroups')) || defaultGroups;

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
    if (els.save) els.save.addEventListener('click', createGroup);
    
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
    document.getElementById('sg-form').reset();
    // Hide all other fields when form resets
    [els.courseOther, els.locOther, els.focusOther].forEach(field => {
      if (field) field.style.display = 'none';
    });
    bootstrap.Modal.getInstance(document.getElementById('sg-create-modal')).hide();
    applyFilters();
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
    alert(`Group: ${g.name}\nCourse: ${g.course}\nSize: ${g.size}\nTime: ${timeLabel(g.time)}\nLocation: ${locationLabel(g.location)}\nFocus: ${focusLabel(g.focus)}\nMembers: ${g.members}/${g.max}\nWhere: ${g.specific||'TBD'}\n\n${g.desc||''}`);
  }
  function timeLabel(t){return({morning:'Morning (8-12)',afternoon:'Afternoon (12-5)',evening:'Evening (5-10)',weekend:'Weekend'})[t]||t}
  function locationLabel(l){return({library:'Library',campus:'Campus Building',online:'Online','coffee-shop':'Coffee Shop','study-room':'Study Room'})[l]||l}
  function focusLabel(f){return({'exam-prep':'Exam Prep','homework-help':'Homework Help','project-work':'Project Work','concept-review':'Concept Review','study-buddy':'Study Buddy'})[f]||f}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]))}
})();