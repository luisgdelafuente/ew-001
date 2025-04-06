import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PageManager from './pages/PageManager';
import NewPage from './pages/NewPage';
import EditPage from './pages/EditPage';
import NewsManager from './pages/NewsManager';
import NewArticle from './pages/NewArticle';
import EditArticle from './pages/EditArticle';
import MediaManager from './pages/MediaManager';
import UserManager from './pages/UserManager';
import Settings from './pages/Settings';

const AdminApp = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="pages" 
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <PageManager />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="pages/new" 
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <NewPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="pages/edit/:id" 
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <EditPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="news" 
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <NewsManager />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="news/new" 
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <NewArticle />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="news/edit/:id" 
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <EditArticle />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="media" 
          element={
            <ProtectedRoute requiredRole="editor">
              <Layout>
                <MediaManager />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <UserManager />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect to admin dashboard for any other admin routes */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AdminApp;