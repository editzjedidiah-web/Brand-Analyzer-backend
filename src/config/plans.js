export const PLAN_LIMITS = {
  free: {
    maxRequests: 1,
    allowCompetitors: false,
    allowAnomaly: false
  },
  starter: {
    maxRequests: 10,
    allowCompetitors: true,
    allowAnomaly: false
  },
  pro: {
    maxRequests: 9999,
    allowCompetitors: true,
    allowAnomaly: true
  },
  enterprise: {
    maxRequests: 999999,
    allowCompetitors: true,
    allowAnomaly: true
  }
};

export const PLAN_LIMITS = {
  free: 1,
  starter: 10,
  pro: 9999,
  enterprise: 999999
};

