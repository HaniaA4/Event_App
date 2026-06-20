// icons included are plain unicode characters typed directly into the
// strings -- no icon library/CDN involved
// switches between the login tab and the register tab on the auth page
function switchTab(tab) {
  document.getElementById('panelLogin').classList.toggle('active',    tab === 'login');
  document.getElementById('panelRegister').classList.toggle('active', tab === 'register');
  document.getElementById('tabLogin').classList.toggle('active',      tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active',   tab === 'register');
}

// the little eye icon that lets you show/hide your password while typing
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// password strength meter on the register form - just a basic point system,
// +1 for length, +1 for uppercase, +1 for a number, +1 for a symbol
const regPassword = document.getElementById('regPassword');
if (regPassword) {
  regPassword.addEventListener('input', function () {
    const pw = this.value;
    let score = 0;
    if (pw.length >= 8)          score++;
    if (/[A-Z]/.test(pw))        score++;
    if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const colors = ['', '#ef4444', '#5c7cfa', '#eab308', '#34d399'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong 💪'];

  // light up the strength bars (sb1-sb4) up to however many points we scored
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`sb${i}`).style.background = i <= score ? colors[score] : 'rgba(255,255,255,0.08)';
  }

  const label = document.getElementById('strengthLabel');
  label.textContent = pw.length > 0 ? labels[score] : '';
  label.style.color = colors[score] || 'var(--text-muted)';
});
}

// little helper to display an inline error/success message under a form
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent  = text;
  el.className    = `form-msg ${type}`;
  el.style.display = 'block';
}

// quick frontend checks before the form actually submits to the server.
// this is just for instant feedback - the real validation still happens in Flask
function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showMsg('loginMsg', '⚠️ Please fill in all fields.', 'error');
    return false; // false stops the form from submitting
  }

  if (!email.includes('@')) {
    showMsg('loginMsg', '⚠️ Please enter a valid email address.', 'error');
    return false;
  }

  showMsg('loginMsg', '✅ Logging you in…', 'success');
  return true; // Allow form submission
}

function handleRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regPasswordConfirm').value;

  if (!name || !email || !password || !confirm) {
    showMsg('registerMsg', '⚠️ Please fill in all fields.', 'error');
    return false;
  }

  if (!email.includes('@')) {
    showMsg('registerMsg', '⚠️ Please enter a valid email address.', 'error');
    return false;
  }

  if (password.length < 8) {
    showMsg('registerMsg', '⚠️ Password must be at least 8 characters.', 'error');
    return false;
  }

  if (password !== confirm) {
    showMsg('registerMsg', '⚠️ Passwords do not match.', 'error');
    return false;
  }

  showMsg('registerMsg', `✅ Creating account for ${name}...`, 'success');
  return true; // Allow form submission
}

// lets us link directly to the register tab from elsewhere, e.g. login.html#register
if (window.location.hash === '#register') {
  switchTab('register');
}