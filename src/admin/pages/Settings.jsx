import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

const settingsSchema = Yup.object().shape({
  site_name: Yup.string()
    .required('Site name is required')
    .max(50, 'Site name must be 50 characters or less'),
  site_description: Yup.string()
    .max(160, 'Site description should be 160 characters or less for SEO'),
  contact_email: Yup.string()
    .email('Invalid email address'),
  logo_url: Yup.string()
    .url('Invalid URL format'),
  social_twitter: Yup.string()
    .matches(/^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]{1,15}$/, 'Invalid Twitter URL', { excludeEmptyString: true }),
  social_facebook: Yup.string()
    .matches(/^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.\-_]{1,}$/, 'Invalid Facebook URL', { excludeEmptyString: true }),
  social_instagram: Yup.string()
    .matches(/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]{1,30}\/?$/, 'Invalid Instagram URL', { excludeEmptyString: true }),
  social_linkedin: Yup.string()
    .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/(company|in)\/[a-zA-Z0-9\-_]{1,}$/, 'Invalid LinkedIn URL', { excludeEmptyString: true }),
});

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Convert settings array to object
        const settingsObject = {};
        data.forEach(setting => {
          settingsObject[setting.key] = setting.value;
        });
        
        setSettings(settingsObject);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setSuccess('');
    
    try {
      // Create an array of settings to upsert
      const settingsToUpsert = Object.entries(values).map(([key, value]) => ({
        key,
        value: value || '',
        updated_at: new Date(),
        updated_by: user.id,
      }));
      
      // Upsert settings to database
      const { error } = await supabase
        .from('settings')
        .upsert(settingsToUpsert, { onConflict: 'key' });
      
      if (error) {
        throw error;
      }
      
      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'updated',
        entity_type: 'Settings',
        entity_id: 'global',
        user_id: user.id,
      });
      
      setSuccess('Settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoUpload = async (file, setFieldValue) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo.${fileExt}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      
      setFieldValue('logo_url', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('Failed to upload logo. Please try again.');
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Site Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-200">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Formik
            initialValues={{
              site_name: settings.site_name || 'Epica Works',
              site_description: settings.site_description || '',
              contact_email: settings.contact_email || '',
              logo_url: settings.logo_url || '',
              social_twitter: settings.social_twitter || '',
              social_facebook: settings.social_facebook || '',
              social_instagram: settings.social_instagram || '',
              social_linkedin: settings.social_linkedin || '',
            }}
            validationSchema={settingsSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">General Settings</h3>
                  </div>
                  
                  <div>
                    <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Name
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="site_name"
                        id="site_name"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      />
                      <ErrorMessage name="site_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Email
                    </label>
                    <div className="mt-1">
                      <Field
                        type="email"
                        name="contact_email"
                        id="contact_email"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      />
                      <ErrorMessage name="contact_email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="site_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Description
                    </label>
                    <div className="mt-1">
                      <Field
                        as="textarea"
                        name="site_description"
                        id="site_description"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      />
                      <ErrorMessage name="site_description" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {values.site_description.length}/160 characters
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Logo
                    </label>
                    <div className="mt-1 flex items-center">
                      {values.logo_url && (
                        <div className="mr-3 h-16 w-16 overflow-hidden rounded-md">
                          <img
                            src={values.logo_url}
                            alt="Site logo"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <input
                          id="logo"
                          name="logo"
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            if (event.currentTarget.files?.[0]) {
                              handleLogoUpload(event.currentTarget.files[0], setFieldValue);
                            }
                          }}
                          className="block w-full text-sm text-gray-900 dark:text-white
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            dark:file:bg-indigo-900 dark:file:text-indigo-200
                            hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Recommended size: 200x50px
                        </p>
                      </div>
                    </div>
                    <div className="mt-1">
                      <label htmlFor="logo_url" className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Or enter logo URL directly:
                      </label>
                      <Field
                        type="text"
                        name="logo_url"
                        id="logo_url"
                        className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      />
                      <ErrorMessage name="logo_url" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">Social Media</h3>
                  </div>

                  <div>
                    <label htmlFor="social_twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Twitter URL
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="social_twitter"
                        id="social_twitter"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      />
                      <ErrorMessage name="social_twitter" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="social_facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Facebook URL
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="social_facebook"
                        id="social_facebook"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      />
                      <ErrorMessage name="social_facebook" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="social_instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Instagram URL
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="social_instagram"
                        id="social_instagram"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      />
                      <ErrorMessage name="social_instagram" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="social_linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      LinkedIn URL
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="social_linkedin"
                        id="social_linkedin"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                      />
                      <ErrorMessage name="social_linkedin" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Settings;