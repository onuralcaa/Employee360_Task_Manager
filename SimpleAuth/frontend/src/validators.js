export const isValidPassword = (password) => {
  if (password.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

export const isValidUsername = (username, fullName) => {
  if (username.length < 4 || username.length === 1) return false;
  return fullName.includes(username); // adsoyad içinde kullanıcı adı olmalı
};
