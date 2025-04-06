import React, { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../../lib/supabase';
import slugify from 'slugify';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

// Validation schema for news article form
const newsSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title must be 100 characters or less'),
  slug: Yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(100, 'Slug must be 100 characters or less'),
  excerpt: Yup.string()
    .max(300, 'Excerpt must be 300 characters or less'),
  meta_title: Yup.string()
    .max(60, 'Meta title should be 60 characters or less for SEO'),
  meta_description: Yup.string()
    .max(160, 'Meta description should be 160 characters or less for SEO'),
  category_id: Yup.string()
    .required('Category is required'),
  tags: Yup.string(),
  status: Yup.string()
    .oneOf(['draft', 'published', 'scheduled'], 'Invalid status')
    .required('Status is required'),
  publish_date: Yup.date()
    .nullable()
    .when('status', {
      is: 'scheduled',
      then: Yup.date().required('Publish date is required for scheduled articles'),
    }),
});

const NewsForm = ({ initialValues, isEditing = false }) => {
  const [content, setContent] = useState(initialValues.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const formikRef = useRef();

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please refresh the page.');
      }
    };
    
    fetchCategories();
  }, []);

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
      const filePath = `news-images/${fileName}`;

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
      // Process tags
      const tagArray = values.tags
        ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const articleData = {
        ...values,
        content,
        tags: tagArray,
        updated_at: new Date(),
      };

      // Handle file upload if featured image is provided
      if (values.featured_image && typeof values.featured_image !== 'string') {
        const imageUrl = await handleImageUpload(values.featured_image);
        if (imageUrl) {
          articleData.featured_image = imageUrl;
        } else {
          // If upload failed, remove the featured image
          delete articleData.featured_image;
        }
      }

      let result;
      
      if (isEditing) {
        // Update existing article
        const { data, error } = await supabase
          .from('news')
          .update(articleData)
          .eq('id', initialValues.id);
          
        if (error) throw error;
        result = { ...data, id: initialValues.id };
        
        // Log activity
        await supabase.from('activity_logs').insert({
          action: 'updated',
          entity_type: 'News Article',
          entity_id: initialValues.id,
          user_id: user.id,
        });
      } else {
        // Create new article
        const { data, error } = await supabase
          .from('news')
          .insert({
            ...articleData,
            created_at: new Date(),
          })
          .select();
          
        if (error) throw error;
        result = data[0];
        
        // Log activity
        await supabase.from('activity_logs').insert({
          action: 'created',
          entity_type: 'News Article',
          entity_id: result.id,
          user_id: user.id,
        });
      }

      navigate('/admin/news');
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article. Please try again.');
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

  // Format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), 'yyyy-MM-dd');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Formik
        innerRef={formikRef}
        initialValues={{
          title: initialValues.title || '',
          slug: initialValues.slug || '',
          excerpt: initialValues.excerpt || '',
          meta_title: initialValues.meta_title || '',
          meta_description: initialValues.meta_description || '',
          category_id: initialValues.category_id || '',
          tags: Array.isArray(initialValues.tags) ? initialValues.tags.join(', ') : initialValues.tags || '',
          status: initialValues.status || 'draft',
          publish_date: initialValues.publish_date ? formatDateForInput(initialValues.publish_date) : '',
          featured_image: initialValues.featured_image || '',
        }}
        validationSchema={newsSchema}
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
                  Article Title
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
                    /news/
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
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Excerpt
                </label>
                <div className="mt-1">
                  <Field
                    as="textarea"
                    name="excerpt"
                    id="excerpt"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                  />
                  <ErrorMessage name="excerpt" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Brief summary of the article. {values.excerpt.length}/300 characters
                </p>
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
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <div className="mt-1">
                  <Field
                    as="select"
                    name="category_id"
                    id="category_id"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="category_id" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </label>
                <div className="mt-1">
                  <Field
                    type="text"
                    name="tags"
                    id="tags"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                  />
                  <ErrorMessage name="tags" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Comma-separated list of tags (e.g. news, update, feature)
                </p>
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
                        className="h-20 w-32 object-cover rounded-md"
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
                    <option value="scheduled">Scheduled</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {values.status === 'scheduled' && (
                <div>
                  <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publish Date
                  </label>
                  <div className="mt-1">
                    <Field
                      type="date"
                      name="publish_date"
                      id="publish_date"
                      min={formatDateForInput(new Date())}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                    />
                    <ErrorMessage name="publish_date" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/news')}
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

export default NewsForm;