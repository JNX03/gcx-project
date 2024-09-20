import React, { useEffect, useState } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import gantt from 'dhtmlx-gantt';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { ChromePicker } from 'react-color';

const GanttChart = ({ teamName }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskColor, setTaskColor] = useState('#3e5f8a');

  useEffect(() => {
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks`);

    onValue(taskRef, (snapshot) => {
      const taskList = snapshot.val() || [];
      gantt.clearAll();
      gantt.parse({ data: taskList });
    });

    gantt.init('gantt_here');

    gantt.attachEvent('onAfterTaskAdd', saveGanttTasks);
    gantt.attachEvent('onAfterTaskUpdate', saveGanttTasks);
    gantt.attachEvent('onAfterTaskDelete', saveGanttTasks);

    // Custom event to select a task and show color picker
    gantt.attachEvent('onTaskClick', function (id) {
      setSelectedTaskId(id);
      const task = gantt.getTask(id);
      setTaskColor(task.color || '#3e5f8a');
      return true;
    });
  }, [teamName]);

  const saveGanttTasks = () => {
    const tasks = gantt.serialize().data;
    const taskRef = ref(db, `teams/${teamName}/gantt_tasks`);
    set(taskRef, tasks);
  };

  const handleColorChange = (color) => {
    setTaskColor(color.hex);
    if (selectedTaskId) {
      const task = gantt.getTask(selectedTaskId);
      task.color = color.hex;  // Set the task-specific color
      gantt.updateTask(selectedTaskId);  // Update task color
      saveGanttTasks();  // Save changes to Firebase
    }
  };

  gantt.templates.task_class = function (start, end, task) {
    return task.color ? 'custom-task-' + task.id : '';  // Apply color per task
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div id="gantt_here" style={{ width: '75%', height: '90vh' }}></div>
      <div className="settings-sidebar" style={{ width: '25%', padding: '10px', backgroundColor: '#1e3a5f', color: 'white' }}>
        <h3>Task Settings</h3>
        {selectedTaskId && (
          <>
            <h4>Customize Task Color</h4>
            <ChromePicker color={taskColor} onChange={handleColorChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default GanttChart;
