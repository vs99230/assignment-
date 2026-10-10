const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

function validateRegister(body = {}) {
  const errors = [];
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (name.length < 2 || name.length > 100) errors.push('name must be 2-100 characters');
  if (!EMAIL_RE.test(email) || email.length > 255) errors.push('a valid email is required');
  if (password.length < 8 || password.length > 72) errors.push('password must be 8-72 characters');

  return { errors, value: { name, email, password } };
}

function validateLogin(body = {}) {
  const errors = [];
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!EMAIL_RE.test(email)) errors.push('a valid email is required');
  if (!password) errors.push('password is required');

  return { errors, value: { email, password } };
}

function validateEnquiry(body = {}) {
  const errors = [];
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const phone = str(body.phone);
  const course_interest = str(body.course_interest);
  const message = str(body.message);

  if (name.length < 2 || name.length > 100) errors.push('name must be 2-100 characters');
  if (!EMAIL_RE.test(email) || email.length > 255) errors.push('a valid email is required');
  if (phone && !/^[+\d][\d\s-]{6,18}$/.test(phone)) errors.push('phone is invalid');
  if (course_interest.length < 2 || course_interest.length > 150) {
    errors.push('course_interest must be 2-150 characters');
  }
  if (message.length > 2000) errors.push('message must be at most 2000 characters');

  return { errors, value: { name, email, phone: phone || null, course_interest, message: message || null } };
}

module.exports = { validateRegister, validateLogin, validateEnquiry };
