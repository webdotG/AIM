const fr = {
  // Common
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    back: 'Retour',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    confirm: 'Confirmer',
    search: 'Rechercher',
    filter: 'Filtrer',
    noResults: 'Aucun résultat trouvé',
    clearAll: 'Tout effacer',
    yes: 'Oui',
    no: 'Non',
    select: 'Sélectionner',
    add: 'Ajouter',
    remove: 'Retirer',
    close: 'Fermer',
      entryNotFound: 'Entrée non trouvée',
  completed: 'Terminé',
  overdue: 'En retard',
  edit: 'Modifier',
  delete: 'Supprimer',
  markIncomplete: 'Marquer comme incomplet',
  markComplete: 'Marquer comme complet',
    sortByDate: 'Trier par date',
  sortByType: 'Trier par type',
  sortByContent: 'Trier par contenu',
  listView: 'Vue liste',
  gridView: 'Vue grille',
  clearFilters: 'Effacer les filtres',
    requiredContent: 'Veuillez remplir le contenu de l\'entrée',
  requiredDeadline: 'Veuillez spécifier une échéance pour le plan',
  entryCreated: 'Entrée créée !',
  saving: 'Enregistrement...',
  selectEmotion: 'Sélectionner une émotion',
  addTagPlaceholder: 'Entrez un tag et appuyez sur Entrée',
  planDeadlineRequired: 'Le plan nécessite une échéance',
    total: 'Total',
  statistics: 'Statistiques',
  completedPlans: 'Plans terminés',
  overduePlans: 'Plans en retard'

  },

  // Navigation
  navigation: {
    timeline: 'Chronologie',
    analytics: 'Analytique',
    settings: 'Paramètres',
    entries: 'Entrées',
    createEntry: 'Créer une entrée',
    dashboard: 'Tableau de bord',
    profile: 'Profil'
  },

  // Auth
auth: {
  login: {
    title: 'Connexion',
    subtitle: 'Connectez-vous à votre compte',
    label: 'Identifiant',
    placeholder: 'Entrez votre identifiant',
    submit: 'Se connecter',
    registerLink: 'Pas de compte ? S\'inscrire',
    recoverLink: 'Mot de passe oublié ?'
  },
  register: {
    title: 'Inscription',
    subtitle: 'Créer un nouveau compte',
    label: 'Identifiant',
    placeholder: 'Entrez votre identifiant',
    submit: 'S\'inscrire',
    loginLink: 'Déjà un compte ? Se connecter',
    backupCodeInfo: 'Conservez ce code pour récupérer votre mot de passe',
    backupCode: 'Code de sauvegarde'
  },
  recover: {
    title: 'Récupération du mot de passe',
    subtitle: 'Récupérer l\'accès à votre compte',
    label: 'Identifiant',
    placeholder: 'Entrez votre identifiant',
    submit: 'Récupérer',
    loginLink: 'Se souvenir du mot de passe ? Se connecter'
  },
  password: {
    label: 'Mot de passe',
    placeholder: 'Entrez votre mot de passe'
  },
  confirm_password: {
    label: 'Confirmer le mot de passe',
    placeholder: 'Répétez votre mot de passe'
  },
  backup_code: {
    label: 'Code de sauvegarde',
    placeholder: 'Entrez le code de sauvegarde'
  },
  register_link: 'S\'inscrire',
  recover_link: 'Récupérer le mot de passe',
  back_to_login: 'Retour à la connexion',
  passwords_not_match: 'Les mots de passe ne correspondent pas',
  registration_success: 'Inscription réussie',
  logout: 'Déconnexion',
  sessionExpired: 'Session expirée'
},

  // Entries
  entries: {
    types: {
      dream: 'Rêve',
      memory: 'Souvenir',
      thought: 'Pensée',
      plan: 'Plan'
    },
    form: {
      title: 'Créer une entrée',
      editTitle: 'Modifier l\'entrée',
      typeLabel: 'Type d\'entrée',
      contentLabel: 'Contenu',
      contentPlaceholder: 'Décrivez votre pensée, rêve ou souvenir...',
      dateLabel: 'Date de l\'événement',
      deadlineLabel: 'Échéance',
      emotionsLabel: 'Émotions',
      peopleLabel: 'Personnes',
      tagsLabel: 'Étiquettes',
      circumstancesLabel: 'Circonstances',
      bodyStateLabel: 'État corporel',
      locationLabel: 'Lieu',
      submit: 'Enregistrer',
      cancel: 'Annuler',
      saveDraft: 'Enregistrer le brouillon'
    },
    list: {
      title: 'Entrées',
      emptyState: 'Vous n\'avez pas encore d\'entrées',
      createFirst: 'Créer la première entrée',
      filterByType: 'Filtrer par type',
      filterByDate: 'Filtrer par date',
      search: 'Rechercher des entrées',
      sortBy: 'Trier par',
          title: 'Chronologie des entrées',
    emptyState: 'Vous n\'avez pas encore d\'entrées',
    createFirst: 'Créer la première entrée',
      sortOptions: {
        newest: 'Plus récent',
        oldest: 'Plus ancien',
        updated: 'Dernière modification'
      }
    },
    detail: {
      createdAt: 'Créé le',
      updatedAt: 'Mis à jour le',
      emotions: 'Émotions',
      people: 'Personnes',
      tags: 'Étiquettes',
      circumstances: 'Circonstances',
      bodyState: 'État corporel',
      relations: 'Relations',
      incomingRelations: 'Relations entrantes',
      outgoingRelations: 'Relations sortantes',
      noRelations: 'Aucune relation',
      createRelation: 'Créer une relation',
      deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer cette entrée ?',
      markAsComplete: 'Marquer comme terminé',
      markAsIncomplete: 'Marquer comme non terminé'
    },
    stats: {
      totalEntries: 'Total des entrées',
      dreams: 'Rêves',
      memories: 'Souvenirs',
      thoughts: 'Pensées',
      plans: 'Plans'
    }
  },

  // Circumstances
  circumstances: {
    title: 'Circonstances',
    weather: {
      title: 'Météo',
      sunny: 'Ensoleillé',
      rainy: 'Pluvieux',
      snowy: 'Neigeux',
      stormy: 'Orageux',
      cloudy: 'Nuageux',
      windy: 'Venteux',
      foggy: 'Brumeux'
    },
    moonPhase: {
      title: 'Phase lunaire',
      new_moon: 'Nouvelle lune',
      full_moon: 'Pleine lune',
      first_quarter: 'Premier quartier',
      last_quarter: 'Dernier quartier',
      waxing_crescent: 'Croissant croissant',
      waning_crescent: 'Croissant décroissant',
      waxing_gibbous: 'Gibbeuse croissante',
      waning_gibbous: 'Gibbeuse décroissante'
    },
    globalEvents: {
      title: 'Événements mondiaux',
      war: 'Guerre',
      pandemic: 'Pandémie',
      elections: 'Élections',
      economic_crisis: 'Crise économique',
      earthquake: 'Tremblement de terre',
      flood: 'Inondation',
      other: 'Autre'
    },
    temperature: 'Température',
    notes: 'Notes',
    addCircumstances: 'Ajouter des circonstances',
    noCircumstances: 'Aucune circonstance enregistrée'
  },

  // Body States
  bodyStates: {
    title: 'État corporel',
    healthPoints: 'Points de vie',
    energyPoints: 'Points d\'énergie',
    location: 'Lieu',
    locationName: 'Nom du lieu',
    locationAddress: 'Adresse',
    coordinates: 'Coordonnées',
    addLocation: 'Ajouter un lieu',
    noLocation: 'Aucun lieu spécifié',
    precision: {
      exact: 'Exact',
      approximate: 'Approximatif',
      city: 'Ville',
      country: 'Pays'
    }
  },

  // Emotions (Extended)
  emotions: {
    categories: {
      positive: 'Positif',
      negative: 'Négatif',
      neutral: 'Neutre'
    },
    picker: {
      title: 'Sélectionner des émotions',
      search: 'Rechercher des émotions',
      intensity: 'Intensité',
      noEmotions: 'Aucune émotion sélectionnée',
      maxEmotions: 'Maximum {max} émotions',
      selectedCount: '{count} sélectionnée(s)'
    },
    list: {
      admiration: 'Admiration',
      adoration: 'Adoration',
      aesthetic_appreciation: 'Appréciation esthétique',
      amusement: 'Amusement',
      anger: 'Colère',
      anxiety: 'Anxiété',
      awe: 'Émerveillement',
      awkwardness: 'Gêne',
      boredom: 'Ennui',
      calmness: 'Calme',
      confusion: 'Confusion',
      craving: 'Envie',
      disgust: 'Dégoût',
      empathic_pain: 'Douleur empathique',
      entrancement: 'Envoûtement',
      excitement: 'Excitation',
      fear: 'Peur',
      horror: 'Horreur',
      interest: 'Intérêt',
      joy: 'Joie',
      nostalgia: 'Nostalgie',
      relief: 'Soulagement',
      romance: 'Romance',
      sadness: 'Tristesse',
      satisfaction: 'Satisfaction',
      sexual_desire: 'Désir sexuel',
      surprise: 'Surprise'
    },
    intensityLevels: {
      veryLow: 'Très faible',
      low: 'Faible',
      medium: 'Moyen',
      high: 'Fort',
      veryHigh: 'Très fort'
    }
  },

  // People
  people: {
    categories: {
      family: 'Famille',
      friends: 'Amis',
      acquaintances: 'Connaissances',
      strangers: 'Étrangers'
    },
    form: {
      nameLabel: 'Nom',
      namePlaceholder: 'Entrer le nom',
      categoryLabel: 'Catégorie',
      relationshipLabel: 'Relation',
      relationshipPlaceholder: 'Qui est cette personne pour vous',
      birthDateLabel: 'Date de naissance',
      bioLabel: 'Biographie',
      bioPlaceholder: 'Brève information sur la personne',
      notesLabel: 'Notes',
      notesPlaceholder: 'Vos notes'
    },
    list: {
      title: 'Personnes',
      addPerson: 'Ajouter une personne',
      noPeople: 'Aucune personne enregistrée'
    }
  },

  // Relations
  relations: {
    types: {
      led_to: 'A mené à',
      reminded_of: 'A rappelé',
      inspired_by: 'Inspiré par',
      caused_by: 'Causé par',
      related_to: 'Lié à',
      resulted_in: 'A abouti à'
    },
    modal: {
      title: 'Créer une relation',
      fromEntry: 'De l\'entrée',
      toEntry: 'À l\'entrée',
      typeLabel: 'Type de relation',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Décrivez la relation entre les entrées...',
      submit: 'Créer',
      cancel: 'Annuler'
    }
  },

  // Tags
  tags: {
    title: 'Étiquettes',
    addTag: 'Ajouter une étiquette',
    newTag: 'Nouvelle étiquette',
    tagPlaceholder: 'Nom de l\'étiquette',
    popularTags: 'Étiquettes populaires',
    noTags: 'Aucune étiquette',
    manageTags: 'Gérer les étiquettes'
  },

  // Skills (RPG System)
  skills: {
    title: 'Compétences',
    level: 'Niveau',
    experience: 'Expérience',
    xp: 'XP',
    progress: 'Progression',
    category: 'Catégorie',
    description: 'Description',
    createSkill: 'Créer une compétence',
    editSkill: 'Modifier la compétence',
    skillName: 'Nom de la compétence',
    currentLevel: 'Niveau actuel',
    xpToNextLevel: 'XP pour le niveau suivant',
    practice: 'Pratique',
    mastery: 'Maîtrise',
    categories: {
      social: 'Social',
      intellectual: 'Intellectuel',
      physical: 'Physique',
      creative: 'Créatif',
      technical: 'Technique',
      other: 'Autre'
    },
    progressTypes: {
      practice: 'Pratique',
      study: 'Étude',
      application: 'Application',
      teaching: 'Enseignement'
    }
  },

  // Analytics
  analytics: {
    title: 'Analytique',
    overview: 'Aperçu',
    trends: 'Tendances',
    patterns: 'Motifs',
    correlations: 'Corrélations',
    timeline: 'Chronologie',
    statistics: 'Statistiques',
    filters: {
      dateRange: 'Plage de dates',
      entryType: 'Type d\'entrée',
      emotions: 'Émotions',
      people: 'Personnes',
      tags: 'Étiquettes'
    },
    charts: {
      entriesByType: 'Entrées par type',
      entriesOverTime: 'Entrées au fil du temps',
      emotionsDistribution: 'Distribution des émotions',
      activityHeatmap: 'Carte de chaleur d\'activité'
    }
  },

  // Settings
  settings: {
    title: 'Paramètres',
    theme: {
      title: 'Thème',
      light: 'Clair',
      dark: 'Sombre',
      auto: 'Auto'
    },
    language: {
      title: 'Langue',
      ru: 'Русский',
      en: 'English',
      fr: 'Français',
      system: 'Système'
    },
    account: {
      title: 'Compte',
      profile: 'Profil',
      security: 'Sécurité',
      backup: 'Sauvegarde',
      logout: 'Déconnexion',
      deleteAccount: 'Supprimer le compte'
    },
    preferences: {
      title: 'Préférences',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      dataManagement: 'Gestion des données'
    },
    about: {
      title: 'À propos',
      version: 'Version',
      support: 'Support',
      privacyPolicy: 'Politique de confidentialité',
      termsOfService: 'Conditions d\'utilisation'
    }
  },

  // Notifications
  notifications: {
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    info: 'Information',
    entryCreated: 'Entrée créée',
    entryUpdated: 'Entrée mise à jour',
    entryDeleted: 'Entrée supprimée',
    changesSaved: 'Modifications enregistrées',
    loading: 'Chargement...'
  },

  // Time & Date
  time: {
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    thisWeek: 'Cette semaine',
    lastWeek: 'La semaine dernière',
    thisMonth: 'Ce mois',
    lastMonth: 'Le mois dernier',
    customRange: 'Plage personnalisée',
    days: 'jours',
    hours: 'heures',
    minutes: 'minutes',
    seconds: 'secondes',
    ago: 'il y a'
  },

  // AI Features
  ai: {
    analysis: 'Analyse IA',
    generateImage: 'Générer une image',
    summarize: 'Résumer',
    insights: 'Idées',
    generating: 'Génération en cours...',
    symbols: {
      title: 'Symboles trouvés',
      archetypes: 'Archétypes',
      metaphors: 'Métaphores',
      patterns: 'Motifs'
    }
  }
};

export default fr;