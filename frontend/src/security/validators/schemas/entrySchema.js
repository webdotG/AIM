// security/validators/schemas/entrySchema.js
export default {
  content: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 10000,
    validate: async (value) => {
      // Проверка на минимальное содержание
      const cleanText = value.replace(/\s+/g, ' ').trim();
      if (cleanText.length < 3) {
        return 'Content is too short';
      }
      
      // Проверка на спам
      const repeatedPatterns = value.match(/(.{3,})\1{3,}/g);
      if (repeatedPatterns && repeatedPatterns.length > 0) {
        return 'Content contains repeated patterns';
      }
    }
  },
  
  entry_type: {
    type: 'string',
    required: true,
    enum: ['dream', 'memory', 'thought', 'plan']
  },
  
  event_date: {
    type: 'date',
    validate: (value) => {
      const date = new Date(value);
      const now = new Date();
      
      if (isNaN(date.getTime())) {
        return 'Invalid date format';
      }
      
      // Не позволяем создавать записи в будущем (кроме планов)
      if (date > now && fullData.entry_type !== 'plan') {
        return 'Event date cannot be in the future';
      }
    }
  },
  
  deadline: {
    type: 'date',
    required: false,
    validate: (value, fullData) => {
      if (fullData.entry_type === 'plan' && !value) {
        return 'Plan must have a deadline';
      }
      
      if (value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Invalid deadline format';
        }
        
        // Дедлайн должен быть в будущем
        if (date < new Date()) {
          return 'Deadline cannot be in the past';
        }
      }
    }
  }
};

// export const entryCreateSchema = {
//   ...entrySchema,
//   emotions: {
//     type: 'array',
//     required: false,
//     validate: async (value) => {
//       if (!Array.isArray(value)) return 'Emotions must be an array';
      
//       if (value.length > 10) {
//         return 'Maximum 10 emotions per entry';
//       }
      
//       // Проверяем структуру
//       for (const emotion of value) {
//         if (!emotion.emotion_id || !emotion.intensity) {
//           return 'Each emotion must have emotion_id and intensity';
//         }
        
//         if (emotion.intensity < 1 || emotion.intensity > 10) {
//           return 'Emotion intensity must be between 1 and 10';
//         }
//       }
//     }
//   },
  
//   people: {
//     type: 'array',
//     required: false,
//     validate: async (value) => {
//       if (!Array.isArray(value)) return 'People must be an array';
      
//       if (value.length > 20) {
//         return 'Maximum 20 people per entry';
//       }
//     }
//   }
// };