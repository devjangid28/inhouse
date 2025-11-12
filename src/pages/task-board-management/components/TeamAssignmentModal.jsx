import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TeamAssignmentModal = ({ isOpen, onClose, task, onAssign }) => {
  const [selectedMembers, setSelectedMembers] = useState(task?.assignee ? [task.assignee] : []);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock team members
  const teamMembers = [
    { id: 1, name: 'Sarah Johnson', role: 'Event Manager', avatar: 'SJ', status: 'available', email: 'sarah.j@example.com' },
    { id: 2, name: 'Michael Chen', role: 'Coordinator', avatar: 'MC', status: 'busy', email: 'michael.c@example.com' },
    { id: 3, name: 'Emily Davis', role: 'Designer', avatar: 'ED', status: 'available', email: 'emily.d@example.com' },
    { id: 4, name: 'James Wilson', role: 'Marketing Lead', avatar: 'JW', status: 'available', email: 'james.w@example.com' },
    { id: 5, name: 'Lisa Anderson', role: 'Vendor Manager', avatar: 'LA', status: 'away', email: 'lisa.a@example.com' },
    { id: 6, name: 'David Brown', role: 'Logistics', avatar: 'DB', status: 'available', email: 'david.b@example.com' },
    { id: 7, name: 'Jennifer Lee', role: 'Budget Analyst', avatar: 'JL', status: 'available', email: 'jennifer.l@example.com' },
    { id: 8, name: 'Robert Taylor', role: 'Technical Lead', avatar: 'RT', status: 'busy', email: 'robert.t@example.com' }
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleMember = (memberName) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberName)) {
        return prev.filter(m => m !== memberName);
      } else {
        return [...prev, memberName];
      }
    });
  };

  const handleAssign = () => {
    if (selectedMembers.length > 0 && onAssign) {
      onAssign(selectedMembers);
    }
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'away': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <Icon name="Users" size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Assign Team Members</h2>
                <p className="text-sm text-muted-foreground">
                  {task?.title || 'Select team members for this task'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon="Search"
            />
          </div>

          {/* Selected Members Summary */}
          {selectedMembers.length > 0 && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">
                  Selected: {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMembers([])}
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((memberName, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full"
                  >
                    <span className="text-sm text-primary font-medium">{memberName}</span>
                    <button
                      onClick={() => handleToggleMember(memberName)}
                      className="text-primary hover:text-primary/70"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members Grid */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Available Team Members</h3>
            {filteredMembers.map((member) => {
              const isSelected = selectedMembers.includes(member.name);
              return (
                <button
                  key={member.id}
                  onClick={() => handleToggleMember(member.name)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border hover:bg-muted/20'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-white ${
                      isSelected ? 'bg-primary' : 'bg-accent'
                    }`}>
                      {member.avatar}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`} />
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-foreground">{member.name}</p>
                      {isSelected && (
                        <Icon name="CheckCircle2" size={16} className="text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      member.status === 'available' ? 'bg-success/10 text-success' :
                      member.status === 'busy' ? 'bg-warning/10 text-warning' :
                      'bg-muted/10 text-muted-foreground'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No team members found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedMembers.length === 0 ? (
                'Select at least one team member'
              ) : (
                `${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''} selected`
              )}
            </p>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={selectedMembers.length === 0}
                iconName="Check"
                iconPosition="left"
              >
                Assign Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAssignmentModal;
