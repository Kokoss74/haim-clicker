import React, { useState, useEffect } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { User } from "../types/user";
import { toast } from "react-toastify";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface LoginProps {
  setUser: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const { loginUser, registerUser, logout } = useSupabase();
  const [storedUser] = useLocalStorage<User | null>("userData", null);
  
  // Проверяем, есть ли сохраненный пользователь при загрузке компонента
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    console.log('Проверка сохраненного пользователя:', storedUser);
    console.log('Проверка сохраненного токена:', token);
    
    if (storedUser && token) {
      console.log('Установка пользователя из localStorage');
      setUser(storedUser);
    }
  }, [storedUser, setUser]);

  // Функция для валидации израильского номера телефона
  const validateIsraeliPhoneNumber = (phone: string): boolean => {
    // Регулярное выражение для проверки израильского номера телефона
    // Поддерживает форматы:
    // - 05X-XXXXXXX или 05XXXXXXXX (мобильные)
    // - +9725X-XXXXXXX или +9725XXXXXXXX (международный формат)
    const israeliPhoneRegex = /^(?:(?:\+972|0)(?:-)?(?:5|7|8|9))(\d{7,8})$/;
    return israeliPhoneRegex.test(phone.replace(/\s|-/g, ""));
  };

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/\s|-|\(|\)/g, "");
  };


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhoneError("");
  };

  const handleCheckUser = async () => {
    try {
      // Форматируем номер телефона
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Проверяем формат номера
      if (!validateIsraeliPhoneNumber(formattedPhone)) {
        setPhoneError(
          "Неверный формат номера телефона. Введите номер в израильском формате (например, 050-1234567 или +972-501234567)"
        );
        return;
      }

      // Проверка наличия пользователя в базе данных
      // Преобразуем номер в международный формат для проверки в базе
      let formattedPhoneForCheck = formattedPhone;
      if (formattedPhone.startsWith("0")) {
        formattedPhoneForCheck = "+972" + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith("+972")) {
        // Если номер не начинается с +972 и не с 0, добавляем +972
        formattedPhoneForCheck = "+972" + formattedPhone;
      }
      
      console.log('Попытка входа с номером:', formattedPhoneForCheck);
      const user = await loginUser(formattedPhoneForCheck);

      if (user) {
        console.log('Пользователь успешно вошел:', user);
        // Проверяем, сохранился ли токен
        const token = localStorage.getItem('userToken');
        console.log('Токен после входа:', token);
        
        // Пользователь существует, устанавливаем его в состояние
        setUser(user);
      } else {
        console.log('Пользователь не найден, показываем форму регистрации');
        // Пользователь не зарегистрирован, показываем форму регистрации
        setShowRegistration(true);
      }
    } catch (error) {
      console.error('Ошибка при проверке пользователя:', error);
      toast.error('Произошла ошибка при проверке пользователя');
    }
  };

  const handleRegister = async () => {
    try {
      // Проверяем, что имя не пустое
      if (!name.trim()) {
        toast.error("Введите ваше имя");
        return;
      }

      // Форматируем номер телефона
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Проверяем формат номера еще раз
      if (!validateIsraeliPhoneNumber(formattedPhone)) {
        setPhoneError(
          "Неверный формат номера телефона. Введите номер в израильском формате (например, 050-1234567 или +972-501234567)"
        );
        return;
      }

      // Форматируем номер телефона для сохранения в базе данных
      let formattedPhoneForDB = formattedPhone;
      
      // Если номер начинается с 0, заменяем на +972
      if (formattedPhone.startsWith("0")) {
        formattedPhoneForDB = "+972" + formattedPhone.slice(1);
      }
      // Если номер не начинается с +972, добавляем код страны
      else if (!formattedPhone.startsWith("+972")) {
        formattedPhoneForDB = "+972" + formattedPhone;
      }
      // Если номер уже начинается с +972, оставляем как есть

      console.log('Попытка регистрации с номером:', formattedPhoneForDB);
      // Регистрация пользователя
      const user = await registerUser(name, formattedPhoneForDB);

      if (user) {
        console.log('Пользователь успешно зарегистрирован:', user);
        // Проверяем, сохранился ли токен
        const token = localStorage.getItem('userToken');
        console.log('Токен после регистрации:', token);
        
        // Успешная регистрация, устанавливаем пользователя в состояние
        setUser(user);
        setShowRegistration(false);
      } else {
        console.error('Ошибка при регистрации: пользователь не создан');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      toast.error('Произошла ошибка при регистрации пользователя');
    }
  };

  return (
    <div className="login-container">
      <h2>Вход/Регистрация</h2>
      {showRegistration ? (
        <div className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              type="text"
              placeholder="Введите ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Номер телефона</label>
            <input
              id="phone"
              type="tel"
              placeholder="Например: 050-1234567"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className={phoneError ? "error" : ""}
            />
            {phoneError && <p className="error-message">{phoneError}</p>}
          </div>
          <div className="button-group">
            <button onClick={() => setShowRegistration(false)}>Назад</button>
            <button onClick={handleRegister} className="primary-button">Зарегистрироваться</button>
          </div>
        </div>
      ) : (
        <div className="login-form">
          <div className="form-group">
            <label htmlFor="phone">Номер телефона</label>
            <input
              id="phone"
              type="tel"
              placeholder="Например: 050-1234567 или +972-501234567"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className={phoneError ? "error" : ""}
            />
            {phoneError && <p className="error-message">{phoneError}</p>}
          </div>
          <button onClick={handleCheckUser} className="primary-button">Продолжить</button>
        </div>
      )}
    </div>
  );
};

export default Login;
