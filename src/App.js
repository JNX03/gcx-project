import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import GanttChart from './components/GanttChart';
import TodoList from './components/TodoList';
import CalendarView from './components/Calendar';
import Login from './components/Login';
import './App.css';

function App() {
  const [teamName, setTeamName] = useState(null);

  const handleLoginSuccess = (teamName) => {
    setTeamName(teamName);
  };

  return (
    <Router>
      <div className="App dark">
        <nav className="navbar">
          <h1>GcX://Project/{teamName ? teamName : ''}</h1>
          <div className="nav-links">
            {teamName && (
              <>
                <Link to="/gantt">Gantt Chart</Link>
                <Link to="/todolist">To-Do List</Link>
                <Link to="/calendar">Calendar</Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              teamName ? (
                <GanttChart teamName={teamName} />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          {teamName && (
            <>
              <Route path="/gantt" element={<GanttChart teamName={teamName} />} />
              <Route path="/todolist" element={<TodoList teamName={teamName} />} />
              <Route path="/calendar" element={<CalendarView teamName={teamName} />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
