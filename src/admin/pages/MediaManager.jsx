import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const MediaManager = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'images', 'documents'
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [mediaDetails, setMediaDetails] = useState(null);
  const { user } = useAuth();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let query = supabase.from('media').select('*');
      
      // Apply filters
      if (filter === 'images') {
        query = query.like('mime_type', 'image/%');
      } else if (filter === 'documents') {
        query = query.or('mime_type.like.application/%,mime_type.like.text/%');
      }
      
      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filter, sortField, sortDirection]);

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;
        
        // Upload file to storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('media')
          .upload(filePath, file);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        
        const publicUrl = urlData.publicUrl;
        
        // Insert metadata into media table
        const { error: insertError } = await supabase
          .from('media')
          .insert({
            file_name: file.name,
            file_path: filePath,
            mime_type: file.type,
            size: file.size,
            url: publicUrl,
            created_by: user.id,
          });
        
        if (insertError) {
          throw insertError;
        }
        
        // Log activity
        await supabase.from('activity_logs').insert({
          action: 'uploaded',
          entity_type: 'Media',
          entity_id: filePath,
          user_id: user.id,
        });
      }
      
      // Refresh the media list
      fetchMedia();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        // Find the file to delete
        const fileToDelete = media.find(item => item.id === id);
        if (!fileToDelete) return;
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([fileToDelete.file_path]);
        
        if (storageError) {
          throw storageError;
        }
        
        // Delete from database
        const { error: dbError } = await supabase
          .from('media')
          .delete()
          .eq('id', id);
        
        if (dbError) {
          throw dbError;
        }
        
        // Log activity
        await supabase.from('activity_logs').insert({
          action: 'deleted',
          entity_type: 'Media',
          entity_id: id,
          user_id: user.id,
        });
        
        // Update local state
        setMedia(media.filter(item => item.id !== id));
        
        // Close details panel if the deleted item was selected
        if (selectedMedia && selectedMedia.id === id) {
          setSelectedMedia(null);
          setShowDetails(false);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file. Please try again.');
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMediaClick = (item) => {
    setSelectedMedia(item);
    setShowDetails(true);
    fetchMediaDetails(item);
  };

  const fetchMediaDetails = async (item) => {
    try {
      // Fetch usage information
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('id, title')
        .like('content', `%${item.url}%`);
      
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('id, title')
        .like('content', `%${item.url}%`);
      
      if (pagesError) throw pagesError;
      if (newsError) throw newsError;
      
      setMediaDetails({
        pages: pagesData || [],
        news: newsData || [],
      });
    } catch (error) {
      console.error('Error fetching media details:', error);
      setMediaDetails(null);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Copy URL to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert('URL copied to clipboard!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  // Filter media based on search term
  const filteredMedia = media.filter(item => {
    return item.file_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Determine media icon
  const getMediaIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className="h-6 w-6 text-indigo-500" aria-hidden="true" />;
    } else {
      return <DocumentIcon className="h-6 w-6 text-indigo-500" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Media Library</h1>
        <div>
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleUpload}
            className="sr-only"
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Upload Files
              </>
            )}
          </label>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden flex-1 ${showDetails ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
              </select>
            </div>
            <button
              type="button"
              onClick={fetchMedia}
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${selectedMedia?.id === item.id ? 'ring-2 ring-indigo-500' : ''}`}
                    onClick={() => handleMediaClick(item)}
                  >
                    <div className="aspect-w-4 aspect-h-3 bg-gray-100 dark:bg-gray-900 relative">
                      {item.mime_type.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.file_name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {getMediaIcon(item.mime_type)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.file_name}>
                        {item.file_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No media</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No results match your search.' : 'Get started by uploading a file.'}
                </p>
                <div className="mt-6">
                  <label
                    htmlFor="file-upload-empty"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Upload a file
                  </label>
                  <input
                    id="file-upload-empty"
                    type="file"
                    className="sr-only"
                    onChange={handleUpload}
                    multiple
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {showDetails && selectedMedia && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden lg:w-1/3">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">File Details</h2>
              <button
                onClick={closeDetails}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                {selectedMedia.mime_type.startsWith('image/') ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.file_name}
                    className="mx-auto max-h-40 object-contain"
                  />
                ) : (
                  <div className="flex justify-center p-8">
                    {getMediaIcon(selectedMedia.mime_type)}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">File name</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedMedia.file_name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedMedia.mime_type}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Size</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatFileSize(selectedMedia.size)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {format(new Date(selectedMedia.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</h3>
                  <div className="mt-1 flex items-center">
                    <input
                      type="text"
                      value={selectedMedia.url}
                      readOnly
                      className="flex-1 block w-full px-3 py-2 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedMedia.url)}
                      className="ml-2 p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <CheckIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                {mediaDetails && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Used in</h3>
                    {mediaDetails.pages.length > 0 || mediaDetails.news.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {mediaDetails.pages.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500">Pages:</h4>
                            <ul className="pl-5 list-disc text-sm text-gray-900 dark:text-white">
                              {mediaDetails.pages.map(page => (
                                <li key={page.id}>{page.title}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {mediaDetails.news.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500">News Articles:</h4>
                            <ul className="pl-5 list-disc text-sm text-gray-900 dark:text-white">
                              {mediaDetails.news.map(article => (
                                <li key={article.id}>{article.title}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Not used in any content
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManager;