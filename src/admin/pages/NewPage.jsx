import React from 'react';
import PageForm from '../components/PageForm';

const NewPage = () => {
  const initialValues = {
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    featured_image: ''
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Page</h1>
      <PageForm initialValues={initialValues} />
    </div>
  );
};

export default NewPage;