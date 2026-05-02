// ── login.js — Login & Register Logic ──

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navbar').innerHTML = buildNavbar('login');
    if (getUser()) {
        window.location.href = 'index.html';
    }
});

// ── SWITCH TABS ────────────────────────────────────────
function switchTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('loginForm').style.display
        = isLogin ? 'block' : 'none';
    document.getElementById('registerForm').style.display
        = isLogin ? 'none' : 'block';
    document.getElementById('tabLogin')
        .classList.toggle('active', isLogin);
    document.getElementById('tabRegister')
        .classList.toggle('active', !isLogin);
    hideAlert();
}

// ── LOGIN ──────────────────────────────────────────────
async function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPassword').value;
    const btn   = document.getElementById('loginBtn');

    // ── Client-side validation ──
    if (!email || !pass) {
        showAlert('Please enter both email and password.', 'error');
        return;
    }

    // ── Show loading state ──
    btn.disabled    = true;
    btn.textContent = 'Logging in...';
    hideAlert();

    try {
        // ── Direct fetch — no wrapper function ──
        // We do it here directly so we can debug every step
        const response = await fetch(
            'http://localhost:8080/api/users/login',
            {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, password: pass })
            }
        );

        // Log to console for debugging
        console.log('Response status:', response.status);

        // Read response body as text
        const text = await response.text();
        console.log('Response body:', text);

        // Parse JSON if possible
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        // ── Handle each status code ──
        if (response.status === 200) {
            // SUCCESS
            saveUser(data);
            showAlert('Login successful! Redirecting...', 'success');

            const isAdminUser =
                data.role === 'ADMIN' ||
                data.role === 'ROLE_ADMIN';

            setTimeout(() => {
                window.location.href =
                    isAdminUser ? 'admin.html' : 'index.html';
            }, 1000);

        } else if (response.status === 401) {
            // WRONG CREDENTIALS
            showAlert(
                'Invalid email or password. Please try again.',
                'error'
            );
            document.getElementById('loginPassword').value = '';
            btn.disabled    = false;
            btn.textContent = 'Login →';

        } else if (response.status === 400) {
            // BAD REQUEST
            const msg = (typeof data === 'string')
                ? data
                : (data.message || data.error || 'Invalid request.');
            showAlert(msg, 'error');
            btn.disabled    = false;
            btn.textContent = 'Login →';

        } else if (response.status === 500) {
            // SERVER ERROR
            showAlert(
                'Server error. Check IntelliJ console for details.',
                'error'
            );
            btn.disabled    = false;
            btn.textContent = 'Login →';

        } else {
            // ANYTHING ELSE
            showAlert(
                `Unexpected response (${response.status}). Try again.`,
                'error'
            );
            btn.disabled    = false;
            btn.textContent = 'Login →';
        }

    } catch (err) {
        // ── Network error — server not reachable ──
        console.error('Network error:', err);
        showAlert(
            'Cannot reach server. Make sure Spring Boot is running on port 8080.',
            'error'
        );
        btn.disabled    = false;
        btn.textContent = 'Login →';
    }
}

// ── REGISTER ───────────────────────────────────────────
async function doRegister() {
    const name  = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass  = document.getElementById('regPassword').value;
    const btn   = document.getElementById('registerBtn');

    if (!name || !email || !pass) {
        showAlert('Please fill in all fields.', 'error');
        return;
    }
    if (pass.length < 6) {
        showAlert('Password must be at least 6 characters.', 'error');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Creating account...';
    hideAlert();

    try {
        const response = await fetch(
            'http://localhost:8080/api/users/register',
            {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ name, email, password: pass })
            }
        );

        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        if (response.status === 201) {
            showAlert(
                'Account created successfully! You can now login.',
                'success'
            );
            // Pre-fill email in login tab
            document.getElementById('loginEmail').value = email;
            setTimeout(() => switchTab('login'), 1500);

        } else if (response.status === 400) {
            const msg = (typeof data === 'string')
                ? data
                : (data.message || data.error || 'Registration failed.');
            showAlert(msg, 'error');

        } else {
            showAlert('Registration failed. Please try again.', 'error');
        }

    } catch (err) {
        console.error('Register error:', err);
        showAlert(
            'Cannot reach server. Make sure Spring Boot is running.',
            'error'
        );
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Create Account →';
    }
}

// ── ALERT HELPERS ──────────────────────────────────────
function showAlert(message, type) {
    const el = document.getElementById('authAlert');
    el.style.display = 'flex';
    el.className = `alert alert-${type}`;
    el.innerHTML = `
        <span>${type === 'error' ? '⚠️' : '✅'}</span>
        <span>${message}</span>`;
}

function hideAlert() {
    const el = document.getElementById('authAlert');
    if (el) el.style.display = 'none';
}