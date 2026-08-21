window.STABIX_CONFIG = Object.freeze({
  API_BASE_URL: "http://10.148.199.19:3000"
});

window.apiUrl = function(path) {
  return `${window.STABIX_CONFIG.API_BASE_URL}${path}`;
};