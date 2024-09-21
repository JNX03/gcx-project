import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { db } from '../firebase';
import Swal from 'sweetalert2';

const TodoList = ({ teamName }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

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

  const addTodo = async () => {
    if (newTodo.trim() === '') return;
    const todoRef = ref(db, `teams/${teamName}/todos`);
    const newTodoRef = push(todoRef);
    await set(newTodoRef, { content: newTodo, done: false });
    setNewTodo('');

    // Show success alert
    Swal.fire({
      icon: 'success',
      title: 'Todo Added',
      text: 'Your task has been added successfully!',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const deleteTodo = async (id) => {
    const todoRef = ref(db, `teams/${teamName}/todos/${id}`);
    await remove(todoRef);

    // Show success alert
    Swal.fire({
      icon: 'success',
      title: 'Todo Deleted',
      text: 'Your task has been deleted successfully!',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const toggleTodoDone = async (id, currentDoneStatus) => {
    const todoRef = ref(db, `teams/${teamName}/todos/${id}`);
    await update(todoRef, { done: !currentDoneStatus });

    // Show success alert
    Swal.fire({
      icon: 'success',
      title: currentDoneStatus ? 'Todo Marked as Not Done' : 'Todo Completed',
      text: `Your task has been marked as ${currentDoneStatus ? 'not done' : 'done'}!`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
  };

  const completedCount = todos.filter(todo => todo.done).length;
  const totalCount = todos.length;

  return (
    <div className="todo-section">
      <h2>To-Do List</h2>
      <p>Total tasks: {totalCount}, Completed tasks: {completedCount}</p>

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
        {todos.length > 0 ? (
          <Droppable droppableId="droppable-todo-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="todo-list"
              >
                {todos.map((todo, index) => (
                  <Draggable
                    key={todo.id}
                    draggableId={String(todo.id)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`todo-list-item ${
                          snapshot.isDragging ? 'dragging' : ''
                        } ${todo.done ? 'completed' : ''}`} // Add 'completed' class if done
                      >
                        <div className="todo-item-content">
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleTodoDone(todo.id, todo.done)}
                            className="todo-checkbox"
                          />
                          <span className={todo.done ? 'done-task' : ''}>
                            {todo.content}
                          </span>
                        </div>
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
                {provided.placeholder}
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
