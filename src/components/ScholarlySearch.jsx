import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, ExternalLink, Calendar, Users, Award } from 'lucide-react';

const ScholarlySearch = () => {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(10);
  const [trends, setTrends] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const searchPapers = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/search-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit })
      });

      const data = await response.json();

      if (response.ok) {
        setPapers(data.papers || []);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchPapers();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchPapers();
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'ArXiv':
        return 'bg-red-100 text-red-800';
      case 'Google Scholar':
        return 'bg-blue-100 text-blue-800';
      case 'Semantic Scholar':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const truncateAbstract = (abstract, maxLength = 200) => {
    if (!abstract) return 'No abstract available';
    if (abstract.length <= maxLength) return abstract;
    return abstract.substring(0, maxLength) + '...';
  };

  const popularQueries = [
    'artificial intelligence knowledge graph',
    'machine learning neural networks',
    'natural language processing transformers',
    'deep learning computer vision',
    'reinforcement learning algorithms',
    'AI safety alignment',
    'quantum computing machine learning',
    'blockchain artificial intelligence'
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scholarly Research</h2>
        <p className="text-gray-600">Search academic papers and research trends</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for research papers..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 papers</option>
            <option value={10}>10 papers</option>
            <option value={20}>20 papers</option>
            <option value={50}>50 papers</option>
          </select>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </form>

      {/* Popular Queries */}
      {papers.length === 0 && !loading && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Popular Research Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {popularQueries.map((popularQuery, index) => (
              <button
                key={index}
                onClick={() => setQuery(popularQuery)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
              >
                {popularQuery}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Searching academic databases...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {papers.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Found {papers.length} papers for "{query}"
            </h3>
            <div className="text-sm text-gray-500">
              Sorted by relevance
            </div>
          </div>

          <div className="space-y-4">
            {papers.map((paper, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {paper.title}
                    </h4>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(paper.published)}</span>
                      </div>
                      
                      {paper.authors && paper.authors.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {paper.authors.slice(0, 3).join(', ')}
                            {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                          </span>
                        </div>
                      )}
                      
                      {paper.citations && (
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>{paper.citations} citations</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(paper.source)}`}>
                      {paper.source}
                    </span>
                    
                    {paper.relevance_score && (
                      <span className="text-xs text-gray-500">
                        {Math.round(paper.relevance_score * 100)}% match
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-3">
                  {truncateAbstract(paper.abstract)}
                </p>
                
                {paper.venue && (
                  <div className="text-xs text-gray-500 mb-2">
                    Published in: {paper.venue}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedPaper(selectedPaper === paper ? null : paper)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {selectedPaper === paper ? 'Hide Details' : 'Show Details'}
                  </button>
                  
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Paper</span>
                    </a>
                  )}
                </div>
                
                {selectedPaper === paper && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Full Abstract</h5>
                    <p className="text-gray-700 text-sm mb-3">
                      {paper.abstract || 'No abstract available'}
                    </p>
                    
                    {paper.authors && paper.authors.length > 0 && (
                      <div className="mb-3">
                        <h6 className="font-medium text-gray-900 mb-1">Authors</h6>
                        <p className="text-sm text-gray-600">
                          {paper.authors.join(', ')}
                        </p>
                      </div>
                    )}
                    
                    {paper.categories && paper.categories.length > 0 && (
                      <div>
                        <h6 className="font-medium text-gray-900 mb-1">Categories</h6>
                        <div className="flex flex-wrap gap-1">
                          {paper.categories.map((category, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarlySearch;
