import React, { useState, useEffect } from 'react';

const TaskModal = ({ task, onSave, onDelete, onClose }) => {
  const [taskText, setTaskText] = useState(task.text);
  const [startDate, setStartDate] = useState(new Date(task.start_date));
  const [endDate, setEndDate] = useState(new Date(task.end_date));

  const handleSave = () => {
    const updatedTask = {
      ...task,
      text: taskText,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
    onSave(updatedTask);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="modal">
      <h2>{task.id ? 'Edit Task' : 'New Task'}</h2>
      <label>Task Name:</label>
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
      />
      <label>Start Date:</label>
      <input
        type="datetime-local"
        value={startDate.toISOString().slice(0, 16)}
        onChange={(e) => setStartDate(new Date(e.target.value))}
      />
      <label>End Date:</label>
      <input
        type="datetime-local"
        value={endDate.toISOString().slice(0, 16)}
        onChange={(e) => setEndDate(new Date(e.target.value))}
      />
      <div className="modal-actions">
        <button onClick={handleSave}>Save</button>
        {task.id && <button onClick={handleDelete}>Delete</button>}
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TaskModal;
