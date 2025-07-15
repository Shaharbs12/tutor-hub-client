document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.querySelector('#todos-table tbody');
  try {
    const response = await fetch('http://localhost:3000/api/todos');
    const todos = await response.json();
    todos.forEach(todo => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${todo.id}</td>
        <td>${todo.title}</td>
        <td><span class="badge ${todo.completed ? 'bg-success' : 'bg-secondary'}">${todo.completed ? 'Yes' : 'No'}</span></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="3" class="text-danger">Failed to load todos</td></tr>`;
  }
}); 