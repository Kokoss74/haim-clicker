import bcrypt from 'bcrypt';

/**
 * Хеширует пароль с использованием bcrypt
 * @param {string} password - Пароль для хеширования
 * @returns {Promise<string>} - Хешированный пароль
 */
async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

/**
 * Основная функция скрипта
 */
async function main() {
  // Получаем пароль из аргументов командной строки
  const password = process.argv[2];
  
  if (!password) {
    console.error('Ошибка: Пароль не указан');
    console.log('Использование: node scripts/hash-password.js <ваш_пароль>');
    process.exit(1);
  }
  
  try {
    const hashedPassword = await hashPassword(password);
    console.log('Хешированный пароль:');
    console.log(hashedPassword);
    console.log('\nДобавьте этот хеш в файл .env:');
    console.log('VITE_ADMIN_PASSWORD=' + hashedPassword);
  } catch (error) {
    console.error('Ошибка при хешировании пароля:', error);
    process.exit(1);
  }
}

// Запускаем основную функцию
main();