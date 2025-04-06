import React from 'react';
import NewsForm from '../components/NewsForm';

const NewArticle = () => {
  const initialValues = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    category_id: '',
    tags: [],
    status: 'draft',
    publish_date: null,
    featured_image: ''
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Article</h1>
      <NewsForm initialValues={initialValues} />
    </div>
  );
};

export default NewArticle;