
const PLANNER_STORAGE_KEY = "smartStudySessions";

let displayedWeek = getMonday(new Date());

function getSessions() {
    return JSON.parse(localStorage.getItem(PLANNER_STORAGE_KEY)) || [];
}

function saveSessions(sessions) {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(sessions));
}

function getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
    const parts = dateString.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getMonday(date) {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = monday.getDay();

    monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
    monday.setHours(0, 0, 0, 0);

    return monday;
}

function addDays(date, numberOfDays) {
    const result = new Date(date);
    result.setDate(result.getDate() + numberOfDays);
    return result;
}

function formatDate(date) {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function getEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;

    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
        return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}

function getSubjectOptions() {
    const savedSubjects = JSON.parse(
        localStorage.getItem("smartStudySubjects")
    ) || [];

    const subjectNames = savedSubjects
        .map(subject => subject.name)
        .filter(Boolean);

    return [...new Set(subjectNames)];
}

function getSubjectClass(subject) {
    const name = subject.toLowerCase();

    if (name.includes("database")) return "database-session";
    if (name.includes("java")) return "java-session";
    if (name.includes("math")) return "maths-session";
    if (name.includes("web")) return "web-session";
    if (name.includes("program")) return "programming-session";

    return "database-session";
}

function addStudySession(suggested = false) {
    const subjects = getSubjectOptions();

    let subject = "";

    if (suggested) {
        subject = subjects[0] || "General Study";
    } else {
        const subjectMessage = subjects.length
            ? `Enter a subject${"\n"}Available subjects: ${subjects.join(", ")}`
            : "Enter the subject name:";

        subject = prompt(subjectMessage);

        if (subject === null) return;

        subject = subject.trim();

        if (!subject) {
            alert("Please enter a subject name.");
            return;
        }
    }

    const title = prompt(
        suggested ? "What will you study during this session?" : "Enter the session task or topic:"
    );

    if (title === null) return;

    if (!title.trim()) {
        alert("Please enter a session task or topic.");
        return;
    }

    const defaultDate = getDateString(new Date());

    const date = prompt(
        "Enter the study date (YYYY-MM-DD):",
        defaultDate
    );

    if (date === null) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(parseDate(date).getTime()) ||
        getDateString(parseDate(date)) !== date) {
        alert("Please enter a valid date in YYYY-MM-DD format.");
        return;
    }

    const startTime = prompt(
        "Enter the start time using 24-hour format (HH:MM):",
        suggested ? "18:00" : "09:00"
    );

    if (startTime === null) return;

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
        alert("Please enter a valid time, such as 09:30 or 14:00.");
        return;
    }

    const durationInput = prompt(
        "How many minutes will you study?",
        suggested ? "60" : "90"
    );

    if (durationInput === null) return;

    const duration = Number(durationInput);

    if (!Number.isInteger(duration) || duration < 1 || duration > 720) {
        alert("Duration must be between 1 and 720 minutes.");
        return;
    }

    const sessions = getSessions();

    sessions.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        subject: subject,
        title: title.trim(),
        date: date,
        startTime: startTime,
        duration: duration,
        completed: false
    });

    saveSessions(sessions);
    renderPlanner();

    alert("Study session added successfully!");
}

function toggleSession(sessionId) {
    const sessions = getSessions();

    const session = sessions.find(item => item.id === sessionId);

    if (!session) return;

    session.completed = !session.completed;

    saveSessions(sessions);
    renderPlanner();
}

function deleteSession(sessionId) {
    const confirmed = confirm("Are you sure you want to delete this study session?");

    if (!confirmed) return;

    const updatedSessions = getSessions().filter(
        session => session.id !== sessionId
    );

    saveSessions(updatedSessions);
    renderPlanner();
}

function renderWeek() {
    const schedule = document.getElementById("weeklySchedule");
    const dateRange = document.getElementById("weekDateRange");

    const weekEnd = addDays(displayedWeek, 6);

    dateRange.textContent =
        `${formatDate(displayedWeek)} - ${formatDate(weekEnd)}`;

    const sessions = getSessions();

    schedule.innerHTML = "";

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = addDays(displayedWeek, dayIndex);
        const dateString = getDateString(currentDate);

        const daySessions = sessions
            .filter(session => session.date === dateString)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const dayColumn = document.createElement("div");
        dayColumn.className = "day-column";

        const dayHeader = document.createElement("div");
        dayHeader.className = "day-header";

        const dayName = currentDate.toLocaleDateString("en-US", {
            weekday: "short"
        }).toUpperCase();

        dayHeader.innerHTML = `
            <span>${dayName}</span>
            <strong>${currentDate.getDate()}</strong>
        `;

        dayColumn.appendChild(dayHeader);

        if (daySessions.length === 0) {
            const emptyDay = document.createElement("div");
            emptyDay.className = "empty-day";
            emptyDay.textContent = "No sessions planned";
            dayColumn.appendChild(emptyDay);
        }

        daySessions.forEach(session => {
            const sessionCard = document.createElement("div");

            sessionCard.className =
                `study-session ${getSubjectClass(session.subject)}`;

            if (session.completed) {
                sessionCard.classList.add("session-completed");
            }

            sessionCard.innerHTML = `
                <strong>${escapeHTML(session.subject)}</strong>
                <span>
                    ${formatTime(session.startTime)} -
                    ${formatTime(getEndTime(session.startTime, session.duration))}
                </span>
                <small>${escapeHTML(session.title)}</small>
                <div class="planner-session-actions">
                    <button type="button" data-action="toggle"
                        data-id="${escapeHTML(session.id)}">
                        ${session.completed ? "Undo" : "Complete"}
                    </button>
                    <button type="button" data-action="delete"
                        data-id="${escapeHTML(session.id)}">
                        Delete
                    </button>
                </div>
            `;

            dayColumn.appendChild(sessionCard);
        });

        schedule.appendChild(dayColumn);
    }
}

function renderTodaySessions() {
    const today = getDateString(new Date());

    const todaySessions = getSessions()
        .filter(session => session.date === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    document.getElementById("todayDate").textContent =
        new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

    document.getElementById("todaySessionCount").textContent =
        `${todaySessions.length} Session${todaySessions.length === 1 ? "" : "s"}`;

    const container = document.getElementById("todaySessions");

    if (todaySessions.length === 0) {
        container.innerHTML = '<p class="empty-day">No study sessions planned for today.</p>';
        return;
    }

    container.innerHTML = todaySessions.map(session => `
        <div class="today-session ${session.completed ? "session-completed" : ""}">
            <div class="session-time">
                <strong>${formatTime(session.startTime)}</strong>
                <span>${formatDuration(session.duration)}</span>
            </div>

            <div class="session-details">
                <h3>${escapeHTML(session.subject)}</h3>
                <p>${escapeHTML(session.title)}</p>
                <span class="session-subject">
                    ${session.completed ? "Completed" : "Planned"}
                </span>
            </div>

            <button type="button"
                class="complete-session-button"
                data-action="toggle"
                data-id="${escapeHTML(session.id)}">
                ${session.completed ? "Undo" : "Mark Complete"}
            </button>

            <button type="button"
                data-action="delete"
                data-id="${escapeHTML(session.id)}">
                Delete
            </button>
        </div>
    `).join("");
}

function renderWeeklySummary() {
    const sessions = getSessions();

    const weekEnd = addDays(displayedWeek, 7);
    const weeklySessions = sessions.filter(session => {
        const sessionDate = parseDate(session.date);

        return sessionDate >= displayedWeek && sessionDate < weekEnd;
    });

    const totalMinutes = weeklySessions.reduce(
        (total, session) => total + Number(session.duration), 0
    );

    const completedSessions = weeklySessions.filter(
        session => session.completed
    ).length;

    const subjects = new Set(
        weeklySessions.map(session => session.subject)
    );

    const progress = weeklySessions.length === 0
        ? 0
        : Math.round((completedSessions / weeklySessions.length) * 100);

    document.getElementById("plannedStudyTime").textContent =
        `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

    document.getElementById("weeklySessionCount").textContent =
        weeklySessions.length;

    document.getElementById("weeklyProgress").textContent =
        `${progress}%`;

    document.getElementById("subjectsCovered").textContent =
        subjects.size;
}

function renderPlanner() {
    renderWeek();
    renderTodaySessions();
    renderWeeklySummary();
}

document.getElementById("addSessionButton").addEventListener("click", function () {
    addStudySession(false);
});

document.getElementById("suggestedSessionButton").addEventListener("click", function () {
    addStudySession(true);
});

document.getElementById("previousWeekButton").addEventListener("click", function () {
    displayedWeek = addDays(displayedWeek, -7);
    renderPlanner();
});

document.getElementById("nextWeekButton").addEventListener("click", function () {
    displayedWeek = addDays(displayedWeek, 7);
    renderPlanner();
});

document.getElementById("weeklySchedule").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    if (button.dataset.action === "toggle") {
        toggleSession(button.dataset.id);
    } else if (button.dataset.action === "delete") {
        deleteSession(button.dataset.id);
    }
});

document.getElementById("todaySessions").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    if (button.dataset.action === "toggle") {
        toggleSession(button.dataset.id);
    } else if (button.dataset.action === "delete") {
        deleteSession(button.dataset.id);
    }
});

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
        if (typeof logoutUser === "function") {
            event.preventDefault();
            logoutUser();
        }
    });
}

renderPlanner();