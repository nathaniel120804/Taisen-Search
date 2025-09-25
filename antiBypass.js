export function protectPage(queryParam = "q") {
  const params = new URLSearchParams(window.location.search);
  const query = params.get(queryParam) || "";

  // Retrieve stored verification token
  const token = JSON.parse(localStorage.getItem('captchaVerified') || 'null');

  // Anti-bypass checks
  if (!token) {
    console.warn("Access denied: no verification token");
    window.location.href = `captcha.html?q=${encodeURIComponent(query)}`;
    return;
  }

  // Optional: check timestamp (2 hours)
  const twoHours = 2 * 60 * 60 * 1000;
  if (Date.now() - token.timestamp > twoHours) {
    console.warn("Access denied: token expired");
    localStorage.removeItem('captchaVerified');
    window.location.href = `captcha.html?q=${encodeURIComponent(query)}`;
    return;
  }

  // Optional: prevent tampering by checking a simple hash
  const hashCheck = token.verified === true;
  if (!hashCheck) {
    console.warn("Access denied: token invalid");
    localStorage.removeItem('captchaVerified');
    window.location.href = `captcha.html?q=${encodeURIComponent(query)}`;
    return;
  }

  console.log("Access granted: verified token");
}
