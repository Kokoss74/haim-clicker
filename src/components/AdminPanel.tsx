import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { Database } from '../types/database';

type Question = Database['public']['Tables']['questions']['Row'];

const AdminPanel = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id'>>({
    question_text: '',
    answer: '',
    difficulty: 1,
    hint: '',
    reward: 1,
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data || []);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: name === 'difficulty' || name === 'reward' ? parseInt(value, 10) : value,
    }));
  };

  const addQuestion = async () => {
    const { data, error } = await supabase
      .from('questions')
      .insert([newQuestion])
      .select()
      .single();

    if (error) {
      console.error('Error adding question:', error);
    } else {
      setQuestions([...questions, data]);
      setNewQuestion({
        question_text: '',
        answer: '',
        difficulty: 1,
        hint: '',
        reward: 1,
      });
    }
  };

  const deleteQuestion = async (id: number) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
    } else {
      setQuestions(questions.filter(question => question.id !== id));
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      {/* Add Question Form */}
      <h3>Add New Question</h3>
      <input
        type="text"
        name="question_text"
        placeholder="Question Text"
        value={newQuestion.question_text}
        onChange={handleInputChange}
      />
      <textarea
        name="answer"
        placeholder="Answer"
        value={newQuestion.answer}
        onChange={handleInputChange}
      />
      <select name="difficulty" value={newQuestion.difficulty} onChange={handleInputChange}>
        <option value={1}>Easy</option>
        <option value={2}>Medium</option>
        <option value={3}>Hard</option>
      </select>
      <input
        type="text"
        name="hint"
        placeholder="Hint"
        value={newQuestion.hint}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="reward"
        placeholder="Reward"
        value={newQuestion.reward}
        onChange={handleInputChange}
      />
      <button onClick={addQuestion}>Add Question</button>

      {/* Question List */}
      <h3>Existing Questions</h3>
      <ul>
        {questions.map(question => (
          <li key={question.id}>
            {question.question_text} - {question.answer} ({question.difficulty})
            <button onClick={() => deleteQuestion(question.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;