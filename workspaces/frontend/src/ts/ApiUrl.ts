export const getApiUrl = (relativePath = '') => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    const baseUrl = new URL(apiUrl);
    const appendedRelativePath = relativePath !== '' ? `${baseUrl.pathname}/${relativePath}` : relativePath;
    return new URL(appendedRelativePath, apiUrl);
  }
  const prefixedRelativePath = relativePath !== '' ? `/api/${relativePath}` : '/api';
  return new URL(prefixedRelativePath, window.location.href);
};
