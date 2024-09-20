import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { db } from '../firebase';
import TaskModal from './TaskModal'; 
const localizer = momentLocalizer(moment);

const CalendarView = ({ teamName }) => {
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const saveTask = (task) => {
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks`);
    if (task.id) {
      set(ref(db, `teams/${teamName}/gantt_tasks/${task.id}`), task);
    } else {
      const newTaskRef = push(taskRef);
      set(newTaskRef, task);
    }
    setShowModal(false);
  };

  const deleteTask = (taskId) => {
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks/${taskId}`);
    remove(taskRef);
    setShowModal(false);
  };

  const handleSelectEvent = (event) => {
    setSelectedTask(event.taskData);
    setShowModal(true);
  };

  const handleSelectSlot = (slotInfo) => {
    const newTask = {
      id: null,
      text: '',
      start_date: slotInfo.start,
      end_date: slotInfo.end,
    };
    setSelectedTask(newTask);
    setShowModal(true); 
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
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
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
