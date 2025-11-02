// Centralized API endpoints configuration
// Update these endpoints in one place to affect all API calls

const API_VERSION = "/api/v1";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_VERSION}/auth/login`,
    REGISTER: `${API_VERSION}/auth/register`,
    REQUEST_RESET: `${API_VERSION}/auth/request-reset`,
    RESET_PASSWORD: `${API_VERSION}/auth/reset-password`,
    REFRESH_TOKEN: `${API_VERSION}/auth/refresh-token`,
  },

  // Listings endpoints
  LISTINGS: {
    BASE: `${API_VERSION}/listings`,
    BY_ID: (id) => `${API_VERSION}/listings/${id}`,
    GET_ALL: `${API_VERSION}/listings`,
  },

  // Upload endpoints
  UPLOADS: {
    BASE: `${API_VERSION}/upload`,
  },

  // Maintenance endpoints
  APPLICATIONS: {
    BASE: `${API_VERSION}/applications`,
    BY_ID: (id) => `${API_VERSION}/applications/${id}`,
  },

  // Lease endpoints
  LEASES: {
    BASE: `${API_VERSION}/leases`,
    BY_ID: (id) => `${API_VERSION}/leases/${id}`,
  },

  // custom lease endpoints
  CUSTOM_LEASES: {
    BASE: `${API_VERSION}/customleases`,
    BY_ID: (id) => `${API_VERSION}/customleases/${id}`,
    BY_LISTING_ID: (listingId) => `${API_VERSION}/customleases/by-listing/${listingId}`,
  },

  // leases invite endpoints
  LEASES_INVITE: {
    BASE: `${API_VERSION}/leases-invite`,
  },

  // Maintenance endpoints
  MAINTENANCE: {
    BASE: `${API_VERSION}/maintenance`,
    BY_ID: (id) => `${API_VERSION}/maintenance/${id}`,
  },

  // User endpoints
  USERS: {
    BASE: `${API_VERSION}/users`,
    BY_ID: (id) => `${API_VERSION}/users/${id}`,
    PROFILE: `${API_VERSION}/users/profile`,
  },
};

export default API_ENDPOINTS;
