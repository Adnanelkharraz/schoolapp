import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { StudentList } from './pages/StudentList';
import { TeacherList } from './pages/TeacherList';
import { CourseList } from './pages/CourseList';
import { EnrollmentList } from './pages/EnrollmentList';
import { ResourceList } from './pages/ResourceList';
import theme from './theme/theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/teachers" element={<TeacherList />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/enrollments" element={<EnrollmentList />} />
            <Route path="/resources" element={<ResourceList />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
