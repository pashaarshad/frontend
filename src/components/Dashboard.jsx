import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Network, 
  FileText, 
  Search, 
  TrendingUp,
  Users,
  Database,
  Activity,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    knowledge_graph: {
      total_entities: 0,
      total_relationships: 0,
      entity_types: {}
    },
    documents: {
      total_documents: 0,
      total_entities: 0,
      total_relations: 0
    },
    system: {
      uptime: '',
      version: '1.0.0'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', change = null }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const EntityTypeChart = ({ entityTypes }) => {
    const total = Object.values(entityTypes).reduce((sum, count) => sum + count, 0);
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Entity Types Distribution</h3>
        <div className="space-y-3">
          {Object.entries(entityTypes).map(([type, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const RecentActivity = () => {
    const activities = [
      {
        id: 1,
        type: 'document_upload',
        description: 'New document processed: AI Research Paper.pdf',
        timestamp: '2 hours ago',
        icon: FileText
      },
      {
        id: 2,
        type: 'knowledge_graph_update',
        description: 'Knowledge graph updated with 15 new entities',
        timestamp: '4 hours ago',
        icon: Network
      },
      {
        id: 3,
        type: 'scholarly_search',
        description: 'Search performed: "machine learning algorithms"',
        timestamp: '6 hours ago',
        icon: Search
      },
      {
        id: 4,
        type: 'chat_interaction',
        description: 'User asked about artificial intelligence',
        timestamp: '1 day ago',
        icon: Users
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchStats}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Knowledge Graph Entities"
          value={stats.knowledge_graph.total_entities.toLocaleString()}
          icon={Network}
          color="blue"
          change={12}
        />
        <StatCard
          title="Relationships"
          value={stats.knowledge_graph.total_relationships.toLocaleString()}
          icon={Activity}
          color="green"
          change={8}
        />
        <StatCard
          title="Documents Processed"
          value={stats.documents.total_documents.toLocaleString()}
          icon={FileText}
          color="purple"
          change={5}
        />
        <StatCard
          title="System Status"
          value="Active"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EntityTypeChart entityTypes={stats.knowledge_graph.entity_types} />
        <RecentActivity />
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Database</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Neo4j + PostgreSQL</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">API Status</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">All services operational</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Version</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{stats.system.version}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.knowledge_graph.total_entities > 0 ? 
                Math.round(stats.knowledge_graph.total_relationships / stats.knowledge_graph.total_entities * 100) / 100 : 0
              }
            </div>
            <div className="text-sm text-gray-600">Avg Connections per Entity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.documents.total_documents > 0 ? 
                Math.round(stats.documents.total_entities / stats.documents.total_documents) : 0
              }
            </div>
            <div className="text-sm text-gray-600">Avg Entities per Document</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">95%</div>
            <div className="text-sm text-gray-600">Query Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">1.2s</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
