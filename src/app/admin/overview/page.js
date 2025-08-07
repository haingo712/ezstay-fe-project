'use client';

import { useState, useEffect } from 'react';

export default function SystemOverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(30);

  const [systemData] = useState({
    realTimeMetrics: {
      activeUsers: 1247,
      requestsPerSecond: 45.2,
      responseTime: 145,
      errorRate: 0.02,
      cpuUsage: 23.5,
      memoryUsage: 67.3,
      diskUsage: 45.2,
      networkIO: 2.3,
      databaseConnections: 45,
      cacheHitRate: 94.5
    },
    serverStatus: [
      {
        id: 1,
        name: 'Web Server 1',
        type: 'nginx',
        status: 'healthy',
        cpu: 15.2,
        memory: 45.8,
        uptime: '15d 4h 23m',
        requests: 12450,
        location: 'US-East-1'
      },
      {
        id: 2,
        name: 'Web Server 2',
        type: 'nginx',
        status: 'healthy',
        cpu: 18.7,
        memory: 52.3,
        uptime: '15d 4h 23m',
        requests: 11890,
        location: 'US-East-1'
      },
      {
        id: 3,
        name: 'API Server 1',
        type: 'node.js',
        status: 'warning',
        cpu: 78.5,
        memory: 89.2,
        uptime: '12d 8h 15m',
        requests: 8750,
        location: 'US-West-2'
      },
      {
        id: 4,
        name: 'Database Primary',
        type: 'postgresql',
        status: 'healthy',
        cpu: 25.3,
        memory: 72.1,
        uptime: '45d 12h 8m',
        requests: 15670,
        location: 'US-East-1'
      },
      {
        id: 5,
        name: 'Database Replica',
        type: 'postgresql',
        status: 'healthy',
        cpu: 12.8,
        memory: 58.4,
        uptime: '45d 12h 8m',
        requests: 5430,
        location: 'US-West-2'
      },
      {
        id: 6,
        name: 'Redis Cache',
        type: 'redis',
        status: 'healthy',
        cpu: 8.2,
        memory: 34.7,
        uptime: '30d 6h 45m',
        requests: 25890,
        location: 'US-East-1'
      }
    ],
    performanceMetrics: {
      last24h: [
        { time: '00:00', cpu: 15, memory: 45, requests: 120 },
        { time: '04:00', cpu: 12, memory: 42, requests: 85 },
        { time: '08:00', cpu: 25, memory: 58, requests: 280 },
        { time: '12:00', cpu: 35, memory: 72, requests: 450 },
        { time: '16:00', cpu: 42, memory: 78, requests: 520 },
        { time: '20:00', cpu: 38, memory: 75, requests: 480 },
        { time: '24:00', cpu: 23, memory: 67, requests: 320 }
      ]
    },
    databaseMetrics: {
      totalQueries: 1567890,
      slowQueries: 23,
      activeConnections: 45,
      maxConnections: 100,
      cacheHitRatio: 94.5,
      indexUsage: 98.2,
      tableSize: '2.3GB',
      indexSize: '456MB',
      replicationLag: '0.2s'
    },
    securityMetrics: {
      failedLogins: 156,
      blockedIPs: 23,
      suspiciousActivity: 8,
      activeFirewallRules: 145,
      sslCertificateExpiry: '89 days',
      lastSecurityScan: '2 hours ago',
      vulnerabilities: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 12
      }
    },
    backupStatus: {
      lastFullBackup: '2024-01-22T02:00:00Z',
      lastIncrementalBackup: '2024-01-22T14:00:00Z',
      backupSize: '15.2GB',
      retentionPeriod: '30 days',
      backupLocation: 'AWS S3',
      status: 'completed',
      nextScheduled: '2024-01-23T02:00:00Z'
    },
    apiMetrics: {
      totalRequests: 2456789,
      successRate: 99.8,
      averageResponseTime: 145,
      peakRPS: 125,
      currentRPS: 45,
      rateLimitHits: 234,
      topEndpoints: [
        { endpoint: '/api/posts', requests: 456789, avgTime: 120 },
        { endpoint: '/api/users', requests: 234567, avgTime: 95 },
        { endpoint: '/api/auth', requests: 189234, avgTime: 180 },
        { endpoint: '/api/search', requests: 156789, avgTime: 250 },
        { endpoint: '/api/bookings', requests: 123456, avgTime: 200 }
      ]
    },
    errorLogs: [
      {
        id: 1,
        timestamp: '2024-01-22T14:30:15Z',
        level: 'error',
        service: 'api-server',
        message: 'Database connection timeout',
        count: 3,
        resolved: false
      },
      {
        id: 2,
        timestamp: '2024-01-22T14:25:42Z',
        level: 'warning',
        service: 'web-server',
        message: 'High memory usage detected',
        count: 1,
        resolved: true
      },
      {
        id: 3,
        timestamp: '2024-01-22T14:20:18Z',
        level: 'error',
        service: 'payment-gateway',
        message: 'Payment processing failed',
        count: 5,
        resolved: false
      },
      {
        id: 4,
        timestamp: '2024-01-22T14:15:33Z',
        level: 'info',
        service: 'backup-service',
        message: 'Incremental backup completed',
        count: 1,
        resolved: true
      }
    ]
  });

  useEffect(() => {
    setMounted(true);
    
    // Auto-refresh data
    const interval = setInterval(() => {
      // In a real app, this would fetch fresh data
      console.log('Refreshing system data...');
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUsageColor = (usage) => {
    if (usage > 80) return 'bg-red-500';
    if (usage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatUptime = (uptime) => {
    return uptime;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const { realTimeMetrics, serverStatus, performanceMetrics, databaseMetrics, securityMetrics, backupStatus, apiMetrics, errorLogs } = systemData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Overview</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time system monitoring and performance metrics
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>Refresh: 10s</option>
                <option value={30}>Refresh: 30s</option>
                <option value={60}>Refresh: 1m</option>
                <option value={300}>Refresh: 5m</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(realTimeMetrics.activeUsers)}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Requests/sec</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{realTimeMetrics.requestsPerSecond}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{realTimeMetrics.responseTime}ms</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{realTimeMetrics.errorRate}%</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{realTimeMetrics.cacheHitRate}%</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Usage</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${realTimeMetrics.cpuUsage * 2.51} 251`}
                    className={realTimeMetrics.cpuUsage > 80 ? 'text-red-500' : realTimeMetrics.cpuUsage > 60 ? 'text-yellow-500' : 'text-green-500'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{realTimeMetrics.cpuUsage}%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">CPU Usage</p>
            </div>

            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${realTimeMetrics.memoryUsage * 2.51} 251`}
                    className={realTimeMetrics.memoryUsage > 80 ? 'text-red-500' : realTimeMetrics.memoryUsage > 60 ? 'text-yellow-500' : 'text-green-500'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{realTimeMetrics.memoryUsage}%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Memory Usage</p>
            </div>

            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${realTimeMetrics.diskUsage * 2.51} 251`}
                    className={realTimeMetrics.diskUsage > 80 ? 'text-red-500' : realTimeMetrics.diskUsage > 60 ? 'text-yellow-500' : 'text-green-500'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{realTimeMetrics.diskUsage}%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Disk Usage</p>
            </div>

            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${realTimeMetrics.networkIO * 10 * 2.51} 251`}
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{realTimeMetrics.networkIO}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Network I/O (GB/s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Server Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Server Status</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Server</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">CPU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Memory</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Uptime</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Requests</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Location</th>
                </tr>
              </thead>
              <tbody>
                {serverStatus.map((server) => (
                  <tr key={server.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{server.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{server.type}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 ${getStatusIndicator(server.status)} rounded-full mr-2`}></div>
                        <span className={`text-sm font-medium ${getStatusColor(server.status)}`}>
                          {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(server.cpu)}`}
                            style={{ width: `${server.cpu}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{server.cpu}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUsageColor(server.memory)}`}
                            style={{ width: `${server.memory}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{server.memory}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {formatUptime(server.uptime)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {formatNumber(server.requests)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {server.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database Metrics</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Queries</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(databaseMetrics.totalQueries)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Slow Queries</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{databaseMetrics.slowQueries}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Connections</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {databaseMetrics.activeConnections}/{databaseMetrics.maxConnections}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Ratio</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{databaseMetrics.cacheHitRatio}%</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Table Size: {databaseMetrics.tableSize}</p>
                  <p className="text-gray-600 dark:text-gray-400">Index Size: {databaseMetrics.indexSize}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Index Usage: {databaseMetrics.indexUsage}%</p>
                  <p className="text-gray-600 dark:text-gray-400">Replication Lag: {databaseMetrics.replicationLag}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Metrics</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(apiMetrics.totalRequests)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{apiMetrics.successRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current RPS</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{apiMetrics.currentRPS}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Peak RPS</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{apiMetrics.peakRPS}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Top Endpoints</h3>
              <div className="space-y-2">
                {apiMetrics.topEndpoints.slice(0, 3).map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{endpoint.endpoint}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 dark:text-white">{formatNumber(endpoint.requests)}</span>
                      <span className="text-gray-500 dark:text-gray-400">({endpoint.avgTime}ms)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Error Logs</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {errorLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.level === 'error' ? 'bg-red-500' :
                    log.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{log.message}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {log.service} • {formatDate(log.timestamp)} • Count: {log.count}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    log.level === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    log.level === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  {log.resolved ? (
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  ) : (
                    <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}