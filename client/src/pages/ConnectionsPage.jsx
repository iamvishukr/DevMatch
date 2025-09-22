import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiUsers, FiPlus, FiRefreshCw } from 'react-icons/fi';
import ConnectionCard from '../components/connections/ConnectionCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    filterConnections();
  }, [connections, searchQuery, activeFilter]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getConnections();
      setConnections(response.data.data);
    } catch (error) {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const refreshConnections = async () => {
    try {
      setRefreshing(true);
      const response = await userAPI.getConnections();
      setConnections(response.data.data);
      toast.success('Connections refreshed');
    } catch (error) {
      toast.error('Failed to refresh connections');
    } finally {
      setRefreshing(false);
    }
  };

  const filterConnections = () => {
    let filtered = connections;

    if (searchQuery) {
      filtered = filtered.filter(connection => 
        connection.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connection.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (connection.skills && connection.skills.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    if (activeFilter === 'recent') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeFilter === 'skills') {
      filtered = [...filtered].sort((a, b) => (b.skills?.length || 0) - (a.skills?.length || 0));
    }

    setFilteredConnections(filtered);
  };

  const filterOptions = [
    { id: 'all', label: 'All Connections' },
    { id: 'recent', label: 'Recently Added' },
    { id: 'skills', label: 'Most Skilled' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-indigo-800/30 rounded-2xl backdrop-blur-sm mb-6">
            <FiUsers className="text-4xl text-white mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Your Network
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Connect with developers, collaborate on projects, and grow your professional network
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-white mr-2">{connections.length}</span>
              <span className="text-white/80">connection{connections.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshConnections}
              disabled={refreshing}
              className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            >
              <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
            
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/feed"
              className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-xl text-white font-medium shadow-lg hover:shadow-purple-500/30 transition-shadow"
            >
              <FiPlus />
              Find Connections
            </motion.a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-5 rounded-2xl mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search connections by name or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r bg-blue-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {filteredConnections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 glass-card rounded-2xl"
          >
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchQuery ? 'No matching connections' : 'No connections yet'}
            </h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Start browsing profiles and sending connection requests to build your network.'
              }
            </p>
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="btn-primary"
              >
                Clear Search
              </button>
            ) : (
              <a href="/feed" className="btn-primary">
                Discover People
              </a>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredConnections.map((connection, index) => (
                <motion.div
                  key={connection._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <ConnectionCard user={connection} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;