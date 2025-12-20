ОТЧЁТ
Дата: 21 декабря 2025
Проект: AIM Frontend 
Архитектура: Clean Architecture + MobX
Статус:  Все слои реализованы и готовы к интеграции



Архитектура проекта
src/
├── core/                          # Бизнес-логика (Domain Layer)
│   ├── entities/                  # 13 доменных моделей
│   └── repositories/              # 10 интерфейсов репозиториев
│
├── adapters/                      # Адаптеры (Infrastructure Layer)
│   └── api/
│       ├── config.js             # Axios настройки
│       ├── clients/              # 10 API клиентов
│       └── mappers/              # 10 мапперов DTO ↔ Entity
│
└── store/                         # Состояние (Presentation Layer)
    ├── RootStore.js
    ├── StoreContext.jsx
    └── stores/                    # 6 MobX stores


1. Entities (Доменные модели) — 13 штук
EntityОписаниеБизнес-логикаEntryЗаписи (dream, memory, thought, plan)isDream(), isOverdue(), getDominantEmotion()BodyStateФизическое состояние (HP, место)isHealthCritical(), getHealthStatus()CircumstanceОбстоятельства (погода, луна)isFullMoon(), getWeatherIcon()SkillНавыки с уровнямиcanLevelUp(), getProgressToNextLevel()SkillProgressПрогресс навыкаgetProgressTypeIcon()Emotion27 эмоций BerkeleyisPositive(), getCategoryIcon()RelationСвязи между записямиgetTypeLabel(), getDirection()TagТегиisPopular(), isUnused()PersonЛюдиisFamily(), getCategoryIcon()UserПользователь-AnalyticsСтатистикаgetCompletionRate(), getMostActiveType()
Файлы:
core/entities/
├── Entry.js                  Обновлён (bodyStateId, circumstanceId)
├── BodyState.js              Создан
├── Circumstance.js           Создан
├── Skill.js                  Создан
├── SkillProgress.js          Создан
├── Emotion.js                Обновлён
├── Relation.js               Обновлён
├── Tag.js                    Обновлён
├── Person.js                 Обновлён
├── User.js                   Обновлён
├── Analytics.js              Создан
└── index.js                  Экспорт

2. Repositories (Интерфейсы) — 10 штук
RepositoryМетодыСпецифичные методыAuthRepositoryregister, login, recover, logoutisAuthenticated()EntriesRepositoryCRUD + searchsearch()BodyStatesRepositoryCRUD-CircumstancesRepositoryCRUDgetWeatherStats(), getMoonPhaseStats()SkillsRepositoryCRUDaddProgress(), getProgressHistory(), getTopSkills()EmotionsRepositorygetAll, attachToEntrygetStats(), getMostFrequent(), getTimeline()RelationsRepositoryCRUDgetChain(), getGraph(), getTypes()TagsRepositoryCRUDfindOrCreate(), getMostUsed(), getSimilar()PeopleRepositoryCRUDgetMostMentioned()AnalyticsRepository-getOverallStats(), getStreaks(), getActivityHeatmap()
Файлы:
core/repositories/
├── base/BaseRepository.js   
├── AuthRepository.js          Обновлён
├── EntriesRepository.js       Обновлён
├── BodyStatesRepository.js    Создан
├── CircumstancesRepository.js  Создан
├── SkillsRepository.js        Создан
├── EmotionsRepository.js      Обновлён
├── RelationsRepository.js     Обновлён
├── TagsRepository.js          Обновлён
├── PeopleRepository.js        Обновлён
├── AnalyticsRepository.js     Создан
└── index.js                   Экспорт

3. API Config + Axios
javascript// adapters/api/config.js
- Axios instance с baseURL
- Request interceptor (добавление токена)
- Response interceptor (обработка 401)
- Timeout 30 секунд
Фичи:

 Автоматическое добавление Authorization: Bearer <token>
 Redirect на /auth при 401
 Возвращает только response.data
 Cookies для хранения токена


4. Mappers (DTO ↔ Entity) — 10 штук
MapperФункцииEntryMappertoDomain(), toDTO(), toDomainArray()BodyStateMappertoDomain(), toDTO(), toDomainArray()CircumstanceMappertoDomain(), toDTO(), toDomainArray()SkillMappertoDomain(), toDTO(), progressToDomain(), progressToDTO()EmotionMappertoDomain(), emotionAttachmentToDTO()RelationMappertoDomain(), toDTO()TagMappertoDomain(), toDomainArray()PersonMappertoDomain(), toDTO()UserMappertoDomain()AnalyticsMappertoDomain()
Преобразования:
javascript// Backend DTO (snake_case)
{ user_id: 1, entry_type: 'dream', created_at: '2024-12-20' }

// ↓ Mapper ↓

// Domain Entity (camelCase)
Entry { userId: 1, entryType: 'dream', createdAt: Date }
Файлы:
adapters/api/mappers/
├── EntryMapper.js           
├── BodyStateMapper.js       
├── CircumstanceMapper.js    
├── SkillMapper.js           
├── EmotionMapper.js         
├── RelationMapper.js        
├── TagMapper.js             
├── PersonMapper.js          
├── UserMapper.js            
├── AnalyticsMapper.js       
└── index.js                 

5. API Clients (Реализации Repository) — 10 штук
API ClientEndpoints покрытоAuthAPIClient3EntriesAPIClient6BodyStatesAPIClient5CircumstancesAPIClient8SkillsAPIClient9EmotionsAPIClient9RelationsAPIClient7TagsAPIClient11PeopleAPIClient6AnalyticsAPIClient5ИТОГО69 endpoints
Пример использования:
javascript// API Client extends Repository
class EntriesAPIClient extends EntriesRepository {
  async getAll(filters) {
    const response = await apiClient.get('/entries', { params: filters });
    return {
      entries: EntryMapper.toDomainArray(response.data.entries),
      pagination: response.data.pagination
    };
  }
}
Файлы:
adapters/api/clients/
├── AuthAPIClient.js         
├── EntriesAPIClient.js      
├── BodyStatesAPIClient.js   
├── CircumstancesAPIClient.js 
├── SkillsAPIClient.js       
├── EmotionsAPIClient.js     
├── RelationsAPIClient.js    
├── TagsAPIClient.js         
├── PeopleAPIClient.js       
├── AnalyticsAPIClient.js    
└── index.js                 

6. MobX Stores — 6 штук
StoreФункцииComputedAuthStorelogin, register, recover, logout-EntriesStoreCRUD, searchdreamEntries, overduePlansBodyStatesStoreCRUDcriticalHealthStates, lowEnergyStatesCircumstancesStoreCRUD, statsfullMoonCircumstancesSkillsStoreCRUD, progressmasterSkills, beginnerSkillsUIStore(существующий)-
Пример Store:
javascriptexport class EntriesStore {
  entries = [];
  isLoading = false;
  error = null;
  repository = new EntriesAPIClient();

  constructor() {
    makeAutoObservable(this);
  }

  async fetchEntries(filters) {
    this.isLoading = true;
    try {
      const response = await this.repository.getAll(filters);
      runInAction(() => {
        this.entries = response.entries;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error;
        this.isLoading = false;
      });
    }
  }

  // Computed
  get overduePlans() {
    return this.entries.filter(e => e.isOverdue());
  }
}
Файлы:
store/
├── RootStore.js             
├── StoreContext.jsx         
└── stores/
    ├── AuthStore.js         
    ├── EntriesStore.js      
    ├── BodyStatesStore.js   
    ├── CircumstancesStore.js 
    ├── SkillsStore.js       
    └── UIStore.js           


Статус: READY FOR INTEGRATION

Создано: 21 декабря 2025
