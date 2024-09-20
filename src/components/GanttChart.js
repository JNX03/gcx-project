import React, { useEffect, useState, useRef } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import gantt from 'dhtmlx-gantt';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';

const GanttChart = ({ teamName }) => {
  const ganttContainerRef = useRef(null);  // Ref to track the Gantt container

  useEffect(() => {
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks`);

    // Fetch tasks and ensure correct date format
    onValue(taskRef, (snapshot) => {
      const taskList = snapshot.val() || [];
      const formattedTaskList = Array.isArray(taskList) ? taskList : Object.values(taskList);

      const tasksWithFormattedDates = formattedTaskList.map(task => ({
        ...task,
        start_date: formatValidDate(task.start_date),
        end_date: formatValidDate(task.end_date),
      }));

      gantt.clearAll();
      gantt.parse({ data: tasksWithFormattedDates });
    });

    // Initialize Gantt
    gantt.init(ganttContainerRef.current);

    // Resize Gantt on window resize
    window.addEventListener('resize', () => gantt.render());

    return () => {
      window.removeEventListener('resize', () => gantt.render());
    };
  }, [teamName]);

  // Save task changes to Firebase
  const saveGanttTasks = () => {
    const tasks = gantt.serialize().data;
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks`);
    set(taskRef, tasks);
  };

  // Format date to ensure it's valid
  const formatValidDate = (date) => {
    if (!date) return new Date(); // If date is missing, return current date
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;  // If invalid date, return current date
  };

  return (
    <div style={{ width: '100%', height: '90vh' }}>
      <div ref={ganttContainerRef} id="gantt_here" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default GanttChart;
