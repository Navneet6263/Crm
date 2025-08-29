import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts();
      setPosts(response.posts || response);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="posts">
      <div className="page-header">
        <h1>📝 Posts Gallery</h1>
        <p>Explore interesting posts and articles</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {posts.map(post => (
          <div key={post.id} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>{post.title}</h3>
            <p style={{
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>{post.body.substring(0, 150)}...</p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: '#9ca3af'
            }}>
              <span>Author: User {post.userId}</span>
              <span>#{post.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;