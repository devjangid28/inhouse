import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CalendarView = ({ timelineData, eventDate, onActivityClick }) => {
  const [currentView, setCurrentView] = useState('day');
  const [selectedDate, setSelectedDate] = useState(eventDate || new Date());

  // Group activities by hour
  const hourlyActivities = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return {};

    const grouped = {};
    timelineData.forEach(activity => {
      const hour = parseInt(activity.time.split(':')[0]);
      if (!grouped[hour]) {
        grouped[hour] = [];
      }
      grouped[hour].push(activity);
    });
    return grouped;
  }, [timelineData]);

  const formatTime = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success/10 border-success text-success';
      case 'in-progress': return 'bg-primary/10 border-primary text-primary';
      case 'upcoming': return 'bg-warning/10 border-warning text-warning';
      case 'delayed': return 'bg-destructive/10 border-destructive text-destructive';
      default: return 'bg-muted/10 border-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'upcoming': return 'Upcoming';
      case 'delayed': return 'Delayed';
      default: return 'Scheduled';
    }
  };

  // Generate hours for the day (6 AM to 11 PM)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Events Scheduled</h3>
        <p className="text-muted-foreground">
          No activities to display in calendar view
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-card">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="Calendar" size={20} className="text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Event Schedule</h3>
              <p className="text-xs text-muted-foreground">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              Today
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('day')}
          >
            Day
          </Button>
          <Button
            variant={currentView === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('week')}
          >
            Week
          </Button>
          <Button
            variant={currentView === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Day View Calendar */}
      {currentView === 'day' && (
        <div className="p-4">
          {/* Time Grid */}
          <div className="space-y-2">
            {hours.map(hour => {
              const activities = hourlyActivities[hour] || [];
              const hasActivities = activities.length > 0;

              return (
                <div
                  key={hour}
                  className={`border border-border rounded-lg overflow-hidden transition-all ${
                    hasActivities ? 'bg-muted/20' : 'bg-card'
                  }`}
                >
                  <div className="flex">
                    {/* Time Column */}
                    <div className="w-24 flex-shrink-0 p-3 bg-muted/30 border-r border-border">
                      <p className="text-sm font-semibold text-foreground">
                        {formatTime(hour)}
                      </p>
                    </div>

                    {/* Activities Column */}
                    <div className="flex-1 p-2 min-h-[60px]">
                      {activities.length > 0 ? (
                        <div className="space-y-2">
                          {activities.map((activity, idx) => (
                            <button
                              key={idx}
                              onClick={() => onActivityClick && onActivityClick(activity)}
                              className={`w-full text-left p-3 rounded-lg border-l-4 transition-all hover:shadow-md ${getStatusColor(activity.status)}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-semibold text-sm">
                                      {activity.activity}
                                    </h4>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-current">
                                      {getStatusBadge(activity.status)}
                                    </span>
                                  </div>
                                  <p className="text-xs opacity-90 mb-2">
                                    {activity.time} • {activity.duration || 60} min
                                  </p>
                                  {activity.description && (
                                    <p className="text-xs opacity-80 line-clamp-2">
                                      {activity.description}
                                    </p>
                                  )}
                                  {activity.attendees && (
                                    <div className="flex items-center space-x-1 mt-2">
                                      <Icon name="Users" size={12} />
                                      <span className="text-xs">{activity.attendees} attendees</span>
                                    </div>
                                  )}
                                </div>
                                <Icon name="ChevronRight" size={16} className="opacity-50" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-xs text-muted-foreground">No events scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {currentView === 'week' && (
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{day}</p>
                <div className={`p-4 border rounded-lg ${idx === 3 ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}>
                  <p className="text-sm font-semibold text-foreground mb-2">{idx + 1}</p>
                  {idx === 3 && (
                    <div className="space-y-1">
                      {timelineData.slice(0, 3).map((activity, i) => (
                        <div key={i} className="w-2 h-2 bg-primary rounded-full mx-auto" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month View */}
      {currentView === 'month' && (
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i - 2;
              const isEventDay = dayNum === 15;
              return (
                <button
                  key={i}
                  className={`aspect-square p-2 rounded-lg border transition-all ${
                    isEventDay
                      ? 'bg-primary/20 border-primary font-semibold'
                      : dayNum > 0 && dayNum <= 31
                      ? 'bg-card border-border hover:bg-muted/20'
                      : 'bg-muted/10 border-transparent'
                  }`}
                >
                  {dayNum > 0 && dayNum <= 31 && (
                    <span className="text-sm text-foreground">{dayNum}</span>
                  )}
                  {isEventDay && (
                    <div className="flex justify-center mt-1 space-x-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1 h-1 bg-primary rounded-full" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="p-4 border-t border-border bg-muted/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                {timelineData.length} activities scheduled
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                {timelineData.reduce((sum, a) => sum + (a.attendees || 0), 0)} total attendees
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
            Export Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
