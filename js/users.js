async function loadUsers() {
  const tableBody = document.querySelector('#users-table tbody');
  tableBody.innerHTML = '';
  try {
    const response = await fetch('http://localhost:3000/api/users');
    const users = await response.json();
    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><button class="btn btn-danger btn-sm delete-user" data-id="${user.id}">Delete</button></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-danger">Failed to load users</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();

  document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      e.target.reset();
      loadUsers();
    } catch (err) {
      alert('Failed to add user');
    }
  });

  document.querySelector('#users-table').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-user')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Delete this user?')) {
        try {
          await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE' });
          loadUsers();
        } catch (err) {
          alert('Failed to delete user');
        }
      }
    }
  });
}); 