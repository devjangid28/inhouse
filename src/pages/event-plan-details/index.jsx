import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationToast, { useNotifications } from '../../components/ui/NotificationToast';
import EventMetadata from './components/EventMetadata';
import EventTimeline from './components/EventTimeline';
import PlanActions from './components/PlanActions';
import ProgressTracker from './components/ProgressTracker';
import GanttChart from './components/GanttChart';
import CalendarView from './components/CalendarView';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { eventPreferencesService } from '../../services/eventPreferencesService';
import { eventService } from '../../services/eventService';
import { supabase } from '../../lib/supabaseClient';

const EventPlanDetails = () => {
  const [eventData, setEventData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline');

  const { notifications, showSuccess, showError, showInfo, dismissNotification } = useNotifications();

  const getVenueName = (venueCode) => {
    const venueMapping = {
      'taj-palace-lawns': 'Taj Palace Lawns - Luxury Garden',
      'leela-ambience': 'The Leela Ambience - Grand Ballroom',
      'itc-maurya': 'ITC Maurya - Conference & Banquet Hall',
      'oberoi-sky-terrace': 'The Oberoi Sky Terrace - Premium Rooftop',
      'trident-poolside': 'Trident Poolside Lawns - Lakeside View',
      'lalit-ashok': 'The Lalit Ashok - Convention Center'
    };
    return venueMapping[venueCode] || venueCode;
  };

  useEffect(() => {
    const loadEventData = async () => {
      setIsLoading(true);

      try {
        const { event: latestEvent, preference: preferences } = await eventService.getEventWithPreferences();

        let eventDataToUse = latestEvent;
        let aiGeneratedPlan = null;

        if (latestEvent && latestEvent.ai_generated_content) {
          aiGeneratedPlan = latestEvent.ai_generated_content;
        } else if (latestEvent) {
          const { data: aiContent, error: aiError } = await supabase
            .from('ai_generated_content')
            .select('*')
            .eq('event_id', latestEvent.id)
            .eq('content_type', 'event_plan')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (aiError && aiError.code !== 'PGRST116') {
            console.error('Error fetching AI content:', aiError);
          }

          if (aiContent) {
            aiGeneratedPlan = aiContent.generated_content;
          }
        }

        const venueName = preferences?.venue ? getVenueName(preferences.venue) : null;
        const eventType = preferences?.event_type || eventDataToUse?.event_type;
        const eventDate = preferences?.event_date || eventDataToUse?.date;
        const eventTime = preferences?.event_time || eventDataToUse?.time;
        const numberOfPeople = preferences?.number_of_people || preferences?.numberOfPeople || eventDataToUse?.audience_size;
        const budgetAmount = preferences?.budget || 75000;

        const mockEventData = {
          id: eventDataToUse?.id || 'evt_001',
          name: eventDataToUse?.event_name || eventType || 'Untitled Event',
          date: eventDate || '2025-03-15',
          time: eventTime || '09:00',
          location: eventDataToUse?.location || venueName || 'TBD',
          attendees: numberOfPeople || 50,
          budget: budgetAmount,
          status: 'planning',
          description: eventDataToUse?.description || `Event planning for ${eventType || 'special occasion'}`,
          attendeeSummary: {
            seatingTables: Math.ceil((numberOfPeople || 0) / 8),
            seatsPerTable: numberOfPeople > 200 ? 12 : numberOfPeople > 80 ? 10 : 8,
            cateringPlates: Math.ceil((numberOfPeople || 0) * 1.1),
            staffingCount: Math.max(6, Math.ceil((numberOfPeople || 0) / 25))
          },
          contacts: [
            {
              name: 'Riya Sharma',
              role: 'Event Manager',
              phone: '+91 98765 43210',
              email: 'riya.sharma@eventindia.com'
            },
            {
              name: 'Arjun Mehta',
              role: 'Technical Coordinator',
              phone: '+91 91234 56789',
              email: 'arjun.mehta@eventindia.com'
            },
            {
              name: 'Priya Nair',
              role: 'Marketing Lead',
              phone: '+91 99876 54321',
              email: 'priya.nair@eventindia.com'
            }
          ]
        };

        let mockTimelineData = [];

        if (aiGeneratedPlan && aiGeneratedPlan.timeline) {
          mockTimelineData = aiGeneratedPlan.timeline.map((item, index) => ({
            id: `tl_${index + 1}`,
            title: item.activity || item.title || 'Activity',
            activity: item.activity || item.title || 'Activity', // For Gantt/Calendar
            type: 'presentation',
            startTime: item.time || '09:00',
            time: item.time || '09:00', // For Gantt/Calendar
            duration: parseInt(item.duration) || 60,
            location: item.location || 'Main Hall',
            attendees: item.attendees,
            description: item.description || item.activity || '',
            resources: item.resources || [],
            assignedTo: item.assignedTo || [],
            notes: item.notes || '',
            status: 'upcoming' // Add default status for Gantt/Calendar
          }));
        } else {
          mockTimelineData = [
            {
              id: 'tl_001',
              title: 'Venue Setup & Registration',
              activity: 'Venue Setup & Registration',
              type: 'setup',
              startTime: '07:00',
              time: '07:00',
              duration: 120,
              location: 'Main Hall',
              description: 'Complete venue setup including registration desks, signage, and technical equipment testing.',
              resources: ['Registration desks', 'Welcome banners', 'Audio/Visual equipment', 'Name badges', 'Welcome packets'],
              assignedTo: ['Setup Team', 'Registration Staff'],
              notes: 'Ensure all technical equipment is tested 30 minutes before event start.',
              status: 'completed'
            },
          {
            id: 'tl_002',
            title: 'Opening Keynote',
            activity: 'Opening Keynote',
            type: 'presentation',
            startTime: '09:00',
            time: '09:00',
            duration: 60,
            location: 'Main Auditorium',
            description: 'Welcome address and opening keynote presentation by industry leader.',
            resources: ['Main stage setup', 'Wireless microphone', 'Presentation screen', 'Lighting system'],
            assignedTo: ['AV Team', 'Stage Manager'],
            notes: 'Speaker needs wireless lapel mic and clicker for slides.',
            status: 'in-progress'
          },
          {
            id: 'tl_003',
            title: 'Networking Coffee Break',
            activity: 'Networking Coffee Break',
            type: 'break',
            startTime: '10:00',
            time: '10:00',
            duration: 30,
            location: 'Exhibition Hall',
            description: 'Coffee, tea, and light refreshments with networking opportunities.',
            resources: ['Coffee stations', 'Pastries', 'High-top tables', 'Networking materials'],
            assignedTo: ['Catering Team', 'Event Staff'],
            notes: 'Ensure dietary restrictions are accommodated with alternative options.',
            status: 'upcoming'
          },
          {
            id: 'tl_004',
            title: 'Technical Workshops',
            activity: 'Technical Workshops',
            type: 'presentation',
            startTime: '10:30',
            time: '10:30',
            duration: 90,
            location: 'Breakout Rooms A, B, C',
            description: 'Parallel technical workshops on AI, Cloud Computing, and Cybersecurity.',
            resources: ['Laptops for hands-on sessions', 'Workshop materials', 'Whiteboards', 'Projectors'],
            assignedTo: ['Workshop Facilitators', 'Technical Support'],
            notes: 'Each room needs dedicated technical support staff.',
            status: 'upcoming'
          },
          {
            id: 'tl_005',
            title: 'Lunch & Exhibition',
            activity: 'Lunch & Exhibition',
            type: 'meal',
            startTime: '12:00',
            time: '12:00',
            duration: 60,
            location: 'Exhibition Hall',
            description: 'Buffet lunch with sponsor exhibition booths and product demonstrations.',
            resources: ['Buffet stations', 'Exhibition booths', 'Demo equipment', 'Seating areas'],
            assignedTo: ['Catering Team', 'Exhibition Coordinators'],
            notes: 'Coordinate with sponsors for booth setup and demo schedules.',
            status: 'upcoming'
          },
          {
            id: 'tl_006',
            title: 'Panel Discussion',
            activity: 'Panel Discussion',
            type: 'presentation',
            startTime: '13:00',
            time: '13:00',
            duration: 75,
            location: 'Main Auditorium',
            description: 'Industry expert panel on future technology trends and innovations.',
            resources: ['Panel table setup', 'Multiple microphones', 'Moderator materials'],
            assignedTo: ['Moderator', 'AV Team'],
            notes: 'Prepare backup questions for moderator in case of time gaps.',
            status: 'upcoming'
          },
          {
            id: 'tl_007',
            title: 'Closing Ceremony & Awards',
            activity: 'Closing Ceremony & Awards',
            type: 'presentation',
            startTime: '14:15',
            time: '14:15',
            duration: 45,
            location: 'Main Auditorium',
            description: 'Award presentations, closing remarks, and next year announcements.',
            resources: ['Award trophies', 'Presentation materials', 'Photography equipment'],
            assignedTo: ['Event Manager', 'Photography Team'],
            notes: 'Ensure all award recipients are present and prepared.',
            status: 'upcoming'
          },
          {
            id: 'tl_008',
            title: 'Venue Cleanup',
            activity: 'Venue Cleanup',
            type: 'cleanup',
            startTime: '15:00',
            time: '15:00',
            duration: 120,
            location: 'All Areas',
            description: 'Complete venue cleanup, equipment breakdown, and material collection.',
            resources: ['Cleaning supplies', 'Storage containers', 'Transportation'],
            assignedTo: ['Cleanup Crew', 'Equipment Team'],
            notes: 'Coordinate with venue management for final inspection.',
            status: 'upcoming'
          }];
        }

        const mockProgressData = {
          phases: [
            {
              id: 'planning',
              status: 'completed',
              progress: 100,
              completedTasks: 12,
              totalTasks: 12
            },
            {
              id: 'preparation',
              status: 'in-progress',
              progress: 65,
              completedTasks: 8,
              totalTasks: 15
            },
            {
              id: 'execution',
              status: 'pending',
              progress: 0,
              completedTasks: 0,
              totalTasks: 8
            },
            {
              id: 'followup',
              status: 'pending',
              progress: 0,
              completedTasks: 0,
              totalTasks: 5
            }
          ],
          completedTasks: 20,
          totalTasks: 40,
          daysRemaining: 45,
          nextActions: [
            'Finalize catering menu and dietary options',
            'Confirm speaker travel arrangements',
            'Complete venue layout and seating plan',
            'Send final event details to all attendees'
          ]
        };

        setEventData(mockEventData);
        setTimelineData(mockTimelineData);
        setProgressData(mockProgressData);

        if (preferences) {
          showInfo('Event plan loaded with preferences from dashboard');
        } else {
          showInfo('Event plan loaded successfully');
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        showError('Failed to load event plan. Using default data.');
        
        // Fallback to basic mock data
        setEventData({
          id: 'evt_001',
          name: 'Sample Event',
          date: '2025-03-15',
          time: '09:00',
          location: 'TBD',
          attendees: 50,
          budget: 10000,
          status: 'planning',
          attendeeSummary: {
            seatingTables: Math.ceil(50 / 8),
            seatsPerTable: 8,
            cateringPlates: Math.ceil(50 * 1.1),
            staffingCount: Math.max(6, Math.ceil(50 / 25))
          },
          contacts: [
            {
              name: 'Riya Sharma',
              role: 'Event Manager',
              phone: '+91 98765 43210',
              email: 'riya.sharma@eventindia.com'
            },
            {
              name: 'Arjun Mehta',
              role: 'Technical Coordinator',
              phone: '+91 91234 56789',
              email: 'arjun.mehta@eventindia.com'
            },
            {
              name: 'Priya Nair',
              role: 'Marketing Lead',
              phone: '+91 99876 54321',
              email: 'priya.nair@eventindia.com'
            }
          ]
        });
        setTimelineData([]);
        setProgressData({
          phases: [],
          completedTasks: 0,
          totalTasks: 0,
          daysRemaining: 30,
          nextActions: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, []);

  const handleUpdateEvent = (updatedData) => {
    try {
      setEventData(updatedData);
      
      // Save updated data to localStorage
      const currentSavedData = localStorage.getItem('eventPlanningData');
      if (currentSavedData) {
        try {
          const parsedData = JSON.parse(currentSavedData);
          const updatedSavedData = {
            ...parsedData,
            eventName: updatedData.name,
            eventDate: updatedData.date,
            eventTime: updatedData.time,
            eventLocation: updatedData.location,
            expectedAttendees: updatedData.attendees
          };
          localStorage.setItem('eventPlanningData', JSON.stringify(updatedSavedData));
        } catch (error) {
          console.error('Error updating saved data:', error);
        }
      }
      
      showSuccess('Event details updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      showError('Failed to update event details');
    }
  };

  const handleUpdateActivity = (activityId, updatedActivity) => {
    try {
      setTimelineData(prev => 
        prev?.map(item => 
          item?.id === activityId ? { ...item, ...updatedActivity, updatedAt: new Date()?.toISOString() } : item
        )
      );
      showSuccess('Activity updated successfully');
    } catch (error) {
      console.error('Error updating activity:', error);
      showError('Failed to update activity');
    }
  };

  const handleAddActivity = () => {
    try {
      const newActivity = {
        id: `tl_${Date.now()}`,
        title: 'New Activity',
        type: 'setup',
        startTime: '10:00',
        duration: 60,
        location: 'TBD',
        attendees: 10,
        description: 'New activity description',
        resources: [],
        assignedTo: [],
        notes: '',
        createdAt: new Date()?.toISOString()
      };
      
      setTimelineData(prev => [...prev, newActivity]);
      showSuccess('New activity added to timeline');
    } catch (error) {
      console.error('Error adding activity:', error);
      showError('Failed to add new activity');
    }
  };

  const handleExport = async (format) => {
    try {
      showInfo(`Exporting plan as ${format?.toUpperCase()}...`);
      
      const exportData = {
        eventData,
        timelineData,
        progressData,
        exportFormat: format,
        exportedAt: new Date()?.toISOString()
      };
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-plan-${eventData?.name?.replace(/\s+/g, '-')?.toLowerCase()}.${format}`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess(`Plan exported as ${format?.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      showError(`Failed to export plan as ${format?.toUpperCase()}`);
    }
  };

  const handleRegenerate = async () => {
    try {
      showInfo('Generating alternative plan...');
      
      // Simulate regeneration process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add some variation to the timeline
      const regeneratedTimeline = timelineData?.map(item => ({
        ...item,
        duration: item.duration + (Math.random() > 0.5 ? 15 : -15),
        updatedAt: new Date()?.toISOString()
      }));
      
      setTimelineData(regeneratedTimeline);
      showSuccess('Alternative plan generated successfully');
    } catch (error) {
      console.error('Regeneration failed:', error);
      showError('Failed to generate alternative plan');
    }
  };

  const handleCreateTasks = () => {
    try {
      // Save current event context for task creation
      const taskContext = {
        eventId: eventData?.id,
        eventName: eventData?.name,
        eventDate: eventData?.date,
        timelineActivities: timelineData?.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          assignedTo: item.assignedTo
        }))
      };
      
      localStorage.setItem('taskCreationContext', JSON.stringify(taskContext));
      
      showSuccess('Redirecting to task board...');
      setTimeout(() => {
        window.location.href = '/task-board-management';
      }, 1000);
    } catch (error) {
      console.error('Error preparing task creation:', error);
      showError('Failed to prepare task creation');
    }
  };

  const handleQuickAction = (actionType) => {
    switch (actionType) {
      case 'add-event':
        handleAddActivity();
        break;
      case 'set-reminder': showInfo('Reminder set for 1 hour before event');
        break;
      case 'ai-generate':
        handleRegenerate();
        break;
      case 'quick-add':
        handleAddActivity();
        break;
      default:
        showInfo(`${actionType} action triggered`);
    }
  };

  const viewModeOptions = [
    { value: 'timeline', label: 'Timeline', icon: 'Clock' },
    { value: 'gantt', label: 'Gantt Chart', icon: 'BarChart3' },
    { value: 'calendar', label: 'Calendar', icon: 'Calendar' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Icon name="Loader2" size={32} className="text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading event plan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Event Plan Details</h1>
                <p className="text-muted-foreground">
                  Comprehensive timeline and details for your event planning
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                {viewModeOptions?.map((option) => (
                  <Button
                    key={option?.value}
                    variant={viewMode === option?.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(option?.value)}
                    iconName={option?.icon}
                    iconPosition="left"
                  >
                    {option?.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Event Metadata & Actions */}
            <div className="lg:col-span-1 space-y-6">
              <EventMetadata 
                eventData={eventData}
                onUpdate={handleUpdateEvent}
              />
              
              <PlanActions
                onExport={handleExport}
                onRegenerate={handleRegenerate}
                onCreateTasks={handleCreateTasks}
                attendeeSummary={eventData?.attendeeSummary}
              />
            </div>

            {/* Main Content Area - Timeline */}
            <div className="lg:col-span-2">
              {viewMode === 'timeline' && (
                <EventTimeline
                  timelineData={timelineData}
                  eventStartTime={eventData?.time}
                  attendeeSummary={eventData?.attendeeSummary}
                  onUpdateActivity={handleUpdateActivity}
                  onAddActivity={handleAddActivity}
                />
              )}
              
              {viewMode === 'gantt' && (
                <GanttChart
                  timelineData={timelineData}
                  onActivityClick={(activity) => showInfo(`Selected: ${activity.activity}`)}
                />
              )}
              
              {viewMode === 'calendar' && (
                <CalendarView
                  timelineData={timelineData}
                  eventDate={eventData?.date ? new Date(eventData.date) : new Date()}
                  onActivityClick={(activity) => showInfo(`Selected: ${activity.activity}`)}
                />
              )}
            </div>

            {/* Right Sidebar - Progress Tracker */}
            <div className="lg:col-span-1">
              <ProgressTracker progressData={progressData} />
            </div>
          </div>

          {/* Mobile-Optimized Bottom Actions */}
          <div className="lg:hidden mt-8 p-4 bg-card rounded-lg border border-border shadow-card">
            <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/task-board-management'}
                iconName="CheckSquare"
                iconPosition="left"
              >
                Tasks
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/budget-calculator'}
                iconName="Calculator"
                iconPosition="left"
              >
                Budget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/marketing-materials'}
                iconName="Megaphone"
                iconPosition="left"
              >
                Marketing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                iconName="Download"
                iconPosition="left"
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Action Button */}
      <QuickActionButton onAction={handleQuickAction} />
      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
        position="below-header"
      />
    </div>
  );
};

export default EventPlanDetails;