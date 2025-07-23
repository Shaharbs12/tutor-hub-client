document.getElementById('signup-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const city = document.getElementById('city').value;
  const learn = document.getElementById('learn').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('signup-message');

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, city, learn, password })
    });
    if (response.ok) {
      messageDiv.textContent = 'Signup successful! Welcome to Tutor Hub.';
      messageDiv.className = 'text-success mt-3';
      this.reset();
    } else {
      const data = await response.json();
      messageDiv.textContent = data.error || 'Signup failed. Please try again.';
      messageDiv.className = 'text-danger mt-3';
    }
  } catch (err) {
    messageDiv.textContent = 'Signup failed. Please try again.';
    messageDiv.className = 'text-danger mt-3';
  }
}); 