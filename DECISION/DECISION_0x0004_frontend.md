ОТЧЁТ
Дата: 21 декабря 2025
Проект: AIM Frontend 
Архитектура: Clean Architecture + MobX




Архитектура
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

Файлы:
core/entities/
├── Entry.js                  
├── BodyState.js             
├── Circumstance.js          
├── Skill.js                 
├── SkillProgress.js         
├── Emotion.js                
├── Relation.js               
├── Tag.js                    
├── Person.js                 
├── User.js                   
├── Analytics.js             
└── index.js                  Экспорт

2. Repositories (Интерфейсы) — 10 штук

Файлы:
core/repositories/
├── base/BaseRepository.js   
├── AuthRepository.js          
├── EntriesRepository.js       
├── BodyStatesRepository.js   
├── CircumstancesRepository.js 
├── SkillsRepository.js       
├── EmotionsRepository.js      
├── RelationsRepository.js     
├── TagsRepository.js          
├── PeopleRepository.js        
├── AnalyticsRepository.js    
└── index.js                   Экспорт

3. API Config + Axios
javascript// adapters/api/config.js
- Axios instance с baseURL
- Request interceptor (добавление токена)
- Response interceptor (обработка 401)
- Timeout 30 секунд

4. Mappers (DTO ↔ Entity) — 10 штук

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
