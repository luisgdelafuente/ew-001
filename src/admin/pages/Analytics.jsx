import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [pageViews, setPageViews] = useState({});
  const [newsViews, setNewsViews] = useState({});
  const [topPages, setTopPages] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [deviceStats, setDeviceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30days'); // '7days', '30days', '90days', 'thisMonth', 'lastMonth'

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Calculate date range
        let startDate, endDate;
        const now = new Date();
        
        switch (dateRange) {
          case '7days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            endDate = new Date(now);
            break;
          case '30days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            endDate = new Date(now);
            break;
          case '90days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 90);
            endDate = new Date(now);
            break;
          case 'thisMonth':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
          case 'lastMonth':
            const lastMonth = subMonths(now, 1);
            startDate = startOfMonth(lastMonth);
            endDate = endOfMonth(lastMonth);
            break;
          default:
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            endDate = new Date(now);
        }
        
        // Format dates for query
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        // Fetch page views over time
        const { data: pageViewsData, error: pageViewsError } = await supabase
          .from('page_views')
          .select('date, count')
          .gte('date', startDateStr.split('T')[0])
          .lte('date', endDateStr.split('T')[0])
          .order('date');
        
        if (pageViewsError) throw pageViewsError;
        
        // Fetch news article views over time
        const { data: newsViewsData, error: newsViewsError } = await supabase
          .from('news_views')
          .select('date, count')
          .gte('date', startDateStr.split('T')[0])
          .lte('date', endDateStr.split('T')[0])
          .order('date');
        
        if (newsViewsError) throw newsViewsError;
        
        // Fetch top pages
        const { data: topPagesData, error: topPagesError } = await supabase
          .from('page_views')
          .select('path, SUM(count) as total')
          .gte('date', startDateStr.split('T')[0])
          .lte('date', endDateStr.split('T')[0])
          .neq('path', '/')
          .neq('path', '/index.html')
          .group('path')
          .order('total', { ascending: false })
          .limit(5);
        
        if (topPagesError) throw topPagesError;
        
        // Fetch top referrers
        const { data: topReferrersData, error: topReferrersError } = await supabase
          .from('referrers')
          .select('domain, SUM(count) as total')
          .gte('date', startDateStr.split('T')[0])
          .lte('date', endDateStr.split('T')[0])
          .group('domain')
          .order('total', { ascending: false })
          .limit(5);
        
        if (topReferrersError) throw topReferrersError;
        
        // Fetch device stats
        const { data: deviceStatsData, error: deviceStatsError } = await supabase
          .from('device_stats')
          .select('device_type, SUM(count) as total')
          .gte('date', startDateStr.split('T')[0])
          .lte('date', endDateStr.split('T')[0])
          .group('device_type')
          .order('total', { ascending: false });
        
        if (deviceStatsError) throw deviceStatsError;
        
        // Process data
        
        // Fill in missing dates for continuous chart
        const dates = eachDayOfInterval({ start: startDate, end: endDate });
        const formattedDates = dates.map(date => format(date, 'yyyy-MM-dd'));
        
        // Process page views
        const pageViewsByDate = {};
        formattedDates.forEach(date => {
          pageViewsByDate[date] = 0;
        });
        
        pageViewsData.forEach(item => {
          if (pageViewsByDate.hasOwnProperty(item.date)) {
            pageViewsByDate[item.date] = item.count;
          }
        });
        
        // Process news views
        const newsViewsByDate = {};
        formattedDates.forEach(date => {
          newsViewsByDate[date] = 0;
        });
        
        newsViewsData.forEach(item => {
          if (newsViewsByDate.hasOwnProperty(item.date)) {
            newsViewsByDate[item.date] = item.count;
          }
        });
        
        // Process device stats
        const deviceData = {
          labels: [],
          values: [],
          colors: []
        };
        
        const deviceColors = {
          desktop: 'rgba(54, 162, 235, 0.7)',
          mobile: 'rgba(255, 99, 132, 0.7)',
          tablet: 'rgba(75, 192, 192, 0.7)',
          other: 'rgba(153, 102, 255, 0.7)'
        };
        
        deviceStatsData.forEach(item => {
          deviceData.labels.push(item.device_type);
          deviceData.values.push(item.total);
          deviceData.colors.push(deviceColors[item.device_type] || 'rgba(201, 203, 207, 0.7)');
        });
        
        // Set state
        setPageViews(pageViewsByDate);
        setNewsViews(newsViewsByDate);
        setTopPages(topPagesData || []);
        setTopReferrers(topReferrersData || []);
        setDeviceStats(deviceData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [dateRange]);

  // Prepare chart data
  const pageViewsChartData = {
    labels: Object.keys(pageViews).map(date => format(new Date(date), 'MMM d')),
    datasets: [
      {
        label: 'Page Views',
        data: Object.values(pageViews),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'News Views',
        data: Object.values(newsViews),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const pageViewsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Traffic Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const topPagesChartData = {
    labels: topPages.map(page => page.path.replace(/^\/?|\/$/g, '') || 'Home'),
    datasets: [
      {
        label: 'Page Views',
        data: topPages.map(page => page.total),
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topPagesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Pages',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const deviceStatsChartData = {
    labels: deviceStats.labels,
    datasets: [
      {
        data: deviceStats.values,
        backgroundColor: deviceStats.colors,
        borderColor: deviceStats.colors.map(color => color.replace('0.7', '1')),
        borderWidth: 1,
      },
    ],
  };

  const deviceStatsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Device Distribution',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Overview Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-80">
            <Line options={pageViewsOptions} data={pageViewsChartData} />
          </div>
        </div>

        {/* Top Pages Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-80">
            <Bar options={topPagesOptions} data={topPagesChartData} />
          </div>
        </div>

        {/* Device Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-80">
            <Doughnut options={deviceStatsOptions} data={deviceStatsChartData} />
          </div>
        </div>

        {/* Top Referrers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Top Referrers</h3>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Domain
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Visits
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {topReferrers.length > 0 ? (
                  topReferrers.map((referrer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {referrer.domain || 'Direct / None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                        {referrer.total}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No referrer data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;