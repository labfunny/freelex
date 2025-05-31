const apiBase = 'https://testserv.availableton.io/api/api.php';

// Elements
const sessionsSection = document.getElementById('sessionsSection');
const createSection = document.getElementById('createSection');
const profileSection = document.getElementById('profileSection');
const welcomeSection = document.getElementById('welcomeSection');
const sessionsList = document.getElementById('sessionsList');
const createSessionForm = document.getElementById('createSessionForm');
const createMessage = document.getElementById('createMessage');
const profileContent = document.getElementById('profileContent');
const editSessionIdInput = document.getElementById('editSessionId');
const createOrEditBtn = document.getElementById('createOrEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Auth elements
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const userNameDisplay = document.getElementById('userNameDisplay');
const userMenuButton = document.getElementById('userMenuButton');
const userDropdown = document.getElementById('userDropdown');
const btnLogout = document.getElementById('btnLogout');

// Mobile auth
const mobileAuthButtons = document.getElementById('mobileAuthButtons');
const mobileUserMenu = document.getElementById('mobileUserMenu');
const mobileUserNameDisplay = document.getElementById('mobileUserNameDisplay');
const mobileBtnLogin = document.getElementById('mobileBtnLogin');
const mobileBtnRegister = document.getElementById('mobileBtnRegister');
const mobileBtnLogout = document.getElementById('mobileBtnLogout');

// Modals
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginModalClose = document.getElementById('loginModalClose');
const registerModalClose = document.getElementById('registerModalClose');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Session detail modal
const sessionModal = document.getElementById('sessionModal');
const sessionModalContent = document.getElementById('sessionModalContent');
const sessionModalClose = document.getElementById('sessionModalClose');

// Navigation buttons
const btnSessions = document.getElementById('btnSessions');
const btnCreate = document.getElementById('btnCreate');
const btnProfile = document.getElementById('btnProfile');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileBtnSessions = document.getElementById('mobileBtnSessions');
const mobileBtnCreate = document.getElementById('mobileBtnCreate');
const mobileBtnProfile = document.getElementById('mobileBtnProfile');

// Show section helper
function showSection(section) {
  sessionsSection.classList.add('hidden');
  createSection.classList.add('hidden');
  profileSection.classList.add('hidden');
  welcomeSection.classList.add('hidden');
  section.classList.remove('hidden');
  if (mobileMenu.classList.contains('block')) {
    mobileMenu.classList.remove('block');
    mobileMenu.classList.add('hidden');
  }
}

// Show welcome if not logged in, else sessions
function showInitialSection() {
  if (isLoggedIn()) {
    showSection(sessionsSection);
    loadSessions();
  } else {
    showSection(welcomeSection);
  }
}

// Load sessions from API
async function loadSessions() {
  sessionsList.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">Завантаження сесій...</p>`;
  try {
    const user = getCurrentUser();
    let url = `${apiBase}?action=fetchSessions`;
    if (user) {
      url += `&user_id=${user.id}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      sessionsList.innerHTML = '';
      if (data.joined_sessions && data.joined_sessions.length > 0) {
        data.joined_sessions.forEach((session) => {
          sessionsList.appendChild(createSessionCard(session, true));
        });
      }
      if (data.not_joined_sessions && data.not_joined_sessions.length > 0) {
        data.not_joined_sessions.forEach((session) => {
          sessionsList.appendChild(createSessionCard(session, false));
        });
      }
      if (
        (!data.joined_sessions || data.joined_sessions.length === 0) &&
        (!data.not_joined_sessions || data.not_joined_sessions.length === 0)
      ) {
        sessionsList.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">Сесій не знайдено.</p>`;
      }
      document.querySelectorAll('.joinBtn').forEach((btn) => {
        btn.addEventListener('click', joinSessionHandler);
      });
      document.querySelectorAll('.editBtn').forEach((btn) => {
        btn.addEventListener('click', editSessionHandler);
      });
      document.querySelectorAll('.sessionCard').forEach((card) => {
        card.addEventListener('click', sessionCardClickHandler);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sessionCardClickHandler(e);
          }
        });
      });
    } else if (data.sessions) {
      sessionsList.innerHTML = '';
      data.sessions.forEach((session) => {
        sessionsList.appendChild(createSessionCard(session, false));
      });
    } else {
      sessionsList.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Помилка завантаження сесій.</p>`;
    }
  } catch (error) {
    sessionsList.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Error loading sessions.</p>`;
  }
}

// Create session card element
function createSessionCard(session, joined) {
  const card = document.createElement('article');
  card.className =
    'sessionCard bg-white rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-black';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View details for session titled ${session.title}`);

  const startDate = new Date(session.start_time);
  const endDate = new Date(session.end_time);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const user = getCurrentUser();
  const isCreator = user && user.id === Number(session.creator_id);
  const creatorName = session.creator_name || `User #${session.creator_id}`;

  card.innerHTML = `
    <h3 class="text-2xl font-semibold mb-3 truncate">${session.title}</h3>
    <p class="text-gray-600 mb-5 line-clamp-3 text-lg">${session.description || 'No description provided.'}</p>
    <dl class="text-base text-gray-500 space-y-2 mb-6">
      <div><dt class="inline font-semibold">Start:</dt> <dd class="inline">${startDate.toLocaleString(undefined, options)}</dd></div>
      <div><dt class="inline font-semibold">End:</dt> <dd class="inline">${endDate.toLocaleString(undefined, options)}</dd></div>
      <div><dt class="inline font-semibold">Work:</dt> <dd class="inline">${session.work_minutes} min</dd></div>
      <div><dt class="inline font-semibold">Break:</dt> <dd class="inline">${session.break_minutes} min</dd></div>
      <div><dt class="inline font-semibold">Created By:</dt> <dd class="inline">${creatorName}</dd></div>
      <div><dt class="inline font-semibold">Participant Count:</dt> <dd class="inline">${session.participants?.length || session.participant_count || 0}</dd></div>
    </dl>
    <div class="flex space-x-4 mt-auto flex-col sm:flex-row">
      ${
        joined
          ? `<button class="joinBtn bg-gray-500 text-white py-4 rounded-full font-semibold cursor-not-allowed flex-1 text-lg" disabled>Joined</button>`
          : `<button class="joinBtn bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-900 transition flex-1 text-lg" data-session-id="${session.id}" type="button">Приєднатися</button>`
      }
      ${
        isCreator
          ? `<button class="editBtn bg-blue-600 text-white py-4 rounded-full font-semibold hover:bg-blue-700 transition flex-1 text-lg mt-4 sm:mt-0" data-session-id="${session.id}" type="button">Редагувати</button>`
          : ''
      }
    </div>
  `;
  return card;
}

// Session card click handler
async function sessionCardClickHandler(e) {
  if (e.target.closest('button')) return;

  const card = e.currentTarget;
  let sessionId = null;
  const joinBtn = card.querySelector('.joinBtn[data-session-id]');
  if (joinBtn) {
    sessionId = joinBtn.getAttribute('data-session-id');
  } else {
    const editBtn = card.querySelector('.editBtn[data-session-id]');
    if (editBtn) {
      sessionId = editBtn.getAttribute('data-session-id');
    }
  }
  if (!sessionId) return;
  try {
    const res = await fetch(`${apiBase}?action=session&id=${sessionId}`);
    const data = await res.json();
    if (data.success) {
      showSessionModal(data.session);
    } else {
      alert(data.message || 'Failed to load session details.');
    }
  } catch {
    alert('Error loading session details.');
  }
}

// Show session modal
function showSessionModal(session) {
  const startDate = new Date(session.start_time);
  const endDate = new Date(session.end_time);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const creatorName = session.creator_name || `User #${session.creator_id}`;

  sessionModalContent.innerHTML = `
    <h4 class="text-2xl font-semibold">${session.title}</h4>
    <p class="text-gray-700 whitespace-pre-wrap text-lg">${session.description || 'No description provided.'}</p>
    <dl class="text-base text-gray-600 space-y-2 mt-6">
      <div><dt class="inline font-semibold">Start Time:</dt> <dd class="inline">${startDate.toLocaleString(undefined, options)}</dd></div>
      <div><dt class="inline font-semibold">End Time:</dt> <dd class="inline">${endDate.toLocaleString(undefined, options)}</dd></div>
      <div><dt class="inline font-semibold">Work Minutes:</dt> <dd class="inline">${session.work_minutes} min</dd></div>
      <div><dt class="inline font-semibold">Break Minutes:</dt> <dd class="inline">${session.break_minutes} min</dd></div>
      <div><dt class="inline font-semibold">Created By:</dt> <dd class="inline">${creatorName}</dd></div>
      <div><dt class="inline font-semibold">Participant Count:</dt> <dd class="inline">${session.participants?.length || session.participant_count || 0}</dd></div>
    </dl>
  `;
  sessionModal.classList.remove('hidden');
  sessionModal.classList.add('flex');
  sessionModal.querySelector('button').focus();
}

// Join session handler
async function joinSessionHandler(e) {
  e.stopPropagation();
  if (!isLoggedIn()) {
    alert('Please login to join a session.');
    openLoginModal();
    return;
  }
  const sessionId = e.target.getAttribute('data-session-id');
  const userId = getCurrentUser().id;
  try {
    const res = await fetch(`${apiBase}?action=joinsession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, user_id: userId }),
    });
    const data = await res.json();
    if (data.success) {
      alert('You have successfully joined the session!');
      loadSessions();
    } else {
      alert(data.message || 'Failed to join session.');
    }
  } catch {
    alert('Error joining session.');
  }
}

// Edit session handler
async function editSessionHandler(e) {
  e.stopPropagation();
  if (!isLoggedIn()) {
    alert('Please login to edit a session.');
    openLoginModal();
    return;
  }
  const sessionId = e.target.getAttribute('data-session-id');
  try {
    const res = await fetch(`${apiBase}?action=session&id=${sessionId}`);
    const data = await res.json();
    if (data.success) {
      const session = data.session;
      const user = getCurrentUser();
      if (user.id !== Number(session.creator_id)) {
        alert('You do not have permission to edit this session.');
        return;
      }
      editSessionIdInput.value = session.id;
      createSessionForm.title.value = session.title;
      createSessionForm.description.value = session.description || '';
      createSessionForm.start_time.value = session.start_time.slice(0, 16);
      createSessionForm.end_time.value = session.end_time.slice(0, 16);
      createSessionForm.work_minutes.value = session.work_minutes;
      createSessionForm.break_minutes.value = session.break_minutes;
      createOrEditBtn.textContent = 'Save Changes';
      cancelEditBtn.classList.remove('hidden');
      showSection(createSection);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(data.message || 'Failed to load session for editing.');
    }
  } catch {
    alert('Error loading session for editing.');
  }
}

// Authentication state management
function saveUser(user) {
  localStorage.setItem('pomodoroUser', JSON.stringify(user));
}

function getCurrentUser() {
  const user = localStorage.getItem('pomodoroUser');
  return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function logout() {
  localStorage.removeItem('pomodoroUser');
  updateAuthUI();
  showInitialSection();
}

// Update UI based on auth state
function updateAuthUI() {
  const user = getCurrentUser();
  if (user) {
    authButtons.classList.add('hidden');
    userMenu.classList.remove('hidden');
    userNameDisplay.textContent = user.name;
    mobileAuthButtons.classList.add('hidden');
    mobileUserMenu.classList.remove('hidden');
    mobileUserNameDisplay.textContent = user.name;
  } else {
    authButtons.classList.remove('hidden');
    userMenu.classList.add('hidden');
    userNameDisplay.textContent = '';
    mobileAuthButtons.classList.remove('hidden');
    mobileUserMenu.classList.add('hidden');
    mobileUserNameDisplay.textContent = '';
  }
}

// Modal functions
function openLoginModal() {
  loginError.textContent = '';
  loginForm.reset();
  loginModal.classList.remove('hidden');
  loginModal.classList.add('flex');
  loginModal.querySelector('input').focus();
}

function closeLoginModal() {
  loginModal.classList.add('hidden');
  loginModal.classList.remove('flex');
}

function openRegisterModal() {
  registerError.textContent = '';
  registerForm.reset();
  registerModal.classList.remove('hidden');
  registerModal.classList.add('flex');
  registerModal.querySelector('input').focus();
}

function closeRegisterModal() {
  registerModal.classList.add('hidden');
  registerModal.classList.remove('flex');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Modal close buttons
  sessionModalClose.addEventListener('click', () => {
    sessionModal.classList.add('hidden');
    sessionModal.classList.remove('flex');
    sessionModalContent.innerHTML = '';
  });

  loginModalClose.addEventListener('click', closeLoginModal);
  registerModalClose.addEventListener('click', closeRegisterModal);

  // Modal outside clicks
  sessionModal.addEventListener('click', (e) => {
    if (e.target === sessionModal) {
      sessionModal.classList.add('hidden');
      sessionModal.classList.remove('flex');
      sessionModalContent.innerHTML = '';
    }
  });

  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLoginModal();
  });

  registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) closeRegisterModal();
  });

  // Navigation buttons
  btnSessions.addEventListener('click', () => {
    showSection(sessionsSection);
    loadSessions();
  });

  btnCreate.addEventListener('click', () => {
    if (!isLoggedIn()) {
      alert('Please login to create a session.');
      openLoginModal();
      return;
    }
    resetCreateForm();
    showSection(createSection);
  });

  btnProfile.addEventListener('click', () => {
    if (!isLoggedIn()) {
      alert('Please login to view your profile.');
      openLoginModal();
      return;
    }
    showSection(profileSection);
    loadProfile();
  });

  // Mobile navigation
  mobileBtnSessions.addEventListener('click', () => {
    showSection(sessionsSection);
    loadSessions();
  });

  mobileBtnCreate.addEventListener('click', () => {
    if (!isLoggedIn()) {
      alert('Please login to create a session.');
      openLoginModal();
      return;
    }
    resetCreateForm();
    showSection(createSection);
  });

  mobileBtnProfile.addEventListener('click', () => {
    if (!isLoggedIn()) {
      alert('Please login to view your profile.');
      openLoginModal();
      return;
    }
    showSection(profileSection);
    loadProfile();
  });

  mobileMenuBtn.addEventListener('click', () => {
    if (mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('block');
    } else {
      mobileMenu.classList.remove('block');
      mobileMenu.classList.add('hidden');
    }
  });

  // Auth buttons
  btnLogin.addEventListener('click', openLoginModal);
  btnRegister.addEventListener('click', openRegisterModal);
  mobileBtnLogin.addEventListener('click', () => {
    openLoginModal();
    if (mobileMenu.classList.contains('block')) {
      mobileMenu.classList.remove('block');
      mobileMenu.classList.add('hidden');
    }
  });

  mobileBtnRegister.addEventListener('click', () => {
    openRegisterModal();
    if (mobileMenu.classList.contains('block')) {
      mobileMenu.classList.remove('block');
      mobileMenu.classList.add('hidden');
    }
  });

  // Welcome buttons
  document.getElementById('welcomeLoginBtn').addEventListener('click', openLoginModal);
  document.getElementById('welcomeRegisterBtn').addEventListener('click', openRegisterModal);

  // User menu
  userMenuButton.addEventListener('click', () => {
    const expanded = userMenuButton.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      userDropdown.classList.add('hidden');
      userMenuButton.setAttribute('aria-expanded', 'false');
    } else {
      userDropdown.classList.remove('hidden');
      userMenuButton.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userDropdown.classList.add('hidden');
      userMenuButton.setAttribute('aria-expanded', 'false');
    }
  });

  // Logout buttons
  btnLogout.addEventListener('click', logout);
  mobileBtnLogout.addEventListener('click', () => {
    logout();
    if (mobileMenu.classList.contains('block')) {
      mobileMenu.classList.remove('block');
      mobileMenu.classList.add('hidden');
    }
  });

  // Form submissions
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = loginForm.loginEmail.value.trim();
    const password = loginForm.loginPassword.value;
    if (!email || !password) {
      loginError.textContent = 'Please fill in all fields.';
      return;
    }
    try {
      const res = await fetch(`${apiBase}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        saveUser(data.user);
        updateAuthUI();
        closeLoginModal();
        alert(`Welcome back, ${data.user.name}!`);
        showSection(sessionsSection);
        loadSessions();
      } else {
        loginError.textContent = data.message || 'Login failed.';
      }
    } catch {
      loginError.textContent = 'Error during login.';
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    const name = registerForm.registerName.value.trim();
    const email = registerForm.registerEmail.value.trim();
    const password = registerForm.registerPassword.value;
    if (!name || !email || !password) {
      registerError.textContent = 'Please fill in all fields.';
      return;
    }
    if (password.length < 6) {
      registerError.textContent = 'Password must be at least 6 characters.';
      return;
    }
    try {
      const res = await fetch(`${apiBase}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Registration successful! You can now log in.');
        closeRegisterModal();
        openLoginModal();
      } else {
        registerError.textContent = data.message || 'Registration failed.';
      }
    } catch {
      registerError.textContent = 'Error during registration.';
    }
  });

  createSessionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    createMessage.textContent = '';
    if (!isLoggedIn()) {
      createMessage.textContent = 'You must be logged in to create or edit a session.';
      createMessage.className = 'text-red-600 text-center font-semibold mt-6';
      openLoginModal();
      return;
    }
    const formData = new FormData(createSessionForm);
    const sessionId = editSessionIdInput.value;
    const payload = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
      work_minutes: Number(formData.get('work_minutes')),
      break_minutes: Number(formData.get('break_minutes')),
      creator_id: getCurrentUser().id,
    };

    if (new Date(payload.start_time) >= new Date(payload.end_time)) {
      createMessage.textContent = 'End time must be after start time.';
      createMessage.className = 'text-red-600 text-center font-semibold mt-6';
      return;
    }

    try {
      let res, data;
      if (sessionId) {
        payload.session_id = sessionId;
        res = await fetch(`${apiBase}?action=editSession`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (data.success) {
          createMessage.textContent = 'Session updated successfully!';
          createMessage.className = 'text-green-600 text-center font-semibold mt-6';
          resetCreateForm();
          showSection(sessionsSection);
          loadSessions();
        } else {
          createMessage.textContent = data.message || 'Failed to update session.';
          createMessage.className = 'text-red-600 text-center font-semibold mt-6';
        }
      } else {
        res = await fetch(`${apiBase}?action=createsession`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (data.success) {
          createMessage.textContent = 'Session created successfully!';
          createMessage.className = 'text-green-600 text-center font-semibold mt-6';
          createSessionForm.reset();
          loadSessions();
          showSection(sessionsSection);
        } else {
          createMessage.textContent = data.message || 'Failed to create session.';
          createMessage.className = 'text-red-600 text-center font-semibold mt-6';
        }
      }
    } catch {
      createMessage.textContent = 'Error creating or updating session.';
      createMessage.className = 'text-red-600 text-center font-semibold mt-6';
    }
  });

  // Cancel edit button
  cancelEditBtn.addEventListener('click', () => {
    resetCreateForm();
    showSection(sessionsSection);
    loadSessions();
  });

  // Initial load
  updateAuthUI();
  showInitialSection();
}); 