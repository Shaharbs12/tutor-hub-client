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
    console.log('Admin login attempt...');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'none';
    
    try {
      console.log('Sending login request...');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      console.log('Login response status:', res.status);
      
      const data = await res.json();
      console.log('Login response data:', data);
      
      if (!res.ok || !data.user || !data.user.isAdmin) {
        console.log('Login failed or user is not admin');
        errorDiv.textContent = 'Invalid credentials or not an admin.';
        errorDiv.style.display = 'block';
        return;
      }
      
      console.log('Login successful, storing token...');
      setToken(data.token);
      console.log('Token stored, redirecting to admin dashboard...');
      redirectTo('admin.html');
    } catch (err) {
      console.error('Login error:', err);
      errorDiv.textContent = 'Login failed.';
      errorDiv.style.display = 'block';
    }
  });
}

// Admin Dashboard Logic
if (window.location.pathname.includes('admin.html')) {
  // Redirect to login if not admin
  async function checkAdmin() {
    console.log('Checking admin status...');
    const token = getToken();
    console.log('Token exists:', !!token);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      window.location.href = 'admin-login.html';
      return;
    }
    
    try {
      // Verify token with a request
      console.log('Verifying token...');
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        console.log('Token verification failed');
        clearToken();
        window.location.href = 'admin-login.html';
        return;
      }
      
      const data = await res.json();
      console.log('User data:', data);
      console.log('Is admin:', data.user?.isAdmin);
      
      if (!data.user || !data.user.isAdmin) {
        console.log('User is not admin, redirecting to login');
        clearToken();
        window.location.href = 'admin-login.html';
        return;
      }
      
      console.log('Admin verification successful, loading users...');
      // If we get here, user is admin, so load the users
      loadUsers();
    } catch (error) {
      console.error('Error checking admin status:', error);
      clearToken();
      window.location.href = 'admin-login.html';
    }
  }
  
  // Load users
  async function loadUsers() {
    try {
      const token = getToken();
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (!res.ok) {
        console.error('Failed to load users');
        return;
      }
      
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
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }
  
  // Wait for DOM to load before checking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAdmin);
  } else {
    checkAdmin();
  }

  // Logout
  document.getElementById('logoutBtn').onclick = function () {
    clearToken();
    redirectTo('admin-login.html');
  };

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