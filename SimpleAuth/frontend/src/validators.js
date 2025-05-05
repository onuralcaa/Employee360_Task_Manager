export const isValidPassword = (password) => {
  if (password.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

export const isValidUsername = (username) => {
  if (username.length < 4) return false;
  // Check that username contains only alphanumeric characters
  return /^[a-zA-Z0-9]+$/.test(username);
};
