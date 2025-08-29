import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Check, 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  MoreVertical,
  Edit,
  Trash,
  AlertCircle,
  ChevronDown,
  Search
} from 'lucide-react';
import apiService from '../services/apiService';
import { showToast } from './ToastNotification';

const TaskKanban = ({ darkMode }) => {
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    assignee: '',
    type: 'call',
    relatedTo: 'lead',
    relatedId: ''
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);

  // Load data from backend API
  useEffect(() => {
    loadTasks();
    loadUsers();
    loadLeads();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTasks();
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      showToast('error', '❌ Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await apiService.getLeads();
      setLeads(response || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (status) => {
    if (draggedTask) {
      try {
        // Map frontend status to backend status
        const backendStatus = status === 'todo' ? 'pending' : 
                             status === 'in-progress' ? 'in-progress' : 
                             status === 'done' ? 'completed' : status;
        
        await apiService.updateTask(draggedTask._id, { status: backendStatus });
        
        const updatedTasks = tasks.map(task => {
          if (task._id === draggedTask._id) {
            return { ...task, status: backendStatus };
          }
          return task;
        });
        setTasks(updatedTasks);
        showToast('success', '✅ Task status updated');
      } catch (error) {
        console.error('Error updating task:', error);
        showToast('error', '❌ Failed to update task');
      }
      setDraggedTask(null);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      showToast('error', '❌ Task title is required');
      return;
    }
    
    if (!newTask.dueDate) {
      showToast('error', '❌ Due date is required');
      return;
    }

    if (!newTask.relatedId) {
      showToast('error', '❌ Please select a related lead');
      return;
    }
    
    try {
      const taskData = {
        ...newTask,
        status: newTask.status === 'todo' ? 'pending' : newTask.status
      };
      
      const createdTask = await apiService.createTask(taskData);
      setTasks([...tasks, createdTask]);
      
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        assignee: '',
        type: 'call',
        relatedTo: 'lead',
        relatedId: ''
      });
      setShowAddTask(false);
      showToast('success', '✅ Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('error', '❌ Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !editingTask.title.trim()) {
      showToast('error', '❌ Task title is required');
      return;
    }
    
    try {
      const updatedTask = await apiService.updateTask(editingTask._id, editingTask);
      
      const updatedTasks = tasks.map(task => {
        if (task._id === editingTask._id) {
          return updatedTask;
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setEditingTask(null);
      showToast('success', '✅ Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('error', '❌ Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiService.deleteTask(taskId);
      
      const updatedTasks = tasks.filter(task => task._id !== taskId);
      setTasks(updatedTasks);
      
      if (editingTask && editingTask._id === taskId) {
        setEditingTask(null);
      }
      
      showToast('success', '✅ Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('error', '❌ Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'urgent': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#3b82f6';
      case 'in-progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 'pending': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Done';
      default: return status;
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Map backend status to frontend status for filtering
      const frontendStatus = task.status === 'pending' ? 'todo' : 
                            task.status === 'completed' ? 'done' : 
                            task.status;
      
      // Apply status filter
      if (filter !== 'all' && frontendStatus !== filter) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.assignee && task.assignee.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  };

  const filteredTasks = getFilteredTasks();
  
  const todoTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const doneTasks = filteredTasks.filter(task => task.status === 'completed');

  const containerStyle = {
    padding: '0',
    background: darkMode ? '#111827' : '#f9fafb',
    minHeight: '100vh'
  };

  const cardStyle = {
    background: darkMode ? '#1f2937' : 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar style={{ color: '#8b5cf6' }} size={32} />
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Task Management
              </h1>
              <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem', margin: 0 }}>
                Organize and track your sales tasks
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'all' ? 
                (darkMode ? '#374151' : '#f3f4f6') : 
                'transparent',
              color: darkMode ? '#d1d5db' : '#374151',
              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: filter === 'all' ? '600' : '500'
            }}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('todo')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'todo' ? 
                (darkMode ? '#374151' : '#f3f4f6') : 
                'transparent',
              color: darkMode ? '#d1d5db' : '#374151',
              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: filter === 'todo' ? '600' : '500'
            }}
          >
            To Do
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'in-progress' ? 
                (darkMode ? '#374151' : '#f3f4f6') : 
                'transparent',
              color: darkMode ? '#d1d5db' : '#374151',
              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: filter === 'in-progress' ? '600' : '500'
            }}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('done')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'done' ? 
                (darkMode ? '#374151' : '#f3f4f6') : 
                'transparent',
              color: darkMode ? '#d1d5db' : '#374151',
              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: filter === 'done' ? '600' : '500'
            }}
          >
            Done
          </button>
        </div>

        <div style={{
          position: 'relative',
          width: '300px'
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              borderRadius: '6px',
              border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              background: darkMode ? '#374151' : 'white',
              color: darkMode ? 'white' : '#1f2937',
              fontSize: '0.875rem'
            }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* To Do Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={() => handleDrop('todo')}
          style={{
            ...cardStyle,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            height: '600px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#3b82f6'
            }}></div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              To Do
            </h3>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#9ca3af' : '#6b7280',
              marginLeft: 'auto'
            }}>
              {todoTasks.length}
            </span>
          </div>

          <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '0.5rem'
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                Loading tasks...
              </div>
            ) : todoTasks.map(task => (
              <div
                key={task._id}
                draggable
                onDragStart={() => handleDragStart(task)}
                style={{
                  ...cardStyle,
                  padding: '1rem',
                  marginBottom: '1rem',
                  cursor: 'grab',
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: 0
                  }}>
                    {task.title}
                  </h4>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setEditingTask(task)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  margin: '0 0 0.75rem 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {task.description || 'No description'}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    <Clock size={12} />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <User size={12} />
                    {task.assignee || 'Unassigned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={() => handleDrop('in-progress')}
          style={{
            ...cardStyle,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            height: '600px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#8b5cf6'
            }}></div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              In Progress
            </h3>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#9ca3af' : '#6b7280',
              marginLeft: 'auto'
            }}>
              {inProgressTasks.length}
            </span>
          </div>

          <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '0.5rem'
          }}>
            {inProgressTasks.map(task => (
              <div
                key={task._id}
                draggable
                onDragStart={() => handleDragStart(task)}
                style={{
                  ...cardStyle,
                  padding: '1rem',
                  marginBottom: '1rem',
                  cursor: 'grab',
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: 0
                  }}>
                    {task.title}
                  </h4>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setEditingTask(task)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  margin: '0 0 0.75rem 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {task.description || 'No description'}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    <Clock size={12} />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <User size={12} />
                    {task.assignee || 'Unassigned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={() => handleDrop('done')}
          style={{
            ...cardStyle,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            height: '600px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981'
            }}></div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: darkMode ? 'white' : '#1f2937',
              margin: 0
            }}>
              Done
            </h3>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#9ca3af' : '#6b7280',
              marginLeft: 'auto'
            }}>
              {doneTasks.length}
            </span>
          </div>

          <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '0.5rem'
          }}>
            {doneTasks.map(task => (
              <div
                key={task._id}
                draggable
                onDragStart={() => handleDragStart(task)}
                style={{
                  ...cardStyle,
                  padding: '1rem',
                  marginBottom: '1rem',
                  cursor: 'grab',
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                  opacity: 0.8
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: darkMode ? 'white' : '#1f2937',
                    margin: 0,
                    textDecoration: 'line-through'
                  }}>
                    {task.title}
                  </h4>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setEditingTask(task)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  margin: '0 0 0.75rem 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {task.description || 'No description'}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    <Check size={12} />
                    Completed
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <User size={12} />
                    {task.assignee || 'Unassigned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            ...cardStyle,
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '1rem',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Add New Task
              </h3>
              <button
                onClick={() => setShowAddTask(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    background: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    background: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Type
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      background: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="demo">Demo</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      background: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Due Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      background: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Assignee
                  </label>
                  <select
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      background: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Select Assignee</option>
                    {Array.isArray(users) && users.map(user => (
                      <option key={user._id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Related Lead <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={newTask.relatedId}
                  onChange={(e) => setNewTask({ ...newTask, relatedId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    background: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Select Lead</option>
                  {Array.isArray(leads) && leads.map(lead => (
                    <option key={lead._id} value={lead._id}>
                      {lead.contactPerson} - {lead.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => setShowAddTask(false)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    color: darkMode ? '#d1d5db' : '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Check size={16} />
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            ...cardStyle,
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '1rem',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? 'white' : '#1f2937',
                margin: 0
              }}>
                Edit Task
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="Enter task title"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    background: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#d1d5db' : '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Enter task description"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    background: darkMode ? '#1f2937' : 'white',
                    color: darkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Status
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      background: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      background: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      background: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: darkMode ? '#d1d5db' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Assignee
                  </label>
                  <select
                    value={editingTask.assignee || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      background: darkMode ? '#1f2937' : 'white',
                      color: darkMode ? 'white' : '#1f2937',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="">Select Assignee</option>
                    {Array.isArray(users) && users.map(user => (
                      <option key={user._id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => handleDeleteTask(editingTask._id)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: darkMode ? '#7f1d1d' : '#fee2e2',
                    border: 'none',
                    borderRadius: '6px',
                    color: darkMode ? '#ef4444' : '#dc2626',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Trash size={16} />
                  Delete
                </button>

                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => setEditingTask(null)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'transparent',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      color: darkMode ? '#d1d5db' : '#374151',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTask}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Check size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskKanban;