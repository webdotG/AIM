const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    noResults: 'No results found',
    clearAll: 'Clear all',
    yes: 'Yes',
    no: 'No',
    select: 'Select',
    add: 'Add',
    remove: 'Remove',
    close: 'Close',
      entryNotFound: 'Entry not found',
  completed: 'Completed',
  overdue: 'Overdue',
  edit: 'Edit',
  delete: 'Delete',
  markIncomplete: 'Mark as incomplete',
  markComplete: 'Mark as complete',
    sortByDate: 'Sort by date',
  sortByType: 'Sort by type',
  sortByContent: 'Sort by content',
  listView: 'List view',
  gridView: 'Grid view',
  clearFilters: 'Clear filters',
  total: 'Total',
    requiredContent: 'Please fill in the entry content',
  requiredDeadline: 'Please specify a deadline for the plan',
  entryCreated: 'Entry created!',
  saving: 'Saving...',
  selectEmotion: 'Select emotion',
  addTagPlaceholder: 'Enter tag and press Enter',
  planDeadlineRequired: 'Plan requires a deadline'
  },

  // Navigation
  navigation: {
    timeline: 'Timeline',
    analytics: 'Analytics',
    settings: 'Settings',
    entries: 'Entries',
    createEntry: 'Create Entry',
    dashboard: 'Dashboard',
    profile: 'Profile'
  },

  // Auth
auth: {
  login: {
    title: 'Login',
    subtitle: 'Sign in to your account',
    label: 'Login',
    placeholder: 'Enter your login',
    submit: 'Log in',
    registerLink: "Don't have an account? Register",
    recoverLink: 'Forgot password?'
  },
  register: {
    title: 'Register',
    subtitle: 'Create a new account',
    label: 'Login',
    placeholder: 'Enter your login',
    submit: 'Register',
    loginLink: 'Already have an account? Log in',
    backupCodeInfo: 'Save this code for password recovery',
    backupCode: 'Backup code'
  },
  recover: {
    title: 'Password recovery',
    subtitle: 'Restore access to your account',
    label: 'Login',
    placeholder: 'Enter your login',
    submit: 'Recover',
    loginLink: 'Remember password? Log in'
  },
  password: {
    label: 'Password',
    placeholder: 'Enter your password'
  },
  confirm_password: {
    label: 'Confirm password',
    placeholder: 'Repeat your password'
  },
  backup_code: {
    label: 'Backup code',
    placeholder: 'Enter backup code'
  },
  register_link: 'Register',
  recover_link: 'Recover password',
  back_to_login: 'Back to login',
  passwords_not_match: 'Passwords do not match',
  registration_success: 'Registration successful',
  logout: 'Log out',
  sessionExpired: 'Session expired'
},

  // Circumstances
  circumstances: {
    title: 'Circumstances',
    weather: {
      title: 'Weather',
      sunny: 'Sunny',
      rainy: 'Rainy',
      snowy: 'Snowy',
      stormy: 'Stormy',
      cloudy: 'Cloudy',
      windy: 'Windy',
      foggy: 'Foggy'
    },
    moonPhase: {
      title: 'Moon Phase',
      new_moon: 'New Moon',
      full_moon: 'Full Moon',
      first_quarter: 'First Quarter',
      last_quarter: 'Last Quarter',
      waxing_crescent: 'Waxing Crescent',
      waning_crescent: 'Waning Crescent',
      waxing_gibbous: 'Waxing Gibbous',
      waning_gibbous: 'Waning Gibbous'
    },
    globalEvents: {
      title: 'Global Events',
      war: 'War',
      pandemic: 'Pandemic',
      elections: 'Elections',
      economic_crisis: 'Economic Crisis',
      earthquake: 'Earthquake',
      flood: 'Flood',
      other: 'Other'
    },
    temperature: 'Temperature',
    notes: 'Notes',
    addCircumstances: 'Add Circumstances',
    noCircumstances: 'No circumstances recorded'
  },

  // Body States
  bodyStates: {
    title: 'Body State',
    healthPoints: 'Health Points',
    energyPoints: 'Energy Points',
    location: 'Location',
    locationName: 'Location Name',
    locationAddress: 'Address',
    coordinates: 'Coordinates',
    addLocation: 'Add Location',
    noLocation: 'No location specified',
    precision: {
      exact: 'Exact',
      approximate: 'Approximate',
      city: 'City',
      country: 'Country'
    }
  },

  // Entries
  entries: {
    types: {
      dream: 'Dream',
      memory: 'Memory',
      thought: 'Thought',
      plan: 'Plan'
    },
    form: {
      title: 'Create entry',
      editTitle: 'Edit entry',
      typeLabel: 'Entry type',
      contentLabel: 'Content',
      contentPlaceholder: 'Describe your thought, dream or memory...',
      dateLabel: 'Event date',
      deadlineLabel: 'Deadline',
      emotionsLabel: 'Emotions',
      peopleLabel: 'People',
      tagsLabel: 'Tags',
      circumstancesLabel: 'Circumstances',
      bodyStateLabel: 'Body State',
      locationLabel: 'Location',
      submit: 'Save',
      cancel: 'Cancel',
      saveDraft: 'Save Draft'
    },
    list: {
      title: 'Entries',
      emptyState: 'You have no entries yet',
      createFirst: 'Create first entry',
      filterByType: 'Filter by type',
      filterByDate: 'Filter by date',
      search: 'Search entries',
      sortBy: 'Sort by',
      sortOptions: {
        newest: 'Newest',
        oldest: 'Oldest',
        updated: 'Last Updated'
      }
    },
    detail: {
      createdAt: 'Created',
      updatedAt: 'Updated',
      emotions: 'Emotions',
      people: 'People',
      tags: 'Tags',
      circumstances: 'Circumstances',
      bodyState: 'Body State',
      relations: 'Relations',
      incomingRelations: 'Incoming relations',
      outgoingRelations: 'Outgoing relations',
      noRelations: 'No relations',
      createRelation: 'Create relation',
      deleteConfirmation: 'Are you sure you want to delete this entry?',
      markAsComplete: 'Mark as Complete',
      markAsIncomplete: 'Mark as Incomplete'
    },
    stats: {
      totalEntries: 'Total Entries',
      dreams: 'Dreams',
      memories: 'Memories',
      thoughts: 'Thoughts',
      plans: 'Plans'
    }
  },

  // Relations
  relations: {
    types: {
      led_to: 'Led to',
      reminded_of: 'Reminded of',
      inspired_by: 'Inspired by',
      caused_by: 'Caused by',
      related_to: 'Related to',
      resulted_in: 'Resulted in'
    },
    modal: {
      title: 'Create relation',
      fromEntry: 'From entry',
      toEntry: 'To entry',
      typeLabel: 'Relation type',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Describe the relation between entries...',
      submit: 'Create',
      cancel: 'Cancel'
    }
  },

  // Emotions
  emotions: {
    categories: {
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral'
    },
    picker: {
      title: 'Select emotions',
      search: 'Search emotions',
      intensity: 'Intensity',
      noEmotions: 'No emotions selected',
      maxEmotions: 'Maximum {max} emotions',
      selectedCount: '{count} selected'
    },
    list: {
      admiration: 'Admiration',
      adoration: 'Adoration',
      aesthetic_appreciation: 'Aesthetic appreciation',
      amusement: 'Amusement',
      anger: 'Anger',
      anxiety: 'Anxiety',
      awe: 'Awe',
      awkwardness: 'Awkwardness',
      boredom: 'Boredom',
      calmness: 'Calmness',
      confusion: 'Confusion',
      craving: 'Craving',
      disgust: 'Disgust',
      empathic_pain: 'Empathic pain',
      entrancement: 'Entrancement',
      excitement: 'Excitement',
      fear: 'Fear',
      horror: 'Horror',
      interest: 'Interest',
      joy: 'Joy',
      nostalgia: 'Nostalgia',
      relief: 'Relief',
      romance: 'Romance',
      sadness: 'Sadness',
      satisfaction: 'Satisfaction',
      sexual_desire: 'Sexual desire',
      surprise: 'Surprise'
    },
    intensityLevels: {
      veryLow: 'Very Low',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      veryHigh: 'Very High'
    }
  },

  // People
  people: {
    categories: {
      family: 'Family',
      friends: 'Friends',
      acquaintances: 'Acquaintances',
      strangers: 'Strangers'
    },
    form: {
      nameLabel: 'Name',
      namePlaceholder: 'Enter name',
      categoryLabel: 'Category',
      relationshipLabel: 'Relationship',
      relationshipPlaceholder: 'Who is this person to you',
      birthDateLabel: 'Birth date',
      bioLabel: 'Biography',
      bioPlaceholder: 'Brief information about the person',
      notesLabel: 'Notes',
      notesPlaceholder: 'Your notes'
    },
    list: {
      title: 'People',
      addPerson: 'Add Person',
      noPeople: 'No people registered'
    }
  },

  // Tags
  tags: {
    title: 'Tags',
    addTag: 'Add Tag',
    newTag: 'New Tag',
    tagPlaceholder: 'Tag name',
    popularTags: 'Popular Tags',
    noTags: 'No tags',
    manageTags: 'Manage Tags'
  },

  // Skills
  skills: {
    title: 'Skills',
    level: 'Level',
    experience: 'Experience',
    xp: 'XP',
    progress: 'Progress',
    category: 'Category',
    description: 'Description',
    createSkill: 'Create Skill',
    editSkill: 'Edit Skill',
    skillName: 'Skill Name',
    currentLevel: 'Current Level',
    xpToNextLevel: 'XP to Next Level',
    practice: 'Practice',
    mastery: 'Mastery',
    categories: {
      social: 'Social',
      intellectual: 'Intellectual',
      physical: 'Physical',
      creative: 'Creative',
      technical: 'Technical',
      other: 'Other'
    },
    progressTypes: {
      practice: 'Practice',
      study: 'Study',
      application: 'Application',
      teaching: 'Teaching'
    }
  },

  // Analytics
  analytics: {
    title: 'Analytics',
    overview: 'Overview',
    trends: 'Trends',
    patterns: 'Patterns',
    correlations: 'Correlations',
    timeline: 'Timeline',
    statistics: 'Statistics',
    filters: {
      dateRange: 'Date Range',
      entryType: 'Entry Type',
      emotions: 'Emotions',
      people: 'People',
      tags: 'Tags'
    },
    charts: {
      entriesByType: 'Entries by Type',
      entriesOverTime: 'Entries Over Time',
      emotionsDistribution: 'Emotions Distribution',
      activityHeatmap: 'Activity Heatmap'
    }
  },

  // Settings
  settings: {
    title: 'Settings',
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto'
    },
    language: {
      title: 'Language',
      ru: 'Русский',
      en: 'English',
      fr: 'Français',
      system: 'System'
    },
    account: {
      title: 'Account',
      profile: 'Profile',
      security: 'Security',
      backup: 'Backup',
      logout: 'Log out',
      deleteAccount: 'Delete Account'
    },
    preferences: {
      title: 'Preferences',
      notifications: 'Notifications',
      privacy: 'Privacy',
      dataManagement: 'Data Management'
    },
    about: {
      title: 'About',
      version: 'Version',
      support: 'Support',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service'
    }
  },

  // Notifications
  notifications: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    entryCreated: 'Entry created',
    entryUpdated: 'Entry updated',
    entryDeleted: 'Entry deleted',
    changesSaved: 'Changes saved',
    loading: 'Loading...'
  },

  // Time & Date
  time: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    customRange: 'Custom Range',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    ago: 'ago',
    close: 'Close'
  },

  // AI Features
  ai: {
    analysis: 'AI Analysis',
    generateImage: 'Generate Image',
    summarize: 'Summarize',
    insights: 'Insights',
    generating: 'Generating...',
    symbols: {
      title: 'Found Symbols',
      archetypes: 'Archetypes',
      metaphors: 'Metaphors',
      patterns: 'Patterns'
    }
  }
};

export default en;