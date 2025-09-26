# Event Sync System for CrimsonCollab Dashboard

This system automatically syncs events from different pages (trips, groups, collaborations, etc.) to the dashboard calendar when users sign up for them.

## 🚀 **How It Works**

1. **User joins an event** on any page (travel, groups, collaboration, etc.)
2. **Event data is synced** to the shared data service
3. **Dashboard automatically processes** pending events every 30 seconds
4. **Events appear on calendar** with appropriate icons and details
5. **Activity feed is updated** with join notifications

## 📁 **Files Created/Modified**

### **Core System Files:**
- `shared-data-service.js` - Enhanced with specific event types
- `dashboard.js` - Updated sync function to handle different event types
- `event-sync-helper.js` - Universal helper functions for any page

### **Integration Examples:**
- `travel-calendar-sync.js` - Example integration for travel page
- `travel.html` - Updated to include sync scripts

## 🛠️ **How to Use**

### **For Travel Page:**
```javascript
// When a user joins a trip, call:
joinTripWithCalendarSync(tripCard);

// Or manually sync a trip:
syncTripToCalendar({
    destination: 'Nashville, TN',
    date: '2025-10-15',
    time: '09:00',
    description: 'Weekend trip to Nashville',
    duration: '2 days',
    participants: ['You', 'John', 'Sarah'],
    cost: '$25 per person',
    source: 'travel'
});
```

### **For Groups Page:**
```javascript
// When a user joins a group, call:
syncGroupToCalendar({
    name: 'Study Group',
    date: '2025-10-20',
    time: '19:00',
    description: 'Weekly study session',
    location: 'Library Room 205',
    duration: '2 hours',
    members: ['You', 'Alex', 'Maria'],
    source: 'groups'
});
```

### **For Collaboration Page:**
```javascript
// When a user joins a collaboration, call:
syncCollaborationToCalendar({
    title: 'Project Alpha',
    date: '2025-10-25',
    time: '10:00',
    description: 'Project planning session',
    collaborationCode: 'PROJ001',
    location: 'Online',
    duration: '1 hour',
    participants: ['You', 'Team Lead'],
    source: 'collaboration'
});
```

### **Universal Function:**
```javascript
// For any custom event type:
syncEventToCalendar('custom', {
    title: 'Custom Event',
    date: '2025-10-30',
    time: '14:00',
    description: 'Custom event description',
    location: 'Custom Location',
    duration: '1 hour',
    participants: ['You'],
    source: 'custom'
});
```

## 🎯 **Event Types Supported**

| Event Type | Icon | Description | Source |
|------------|------|-------------|---------|
| `trip` | ✈️ | Travel/trip events | `travel` |
| `group` | 👥 | Group meetings | `groups` |
| `collaboration` | 🤝 | Collaboration sessions | `collaboration` |
| `custom` | 📅 | Any custom event | `custom` |

## 📊 **Dashboard Integration**

### **Calendar View:**
- Events appear with appropriate icons
- Different colors for different event types
- Click to view/edit event details
- Delete events directly from calendar

### **Activity Feed:**
- Automatic notifications when events are added
- Specific messaging based on event type:
  - "You joined a trip to Nashville"
  - "You joined the group: Study Group"
  - "You joined the collaboration: Project Alpha"

### **Sync Process:**
- Runs every 30 seconds automatically
- Processes pending events from shared data service
- Prevents duplicate events
- Shows success notifications

## 🔧 **Customization**

### **Adding New Event Types:**
1. Add new case to `syncEventToCalendar()` in `shared-data-service.js`
2. Add new helper function (e.g., `addCustomEvent()`)
3. Update dashboard sync function to handle new type
4. Add appropriate icon and messaging

### **Custom Event Data:**
```javascript
// Add custom fields to event data:
const eventData = {
    title: 'Custom Event',
    date: '2025-10-30',
    time: '14:00',
    description: 'Custom event description',
    location: 'Custom Location',
    duration: '1 hour',
    participants: ['You'],
    cost: '$10',
    status: 'confirmed',
    customField: 'custom value',
    source: 'custom'
};
```

## 🚨 **Error Handling**

The system includes comprehensive error handling:
- **Missing SharedDataService**: Logs warning and continues
- **Invalid Event Data**: Logs error and shows user notification
- **Sync Failures**: Shows warning toast to user
- **Duplicate Events**: Automatically prevents duplicates

## 📱 **User Experience**

### **Success Flow:**
1. User joins trip on travel page
2. Toast notification: "Trip added to your calendar!"
3. Event appears on dashboard calendar
4. Activity feed shows: "You joined a trip to Nashville"

### **Error Flow:**
1. User joins trip on travel page
2. Sync fails
3. Toast notification: "Trip joined, but failed to add to calendar"
4. User can manually add to calendar later

## 🔄 **Sync Timing**

- **Automatic**: Every 30 seconds
- **Manual**: Call `syncPendingCalendarEvents()` in dashboard
- **Immediate**: Events are queued immediately when user joins
- **Persistent**: Events persist until processed or expired

## 🎨 **Visual Indicators**

### **Calendar Events:**
- **Trips**: Airplane icon (✈️)
- **Groups**: People icon (👥)
- **Collaborations**: Handshake icon (🤝)
- **Custom**: Calendar icon (📅)

### **Activity Feed:**
- **Travel**: Airplane icon with travel-specific messaging
- **Groups**: People icon with group-specific messaging
- **Collaborations**: Handshake icon with collaboration-specific messaging

## 🧪 **Testing**

### **Test Trip Sync:**
```javascript
// In browser console:
syncTripToCalendar({
    destination: 'Test Destination',
    date: '2025-10-15',
    time: '09:00',
    description: 'Test trip',
    source: 'travel'
});
```

### **Test Group Sync:**
```javascript
// In browser console:
syncGroupToCalendar({
    name: 'Test Group',
    date: '2025-10-20',
    time: '19:00',
    description: 'Test group meeting',
    source: 'groups'
});
```

### **Check Pending Events:**
```javascript
// In browser console:
console.log(window.sharedDataService.getPendingCalendarEvents());
```

## 🚀 **Future Enhancements**

- **Real-time sync** with WebSocket connections
- **Event reminders** with notifications
- **Event conflicts** detection and resolution
- **Bulk event operations** (import/export)
- **Event templates** for common event types
- **Integration with external calendars** (Google Calendar, Outlook)

## 📝 **Notes**

- Events are stored in `localStorage` for persistence
- System works offline and syncs when online
- Compatible with existing dashboard functionality
- No breaking changes to existing code
- Easy to extend for new event types
- Comprehensive error handling and user feedback
