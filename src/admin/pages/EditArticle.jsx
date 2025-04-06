import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import NewsForm from '../components/NewsForm';

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Article not found');
        }
        
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Failed to load article. It may have been deleted or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
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
              onClick={() => navigate('/admin/news')}
            >
              ← Back to News
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Article not found</p>
        <button
          className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          onClick={() => navigate('/admin/news')}
        >
          ← Back to News
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Article</h1>
      <NewsForm initialValues={article} isEditing={true} />
    </div>
  );
};

export default EditArticle;