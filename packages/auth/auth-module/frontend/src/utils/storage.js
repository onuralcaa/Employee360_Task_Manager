export const storage = {
  get(key) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  },

  clear() {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
};