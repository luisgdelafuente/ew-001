import React, { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../../lib/supabase';
import slugify from 'slugify';
import { useAuth } from '../context/AuthContext';

// Validation schema for page form
const pageSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title must be 100 characters or less'),
  slug: Yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(100, 'Slug must be 100 characters or less'),
  meta_title: Yup.string()
    .max(60, 'Meta title should be 60 characters or less for SEO'),
  meta_description: Yup.string()
    .max(160, 'Meta description should be 160 characters or less for SEO'),
  status: Yup.string()
    .oneOf(['published', 'draft'], 'Invalid status')
    .required('Status is required'),
});

const PageForm = ({ initialValues, isEditing = false }) => {
  const [content, setContent] = useState(initialValues.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const formikRef = useRef();

  // Content editor toolbar options
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  const handleImageUpload = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `page-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSaving(true);
    setError('');

    try {
      const pageData = {
        ...values,
        content,
        updated_at: new Date(),
      };

      // Handle file upload if featured image is provided
      if (values.featured_image && typeof values.featured_image !== 'string') {
        const imageUrl = await handleImageUpload(values.featured_image);
        if (imageUrl) {
          pageData.featured_image = imageUrl;
        } else {
          // If upload failed, remove the featured image
          delete pageData.featured_image;
        }
      }

      let result;
      
      if (isEditing) {
        // Update existing page
        const { data, error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', initialValues.id);
          
        if (error) throw error;
        result = { ...data, id: initialValues.id };
        
        // Log activity
        await supabase.from('activity_logs').insert({
          action: 'updated',
          entity_type: 'Page',
          entity_id: initialValues.id,
          user_id: user.id,
        });
      } else {
        // Create new page
        const { data, error } = await supabase
          .from('pages')
          .insert({
            ...pageData,
            created_at: new Date(),
          })
          .select();
          
        if (error) throw error;
        result = data[0];
        
        // Log activity
        await supabase.from('activity_logs').insert({
          action: 'created',
          entity_type: 'Page',
          entity_id: result.id,
          user_id: user.id,
        });
      }

      // Save page version for history tracking
      await supabase.from('page_versions').insert({
        page_id: result.id,
        content: pageData.content,
        title: pageData.title,
        user_id: user.id,
        created_at: new Date(),
      });

      navigate('/admin/pages');
    } catch (error) {
      console.error('Error saving page:', error);
      setError('Failed to save page. Please try again.');
    } finally {
      setIsSaving(false);
      setSubmitting(false);
    }
  };

  const generateSlug = () => {
    if (formikRef.current) {
      const title = formikRef.current.values.title;
      if (title) {
        const slug = slugify(title, { lower: true, strict: true });
        formikRef.current.setFieldValue('slug', slug);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Formik
        innerRef={formikRef}
        initialValues={{
          title: initialValues.title || '',
          slug: initialValues.slug || '',
          meta_title: initialValues.meta_title || '',
          meta_description: initialValues.meta_description || '',
          status: initialValues.status || 'draft',
          featured_image: initialValues.featured_image || '',
        }}
        validationSchema={pageSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/30 dark:border-red-500">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page Title
                </label>
                <div className="mt-1">
                  <Field
                    type="text"
                    name="title"
                    id="title"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                    onBlur={generateSlug}
                  />
                  <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 sm:text-sm">
                    /
                  </span>
                  <Field
                    type="text"
                    name="slug"
                    id="slug"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <ErrorMessage name="slug" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content
                </label>
                <div className="mt-1">
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    formats={formats}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-64 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meta Title
                </label>
                <div className="mt-1">
                  <Field
                    type="text"
                    name="meta_title"
                    id="meta_title"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                  />
                  <ErrorMessage name="meta_title" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {values.meta_title.length}/60 characters
                </p>
              </div>

              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meta Description
                </label>
                <div className="mt-1">
                  <Field
                    as="textarea"
                    name="meta_description"
                    id="meta_description"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                  />
                  <ErrorMessage name="meta_description" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {values.meta_description.length}/160 characters
                </p>
              </div>

              <div>
                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured Image
                </label>
                <div className="mt-1 flex items-center">
                  {values.featured_image && typeof values.featured_image === 'string' && (
                    <div className="mr-3">
                      <img
                        src={values.featured_image}
                        alt="Featured preview"
                        className="h-20 w-20 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <input
                    id="featured_image"
                    name="featured_image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      setFieldValue('featured_image', event.currentTarget.files[0]);
                    }}
                    className="block w-full text-sm text-gray-900 dark:text-white
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      dark:file:bg-indigo-900 dark:file:text-indigo-200
                      hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <div className="mt-1">
                  <Field
                    as="select"
                    name="status"
                    id="status"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/pages')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isSaving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PageForm;