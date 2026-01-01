// Простой мок который возвращает функцию verify
export const verify = jest.fn((req, res, next) => {
  console.log('hCaptcha middleware mocked - skipping verification');
  next();
});

// Если есть default export
export default { verify };
