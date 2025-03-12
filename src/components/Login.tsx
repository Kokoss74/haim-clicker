import React, { useState } from "react";
import { supabase } from "../supabase/client";

interface LoginProps {
  setUser: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleLogin = async () => {
    // Проверка наличия пользователя в базе данных
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", phoneNumber)
      .single();

    if (error) {
      console.error("Ошибка при проверке пользователя:", error);
      alert("Ошибка при входе. Попробуйте еще раз.");
      return;
    }

    if (data) {
      // Пользователь существует, устанавливаем его в состояние
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } else {
      // Пользователь не зарегистрирован, показываем форму регистрации
      setIsRegistered(true);
    }
  };

  const handleRegister = async () => {
    // Регистрация пользователя
    const { data, error } = await supabase
      .from("users")
      .insert([{ phone_number: phoneNumber, name: name }])
      .select()
      .single();

    if (error) {
      console.error("Ошибка при регистрации:", error);
      alert("Ошибка при регистрации. Попробуйте еще раз.");
      return;
    }

    // Успешная регистрация, устанавливаем пользователя в состояние
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    setIsRegistered(false);
  };

  return (
    <div>
      <h2>Вход/Регистрация</h2>
      {isRegistered ? (
        <div>
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleRegister}>Зарегистрироваться</button>
        </div>
      ) : (
        <div>
          <input
            type="tel"
            placeholder="Номер телефона"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button onClick={handleLogin}>Войти</button>
        </div>
      )}
    </div>
  );
};

export default Login;
