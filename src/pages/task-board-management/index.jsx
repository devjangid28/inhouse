import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationToast, { useNotifications } from '../../components/ui/NotificationToast';
import TaskColumn from './components/TaskColumn';
import TaskFilters from './components/TaskFilters';
import TaskModal from './components/TaskModal';
import TeamAssignmentModal from './components/TeamAssignmentModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const TaskBoardManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    assignee: '',
    category: '',
    status: '',
    dueDateFrom: '',
    dueDateTo: '',
    showOverdueOnly: false,
    showHighPriorityOnly: false,
    showMyTasksOnly: false
  });
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskStats, setTaskStats] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeTab, setActiveTab] = useState('todo');

  const { notifications, showSuccess, showError, showWarning, dismissNotification } = useNotifications();

  // Mock task data
  const mockTasks = [
    {
      id: 1,
      title: "Book Main Venue",
      description: "Secure the primary event location with all necessary permits",
      fullDescription: `Research and book the main venue for the annual tech conference. This includes:\n- Capacity for 500+ attendees\n- Audio/visual equipment\n- Parking facilities\n- Accessibility compliance\n- Catering kitchen access`,
      assignee: "Sarah Johnson",
      priority: "high",
      status: "in-progress",
      dueDate: "2025-01-15",
      category: "venue",
      tags: ["urgent", "permits", "capacity"],
      progress: 75,
      subtasks: [
        { id: 101, title: "Research venue options", completed: true },
        { id: 102, title: "Visit top 3 venues", completed: true },
        { id: 103, title: "Negotiate pricing", completed: false },
        { id: 104, title: "Sign contract", completed: false }
      ],
      comments: [
        {
          author: "Mike Chen",
          text: "I\'ve found 3 great options within budget. The Grand Hall looks most promising.",
          timestamp: "2025-01-02T10:30:00Z"
        }
      ]
    },
    {
      id: 2,
      title: "Design Event Branding",
      description: "Create visual identity and branding materials for the event",
      fullDescription: "Develop comprehensive branding package including logos, color schemes, typography, and brand guidelines for all event materials.",
      assignee: "Emily Davis",
      priority: "medium",
      status: "todo",
      dueDate: "2025-01-20",
      category: "marketing",
      tags: ["design", "branding", "creative"],
      progress: 25,
      subtasks: [
        { id: 201, title: "Create logo concepts", completed: true },
        { id: 202, title: "Develop color palette", completed: false },
        { id: 203, title: "Design templates", completed: false }
      ],
      comments: []
    },
    {
      id: 3,
      title: "Catering Menu Planning",
      description: "Plan and finalize catering options for all event meals",
      fullDescription: "Work with catering partners to design menus that accommodate dietary restrictions and preferences while staying within budget.",
      assignee: "Alex Rodriguez",
      priority: "medium",
      status: "backlog",
      dueDate: "2025-01-25",
      category: "catering",
      tags: ["food", "dietary", "budget"],
      progress: 0,
      subtasks: [],
      comments: []
    },
    {
      id: 4,
      title: "Speaker Coordination",
      description: "Coordinate with keynote speakers and manage their requirements",
      fullDescription: "Handle all aspects of speaker management including travel arrangements, accommodation, technical requirements, and presentation coordination.",
      assignee: "Lisa Wang",
      priority: "high",
      status: "review",
      dueDate: "2025-01-10",
      category: "logistics",
      tags: ["speakers", "travel", "coordination"],
      progress: 90,
      subtasks: [
        { id: 401, title: "Confirm speaker availability", completed: true },
        { id: 402, title: "Book travel arrangements", completed: true },
        { id: 403, title: "Prepare welcome packages", completed: false }
      ],
      comments: [
        {
          author: "Sarah Johnson",
          text: "All speakers confirmed. Just waiting for final presentation topics.",
          timestamp: "2025-01-01T14:20:00Z"
        }
      ]
    },
    {
      id: 5,
      title: "Registration System Setup",
      description: "Set up online registration and ticketing system",
      fullDescription: "Configure and test the online registration platform with payment processing, attendee management, and automated confirmation emails.",
      assignee: "Mike Chen",
      priority: "high",
      status: "done",
      dueDate: "2024-12-30",
      category: "logistics",
      tags: ["registration", "payments", "automation"],
      progress: 100,
      subtasks: [
        { id: 501, title: "Platform setup", completed: true },
        { id: 502, title: "Payment integration", completed: true },
        { id: 503, title: "Testing", completed: true }
      ],
      comments: []
    },
    {
      id: 6,
      title: "Social Media Campaign",
      description: "Launch comprehensive social media marketing campaign",
      fullDescription: "Create and execute a multi-platform social media strategy to promote the event and engage with potential attendees.",
      assignee: "Emily Davis",
      priority: "medium",
      status: "in-progress",
      dueDate: "2025-01-18",
      category: "marketing",
      tags: ["social-media", "promotion", "engagement"],
      progress: 60,
      subtasks: [
        { id: 601, title: "Content calendar creation", completed: true },
        { id: 602, title: "Asset creation", completed: true },
        { id: 603, title: "Campaign launch", completed: false }
      ],
      comments: []
    }
  ];

  const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ];

  // Initialize tasks and check mobile view
  useEffect(() => {
    setTasks(mockTasks);
    
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Filter tasks based on current filters
  useEffect(() => {
    let filtered = [...tasks];

    // Search filter
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(task =>
        task?.title?.toLowerCase()?.includes(searchTerm) ||
        task?.description?.toLowerCase()?.includes(searchTerm) ||
        task?.assignee?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Priority filter
    if (filters?.priority) {
      filtered = filtered?.filter(task => task?.priority === filters?.priority);
    }

    // Assignee filter
    if (filters?.assignee) {
      filtered = filtered?.filter(task => task?.assignee === filters?.assignee);
    }

    // Category filter
    if (filters?.category) {
      filtered = filtered?.filter(task => task?.category === filters?.category);
    }

    // Status filter
    if (filters?.status) {
      filtered = filtered?.filter(task => task?.status === filters?.status);
    }

    // Date range filters
    if (filters?.dueDateFrom) {
      filtered = filtered?.filter(task => 
        task?.dueDate && new Date(task.dueDate) >= new Date(filters.dueDateFrom)
      );
    }

    if (filters?.dueDateTo) {
      filtered = filtered?.filter(task => 
        task?.dueDate && new Date(task.dueDate) <= new Date(filters.dueDateTo)
      );
    }

    // Special filters
    if (filters?.showOverdueOnly) {
      filtered = filtered?.filter(task => 
        task?.dueDate && new Date(task.dueDate) < new Date() && task?.status !== 'done'
      );
    }

    if (filters?.showHighPriorityOnly) {
      filtered = filtered?.filter(task => task?.priority === 'high');
    }

    if (filters?.showMyTasksOnly) {
      // Mock current user as "Sarah Johnson"
      filtered = filtered?.filter(task => task?.assignee === 'Sarah Johnson');
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  // Calculate task statistics
  useEffect(() => {
    const stats = {
      total: filteredTasks?.length,
      inProgress: filteredTasks?.filter(t => t?.status === 'in-progress')?.length,
      completed: filteredTasks?.filter(t => t?.status === 'done')?.length,
      overdue: filteredTasks?.filter(t => 
        t?.dueDate && new Date(t.dueDate) < new Date() && t?.status !== 'done'
      )?.length
    };
    setTaskStats(stats);
  }, [filteredTasks]);

  const getTasksByStatus = (status) => {
    return filteredTasks?.filter(task => task?.status === status);
  };

  const handleDragOver = (columnId) => {
    setDragOverColumn(columnId);
  };

  const handleDrop = (taskId, newStatus) => {
    const taskIdNum = parseInt(taskId);
    const task = tasks?.find(t => t?.id === taskIdNum);
    
    if (task && task?.status !== newStatus) {
      setTasks(prevTasks =>
        prevTasks?.map(t =>
          t?.id === taskIdNum
            ? { ...t, status: newStatus, updatedAt: new Date()?.toISOString() }
            : t
        )
      );
      
      showSuccess(`Task "${task?.title}" moved to ${newStatus?.replace('-', ' ')}`);
    }
    
    setDragOverColumn(null);
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskDelete = (taskId) => {
    const task = tasks?.find(t => t?.id === taskId);
    if (task) {
      setTasks(prevTasks => prevTasks?.filter(t => t?.id !== taskId));
      showSuccess(`Task "${task?.title}" deleted successfully`);
    }
  };

  const handleTaskSave = (taskData) => {
    if (editingTask) {
      // Update existing task
      setTasks(prevTasks =>
        prevTasks?.map(t =>
          t?.id === taskData?.id ? taskData : t
        )
      );
      showSuccess(`Task "${taskData?.title}" updated successfully`);
    } else {
      // Create new task
      setTasks(prevTasks => [...prevTasks, taskData]);
      showSuccess(`Task "${taskData?.title}" created successfully`);
    }
    
    setEditingTask(null);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      priority: '',
      assignee: '',
      category: '',
      status: '',
      dueDateFrom: '',
      dueDateTo: '',
      showOverdueOnly: false,
      showHighPriorityOnly: false,
      showMyTasksOnly: false
    });
    showSuccess('Filters cleared');
  };

  const handleQuickAction = (actionType) => {
    switch (actionType) {
      case 'add-task':
        setEditingTask(null);
        setIsTaskModalOpen(true);
        break;
      case 'assign-team':
        setIsTeamModalOpen(true);
        break;
      default:
        showWarning('Action not implemented yet');
    }
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Page Header */}
        <div className="bg-card border-b border-border shadow-card">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                  <Icon name="CheckSquare" size={24} color="white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Task Board Management</h1>
                  <p className="text-muted-foreground">
                    Organize and track your event planning tasks with drag-and-drop functionality
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleClearFilters()}
                  iconName="RotateCcw"
                  size="sm"
                >
                  Reset Board
                </Button>
                
                <Button
                  variant="default"
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  iconName="Plus"
                >
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Filters */}
          <TaskFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            taskStats={taskStats}
            className="mb-6"
          />

          {/* Task Board */}
          {isMobileView ? (
            // Mobile Tabbed View
            (<div className="bg-card rounded-lg border border-border shadow-card">
              {/* Tab Headers */}
              <div className="flex overflow-x-auto border-b border-border">
                {columns?.map((column) => {
                  const taskCount = getTasksByStatus(column?.id)?.length;
                  return (
                    <button
                      key={column?.id}
                      onClick={() => setActiveTab(column?.id)}
                      className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === column?.id
                          ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {column?.title} ({taskCount})
                                          </button>
                  );
                })}
              </div>
              {/* Active Tab Content */}
              <div className="p-4">
                {columns?.map((column) => (
                  <div
                    key={column?.id}
                    className={activeTab === column?.id ? 'block' : 'hidden'}
                  >
                    <TaskColumn
                      column={column}
                      tasks={getTasksByStatus(column?.id)}
                      onTaskEdit={handleTaskEdit}
                      onTaskDelete={handleTaskDelete}
                      onDrop={handleDrop}
                      onTaskStatusChange={handleDrop}
                      onDragOver={handleDragOver}
                      isDragOver={dragOverColumn === column?.id}
                    />
                  </div>
                ))}
              </div>
            </div>)
          ) : (
            // Desktop Board View
            (<div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <div className="flex overflow-x-auto min-h-[600px]">
                {columns?.map((column) => (
                  <TaskColumn
                    key={column?.id}
                    column={column}
                    tasks={getTasksByStatus(column?.id)}
                    onTaskEdit={handleTaskEdit}
                    onTaskDelete={handleTaskDelete}
                    onDrop={handleDrop}
                    onTaskStatusChange={handleDrop}
                    onDragOver={handleDragOver}
                    isDragOver={dragOverColumn === column?.id}
                    className="border-r border-border last:border-r-0"
                  />
                ))}
              </div>
            </div>)
          )}

          {/* Empty State */}
          {filteredTasks?.length === 0 && (
            <div className="text-center py-12">
              <Icon name="CheckSquare" size={48} className="text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-6">
                {Object.values(filters)?.some(v => v && v !== '') 
                  ? 'Try adjusting your filters or create a new task' : 'Get started by creating your first task'
                }
              </p>
              <Button
                variant="default"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                iconName="Plus"
              >
                Create First Task
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onSave={handleTaskSave}
        task={editingTask}
        mode={editingTask ? 'edit' : 'create'}
      />
      {/* Quick Action Button */}
      <QuickActionButton onAction={handleQuickAction} />
      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
        position="below-header"
      />

      {/* Team Assignment Modal */}
      <TeamAssignmentModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        task={editingTask}
        onAssign={(members) => {
          if (editingTask) {
            const updatedTasks = tasks.map(task =>
              task.id === editingTask.id
                ? { ...task, assignee: members[0] || task.assignee }
                : task
            );
            setTasks(updatedTasks);
            showSuccess(`Team assigned to "${editingTask.title}" successfully!`);
          }
        }}
      />
    </div>
  );
};

export default TaskBoardManagement;