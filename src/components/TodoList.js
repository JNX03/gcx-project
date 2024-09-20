import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { db } from '../firebase';

const TodoList = ({ teamName }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  // Fetch data from Firebase
  useEffect(() => {
    const todoRef = ref(db, `teams/${teamName}/todos`);
    onValue(todoRef, (snapshot) => {
      const data = snapshot.val();
      const todoList = data
        ? Object.entries(data).map(([id, content]) => ({ id, ...content }))
        : [];
      setTodos(todoList);
    });
  }, [teamName]);

  // Add a new todo item
  const addTodo = async () => {
    if (newTodo.trim() === '') return;
    const todoRef = ref(db, `teams/${teamName}/todos`);
    const newTodoRef = push(todoRef);
    set(newTodoRef, { content: newTodo });
    setNewTodo('');
  };

  // Delete a todo item
  const deleteTodo = async (id) => {
    const todoRef = ref(db, `teams/${teamName}/todos/${id}`);
    await remove(todoRef);
  };

  // Handle drag-and-drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return; // If no destination, return

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
  };

  console.log('Todos:', todos); // Add logging to see if todos are being rendered properly

  return (
    <div className="todo-section">
      <h2>To-Do List</h2>

      <div className="todo-input-container">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
          className="todo-input"
        />
        <button onClick={addTodo} className="add-button">
          Add Todo
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Always ensure the Droppable is rendered */}
        {todos.length > 0 ? (
          <Droppable droppableId="droppable-todo-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef} // Ensure the ref is correctly attached
                className="todo-list"
              >
                {todos.map((todo, index) => (
                  <Draggable
                    key={todo.id} // Ensure a unique key
                    draggableId={String(todo.id)} // Ensure draggableId is a string
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef} // Ensure the ref is correctly attached
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`todo-list-item ${
                          snapshot.isDragging ? 'dragging' : ''
                        }`}
                      >
                        <span>{todo.content}</span>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder} {/* Ensure placeholder is rendered */}
              </div>
            )}
          </Droppable>
        ) : (
          <p className="no-tasks">No tasks yet. Add a new task!</p>
        )}
      </DragDropContext>
    </div>
  );
};

export default TodoList;
