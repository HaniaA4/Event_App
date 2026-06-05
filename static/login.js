function switchTab(tab) {
  document.getElementById('panelLogin').classList.toggle('active',    tab === 'login');
  document.getElementById('panelRegister').classList.toggle('active', tab === 'register');
  document.getElementById('tabLogin').classList.toggle('active',      tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active',   tab === 'register');
}

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

document.getElementById('regPassword').addEventListener('input', function () {
  const pw = this.value;
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const colors = ['', '#ef4444', '#5c7cfa', '#eab308', '#34d399'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong 💪'];

  for (let i = 1; i <= 4; i++) {
    document.getElementById(`sb${i}`).style.background = i <= score ? colors[score] : 'rgba(255,255,255,0.08)';
  }

  const label = document.getElementById('strengthLabel');
  label.textContent = pw.length > 0 ? labels[score] : '';
  label.style.color = colors[score] || 'var(--text-muted)';
});

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent  = text;
  el.className    = `form-msg ${type}`;
  el.style.display = 'block';
}

function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showMsg('loginMsg', '⚠️ Please fill in all fields.', 'error');
    return;
  }

  if (!email.includes('@')) {
    showMsg('loginMsg', '⚠️ Please enter a valid email address.', 'error');
    return;
  }

  showMsg('loginMsg', '✅ Logging you in…', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 1200);
}

function handleRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regPasswordConfirm').value;

  if (!name || !email || !password || !confirm) {
    showMsg('registerMsg', '⚠️ Please fill in all fields.', 'error');
    return;
  }

  if (!email.includes('@')) {
    showMsg('registerMsg', '⚠️ Please enter a valid email address.', 'error');
    return;
  }

  if (password.length < 8) {
    showMsg('registerMsg', '⚠️ Password must be at least 8 characters.', 'error');
    return;
  }

  if (password !== confirm) {
    showMsg('registerMsg', '⚠️ Passwords do not match.', 'error');
    return;
  }

  showMsg('registerMsg', `✅ Account created! Welcome, ${name}!`, 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 1400);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const loginActive = document.getElementById('panelLogin').classList.contains('active');
    if (loginActive) handleLogin();
    else handleRegister();
  }
});
