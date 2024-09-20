import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ref, onValue, set, push, remove } from "firebase/database";
import { db } from "../firebase";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // Fetch todos from Firebase
  useEffect(() => {
    const todoRef = ref(db, "todos/");
    onValue(todoRef, (snapshot) => {
      const data = snapshot.val();
      const todoList = data
        ? Object.entries(data).map(([id, content]) => ({ id, content }))
        : [];
      setTodos(todoList);
    });
  }, []);

  // Add new todo to Firebase
  const addTodo = async () => {
    if (newTodo.trim() === "") return;
    const todoRef = ref(db, "todos/");
    const newTodoRef = push(todoRef);
    set(newTodoRef, { content: newTodo });
    setNewTodo("");
  };

  // Delete todo from Firebase
  const deleteTodo = async (id) => {
    const todoRef = ref(db, `todos/${id}`);
    await remove(todoRef);
  };

  // Handle drag and drop event
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
  };

  return (
    <div className="todo-section">
      <h2>To-Do List</h2>
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

      <DragDropContext onDragEnd={handleDragEnd}>
        {todos.length > 0 && (
          <Droppable droppableId="todoList">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ padding: "10px", backgroundColor: "#1a2238" }}
              >
                {todos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="todo-list-item"
                      >
                        {todo.content.content}
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
        )}
      </DragDropContext>
    </div>
  );
};

export default TodoList;
