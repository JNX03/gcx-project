import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { db } from '../firebase';
import TaskModal from './TaskModal';  // Assuming this is a modal component for task management

const localizer = momentLocalizer(moment);

const CalendarView = ({ teamName }) => {
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);  // Track selected task
  const [showModal, setShowModal] = useState(false);  // Modal for task

  useEffect(() => {
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks`);
    onValue(taskRef, (snapshot) => {
      const taskList = snapshot.val() || [];
      const formattedTaskList = Array.isArray(taskList) ? taskList : Object.values(taskList);

      const formattedEvents = formattedTaskList.map((task) => ({
        id: task.id,
        title: task.text,
        start: new Date(task.start_date),
        end: new Date(task.end_date),
        taskData: task
      }));
      setEvents(formattedEvents);
    });
  }, [teamName]);

  // Save task to Firebase
  const saveTask = (task) => {
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks`);
    if (task.id) {
      // Update task
      set(ref(db, `teams/${teamName}/gantt_tasks/${task.id}`), task);
    } else {
      // Create new task
      const newTaskRef = push(taskRef);
      set(newTaskRef, task);
    }
    setShowModal(false);
  };

  // Delete task from Firebase
  const deleteTask = (taskId) => {
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks/${taskId}`);
    remove(taskRef);
    setShowModal(false);
  };

  const handleSelectEvent = (event) => {
    setSelectedTask(event.taskData);
    setShowModal(true);  // Show modal for editing
  };

  const handleSelectSlot = (slotInfo) => {
    const newTask = {
      id: null,
      text: '',
      start_date: slotInfo.start,
      end_date: slotInfo.end,
    };
    setSelectedTask(newTask);
    setShowModal(true);  // Show modal for creating a task
  };

  return (
    <div className="calendar-container">
      <div className="calendar-section">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectEvent={handleSelectEvent}  // Edit event on click
          onSelectSlot={handleSelectSlot}    // Add new event
          style={{ height: '100%' }}
        />
      </div>
      <div className="details-section">
        {showModal && (
          <TaskModal
            task={selectedTask}
            onSave={saveTask}
            onDelete={deleteTask}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarView;
