
const CALENDAR_EVENT_KEY = "smartStudyCalendarEvents";
const STUDY_SESSION_KEY = "smartStudySessions";
const ASSIGNMENT_KEY = "smartStudyAssignments";

let currentCalendarMonth = new Date();
currentCalendarMonth.setDate(1);

let selectedCalendarDate = getCalendarDateString(new Date());

function getCalendarDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseCalendarDate(dateString) {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return null;
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (getCalendarDateString(date) !== dateString) {
        return null;
    }

    return date;
}

function readCalendarStorage(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Could not read ${key}:`, error);
        return [];
    }
}

function saveCustomEvents(events) {
    localStorage.setItem(CALENDAR_EVENT_KEY, JSON.stringify(events));
}

function escapeCalendarHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}

function formatCalendarDate(dateString, options = {}) {
    const date = parseCalendarDate(dateString);

    if (!date) return dateString || "";

    return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        ...options
    });
}

function getStudySessions() {
    return readCalendarStorage(STUDY_SESSION_KEY)
        .filter(session => session.date && session.subject)
        .map(session => ({
            id: String(session.id),
            title: session.title || session.subject,
            subject: session.subject,
            date: session.date,
            type: "study",
            time: session.startTime || "",
            completed: Boolean(session.completed)
        }));
}

function getAssignments() {
    return readCalendarStorage(ASSIGNMENT_KEY)
        .filter(assignment => {
            const status = String(assignment.status || "").toLowerCase();

            return assignment.dueDate &&
                assignment.title &&
                status !== "completed";
        })
        .map(assignment => ({
            id: String(assignment.id),
            title: assignment.title,
            subject: assignment.subject || "General",
            date: assignment.dueDate,
            type: "assignment",
            priority: assignment.priority || "Medium",
            status: assignment.status || "Pending"
        }));
}

function getCustomEvents() {
    return readCalendarStorage(CALENDAR_EVENT_KEY)
        .filter(event => event.date && event.title)
        .map(event => ({
            ...event,
            id: String(event.id),
            type: "custom"
        }));
}

function getAllCalendarEvents() {
    return [
        ...getStudySessions(),
        ...getAssignments(),
        ...getCustomEvents()
    ].filter(event => parseCalendarDate(event.date));
}

function getEventsForDate(dateString) {
    return getAllCalendarEvents()
        .filter(event => event.date === dateString)
        .sort((first, second) => {
            return (first.time || "").localeCompare(second.time || "");
        });
}

function getEventClass(event) {
    if (event.type === "study") return "study-event";
    if (event.type === "assignment") return "assignment-event";
    return "deadline-event";
}

function getEventLabel(event) {
    if (event.type === "study") return "Study session";
    if (event.type === "assignment") return "Assignment";
    return "Custom event";
}

function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    const monthTitle = document.getElementById("calendarMonthTitle");

    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    monthTitle.textContent = currentCalendarMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    grid.innerHTML = "";

    // Find the Monday at the beginning of the calendar grid.
    const firstDay = new Date(year, month, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - mondayOffset);

    const todayString = getCalendarDateString(new Date());
    const events = getAllCalendarEvents();

    // Six rows keep the calendar height consistent between months.
    for (let index = 0; index < 42; index++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);

        const dateString = getCalendarDateString(date);
        const dayEvents = events.filter(event => event.date === dateString);

        const dayCell = document.createElement("div");
        dayCell.className = "calendar-day";

        if (date.getMonth() !== month) {
            dayCell.classList.add("other-month");
        }

        if (dateString === todayString) {
            dayCell.classList.add("today");
        }

        if (dateString === selectedCalendarDate) {
            dayCell.classList.add("selected-calendar-day");
        }

        dayCell.dataset.date = dateString;
        dayCell.setAttribute("role", "button");
        dayCell.setAttribute("tabindex", "0");
        dayCell.setAttribute("aria-label", formatCalendarDate(dateString));

        const dateNumber = document.createElement("span");
        dateNumber.className = "date-number";
        dateNumber.textContent = date.getDate();
        dayCell.appendChild(dateNumber);

        dayEvents.slice(0, 3).forEach(event => {
            const eventElement = document.createElement("div");
            eventElement.className =
                `calendar-event ${getEventClass(event)}`;

            eventElement.textContent = event.title;
            eventElement.title =
                `${getEventLabel(event)}: ${event.title}`;

            dayCell.appendChild(eventElement);
        });

        if (dayEvents.length > 3) {
            const more = document.createElement("small");
            more.className = "calendar-more-events";
            more.textContent = `+${dayEvents.length - 3} more`;
            dayCell.appendChild(more);
        }

        grid.appendChild(dayCell);
    }

    renderSelectedDateEvents();
    renderUpcomingDeadlines();
}

function renderSelectedDateEvents() {
    const title = document.getElementById("selectedDateTitle");
    const container = document.getElementById("selectedDateEvents");

    title.textContent = `Events for ${formatCalendarDate(selectedCalendarDate)}`;

    const events = getEventsForDate(selectedCalendarDate);

    if (events.length === 0) {
        container.innerHTML = '<p class="empty-day">No events on this date. Click Add Event to create one.</p>';
        return;
    }

    container.innerHTML = events.map(event => {
        let extraDetails = "";
        let deleteButton = "";

        if (event.type === "study") {
            extraDetails = `
                <p>${escapeCalendarHTML(event.subject)}</p>
                <span class="calendar-event-type">Study session${event.completed ? " · Completed" : ""}</span>
            `;
        } else if (event.type === "assignment") {
            extraDetails = `
                <p>${escapeCalendarHTML(event.subject)}</p>
                <span class="upcoming-priority ${
                String(event.priority).toLowerCase() === "high"
                    ? "high"
                    : String(event.priority).toLowerCase() === "low"
                        ? "low"
                        : "medium"
            }">${escapeCalendarHTML(event.priority)} Priority</span>
            `;
        } else {
            extraDetails = `<span class="calendar-event-type">Custom event</span>`;

            deleteButton = `
                <button type="button" class="calendar-delete-button"
                    data-delete-event="${escapeCalendarHTML(event.id)}">
                    Delete
                </button>
            `;
        }

        const timeText = event.time
            ? `<p>${escapeCalendarHTML(formatCalendarTime(event.time))}</p>`
            : "";

        return `
            <div class="upcoming-event">
                <div class="upcoming-date">
                    <strong>${parseCalendarDate(event.date).getDate()}</strong>
                    <span>${parseCalendarDate(event.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span>
                </div>

                <div class="upcoming-details">
                    <h3>${escapeCalendarHTML(event.title)}</h3>
                    ${timeText}
                    ${extraDetails}
                </div>

                ${deleteButton}
            </div>
        `;
    }).join("");
}

function formatCalendarTime(time) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        return time;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function renderUpcomingDeadlines() {
    const container = document.getElementById("upcomingDeadlines");
    const todayString = getCalendarDateString(new Date());

    const upcoming = getAssignments()
        .filter(assignment => assignment.date >= todayString)
        .sort((first, second) => first.date.localeCompare(second.date))
        .slice(0, 5);

    if (upcoming.length === 0) {
        container.innerHTML = '<p class="empty-day">No upcoming assignment deadlines. You are all caught up!</p>';
        return;
    }

    container.innerHTML = upcoming.map(assignment => {
        const date = parseCalendarDate(assignment.date);
        const priority = String(assignment.priority).toLowerCase();
        const priorityClass = ["high", "medium", "low"].includes(priority)
            ? priority
            : "medium";

        return `
            <div class="upcoming-event">
                <div class="upcoming-date">
                    <strong>${date.getDate()}</strong>
                    <span>${date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span>
                </div>

                <div class="upcoming-details">
                    <h3>${escapeCalendarHTML(assignment.title)}</h3>
                    <p>${escapeCalendarHTML(assignment.subject)}</p>
                    <small>${escapeCalendarHTML(formatCalendarDate(assignment.date))}</small>
                </div>

                <span class="upcoming-priority ${priorityClass}">
                    ${escapeCalendarHTML(assignment.priority)} Priority
                </span>
            </div>
        `;
    }).join("");
}

function addCustomCalendarEvent() {
    const title = prompt("Enter the event title:");

    if (title === null) return;

    if (!title.trim()) {
        alert("Please enter an event title.");
        return;
    }

    const date = prompt(
        "Enter the event date (YYYY-MM-DD):",
        selectedCalendarDate
    );

    if (date === null) return;

    if (!parseCalendarDate(date)) {
        alert("Please enter a valid date in YYYY-MM-DD format.");
        return;
    }

    const events = readCalendarStorage(CALENDAR_EVENT_KEY);

    events.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title: title.trim(),
        date: date,
        createdAt: new Date().toISOString()
    });

    saveCustomEvents(events);

    selectedCalendarDate = date;
    currentCalendarMonth = new Date(
        parseCalendarDate(date).getFullYear(),
        parseCalendarDate(date).getMonth(),
        1
    );

    renderCalendar();
    alert("Calendar event added successfully!");
}

function deleteCustomCalendarEvent(eventId) {
    const confirmed = confirm("Delete this custom calendar event?");

    if (!confirmed) return;

    const events = readCalendarStorage(CALENDAR_EVENT_KEY)
        .filter(event => String(event.id) !== String(eventId));

    saveCustomEvents(events);
    renderCalendar();
}

document.getElementById("previousMonthButton").addEventListener("click", function () {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() - 1);
    renderCalendar();
});

document.getElementById("nextMonthButton").addEventListener("click", function () {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + 1);
    renderCalendar();
});

document.getElementById("todayButton").addEventListener("click", function () {
    const today = new Date();

    currentCalendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedCalendarDate = getCalendarDateString(today);

    renderCalendar();
});

document.getElementById("addEventButton").addEventListener("click", addCustomCalendarEvent);

document.getElementById("calendarGrid").addEventListener("click", function (event) {
    const dayCell = event.target.closest(".calendar-day");

    if (!dayCell) return;

    selectedCalendarDate = dayCell.dataset.date;
    renderCalendar();
});

document.getElementById("calendarGrid").addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;

    const dayCell = event.target.closest(".calendar-day");

    if (!dayCell) return;

    event.preventDefault();
    selectedCalendarDate = dayCell.dataset.date;
    renderCalendar();
});

document.getElementById("selectedDateEvents").addEventListener("click", function (event) {
    const deleteButton = event.target.closest("[data-delete-event]");

    if (!deleteButton) return;

    deleteCustomCalendarEvent(deleteButton.dataset.deleteEvent);
});

const calendarLogoutButton = document.getElementById("logoutButton");

if (calendarLogoutButton) {
    calendarLogoutButton.addEventListener("click", function (event) {
        if (typeof logoutUser === "function") {
            event.preventDefault();
            logoutUser();
        }
    });
}

renderCalendar();