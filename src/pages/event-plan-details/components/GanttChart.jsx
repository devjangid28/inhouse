import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GanttChart = ({ timelineData, onActivityClick }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Calculate chart dimensions and timeline
  const chartData = useMemo(() => {
    if (!timelineData || timelineData.length === 0) {
      return { activities: [], minTime: null, maxTime: null, totalDuration: 0 };
    }

    // Parse times and calculate positions
    const activities = timelineData.map((item, index) => {
      const [hours, minutes] = item.time.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + (item.duration || 60);

      return {
        ...item,
        startMinutes,
        endMinutes,
        duration: item.duration || 60,
        index
      };
    });

    const minTime = Math.min(...activities.map(a => a.startMinutes));
    const maxTime = Math.max(...activities.map(a => a.endMinutes));
    const totalDuration = maxTime - minTime;

    return { activities, minTime, maxTime, totalDuration };
  }, [timelineData]);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const getPositionPercentage = (minutes) => {
    return ((minutes - chartData.minTime) / chartData.totalDuration) * 100;
  };

  const getDurationPercentage = (duration) => {
    return (duration / chartData.totalDuration) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in-progress': return 'bg-primary';
      case 'upcoming': return 'bg-warning';
      case 'delayed': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    if (onActivityClick) {
      onActivityClick(activity);
    }
  };

  const handleZoom = (direction) => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev + 0.2 : prev - 0.2;
      return Math.max(0.6, Math.min(2, newZoom));
    });
  };

  if (!chartData.activities || chartData.activities.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Timeline Data</h3>
        <p className="text-muted-foreground">
          No activities to display in Gantt chart view
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-card">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="BarChart3" size={20} className="text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Gantt Chart View</h3>
              <p className="text-xs text-muted-foreground">
                Visual timeline of {chartData.activities.length} activities
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('out')}
              disabled={zoomLevel <= 0.6}
            >
              <Icon name="ZoomOut" size={16} />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('in')}
              disabled={zoomLevel >= 2}
            >
              <Icon name="ZoomIn" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4 overflow-x-auto">
        <div style={{ minWidth: `${800 * zoomLevel}px` }}>
          {/* Time Header */}
          <div className="flex items-center mb-4 px-4">
            <div className="w-48 flex-shrink-0 font-medium text-sm text-muted-foreground">
              Activity
            </div>
            <div className="flex-1 relative h-8 border-b border-border">
              {[0, 25, 50, 75, 100].map(percent => (
                <div
                  key={percent}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${percent}%` }}
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {formatTime(chartData.minTime + (chartData.totalDuration * percent / 100))}
                  </span>
                  <div className="w-px h-2 bg-border" />
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-2">
            {chartData.activities.map((activity) => {
              const leftPos = getPositionPercentage(activity.startMinutes);
              const width = getDurationPercentage(activity.duration);
              const isSelected = selectedActivity?.id === activity.id;

              return (
                <div
                  key={activity.id}
                  className="flex items-center px-4 hover:bg-muted/30 rounded-lg transition-colors"
                >
                  {/* Activity Name */}
                  <div className="w-48 flex-shrink-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.activity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.duration} min
                    </p>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-12 flex items-center">
                    {/* Grid Lines */}
                    {[25, 50, 75].map(percent => (
                      <div
                        key={percent}
                        className="absolute top-0 h-full w-px bg-border/30"
                        style={{ left: `${percent}%` }}
                      />
                    ))}

                    {/* Activity Bar */}
                    <button
                      onClick={() => handleActivityClick(activity)}
                      className={`absolute h-8 rounded-lg transition-all cursor-pointer border-2 ${
                        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
                      } hover:scale-105 hover:shadow-md`}
                      style={{
                        left: `${leftPos}%`,
                        width: `${width}%`,
                        minWidth: '60px'
                      }}
                    >
                      <div className={`h-full ${getStatusColor(activity.status)} rounded-md flex items-center justify-center px-2 text-white`}>
                        <span className="text-xs font-medium truncate">
                          {activity.activity}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/10">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground">Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded" />
            <span className="text-xs text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning rounded" />
            <span className="text-xs text-muted-foreground">Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded" />
            <span className="text-xs text-muted-foreground">Delayed</span>
          </div>
        </div>
      </div>

      {/* Activity Details Panel */}
      {selectedActivity && (
        <div className="p-4 border-t border-border bg-primary/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                {selectedActivity.activity}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedActivity.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <span className="ml-2 text-foreground font-medium">
                    {selectedActivity.time}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 text-foreground font-medium">
                    {selectedActivity.duration} minutes
                  </span>
                </div>
                {selectedActivity.attendees && (
                  <div>
                    <span className="text-muted-foreground">Attendees:</span>
                    <span className="ml-2 text-foreground font-medium">
                      {selectedActivity.attendees}
                    </span>
                  </div>
                )}
                {selectedActivity.assignedTo && (
                  <div>
                    <span className="text-muted-foreground">Assigned:</span>
                    <span className="ml-2 text-foreground font-medium">
                      {selectedActivity.assignedTo.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedActivity(null)}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
