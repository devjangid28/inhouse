import React, { useState } from 'react';
import Icon from '../../../src/components/AppIcon';
import Button from '../../../src/components/ui/Button';
import Input from '../../../src/components/ui/Input';
import Select from '../../../src/components/ui/Select';

const CustomExpenseModal = ({ isOpen, onClose, onAdd }) => {
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('miscellaneous');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: 'venue', label: 'Venue & Location' },
    { value: 'catering', label: 'Food & Catering' },
    { value: 'services', label: 'Additional Services' },
    { value: 'miscellaneous', label: 'Miscellaneous' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!expenseName.trim()) {
      newErrors.name = 'Expense name is required';
    }
    
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newExpense = {
        name: expenseName,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription,
        isCustom: true,
        id: Date.now()
      };
      
      onAdd(newExpense);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setExpenseName('');
    setExpenseAmount('');
    setExpenseCategory('miscellaneous');
    setExpenseDescription('');
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <Icon name="Plus" size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Add Custom Expense</h2>
                <p className="text-sm text-muted-foreground">Include additional budget items</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Expense Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Expense Name *
            </label>
            <Input
              placeholder="e.g., Security Personnel, Decorations"
              value={expenseName}
              onChange={(e) => {
                setExpenseName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              error={errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Expense Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Amount (₹) *
            </label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={expenseAmount}
              onChange={(e) => {
                setExpenseAmount(e.target.value);
                if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
              }}
              leftIcon="IndianRupee"
              error={errors.amount}
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <Select
              options={categoryOptions}
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Add any additional details..."
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info Box */}
          <div className="flex items-start space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-1">
                This expense will be added to your selected category and included in the total budget calculation.
              </p>
            </div>
          </div>

          {/* Preview */}
          {expenseName && expenseAmount && (
            <div className="p-4 bg-muted/10 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{expenseName}</p>
                  {expenseDescription && (
                    <p className="text-xs text-muted-foreground mt-1">{expenseDescription}</p>
                  )}
                </div>
                <p className="text-lg font-bold text-primary">
                  ₹{parseFloat(expenseAmount || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10">
          <div className="flex items-center justify-between space-x-3">
            <Button variant="ghost" onClick={handleReset}>
              Reset
            </Button>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!expenseName || !expenseAmount}
                iconName="Check"
                iconPosition="left"
              >
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomExpenseModal;
