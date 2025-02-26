// DOM Elements
const addClassBtn = document.getElementById('add-class-btn');
const classModal = document.getElementById('class-modal');
const closeModal = document.querySelector('.close-modal');
const classForm = document.getElementById('class-form');
const deleteClassBtn = document.getElementById('delete-class');
const timeColumn = document.getElementById('time-column');
const scheduleGrid = document.getElementById('schedule-grid');
const dayItems = document.querySelectorAll('.day-item');
const prevWeekBtn = document.getElementById('prev-week');
const nextWeekBtn = document.getElementById('next-week');
const currentWeekSpan = document.getElementById('current-week');
const detailsModal = document.getElementById('details-modal');
const closeDetailsModal = document.querySelector('.close-details-modal');
const editClassBtn = document.getElementById('edit-class-btn');
const notificationBanner = document.getElementById('notification-banner');
const enableNotificationsBtn = document.getElementById('enable-notifications');
const dismissNotificationBannerBtn = document.getElementById('dismiss-notification-banner');

// App State
let classes = [];
let currentDate = new Date();
let selectedDay = currentDate.getDay();
let notificationPermission = false;
let notificationTimers = [];

// Initialize the app
async function initApp() {
    setupTimeGrid();
    setupEventListeners();
    checkNotificationPermission();
    await loadClasses();
    updateWeekDisplay();
    highlightToday();
    renderSchedule();
    setupNotificationSystem();
}

// Setup time grid
function setupTimeGrid() {
    // Create time slots from 8 AM to 10 PM
    for (let hour = 8; hour <= 22; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = formatHour(hour);
        timeColumn.appendChild(timeSlot);

        const hourDivider = document.createElement('div');
        hourDivider.className = 'hour-divider';
        hourDivider.style.top = `${(hour - 8) * 60}px`;
        scheduleGrid.appendChild(hourDivider);
    }
}

// Format hour for display
function formatHour(hour) {
    return hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;
}

// Setup event listeners
function setupEventListeners() {
    // Add class button
    addClassBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Class';
        document.getElementById('class-id').value = '';
        classForm.reset();
        document.getElementById('delete-class').style.display = 'none';
        classModal.style.display = 'block';
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        classModal.style.display = 'none';
    });

    // Close details modal
    closeDetailsModal.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });

    // Edit class button in details modal
    editClassBtn.addEventListener('click', () => {
        const classId = editClassBtn.dataset.classId;
        openEditModal(classId);
        detailsModal.style.display = 'none';
    });

    // Class form submission
    classForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveClass();
    });

    // Delete class button
    deleteClassBtn.addEventListener('click', async () => {
        const classId = document.getElementById('class-id').value;
        if (classId) {
            if (confirm('Are you sure you want to delete this class?')) {
                await deleteClassHandler(classId);
            }
        }
    });

    // Day selector
    dayItems.forEach(item => {
        item.addEventListener('click', () => {
            selectedDay = parseInt(item.dataset.day);
            dayItems.forEach(d => d.classList.remove('active'));
            item.classList.add('active');
            renderSchedule();
        });
    });

    // Week navigation
    prevWeekBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 7);
        updateWeekDisplay();
        renderSchedule();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7);
        updateWeekDisplay();
        renderSchedule();
    });

    // Enable notifications button
    enableNotificationsBtn.addEventListener('click', requestNotificationPermission);

    // Dismiss notification banner button
    dismissNotificationBannerBtn.addEventListener('click', () => {
        notificationBanner.style.display = 'none';
        localStorage.setItem('notificationBannerDismissed', 'true');
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === classModal) {
            classModal.style.display = 'none';
        }
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });
}

// Load classes from Supabase
async function loadClasses() {
    try {
        const { data, error } = await getClasses();
        if (error) throw error;
        classes = data || [];
    } catch (error) {
        console.error('Error loading classes:', error);
        alert('Failed to load your classes. Please try again later.');
    }
}

// Save class (create or update)
async function saveClass() {
    const classId = document.getElementById('class-id').value;
    const className = document.getElementById('class-name').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const roomLocation = document.getElementById('room-location').value;
    const classColor = document.getElementById('class-color').value;
    const classNotes = document.getElementById('class-notes').value;
    
    // Get selected days
    const selectedDays = [];
    document.querySelectorAll('input[name="days"]:checked').forEach(checkbox => {
        selectedDays.push(parseInt(checkbox.value));
    });

    if (selectedDays.length === 0) {
        alert('Please select at least one day for the class.');
        return;
    }

    const classData = {
        name: className,
        days: selectedDays,
        start_time: startTime,
        end_time: endTime,
        location: roomLocation,
        color: classColor,
        notes: classNotes
    };

    try {
        if (classId) {
            // Update existing class
            const { data, error } = await updateClass(classId, classData);
            if (error) throw error;
            
            // Update local classes array
            const index = classes.findIndex(c => c.id.toString() === classId);
            if (index !== -1) {
                classes[index] = data[0];
            }
        } else {
            // Create new class
            const { data, error } = await addClass(classData);
            if (error) throw error;
            
            // Add to local classes array
            classes.push(data[0]);
        }
        
        classModal.style.display = 'none';
        renderSchedule();
        setupNotificationSystem(); // Refresh notifications
    } catch (error) {
        console.error('Error saving class:', error);
        alert('Failed to save your class. Please try again later.');
    }
}

// Delete class handler
async function deleteClassHandler(classId) {
    try {
        const { error } = await deleteClass(classId);
        if (error) throw error;
        
        // Remove from local classes array
        classes = classes.filter(c => c.id.toString() !== classId);
        
        classModal.style.display = 'none';
        renderSchedule();
        setupNotificationSystem(); // Refresh notifications
    } catch (error) {
        console.error('Error deleting class:', error);
        alert('Failed to delete your class. Please try again later.');
    }
}

// Open edit modal for a class
function openEditModal(classId) {
    const classToEdit = classes.find(c => c.id.toString() === classId);
    if (!classToEdit) return;

    document.getElementById('modal-title').textContent = 'Edit Class';
    document.getElementById('class-id').value = classId;
    document.getElementById('class-name').value = classToEdit.name;
    document.getElementById('start-time').value = classToEdit.start_time;
    document.getElementById('end-time').value = classToEdit.end_time;
    document.getElementById('room-location').value = classToEdit.location;
    document.getElementById('class-color').value = classToEdit.color;
    document.getElementById('class-notes').value = classToEdit.notes || '';

    // Reset day checkboxes
    document.querySelectorAll('input[name="days"]').forEach(checkbox => {
        checkbox.checked = classToEdit.days.includes(parseInt(checkbox.value));
    });

    document.getElementById('delete-class').style.display = 'block';
    classModal.style.display = 'block';
}

// Open details modal for a class
function openDetailsModal(classId) {
    const classDetails = classes.find(c => c.id.toString() === classId);
    if (!classDetails) return;

    document.getElementById('details-class-name').textContent = classDetails.name;
    document.getElementById('details-time').textContent = `${formatTime(classDetails.start_time)} - ${formatTime(classDetails.end_time)}`;
    document.getElementById('details-location').textContent = classDetails.location;
    
    const notesContainer = document.getElementById('details-notes-container');
    const notesElement = document.getElementById('details-notes');
    
    if (classDetails.notes) {
        notesElement.textContent = classDetails.notes;
        notesContainer.style.display = 'block';
    } else {
        notesContainer.style.display = 'none';
    }

    editClassBtn.dataset.classId = classId;
    detailsModal.style.display = 'block';
}

// Format time for display (convert 24h to 12h format)
function formatTime(time24h) {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
}

// Render the schedule for the selected day
function renderSchedule() {
    // Clear existing class entries
    const existingEntries = document.querySelectorAll('.class-entry');
    existingEntries.forEach(entry => entry.remove());

    // Filter classes for the selected day
    const classesForDay = classes.filter(c => c.days.includes(selectedDay));

    // Render each class
    classesForDay.forEach(classItem => {
        const startMinutes = timeToMinutes(classItem.start_time);
        const endMinutes = timeToMinutes(classItem.end_time);
        const duration = endMinutes - startMinutes;
        
        // Only display classes that start after 8 AM (480 minutes)
        if (startMinutes >= 480) {
            const top = (startMinutes - 480); // 8 AM is 0px from top
            const height = duration;

            const classEntry = document.createElement('div');
            classEntry.className = 'class-entry';
            classEntry.style.top = `${top}px`;
            classEntry.style.height = `${height}px`;
            classEntry.style.backgroundColor = classItem.color;
            classEntry.dataset.classId = classItem.id;

            classEntry.innerHTML = `
                <h3>${classItem.name}</h3>
                <p>${formatTime(classItem.start_time)} - ${formatTime(classItem.end_time)}</p>
                <p>${classItem.location}</p>
            `;

            classEntry.addEventListener('click', () => {
                openDetailsModal(classItem.id.toString());
            });

            scheduleGrid.appendChild(classEntry);
        }
    });

    // Highlight the selected day
    dayItems.forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.day) === selectedDay) {
            item.classList.add('active');
        }
    });
}

// Convert time string (HH:MM) to minutes since midnight
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Update the week display
function updateWeekDisplay() {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    currentWeekSpan.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
    
    // Update day numbers in day selector
    dayItems.forEach((item, index) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + index);
        
        // Format as "Day #" (e.g., "Mon 15")
        const dayText = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = dayDate.getDate();
        item.textContent = `${dayText} ${dayNumber}`;
        
        // Check if this day is today
        const today = new Date();
        item.classList.remove('today');
        if (dayDate.toDateString() === today.toDateString()) {
            item.classList.add('today');
        }
    });
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Highlight today in the day selector
function highlightToday() {
    const today = new Date().getDay();
    dayItems.forEach(item => {
        item.classList.remove('today');
        if (parseInt(item.dataset.day) === today) {
            item.classList.add('today');
            // Also set as selected day by default
            selectedDay = today;
            item.classList.add('active');
        }
    });
}

// Check notification permission
function checkNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }

    if (Notification.permission === 'granted') {
        notificationPermission = true;
        notificationBanner.style.display = 'none';
    } else if (Notification.permission !== 'denied') {
        // Only show banner if not previously dismissed
        const dismissed = localStorage.getItem('notificationBannerDismissed');
        if (dismissed !== 'true') {
            notificationBanner.style.display = 'flex';
        }
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('This browser does not support notifications');
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            notificationPermission = true;
            notificationBanner.style.display = 'none';
            setupNotificationSystem();
            alert('Notifications enabled! You will now receive reminders 15 minutes before your classes.');
        } else {
            alert('Notification permission denied. You will not receive class reminders.');
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

// Setup notification system
function setupNotificationSystem() {
    // Clear existing notification timers
    notificationTimers.forEach(timer => clearTimeout(timer));
    notificationTimers = [];

    if (!notificationPermission) return;

    // Get today's classes
    const today = new Date();
    const dayOfWeek = today.getDay();
    const classesToday = classes.filter(c => c.days.includes(dayOfWeek));

    classesToday.forEach(classItem => {
        const [hours, minutes] = classItem.start_time.split(':').map(Number);
        
        // Create a date object for the class time today
        const classTime = new Date();
        classTime.setHours(hours, minutes, 0, 0);
        
        // Calculate time for notification (15 minutes before class)
        const notificationTime = new Date(classTime);
        notificationTime.setMinutes(notificationTime.getMinutes() - 15);
        
        // Only schedule if notification time is in the future
        if (notificationTime > today) {
            const timeUntilNotification = notificationTime.getTime() - today.getTime();
            
            // Schedule notification
            const timerId = setTimeout(() => {
                sendNotification(classItem);
            }, timeUntilNotification);
            
            notificationTimers.push(timerId);
        }
    });
}

// Send notification for a class
function sendNotification(classItem) {
    if (!notificationPermission) return;

    const title = `Class Reminder: ${classItem.name}`;
    const options = {
        body: `Starting in 15 minutes at ${formatTime(classItem.start_time)} in ${classItem.location}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991231.png',
        vibrate: [100, 50, 100],
        data: {
            classId: classItem.id
        }
    };

    try {
        const notification = new Notification(title, options);
        
        notification.onclick = function() {
            window.focus();
            openDetailsModal(classItem.id.toString());
            this.close();
        };
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
