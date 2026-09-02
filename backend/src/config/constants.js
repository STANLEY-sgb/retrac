module.exports = {
  ROLES: {
    ADMIN: 'admin',
    CASEWORKER: 'caseworker',
    EMPLOYER: 'employer'
  },
  RISK_LEVELS: {
    STABLE: 'STABLE',
    MONITOR: 'MONITOR',
    AT_RISK: 'AT_RISK',
    CRITICAL: 'CRITICAL'
  },
  RISK_THRESHOLDS: {
    STABLE_MAX: 29,
    MONITOR_MAX: 49,
    AT_RISK_MAX: 74,
    CRITICAL_MIN: 75
  },
  RISK_WEIGHTS: {
    MISSED_CHECKIN: 15,
    REPLY_STRUGGLING: 25,
    CONSECUTIVE_STRUGGLING: 20,
    CONSECUTIVE_MISSED: 20,
    NLP_DISTRESS_SIGNAL: 20,
    RECENT_UNRESOLVED_ALERT: 10
  },
  SMS_RESPONSE_CODES: {
    DOING_WELL: '1',
    STRUGGLING: '2',
    FREE_TEXT: 'FREE_TEXT',
    NONE: 'NONE'
  },
  PAYMENT_STATUSES: {
    PENDING: 'pending',
    INITIATED: 'initiated',
    SUCCESSFUL: 'successful',
    FAILED: 'failed'
  },
  JOB_STATUSES: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    FILLED: 'filled',
    CLOSED: 'closed'
  },
  APPLICATION_STATUSES: {
    MATCHED: 'matched',
    APPLIED: 'applied',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }
};
