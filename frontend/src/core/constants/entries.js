export const ENTRY_TYPES = {
  NOTE: 'note',
  MEMORY: 'memory',
  PLAN: 'plan',
  GOAL: 'goal',
  EVENT: 'event'
};

export const ENTRY_TYPE_ICONS = {
  [ENTRY_TYPES.NOTE]: '📝',
  [ENTRY_TYPES.MEMORY]: '🧠',
  [ENTRY_TYPES.PLAN]: '📅',
  [ENTRY_TYPES.GOAL]: '🎯',
  [ENTRY_TYPES.EVENT]: '🎉'
};

export const MAX_CONTENT_LENGTH = 5000;
export const MAX_TAGS = 10;
export const MAX_EMOTIONS = 5;
