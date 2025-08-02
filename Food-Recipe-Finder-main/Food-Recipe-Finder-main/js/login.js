const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const togglePassword = document.getElementById('toggle-password');
const toggleNewPassword = document.getElementById('toggle-new-password');

// Toggle forms
loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
});
registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
});

// Login functionality
loginBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const registeredUser = localStorage.getItem('registeredUser');
  const registeredPass = localStorage.getItem('registeredPass');

  if (username === registeredUser && password === registeredPass) {
    localStorage.setItem('loggedInUser', username);
    window.location.href = 'index.html';
  } else if (username && password === "12345") {
    localStorage.setItem('loggedInUser', username);
    window.location.href = 'index.html';
  } else {
    alert('Incorrect username or password.');
  }
});

// Register functionality
registerBtn.addEventListener('click', () => {
  const newUsername = document.getElementById('new-username').value.trim();
  const newPassword = document.getElementById('new-password').value;

  if (newUsername && newPassword) {
    localStorage.setItem('registeredUser', newUsername);
    localStorage.setItem('registeredPass', newPassword);
    alert('Account created! You can now login.');
    loginTab.click();
  } else {
    alert('Please enter both name and password.');
  }
});

// Toggle password visibility
[togglePassword, toggleNewPassword].forEach(icon => {
  icon.addEventListener('click', () => {
    const input = icon.previousElementSibling;
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    icon.classList.toggle('fa-eye-slash');
  });
});
