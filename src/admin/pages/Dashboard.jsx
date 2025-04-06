import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ClockIcon,
  DocumentTextIcon,
  NewspaperIcon,
  PhotoIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    pageCount: 0,
    articleCount: 0,
    mediaCount: 0,
    userCount: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch page count
        const { count: pageCount, error: pageError } = await supabase
          .from('pages')
          .select('id', { count: 'exact', head: true });
          
        if (pageError) throw pageError;

        // Fetch article count
        const { count: articleCount, error: articleError } = await supabase
          .from('news')
          .select('id', { count: 'exact', head: true });
          
        if (articleError) throw articleError;

        // Fetch media count
        const { count: mediaCount, error: mediaError } = await supabase
          .from('media')
          .select('id', { count: 'exact', head: true });
          
        if (mediaError) throw mediaError;

        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true });
          
        if (userError) throw userError;

        // Fetch recent activity and manually join with users table
        const { data: activityData, error: activityError } = await supabase
          .from('activity_logs')
          .select('id, action, entity_type, entity_id, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (activityError) throw activityError;
        
        // If we have activity data, fetch associated user emails
        let enrichedActivityData = [];
        if (activityData && activityData.length > 0) {
          // Get unique user IDs from activities
          const userIds = [...new Set(activityData.map(item => item.user_id))].filter(Boolean);
          
          if (userIds.length > 0) {
            // Fetch user emails for these IDs
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, email')
              .in('id', userIds);
              
            if (usersError) throw usersError;
            
            // Create a map of user IDs to emails
            const userMap = {};
            if (usersData) {
              usersData.forEach(user => {
                userMap[user.id] = user.email;
              });
            }
            
            // Enrich activity data with user emails
            enrichedActivityData = activityData.map(activity => ({
              ...activity,
              user_email: userMap[activity.user_id] || 'Unknown User'
            }));
          } else {
            // If no valid userIds, just use the activity data as is
            enrichedActivityData = activityData.map(activity => ({
              ...activity,
              user_email: 'Unknown User'
            }));
          }
        }

        setStats({
          pageCount: pageCount || 0,
          articleCount: articleCount || 0,
          mediaCount: mediaCount || 0,
          userCount: userCount || 0,
        });
        
        setRecentActivity(enrichedActivityData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/30 dark:border-red-500">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-medium text-red-700 dark:text-red-200 hover:text-red-600 dark:hover:text-red-100"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format date for activity log
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pages</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.pageCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/pages" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <NewspaperIcon className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">News Articles</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.articleCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/news" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhotoIcon className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Media Files</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.mediaCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/media" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.userCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                              <ClockIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {activity.user_email || 'Unknown user'}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(activity.created_at)}
                              </p>
                            </div>
                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                              <p>
                                {activity.action} a {activity.entity_type.toLowerCase()}
                                {activity.entity_id ? ` (ID: ${activity.entity_id})` : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No recent activity
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/activity" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                View all activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;