import React, { useEffect, useRef } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import gantt from 'dhtmlx-gantt';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

const GanttChart = ({ teamName }) => {
  const ganttContainerRef = useRef(null); 

  useEffect(() => {
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks`);

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

    gantt.init(ganttContainerRef.current);

    window.addEventListener('resize', () => gantt.render());

    return () => {
      window.removeEventListener('resize', () => gantt.render());
    };
  }, [teamName]);

  const formatValidDate = (date) => {
    if (!date) return new Date();
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate; 
  };

  return (
    <div style={{ width: '100%', height: '90vh' }}>
      <div ref={ganttContainerRef} id="gantt_here" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default GanttChart;
