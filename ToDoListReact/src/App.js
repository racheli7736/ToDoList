import React, { useEffect, useState } from 'react';
import service from './service.js';

function App() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);

  async function getTodos() {
    const todos = await service.getTasks();
    setTodos(todos);
  }

  async function createTodo(e) {
    e.preventDefault();
    await service.addTask(newTodo);
    setNewTodo("");//clear input
    await getTodos();//refresh tasks list (in order to see the new one)
  }

  async function updateCompleted(todo, isComplete) {
    await service.setCompleted(todo.id, isComplete);
    await getTodos();//refresh tasks list (in order to see the updated one)
  }

  async function deleteTodo(id) {
    await service.deleteTask(id);
    await getTodos();//refresh tasks list
  }

  useEffect(() => {
    getTodos();
  }, []);

  const remaining = todos.filter(t => !t.isComplete).length;

  return (
    <div className="page">
      <section className="card">
        <div className="top-bar">
          <div>
            <h1 className="title">המשימות שלי</h1>
            <p className="subtitle">מה עושים היום?</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => service.logout()}
          >
            התנתקות
          </button>
        </div>

        <form className="add-form" onSubmit={createTodo}>
          <input
            className="field"
            placeholder="הוספת משימה חדשה..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">הוספה</button>
        </form>

        {todos.length === 0 ? (
          <p className="empty">אין משימות עדיין. אפשר להוסיף את הראשונה למעלה.</p>
        ) : (
          <>
            <ul className="todo-list">
              {todos.map(todo => (
                <li className={"todo-item" + (todo.isComplete ? " completed" : "")} key={todo.id}>
                  <input
                    type="checkbox"
                    defaultChecked={todo.isComplete}
                    onChange={(e) => updateCompleted(todo, e.target.checked)}
                    aria-label="סימון כבוצע"
                  />
                  <span className="todo-name">{todo.name}</span>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label="מחיקת משימה"
                    title="מחיקה"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="footer-count">
              {remaining === 0 ? "כל המשימות הושלמו" : `נשארו ${remaining} משימות`}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default App;