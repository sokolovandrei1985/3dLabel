// Валидация email
export const EMAIL_RULES =  [
  { required: true, message: 'Введите email' },
  {
    type: 'email',
    message: 'Введите корректный email адрес',
    validator: (_rule: any, value: string) => {
      if (!value) return Promise.resolve()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
        ? Promise.resolve()
        : Promise.reject('Введите корректный email адрес')
    }
  }
]