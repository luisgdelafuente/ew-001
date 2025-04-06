import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PageForm from '../components/PageForm';

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Page not found');
        }
        
        setPage(data);
      } catch (error) {
        console.error('Error fetching page:', error);
        setError('Failed to load page. It may have been deleted or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 mt-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            <button
              className="mt-3 text-sm font-medium text-red-700 dark:text-red-200 hover:text-red-600 dark:hover:text-red-100"
              onClick={() => navigate('/admin/pages')}
            >
              ← Back to Pages
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Page not found</p>
        <button
          className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          onClick={() => navigate('/admin/pages')}
        >
          ← Back to Pages
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Page</h1>
      <PageForm initialValues={page} isEditing={true} />
    </div>
  );
};

export default EditPage;