const ru = {
  // relations: {
  //   "types": {
  //     "led_to": "Привело к",
  //     "reminded_of": "Напомнило о",
  //     "inspired_by": "Вдохновлено",
  //     "caused_by": "Вызвано",
  //     "related_to": "Связано с",
  //     "resulted_in": "Привело к результату"
  //   },
  //   "descriptions": {
  //     "led_to": "Эта запись привела к другой записи",
  //     "reminded_of": "Напоминает о другой записи",
  //     "inspired_by": "Было вдохновлено другой записью",
  //     "caused_by": "Было вызвано другой записью",
  //     "related_to": "Связана с другой записью",
  //     "resulted_in": "Привела к другой записи"
  //   },
  //   "picker": {
  //     "title": "Добавить связи",
  //     "open": "Связать с другими записями",
  //     "selectType": "Как это связано?",
  //     "typeHelp": "Выберите тип связи",
  //     "searchEntry": "Найти запись",
  //     "searchPlaceholder": "Поиск по содержанию или дате...",
  //     "searchHint": "Начните вводить для поиска ваших записей",
  //     "noResults": "Записей не найдено",
  //     "addDescription": "Добавить описание",
  //     "descriptionLabel": "Описание (необязательно)",
  //     "descriptionPlaceholder": "Почему это связано? (необязательно)",
  //     "addRelation": "Добавить связь",
  //     "skipDescription": "Пропустить описание",
  //     "selected": "Выбрано: {count} / {max}"
  //   },
  //   "graph": {
  //     "title": "Граф связей",
  //     "noData": "Нет связей для визуализации"
  //   }
  // },
  // "entries": {
  //   "form": {
  //     "relationsLabel": "Связи"
  //   }
  // },

  // Common
  common: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    back: 'Назад',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    confirm: 'Подтвердить',
    search: 'Поиск',
    filter: 'Фильтр',
    noResults: 'Ничего не найдено',
    clearAll: 'Очистить всё',
    yes: 'Да',
    no: 'Нет',
    select: 'Выбрать',
    add: 'Добавить',
    remove: 'Убрать',
    close: 'Закрыть',
      entryNotFound: 'Запись не найдена',
  completed: 'Выполнено',
  overdue: 'Просрочено',
  edit: 'Редактировать',
  delete: 'Удалить',
  markIncomplete: 'Отметить невыполненным',
  markComplete: 'Отметить выполненным',
    sortByDate: 'Сортировать по дате',
  sortByType: 'Сортировать по типу',
  sortByContent: 'Сортировать по содержанию',
  listView: 'Вид списком',
  gridView: 'Вид сеткой',
  clearFilters: 'Очистить фильтры',
  total: 'Всего',
    requiredContent: 'Заполните содержание записи',
  requiredDeadline: 'Укажите дедлайн для плана',
  entryCreated: 'Запись создана!',
  saving: 'Сохранение...',
  selectEmotion: 'Выберите эмоцию',
  addTagPlaceholder: 'Введите тег и нажмите Enter',
  planDeadlineRequired: 'Для плана требуется указать дедлайн',
    somethingWentWrong: 'Что-то пошло не так',
  reload: 'Перезагрузить',
  goHome: 'На главную',
  entriesCount: 'Записей: {count}', 
      menu: 'Меню',
    statistics: 'Статистика',
    requiredContent: 'Введите текст записи',
    requiredDeadline: 'Укажите дедлайн для плана',
    entryCreated: 'Запись создана успешно',
    saving: 'Сохранение',
    planDeadlineRequired: 'Для плана необходимо указать дедлайн'
  },

  // Navigation
  navigation: {
    timeline: 'Хронология',
    analytics: 'Аналитика',
    settings: 'Настройки',
    entries: 'Записи',
    createEntry: 'Создать запись',
    dashboard: 'Панель управления',
    profile: 'Профиль',
    home: 'Главная'
  },

  // Auth
 // В секции auth исправляем:
auth: {
  login: {
    title: 'Вход',
    subtitle: 'Вход в аккаунт',
    label: 'Логин',
    placeholder: 'Введите логин',
    submit: 'Войти',
    registerLink: 'Нет аккаунта? Зарегистрироваться',
    recoverLink: 'Забыли пароль?'
  },
  register: {
    title: 'Регистрация',
    subtitle: 'Создание нового аккаунта',
    label: 'Логин',
    placeholder: 'Введите логин',
    submit: 'Зарегистрироваться',
    loginLink: 'Уже есть аккаунт? Войти',
    backupCodeInfo: 'Сохраните этот код для восстановления пароля',
    backupCode: 'Backup-код'
  },
  recover: {
    title: 'Восстановление пароля',
    subtitle: 'Восстановление доступа к аккаунту',
    label: 'Логин',
    placeholder: 'Введите логин',
    submit: 'Восстановить',
    loginLink: 'Вспомнили пароль? Войти'
  },
  // Общие поля для всех форм
  password: {
    label: 'Пароль',
    placeholder: 'Введите пароль'
  },
  confirm_password: {
    label: 'Повторите пароль',
    placeholder: 'Повторите пароль'
  },
  backup_code: {
    label: 'Backup-код',
    placeholder: 'Введите backup-код'
  },
  // Ссылки
  register_link: 'Зарегистрироваться',
  recover_link: 'Восстановить пароль',
  back_to_login: 'Вернуться к входу',
  // Сообщения
  passwords_not_match: 'Пароли не совпадают',
  registration_success: 'Регистрация успешна',
  logout: 'Выйти',
  sessionExpired: 'Сессия истекла'
},

  // Circumstances
  circumstances: {
    title: 'Обстоятельства',
    weather: {
      title: 'Погода',
      sunny: 'Солнечно',
      rainy: 'Дождь',
      snowy: 'Снег',
      stormy: 'Гроза',
      cloudy: 'Облачно',
      windy: 'Ветрено',
      foggy: 'Туман'
    },
    moonPhase: {
      title: 'Фаза луны',
      new_moon: 'Новолуние',
      full_moon: 'Полнолуние',
      first_quarter: 'Первая четверть',
      last_quarter: 'Последняя четверть',
      waxing_crescent: 'Растущий серп',
      waning_crescent: 'Стареющий серп',
      waxing_gibbous: 'Растущая луна',
      waning_gibbous: 'Убывающая луна'
    },
    globalEvents: {
      title: 'Глобальные события',
      war: 'Война',
      pandemic: 'Пандемия',
      elections: 'Выборы',
      economic_crisis: 'Экономический кризис',
      earthquake: 'Землетрясение',
      flood: 'Наводнение',
      other: 'Другое'
    },
    temperature: 'Температура',
    notes: 'Заметки',
    addCircumstances: 'Добавить обстоятельства',
    noCircumstances: 'Нет записанных обстоятельств'
  },

  // Body States
  bodyStates: {
    title: 'Состояние тела',
    healthPoints: 'Очки здоровья',
    energyPoints: 'Очки энергии',
    location: 'Местоположение',
    locationName: 'Название места',
    locationAddress: 'Адрес',
    coordinates: 'Координаты',
    addLocation: 'Добавить место',
    noLocation: 'Место не указано',
    precision: {
      exact: 'Точное',
      approximate: 'Приблизительное',
      city: 'Город',
      country: 'Страна'
    }
  },

  // Entries
  entries: {
    types: {
      dream: 'Сон',
      memory: 'Воспоминание',
      thought: 'Мысль',
      plan: 'План'
    },
    form: {
      title: 'Создать запись',
      editTitle: 'Редактировать запись',
      typeLabel: 'Тип записи',
      contentLabel: 'Содержание',
      contentPlaceholder: 'Опишите свою мысль, сон или воспоминание...',
      dateLabel: 'Дата события',
      deadlineLabel: 'Дедлайн',
      emotionsLabel: 'Эмоции',
      peopleLabel: 'Люди',
      tagsLabel: 'Теги',
      circumstancesLabel: 'Обстоятельства',
      bodyStateLabel: 'Состояние тела',
      locationLabel: 'Местоположение',
      submit: 'Сохранить',
      cancel: 'Отмена',
      saveDraft: 'Сохранить черновик'
    },
    list: {
      title: 'Записи',
      emptyState: 'У вас пока нет записей',
      createFirst: 'Создать первую запись',
      filterByType: 'Фильтр по типу',
      filterByDate: 'Фильтр по дате',
      search: 'Поиск по записям',
      sortBy: 'Сортировать по',
      sortOptions: {
        newest: 'Новейшие',
        oldest: 'Старейшие',
        updated: 'Последнее обновление'
      }
    },
    detail: {
      createdAt: 'Создано',
      updatedAt: 'Обновлено',
      emotions: 'Эмоции',
      people: 'Люди',
      tags: 'Теги',
      circumstances: 'Обстоятельства',
      bodyState: 'Состояние тела',
      relations: 'Связи',
      incomingRelations: 'Входящие связи',
      outgoingRelations: 'Исходящие связи',
      noRelations: 'Нет связей',
      createRelation: 'Создать связь',
      deleteConfirmation: 'Вы уверены, что хотите удалить эту запись?',
      markAsComplete: 'Отметить как завершённое',
      markAsIncomplete: 'Отметить как незавершённое'
    },
    stats: {
      totalEntries: 'Всего записей',
      dreams: 'Сны',
      memories: 'Воспоминания',
      thoughts: 'Мысли',
      plans: 'Планы'
    }
  },

  // Relations
  relations: {
    types: {
      led_to: 'Привело к',
      reminded_of: 'Напомнило о',
      inspired_by: 'Вдохновлено',
      caused_by: 'Вызвано',
      related_to: 'Связано с',
      resulted_in: 'Привело к результату'
    },
    modal: {
      title: 'Создать связь',
      fromEntry: 'От записи',
      toEntry: 'К записи',
      typeLabel: 'Тип связи',
      descriptionLabel: 'Описание',
      descriptionPlaceholder: 'Опишите связь между записями...',
      submit: 'Создать',
      cancel: 'Отмена'
    }
  },

  // Emotions
  emotions: {
    categories: {
      positive: 'Позитивные',
      negative: 'Негативные',
      neutral: 'Нейтральные'
    },
    picker: {
      title: 'Выберите эмоции',
      search: 'Поиск эмоций',
      intensity: 'Интенсивность',
      noEmotions: 'Эмоции не выбраны',
      maxEmotions: 'Максимум {max} эмоций',
      selectedCount: '{count} выбрано'
    },
    list: {
      admiration: 'Восхищение',
      adoration: 'Обожание',
      aesthetic_appreciation: 'Эстетическое наслаждение',
      amusement: 'Веселье',
      anger: 'Гнев',
      anxiety: 'Тревога',
      awe: 'Благоговение',
      awkwardness: 'Неловкость',
      boredom: 'Скука',
      calmness: 'Спокойствие',
      confusion: 'Замешательство',
      craving: 'Жажда',
      disgust: 'Отвращение',
      empathic_pain: 'Эмпатическая боль',
      entrancement: 'Завороженность',
      excitement: 'Возбуждение',
      fear: 'Страх',
      horror: 'Ужас',
      interest: 'Интерес',
      joy: 'Радость',
      nostalgia: 'Ностальгия',
      relief: 'Облегчение',
      romance: 'Романтика',
      sadness: 'Грусть',
      satisfaction: 'Удовлетворение',
      sexual_desire: 'Сексуальное влечение',
      surprise: 'Удивление'
    },
    intensityLevels: {
      veryLow: 'Очень слабая',
      low: 'Слабая',
      medium: 'Средняя',
      high: 'Сильная',
      veryHigh: 'Очень сильная'
    }
  },

  // People
  people: {
    categories: {
      family: 'Родные',
      friends: 'Друзья',
      acquaintances: 'Знакомые',
      strangers: 'Случайные'
    },
    form: {
      nameLabel: 'Имя',
      namePlaceholder: 'Введите имя',
      categoryLabel: 'Категория',
      relationshipLabel: 'Отношение',
      relationshipPlaceholder: 'Кто для вас этот человек',
      birthDateLabel: 'Дата рождения',
      bioLabel: 'Биография',
      bioPlaceholder: 'Краткая информация о человеке',
      notesLabel: 'Заметки',
      notesPlaceholder: 'Ваши заметки'
    },
    list: {
      title: 'Люди',
      addPerson: 'Добавить человека',
      noPeople: 'Нет зарегистрированных людей'
    }
  },

  // Tags
  tags: {
    title: 'Теги',
    addTag: 'Добавить тег',
    newTag: 'Новый тег',
    tagPlaceholder: 'Название тега',
    popularTags: 'Популярные теги',
    noTags: 'Нет тегов',
    manageTags: 'Управление тегами'
  },

  // Skills
  skills: {
    title: 'Навыки',
    level: 'Уровень',
    experience: 'Опыт',
    xp: 'ОП',
    progress: 'Прогресс',
    category: 'Категория',
    description: 'Описание',
    createSkill: 'Создать навык',
    editSkill: 'Редактировать навык',
    skillName: 'Название навыка',
    currentLevel: 'Текущий уровень',
    xpToNextLevel: 'ОП до следующего уровня',
    practice: 'Практика',
    mastery: 'Мастерство',
    categories: {
      social: 'Социальные',
      intellectual: 'Интеллектуальные',
      physical: 'Физические',
      creative: 'Творческие',
      technical: 'Технические',
      other: 'Другие'
    },
    progressTypes: {
      practice: 'Практика',
      study: 'Учёба',
      application: 'Применение',
      teaching: 'Обучение'
    }
  },

  // Analytics
  analytics: {
    title: 'Аналитика',
    overview: 'Обзор',
    trends: 'Тренды',
    patterns: 'Шаблоны',
    correlations: 'Корреляции',
    timeline: 'Хронология',
    statistics: 'Статистика',
    filters: {
      dateRange: 'Диапазон дат',
      entryType: 'Тип записи',
      emotions: 'Эмоции',
      people: 'Люди',
      tags: 'Теги'
    },
    charts: {
      entriesByType: 'Записи по типам',
      entriesOverTime: 'Записи по времени',
      emotionsDistribution: 'Распределение эмоций',
      activityHeatmap: 'Карта активности'
    }
  },

  // Settings
  settings: { 
    title: 'Настройки',
    theme: {
      title: 'Тема',
      light: 'Светлая',
      dark: 'Тёмная',
      auto: 'Авто'
    },
    language: {
      title: 'Язык',
      ru: 'Русский',
      en: 'English',
      fr: 'Français',
      system: 'Системный'
    },
    account: {
      title: 'Аккаунт',
      profile: 'Профиль',
      security: 'Безопасность',
      backup: 'Резервная копия',
      logout: 'Выйти',
      deleteAccount: 'Удалить аккаунт'
    },
    preferences: {
      title: 'Настройки',
      notifications: 'Уведомления',
      privacy: 'Конфиденциальность',
      dataManagement: 'Управление данными'
    },
    about: {
      title: 'О приложении',
      version: 'Версия',
      support: 'Поддержка',
      privacyPolicy: 'Политика конфиденциальности',
      termsOfService: 'Условия использования'
    }
  },

  // Notifications
  notifications: {
    success: 'Успешно',
    error: 'Ошибка',
    warning: 'Предупреждение',
    info: 'Информация',
    entryCreated: 'Запись создана',
    entryUpdated: 'Запись обновлена',
    entryDeleted: 'Запись удалена',
    changesSaved: 'Изменения сохранены',
    loading: 'Загрузка...'
  },

  // Time & Date
  time: {
    today: 'Сегодня',
    yesterday: 'Вчера',
    tomorrow: 'Завтра',
    thisWeek: 'На этой неделе',
    lastWeek: 'На прошлой неделе',
    thisMonth: 'В этом месяце',
    lastMonth: 'В прошлом месяце',
    customRange: 'Произвольный диапазон',
    days: 'дней',
    hours: 'часов',
    minutes: 'минут',
    seconds: 'секунд',
    ago: 'назад'
  },

  // AI Features
  ai: {
    analysis: 'ИИ анализ',
    generateImage: 'Сгенерировать изображение',
    summarize: 'Суммировать',
    insights: 'Инсайты',
    generating: 'Генерация...',
    symbols: {
      title: 'Найденные символы',
      archetypes: 'Архетипы',
      metaphors: 'Метафоры',
      patterns: 'Шаблоны'
    }
  }
};

export default ru;