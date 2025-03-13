
# Обновленный пошаговый алгоритм настройки Supabase с собственной системой аутентификации

## Шаг 1: Создание проекта в Supabase

1. Зайдите на [app.supabase.com](https://app.supabase.com) и авторизуйтесь.
2. Нажмите кнопку "New Project".
3. Введите название проекта (например, "Clicker").
4. Выберите регион, ближайший к вашим пользователям.
5. Установите пароль для базы данных (сохраните его в надежном месте).
6. Нажмите "Create new project".

## Шаг 2: Создание таблиц

### Создание таблицы `users`:

1. Перейдите в раздел "Table Editor" в левом меню.
2. Нажмите кнопку "New Table".
3. Название таблицы: `users`
4. Включите "Enable Row Level Security (RLS)"
5. Добавьте следующие колонки:
   - `id`: тип `uuid`, Primary Key, Default Value: `uuid_generate_v4()`
   - `name`: тип `text`, NOT NULL
   - `phone`: тип `text`, NOT NULL, UNIQUE
   - `attempts_left`: тип `int4`, NOT NULL, Default Value: `10`
   - `best_result`: тип `int4`, NULL
   - `discount`: тип `int4`, NOT NULL, Default Value: `3`
   - `created_at`: тип `timestamptz`, Default Value: `now()`
6. Нажмите "Save".
7. После создания таблицы, добавьте ограничения через SQL Editor:
   ```sql
   ALTER TABLE users ADD CONSTRAINT check_name_length CHECK (char_length(name) >= 3);
   ALTER TABLE users ADD CONSTRAINT check_phone_format CHECK (phone ~ '^\+972\d{9}$');
   ```

### Создание таблицы `attempts`:

1. Нажмите кнопку "New Table".
2. Название таблицы: `attempts`
3. Включите "Enable Row Level Security (RLS)"
4. Добавьте следующие колонки:
   - `id`: тип `uuid`, Primary Key, Default Value: `uuid_generate_v4()`
   - `user_id`: тип `uuid`, NOT NULL, Foreign Key к `users.id`
   - `difference`: тип `int4`, NOT NULL
   - `click_time`: тип `timestamptz`, NOT NULL, Default Value: `now()` (для хранения точного времени нажатия)
   - `created_at`: тип `timestamptz`, Default Value: `now()`
5. Нажмите "Save".
6. Создайте индекс для ускорения запросов через SQL Editor:
   ```sql
   CREATE INDEX idx_attempts_user_id ON attempts (user_id);
   ```

### Создание таблицы `game_settings`:

1. Нажмите кнопку "New Table".
2. Название таблицы: `game_settings`
3. Включите "Enable Row Level Security (RLS)"
4. Добавьте следующие колонки:
   - `id`: тип `int4`, Primary Key, Default Value: `1`
   - `attempts_number`: тип `int4`, NOT NULL, Default Value: `10`
   - `discount_ranges`: тип `jsonb`, NOT NULL, Default Value:
     ```json
     [
       {"min": 0, "max": 0, "discount": 25},
       {"min": 1, "max": 10, "discount": 15},
       {"min": 11, "max": 50, "discount": 10},
       {"min": 51, "max": 100, "discount": 5},
       {"min": 101, "max": null, "discount": 3}
     ]
     ```
5. Нажмите "Save".
6. После создания таблицы, добавьте ограничение через SQL Editor:
   ```sql
   ALTER TABLE game_settings ADD CONSTRAINT check_singleton CHECK (id = 1);
   INSERT INTO game_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
   ```

### Создание таблицы `admins`:

1. Нажмите кнопку "New Table".
2. Название таблицы: `admins`
3. Включите "Enable Row Level Security (RLS)"
4. Добавьте следующие колонки:
   - `id`: тип `uuid`, Primary Key, Default Value: `uuid_generate_v4()`
   - `username`: тип `text`, NOT NULL, UNIQUE
   - `password_hash`: тип `text`, NOT NULL
   - `failed_attempts`: тип `int4`, NOT NULL, Default Value: `0`
   - `locked_until`: тип `timestamptz`, NULL
   - `created_at`: тип `timestamptz`, Default Value: `now()`
5. Нажмите "Save".

### Создание таблицы `admin_logs`:

1. Нажмите кнопку "New Table".
2. Название таблицы: `admin_logs`
3. Включите "Enable Row Level Security (RLS)"
4. Добавьте следующие колонки:
   - `id`: тип `uuid`, Primary Key, Default Value: `uuid_generate_v4()`
   - `admin_id`: тип `uuid`, NOT NULL, Foreign Key к `admins.id`
   - `action`: тип `text`, NOT NULL (описание действия)
   - `details`: тип `jsonb`, NULL (дополнительные детали действия)
   - `ip_address`: тип `text`, NULL (IP-адрес)
   - `created_at`: тип `timestamptz`, Default Value: `now()`
5. Нажмите "Save".
6. Создайте индексы для ускорения запросов через SQL Editor:
   ```sql
   CREATE INDEX idx_admin_logs_admin_id ON admin_logs (admin_id);
   CREATE INDEX idx_admin_logs_created_at ON admin_logs (created_at);
   ```

## Шаг 3: Создание функций для собственной системы аутентификации

Используйте SQL Editor для создания следующих функций:

```sql
-- Установка необходимых расширений
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Функция для проверки токена и получения ID пользователя
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS UUID AS $$
DECLARE
  token TEXT;
  token_data JSON;
  user_id UUID;
BEGIN
  -- Получаем токен из заголовка запроса
  token := current_setting('request.headers.authorization', true);
  
  -- Если токена нет, возвращаем NULL
  IF token IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Удаляем префикс 'Bearer ' если он есть
  IF position('Bearer ' in token) > 0 THEN
    token := substring(token from 8);
  END IF;
  
  -- Декодируем токен
  BEGIN
    token_data := convert_from(
      decode(
        split_part(token, '.', 2),
        'base64'
      ),
      'utf8'
    )::json;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NULL;
  END;
  
  -- Получаем user_id из токена
  user_id := (token_data->>'user_id')::UUID;
  
  -- Проверяем срок действия токена
  IF (token_data->>'exp')::NUMERIC < extract(epoch from now()) THEN
    RETURN NULL;
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки существования пользователя по номеру телефона
CREATE OR REPLACE FUNCTION public.check_phone_exists(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM users WHERE phone = phone_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для входа пользователя
CREATE OR REPLACE FUNCTION public.login_user(phone_number TEXT)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  token TEXT;
  header TEXT := '{"alg":"HS256","typ":"JWT"}';
  payload JSON;
  secret TEXT := current_setting('app.jwt_secret', true);
BEGIN
  -- Находим пользователя
  SELECT * INTO user_record FROM users WHERE phone = phone_number;
  
  -- Если пользователь не найден, возвращаем ошибку
  IF user_record IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Пользователь не найден');
  END IF;
  
  -- Создаем payload для JWT
  payload := json_build_object(
    'user_id', user_record.id,
    'phone', user_record.phone,
    'iat', extract(epoch from now())::integer,
    'exp', extract(epoch from (now() + interval '7 days'))::integer
  );
  
  -- Генерируем JWT токен
  token := 
    replace(encode(convert_to(header, 'utf8'), 'base64'), '=', '') || '.' ||
    replace(encode(convert_to(payload::text, 'utf8'), 'base64'), '=', '') || '.' ||
    replace(encode(
      hmac(
        replace(encode(convert_to(header, 'utf8'), 'base64'), '=', '') || '.' ||
        replace(encode(convert_to(payload::text, 'utf8'), 'base64'), '=', ''),
        secret,
        'sha256'
      ),
      'base64'
    ), '=', '');
  
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', user_record.id,
      'name', user_record.name,
      'phone', user_record.phone,
      'attempts_left', user_record.attempts_left,
      'best_result', user_record.best_result,
      'discount', user_record.discount
    ),
    'token', token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для регистрации пользователя
CREATE OR REPLACE FUNCTION public.register_user(user_name TEXT, phone_number TEXT)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  token TEXT;
  header TEXT := '{"alg":"HS256","typ":"JWT"}';
  payload JSON;
  secret TEXT := current_setting('app.jwt_secret', true);
BEGIN
  -- Проверяем, существует ли пользователь
  IF EXISTS (SELECT 1 FROM users WHERE phone = phone_number) THEN
    RETURN json_build_object('success', false, 'message', 'Пользователь уже зарегистрирован');
  END IF;
  
  -- Проверяем длину имени
  IF char_length(user_name) < 3 THEN
    RETURN json_build_object('success', false, 'message', 'Имя должно содержать не менее 3 символов');
  END IF;
  
  -- Проверяем формат телефона
  IF NOT (phone_number ~ '^\+972\d{9}$') THEN
    RETURN json_build_object('success', false, 'message', 'Неверный формат номера телефона');
  END IF;
  
  -- Создаем нового пользователя
  INSERT INTO users (name, phone)
  VALUES (user_name, phone_number)
  RETURNING id INTO new_user_id;
  
  -- Создаем payload для JWT
  payload := json_build_object(
    'user_id', new_user_id,
    'phone', phone_number,
    'iat', extract(epoch from now())::integer,
    'exp', extract(epoch from (now() + interval '7 days'))::integer
  );
  
  -- Генерируем JWT токен
  token := 
    replace(encode(convert_to(header, 'utf8'), 'base64'), '=', '') || '.' ||
    replace(encode(convert_to(payload::text, 'utf8'), 'base64'), '=', '') || '.' ||
    replace(encode(
      hmac(
        replace(encode(convert_to(header, 'utf8'), 'base64'), '=', '') || '.' ||
        replace(encode(convert_to(payload::text, 'utf8'), 'base64'), '=', ''),
        secret,
        'sha256'
      ),
      'base64'
    ), '=', '');
  
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', new_user_id,
      'name', user_name,
      'phone', phone_number,
      'attempts_left', 10,
      'best_result', NULL,
      'discount', 3
    ),
    'token', token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Установка секретного ключа для JWT
DO $$
BEGIN
  -- Проверяем, существует ли параметр
  IF NOT EXISTS (
    SELECT 1 FROM pg_settings WHERE name = 'app.jwt_secret'
  ) THEN
    -- Создаем случайный секретный ключ
    PERFORM set_config('app.jwt_secret', encode(gen_random_bytes(32), 'hex'), false);
  END IF;
END $$;

-- Разрешаем анонимный доступ к функциям
GRANT EXECUTE ON FUNCTION public.check_phone_exists TO anon;
GRANT EXECUTE ON FUNCTION public.login_user TO anon;
GRANT EXECUTE ON FUNCTION public.register_user TO anon;
```

## Шаг 4: Создание функций для администраторов и триггеров

```sql
-- Функция для проверки и обновления блокировки админа
CREATE OR REPLACE FUNCTION public.admin_login(admin_username TEXT, input_password TEXT)
RETURNS JSON AS $$
DECLARE
  admin_record RECORD;
  is_valid BOOLEAN;
  token TEXT;
  header TEXT := '{"alg":"HS256","typ":"JWT"}';
  payload JSON;
  secret TEXT := current_setting('app.jwt_secret', true);
BEGIN
  -- Получаем запись админа
  SELECT * INTO admin_record FROM admins WHERE username = admin_username;
  
  -- Если админ не найден, возвращаем ошибку
  IF admin_record IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Администратор не найден');
  END IF;
  
  -- Проверяем, заблокирован ли админ
  IF admin_record.locked_until IS NOT NULL AND admin_record.locked_until > NOW() THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Аккаунт заблокирован до ' || to_char(admin_record.locked_until, 'DD.MM.YYYY HH24:MI:SS')
    );
  END IF;
  
  -- Проверяем пароль
  is_valid := admin_record.password_hash = crypt(input_password, admin_record.password_hash);
  
  IF is_valid THEN
    -- Сбрасываем счетчик неудачных попыток
    UPDATE admins SET failed_attempts = 0 WHERE username = admin_username;
    
    -- Создаем payload для JWT
    payload := json_build_object(
      'admin_id', admin_record.id,
      'username', admin_record.username,
      'is_admin', true,
      'iat', extract(epoch from now())::integer,
      'exp', extract(epoch from (now() + interval '1 day'))::integer
    );
    
    -- Генерируем JWT токен
    token := 
      replace(encode(convert_to(header, 'utf8'), 'base64'), '=', '') || '.' ||
      replace(encode(convert_to(payload::text, 'utf8'), 'base64'), '=', '') || '.' ||
      replace(encode(
        hmac(
          replace(encode(convert_to(header, 'utf8'), 'base64'), '=', '') || '.' ||
          replace(encode(convert_to(payload::text, 'utf8'), 'base64'), '=', ''),
          secret,
          'sha256'
        ),
        'base64'
      ), '=', '');
    
    -- Логируем успешный вход
    INSERT INTO admin_logs (admin_id, action, ip_address)
    VALUES (admin_record.id, 'Успешный вход', current_setting('request.headers.x-forwarded-for', true));
    
    RETURN json_build_object(
      'success', true,
      'admin', json_build_object(
        'id', admin_record.id,
        'username', admin_record.username
      ),
      'token', token
    );
  ELSE
    -- Увеличиваем счетчик неудачных попыток
    UPDATE admins 
    SET 
      failed_attempts = failed_attempts + 1,
      locked_until = CASE 
                      WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
                      ELSE locked_until
                     END
    WHERE username = admin_username;
    
    -- Логируем неудачную попытку
    INSERT INTO admin_logs (admin_id, action, details, ip_address)
    VALUES (
      admin_record.id, 
      'Неудачная попытка входа', 
      json_build_object('failed_attempts', admin_record.failed_attempts + 1),
      current_setting('request.headers.x-forwarded-for', true)
    );
    
    RETURN json_build_object('success', false, 'message', 'Неверный пароль');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для логирования действий администратора
CREATE OR REPLACE FUNCTION public.log_admin_action(action_text TEXT, action_details JSONB DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Получаем ID администратора из токена
  admin_id := get_auth_user_id();
  
  -- Проверяем, что это действительно администратор
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = admin_id) THEN
    RETURN false;
  END IF;
  
  -- Логируем действие
  INSERT INTO admin_logs (admin_id, action, details, ip_address)
  VALUES (
    admin_id, 
    action_text, 
    action_details,
    current_setting('request.headers.x-forwarded-for', true)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для определения скидки на основе разницы
CREATE OR REPLACE FUNCTION calculate_discount(difference_ms INTEGER)
RETURNS INTEGER AS $$
DECLARE
  ranges JSONB;
  r JSONB;
  discount INTEGER := 3; -- Значение по умолчанию
BEGIN
  -- Получаем настройки диапазонов скидок
  SELECT discount_ranges INTO ranges FROM game_settings WHERE id = 1;
  
  -- Перебираем диапазоны и находим подходящий
  FOR r IN SELECT * FROM jsonb_array_elements(ranges)
  LOOP
    IF (r->>'min')::INTEGER <= difference_ms AND 
       ((r->>'max') IS NULL OR (r->>'max')::INTEGER >= difference_ms) THEN
      discount := (r->>'discount')::INTEGER;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN discount;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления лучшего результата и скидки пользователя
CREATE OR REPLACE FUNCTION update_user_best_result()
RETURNS TRIGGER AS $$
DECLARE
  current_best INTEGER;
  new_discount INTEGER;
BEGIN
  -- Получаем текущий лучший результат пользователя
  SELECT best_result INTO current_best FROM users WHERE id = NEW.user_id;
  
  -- Если текущего лучшего результата нет или новый результат лучше
  IF current_best IS NULL OR NEW.difference < current_best THEN
    -- Вычисляем новую скидку
    new_discount := calculate_discount(NEW.difference);
    
    -- Обновляем запись пользователя
    UPDATE users 
    SET best_result = NEW.difference, discount = new_discount
    WHERE id = NEW.user_id;
  END IF;
  
  -- Уменьшаем количество оставшихся попыток
  UPDATE users 
  SET attempts_left = attempts_left - 1
  WHERE id = NEW.user_id AND attempts_left > 0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления лучшего результата и скидки
CREATE TRIGGER update_user_best_result_trigger
AFTER INSERT ON attempts
FOR EACH ROW
EXECUTE FUNCTION update_user_best_result();

-- Разрешаем анонимный доступ к функции для входа администратора
GRANT EXECUTE ON FUNCTION public.admin_login TO anon;
```

## Шаг 5: Настройка политик безопасности (RLS)

### Политики для таблицы `users`:

1. Перейдите к таблице `users` в Table Editor.
2. Нажмите на вкладку "Policies".
3. Нажмите "Add Policy".

**Политика для анонимного поиска пользователя по номеру телефона:**
- Название: `Allow anonymous phone lookup`
- Операция: `SELECT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `true`
- Using expression: `false` (эта политика не нужна, так как мы используем функцию `check_phone_exists`)
- Нажмите "Review" и затем "Save Policy".

**Политика для чтения (SELECT) своего профиля:**
- Название: `Users can view their own profile`
- Операция: `SELECT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `id = get_auth_user_id()`
- Нажмите "Review" и затем "Save Policy".

**Политика для обновления (UPDATE) своего профиля:**
- Название: `Users can update their own profile`
- Операция: `UPDATE`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `id = get_auth_user_id()`
- Нажмите "Review" и затем "Save Policy".

**Политика для администраторов:**
- Название: `Admins can view all users`
- Операция: `SELECT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `EXISTS (SELECT 1 FROM admins WHERE id = get_auth_user_id() AND (locked_until IS NULL OR locked_until < now()))`
- Нажмите "Review" и затем "Save Policy".

**Политика для администраторов (обновление):**
- Название: `Admins can update users`
- Операция: `UPDATE`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `EXISTS (SELECT 1 FROM admins WHERE id = get_auth_user_id() AND (locked_until IS NULL OR locked_until < now()))`
- Нажмите "Review" и затем "Save Policy".

### Политики для таблицы `attempts`:

1. Перейдите к таблице `attempts` в Table Editor.
2. Нажмите на вкладку "Policies".
3. Нажмите "Add Policy".

**Политика для чтения (SELECT) своих попыток:**
- Название: `Users can view their own attempts`
- Операция: `SELECT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `user_id = get_auth_user_id()`
- Нажмите "Review" и затем "Save Policy".

**Политика для создания (INSERT) новой попытки:**
- Название: `Users can create attempts for themselves`
- Операция: `INSERT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `user_id = get_auth_user_id()`
- Нажмите "Review" и затем "Save Policy".

**Политика для администраторов:**
- Название: `Admins can view all attempts`
- Операция: `SELECT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `EXISTS (SELECT 1 FROM admins WHERE id = get_auth_user_id() AND (locked_until IS NULL OR locked_until < now()))`
- Нажмите "Review" и затем "Save Policy".

### Политики для таблицы `game_settings`:

1. Перейдите к таблице `game_settings` в Table Editor.
2. Нажмите на вкладку "Policies".
3. Нажмите "Add Policy".

**Политика для чтения (SELECT) настроек игры:**
- Название: `Anyone can read game settings`
- Операция: `SELECT`
- Использовать шаблон: `Для аутентифицированных пользователей`
- Выражение политики: `true`
- Нажмите "Review" и затем "Save Policy".

**Политика для обновления (UPDATE) настроек игры (только для админов):**
- Название: `Only admins can update game settings`
- Операция: `UPDATE`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `EXISTS (SELECT 1 FROM admins WHERE id = get_auth_user_id() AND (locked_until IS NULL OR locked_until < now()))`
- Нажмите "Review" и затем "Save Policy".

### Политики для таблицы `admins`:

1. Перейдите к таблице `admins` в Table Editor.
2. Нажмите на вкладку "Policies".
3. Нажмите "Add Policy".

**Политика для чтения (SELECT) информации об админах:**
- Название: `Admins can view admin info`
- Операция: `SELECT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `id = get_auth_user_id()`
- Нажмите "Review" и затем "Save Policy".

**Политика для обновления (UPDATE) информации об админах:**
- Название: `Admins can update their own info`
- Операция: `UPDATE`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `id = get_auth_user_id()`
- Нажмите "Review" и затем "Save Policy".

### Политики для таблицы `admin_logs`:

1. Перейдите к таблице `admin_logs` в Table Editor.
2. Нажмите на вкладку "Policies".
3. Нажмите "Add Policy".

**Политика для чтения (SELECT) логов:**
- Название: `Admins can view logs`
- Операция: `SELECT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `EXISTS (SELECT 1 FROM admins WHERE id = get_auth_user_id() AND (locked_until IS NULL OR locked_until < now()))`
- Нажмите "Review" и затем "Save Policy".

**Политика для создания (INSERT) логов:**
- Название: `System can create logs`
- Операция: `INSERT`
- Использовать шаблон: `Индивидуальный (расширенный)`
- Выражение политики: `true` (логи могут создаваться системой через функции)
- Нажмите "Review" и затем "Save Policy".

## Шаг 6: Создание первого администратора

Используйте SQL Editor для создания первого администратора:

```sql
-- Создание первого администратора с зашифрованным паролем
INSERT INTO admins (username, password_hash)
VALUES ('admin', crypt('your_secure_password', gen_salt('bf')));
```

## Шаг 7: Получение API-ключей для клиентского приложения

1. Перейдите в раздел "Settings" в левом меню.
2. Выберите вкладку "API".
3. Скопируйте "Project URL" и "anon public" ключ.
4. Эти значения будут использоваться в вашем клиентском приложении как переменные окружения:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Шаг 8: Примеры использования API в клиентском приложении

### Проверка существования пользователя по номеру телефона

```typescript
const checkPhoneExists = async (phone: string) => {
  try {
    const { data, error } = await supabase.rpc('check_phone_exists', {
      phone_number: phone
    });
    
    if (error) throw error;
    
    return data; // true если пользователь существует, false если нет
  } catch (error) {
    console.error('Error checking phone:', error);
    return false;
  }
};
```

### Вход пользователя

```typescript
const loginUser = async (phone: string) => {
  try {
    const { data, error } = await supabase.rpc('login_user', {
      phone_number: phone
    });
    
    if (error) throw error;
    
    if (!data.success) {
      console.error(data.message);
      return null;
    }
    
    // Сохраняем токен и данные пользователя в localStorage
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userData', JSON

---

## 👤 You ##

Continue

---

## 🧠 Generic · *Claude 3.7 Sonnet* ##

```typescript
const loginUser = async (phone: string) => {
  try {
    const { data, error } = await supabase.rpc('login_user', {
      phone_number: phone
    });
    
    if (error) throw error;
    
    if (!data.success) {
      console.error(data.message);
      return null;
    }
    
    // Сохраняем токен и данные пользователя в localStorage
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};
```

### Регистрация нового пользователя

```typescript
const registerUser = async (name: string, phone: string) => {
  try {
    const { data, error } = await supabase.rpc('register_user', {
      user_name: name,
      phone_number: phone
    });
    
    if (error) throw error;
    
    if (!data.success) {
      console.error(data.message);
      return { success: false, message: data.message };
    }
    
    // Сохраняем токен и данные пользователя в localStorage
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, message: 'Ошибка при регистрации' };
  }
};
```

### Проверка аутентификации пользователя

```typescript
const checkAuth = () => {
  const token = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');
  
  if (!token || !userData) {
    return null;
  }
  
  try {
    const user = JSON.parse(userData);
    return user;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    return null;
  }
};
```

### Настройка Supabase клиента с авторизацией

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Функция для добавления токена к запросам
export const setupAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  
  if (token) {
    // Устанавливаем заголовок Authorization для всех запросов
    supabase.auth.setAuth(token);
  }
};

// Вызываем при инициализации приложения
setupAuthHeaders();
```

### Создание новой попытки

```typescript
const createAttempt = async (difference: number) => {
  try {
    // Получаем ID пользователя из сохраненных данных
    const userData = localStorage.getItem('userData');
    if (!userData) {
      throw new Error('Пользователь не авторизован');
    }
    
    const user = JSON.parse(userData);
    
    // Проверяем, остались ли попытки
    if (user.attempts_left <= 0) {
      return { 
        success: false, 
        message: 'Для продолжения игры необходимо использовать уже имеющуюся скидку в магазине.' 
      };
    }
    
    // Добавляем токен к запросу
    const token = localStorage.getItem('userToken');
    
    const { data, error } = await supabase
      .from('attempts')
      .insert([
        { user_id: user.id, difference: difference }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // Обновляем данные пользователя в localStorage
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) throw userError;
    
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    
    return { success: true, attempt: data, user: updatedUser };
  } catch (error) {
    console.error('Error creating attempt:', error);
    return { success: false, message: 'Ошибка при сохранении попытки' };
  }
};
```

### Вход администратора

```typescript
const adminLogin = async (username: string, password: string) => {
  try {
    const { data, error } = await supabase.rpc('admin_login', {
      admin_username: username,
      input_password: password
    });
    
    if (error) throw error;
    
    if (!data.success) {
      return { success: false, message: data.message };
    }
    
    // Сохраняем токен и данные администратора в localStorage
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminData', JSON.stringify(data.admin));
    
    return { success: true, admin: data.admin };
  } catch (error) {
    console.error('Error logging in as admin:', error);
    return { success: false, message: 'Ошибка при входе' };
  }
};
```

### Логирование действий администратора

```typescript
const logAdminAction = async (action: string, details?: any) => {
  try {
    const { data, error } = await supabase.rpc('log_admin_action', {
      action_text: action,
      action_details: details ? details : null
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error logging admin action:', error);
    return { success: false, message: 'Ошибка при логировании действия' };
  }
};
```

### Сброс попыток пользователя (админ-функция)

```typescript
const resetUserAttempts = async (userId: string) => {
  try {
    // Обновляем количество попыток
    const { data, error } = await supabase
      .from('users')
      .update({ attempts_left: 10 })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Логируем действие
    await logAdminAction('Сброс попыток пользователя', { user_id: userId });
    
    return { success: true, user: data };
  } catch (error) {
    console.error('Error resetting attempts:', error);
    return { success: false, message: 'Ошибка при сбросе попыток' };
  }
};
```

### Изменение настроек игры (админ-функция)

```typescript
const updateGameSettings = async (attemptsNumber: number, discountRanges: any[]) => {
  try {
    const { data, error } = await supabase
      .from('game_settings')
      .update({
        attempts_number: attemptsNumber,
        discount_ranges: discountRanges
      })
      .eq('id', 1)
      .select()
      .single();
    
    if (error) throw error;
    
    // Логируем действие
    await logAdminAction('Изменение настроек игры', { 
      attempts_number: attemptsNumber,
      discount_ranges: discountRanges
    });
    
    return { success: true, settings: data };
  } catch (error) {
    console.error('Error updating game settings:', error);
    return { success: false, message: 'Ошибка при обновлении настроек' };
  }
};
```

## Рекомендации по реализации и безопасности

1. **Безопасность JWT-токенов**:
   - В реальном проекте используйте более надежный механизм генерации и проверки JWT-токенов.
   - Рассмотрите возможность использования библиотеки `pgjwt` в Supabase для работы с токенами.
   - Храните секретный ключ в безопасном месте и периодически меняйте его.

2. **Обработка токенов на клиенте**:
   - Для каждого запроса к API добавляйте токен в заголовок `Authorization`.
   - Пример: `Authorization: Bearer ${token}`.
   - Используйте перехватчик запросов (например, axios interceptors) для автоматического добавления токена.

3. **Обновление токенов**:
   - Реализуйте механизм обновления токенов, когда срок их действия подходит к концу.
   - Создайте функцию `refresh_token` на сервере, которая будет генерировать новый токен.

4. **Выход из системы**:
   ```typescript
   const logout = () => {
     localStorage.removeItem('userToken');
     localStorage.removeItem('userData');
     // Перенаправление на страницу входа
     window.location.href = '/login';
   };
   ```

5. **Обработка ошибок**:
   - Создайте централизованную систему обработки ошибок.
   - Показывайте пользователю понятные сообщения об ошибках.
   - Логируйте ошибки для дальнейшего анализа.

6. **Валидация данных**:
   - Всегда валидируйте данные как на клиенте, так и на сервере.
   - Используйте библиотеки для валидации форм (например, React Hook Form, Formik).

7. **Защита от CSRF и XSS**:
   - Используйте HTTPS для всех запросов.
   - Проверяйте источник запросов.
   - Экранируйте пользовательский ввод перед отображением.

8. **Мониторинг и аудит**:
   - Регулярно проверяйте логи действий администраторов.
   - Настройте оповещения о подозрительной активности.

9. **Резервное копирование**:
   - Регулярно создавайте резервные копии базы данных.
   - Тестируйте процесс восстановления из резервной копии.

10. **Производительность**:
    - Используйте кэширование для часто запрашиваемых данных.
    - Оптимизируйте запросы к базе данных.
    - Мониторьте производительность приложения.

11. **Масштабирование**:
    - Проектируйте систему с учетом возможного масштабирования.
    - Используйте асинхронные операции для длительных задач.

12. **Тестирование**:
    - Тщательно тестируйте все функции, особенно связанные с безопасностью.
    - Используйте автоматизированные тесты для регрессионного тестирования.

Следуя этим рекомендациям, вы создадите надежную и безопасную систему аутентификации для вашего проекта Clicker.

