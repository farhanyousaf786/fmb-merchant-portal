# Universal Toast Notification System

A beautiful, reusable toast notification system for the FMB Merchant Portal.

## Features

- ✅ **4 Toast Types**: Success, Error, Warning, Info
- ✅ **Auto-dismiss**: Configurable duration (default 3 seconds)
- ✅ **Manual Close**: Click the X button to dismiss
- ✅ **Smooth Animations**: Slide-in/slide-out effects
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Global State**: Use anywhere in the app via context
- ✅ **Icon Support**: Each type has a unique icon
- ✅ **Stacking**: Multiple toasts stack vertically

## Usage

### 1. Import the Hook

```javascript
import { useToast } from '../components/Toast/ToastContext';
```

### 2. Use in Your Component

```javascript
function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handleWarning = () => {
    toast.warning('Please check your input');
  };

  const handleInfo = () => {
    toast.info('Here is some information');
  };

  // Custom duration (in milliseconds)
  const handleCustomDuration = () => {
    toast.success('This will stay for 5 seconds', 5000);
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

## API Reference

### Methods

- `toast.success(message, duration?)` - Show success toast
- `toast.error(message, duration?)` - Show error toast
- `toast.warning(message, duration?)` - Show warning toast
- `toast.info(message, duration?)` - Show info toast
- `toast.showToast(message, type, duration?)` - Generic method
- `toast.hideToast(id)` - Manually hide a specific toast

### Parameters

- `message` (string): The message to display
- `duration` (number, optional): Duration in milliseconds (default: 3000)
  - Set to `0` for persistent toast (won't auto-dismiss)
- `type` (string): Toast type - 'success', 'error', 'warning', 'info'

## Examples

### Basic Usage

```javascript
// Success notification
toast.success('Profile updated successfully!');

// Error notification
toast.error('Failed to save changes');

// Warning notification
toast.warning('Your session will expire soon');

// Info notification
toast.info('New features available!');
```

### Custom Duration

```javascript
// Show for 5 seconds
toast.success('Saved!', 5000);

// Persistent (won't auto-dismiss)
toast.error('Critical error - please contact support', 0);
```

### In Async Functions

```javascript
const saveData = async () => {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      toast.success('✅ Data saved successfully!');
    } else {
      toast.error('Failed to save data');
    }
  } catch (error) {
    toast.error('Network error occurred');
  }
};
```

### Form Validation

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!formData.email) {
    toast.error('Email is required');
    return;
  }
  
  if (!formData.password) {
    toast.error('Password is required');
    return;
  }
  
  // Submit form
  toast.success('Form submitted!');
};
```

## Styling

The toast system uses predefined colors for each type:

- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Warning**: Orange (#f59e0b)
- **Info**: Blue (#3b82f6)

Toast notifications appear in the top-right corner by default and stack vertically if multiple toasts are shown.

## Best Practices

1. **Keep messages concise**: Short, clear messages work best
2. **Use appropriate types**: Match the toast type to the message severity
3. **Don't overuse**: Too many toasts can be annoying
4. **Provide context**: Include enough information for the user to understand what happened
5. **Use emojis sparingly**: ✅ ❌ ⚠️ can enhance readability but don't overdo it

## Migration from Local Toast

If you're migrating from a local toast implementation:

**Before:**
```javascript
const [toast, setToast] = useState(null);

setToast({ type: 'success', message: 'Saved!' });

{toast && (
  <div className={`toast toast-${toast.type}`}>
    {toast.message}
  </div>
)}
```

**After:**
```javascript
const toast = useToast();

toast.success('Saved!');

// No JSX needed - handled globally!
```

## Technical Details

- **Context Provider**: `ToastProvider` wraps the entire app in `App.js`
- **Hook**: `useToast()` provides access to toast methods
- **Auto-dismiss**: Uses `setTimeout` with cleanup
- **Animations**: CSS keyframes for smooth transitions
- **Z-index**: 9999 to appear above all content
- **Responsive**: Adapts to mobile screens

## Troubleshooting

### Toast not appearing?

Make sure `ToastProvider` wraps your app in `App.js`:

```javascript
<ToastProvider>
  <Router>
    {/* Your app */}
  </Router>
</ToastProvider>
```

### "useToast must be used within a ToastProvider" error?

The component using `useToast()` must be a child of `ToastProvider`.

### Multiple toasts overlapping?

This is normal - they stack vertically. Adjust the gap in `Toast.css` if needed.
