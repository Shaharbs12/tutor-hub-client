// Helper: Get/Set JWT in localStorage
function setToken(token) {
  localStorage.setItem('admin_jwt', token);
}
function getToken() {
  return localStorage.getItem('admin_jwt');
}
function clearToken() {
  localStorage.removeItem('admin_jwt');
}

// Helper: Redirect
function redirectTo(page) {
  window.location.href = page;
}

// Admin Login Logic
if (window.location.pathname.includes('admin-login.html')) {
  document.getElementById('adminLoginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'none';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.user || !data.user.isAdmin) {
        errorDiv.textContent = 'Invalid credentials or not an admin.';
        errorDiv.style.display = 'block';
        return;
      }
      setToken(data.token);
      redirectTo('admin.html');
    } catch (err) {
      errorDiv.textContent = 'Login failed.';
      errorDiv.style.display = 'block';
    }
  });
}

// Admin Dashboard Logic
if (window.location.pathname.includes('admin.html')) {
  // Redirect to login if not admin
  async function checkAdmin() {
    const token = getToken();
    if (!token) return redirectTo('admin-login.html');
    // Optionally, verify token with a request
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (!data.user || !data.user.isAdmin) {
      clearToken();
      return redirectTo('admin-login.html');
    }
  }
  checkAdmin();

  // Logout
  document.getElementById('logoutBtn').onclick = function () {
    clearToken();
    redirectTo('admin-login.html');
  };

  // Load users
  async function loadUsers() {
    const token = getToken();
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const users = await res.json();
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.userType}</td>
        <td>${user.isAdmin ? 'Yes' : 'No'}</td>
        <td>${user.isActive ? 'Yes' : 'No'}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${user.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    // Attach event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = openEditModal);
    document.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = deleteUser);
  }
  loadUsers();

  // Edit user modal logic
  let editModal = null;
  function openEditModal(e) {
    const id = e.target.getAttribute('data-id');
    const row = e.target.closest('tr');
    document.getElementById('editUserId').value = id;
    document.getElementById('editEmail').value = row.children[1].textContent;
    document.getElementById('editFirstName').value = row.children[2].textContent;
    document.getElementById('editLastName').value = row.children[3].textContent;
    document.getElementById('editUserType').value = row.children[4].textContent.toLowerCase();
    document.getElementById('editIsAdmin').value = row.children[5].textContent === 'Yes' ? 'true' : 'false';
    document.getElementById('editIsActive').value = row.children[6].textContent === 'Yes' ? 'true' : 'false';
    if (!editModal) {
      editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    }
    editModal.show();
  }

  document.getElementById('editUserForm').onsubmit = async function (e) {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const token = getToken();
    const body = {
      email: document.getElementById('editEmail').value,
      firstName: document.getElementById('editFirstName').value,
      lastName: document.getElementById('editLastName').value,
      userType: document.getElementById('editUserType').value,
      isAdmin: document.getElementById('editIsAdmin').value === 'true',
      isActive: document.getElementById('editIsActive').value === 'true'
    };
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      editModal.hide();
      loadUsers();
    } else {
      alert('Failed to update user.');
    }
  };

  // Delete user
  async function deleteUser(e) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const id = e.target.getAttribute('data-id');
    const token = getToken();
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      loadUsers();
    } else {
      alert('Failed to delete user.');
    }
  }
} 