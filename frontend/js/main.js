
function readDashboardData(key) {
    try {
        var data = localStorage.getItem(key);
        var parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function displayUserName() {
    var name = localStorage.getItem("currentUser") || "Student";
    var nameElement = document.getElementById("userName");
    var avatar = document.getElementById("dashboardAvatar");
    var heading = document.getElementById("greetingHeading");

    var profile = {};

    try {
        profile = JSON.parse(localStorage.getItem("smartStudyProfile") || "{}");
    } catch (error) {
        profile = {};
    }

    name = profile.fullName || name;

    if (nameElement) {
        nameElement.textContent = name;
    }

    if (avatar) {
        avatar.textContent = name.charAt(0).toUpperCase();
    }

    if (heading) {
        var hour = new Date().getHours();
        var greeting = hour < 12 ? "Good Morning" :
            hour < 17 ? "Good Afternoon" : "Good Evening";

        heading.textContent = greeting + "! 👋";
    }
}

function logoutUser() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function checkLogin() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

function dashboardEscape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
        var characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}

function dashboardParseDate(value) {
    if (!value) {
        return null;
    }

    var parts = String(value).split("-");

    if (parts.length === 3) {
        var date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

        if (
            date.getFullYear() !== Number(parts[0]) ||
            date.getMonth() !== Number(parts[1]) - 1 ||
            date.getDate() !== Number(parts[2])
        ) {
            return null;
        }

        return date;
    }

    var parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dashboardDateKey(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function dashboardIsThisWeek(value) {
    var date = dashboardParseDate(value);

    if (!date) {
        return false;
    }

    var today = new Date();
    var start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var day = start.getDay();

    start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));

    var end = new Date(start);
    end.setDate(end.getDate() + 7);

    return date >= start && date < end;
}

function dashboardFormatHours(hours) {
    return Number(hours.toFixed(2)).toString() + "h";
}

function dashboardGetStudyGoal() {
    try {
        var settings = JSON.parse(
            localStorage.getItem("smartStudySettings") || "{}"
        );

        var match = String(settings.studyGoal || "10 hours").match(/\d+(\.\d+)?/);
        return match ? Number(match[0]) : 10;
    } catch (error) {
        return 10;
    }
}

function updateDashboard() {
    var subjects = readDashboardData("smartStudySubjects");
    var assignments = readDashboardData("smartStudyAssignments");
    var sessions = readDashboardData("smartStudySessions");

    var pending = assignments.filter(function (assignment) {
        return String(assignment.status || "").toLowerCase() === "pending";
    });

    var completedSessions = sessions.filter(function (session) {
        return Boolean(session.completed);
    });

    var weeklyHours = completedSessions.reduce(function (total, session) {
        if (!dashboardIsThisWeek(session.date)) {
            return total;
        }

        var duration = Number(session.duration);
        return total + (Number.isFinite(duration) && duration > 0 ? duration : 0);
    }, 0);

    var completedAssignments = assignments.filter(function (assignment) {
        return String(assignment.status || "").toLowerCase() === "completed";
    }).length;

    var goal = dashboardGetStudyGoal();
    var weeklyProgress = goal > 0
        ? Math.min(100, Math.round(weeklyHours / goal * 100))
        : 0;

    document.getElementById("totalSubjectsStat").textContent = subjects.length;
    document.getElementById("pendingAssignmentsStat").textContent = pending.length;
    document.getElementById("studyHoursStat").textContent = dashboardFormatHours(weeklyHours);
    document.getElementById("weeklyProgressStat").textContent = weeklyProgress + "%";

    displayUpcomingAssignments(assignments);
    displayTodayStudyPlan(sessions);
    displayDashboardRecommendation(assignments, pending, weeklyHours, goal);
}

function displayUpcomingAssignments(assignments) {
    var container = document.getElementById("upcomingAssignmentsList");
    var today = new Date();

    today.setHours(0, 0, 0, 0);

    var upcoming = assignments.filter(function (assignment) {
        if (String(assignment.status || "").toLowerCase() === "completed") {
            return false;
        }

        var date = dashboardParseDate(assignment.dueDate);

        return date && date >= today;
    });

    upcoming.sort(function (first, second) {
        return dashboardParseDate(first.dueDate) - dashboardParseDate(second.dueDate);
    });

    if (upcoming.length === 0) {
        container.innerHTML =
            '<p class="dashboard-empty-message">No upcoming assignments. You are all caught up!</p>';
        return;
    }

    container.innerHTML = upcoming.slice(0, 4).map(function (assignment) {
        var dueDate = dashboardParseDate(assignment.dueDate);
        var daysLeft = Math.ceil(
            (dueDate.getTime() - today.getTime()) / 86400000
        );

        var deadlineText = daysLeft === 0 ? "Due Today" :
            daysLeft === 1 ? "1 Day" : daysLeft + " Days";

        var priority = String(assignment.priority || "").toLowerCase();
        var deadlineClass = priority === "high" || daysLeft <= 1
            ? "danger"
            : priority === "medium" || daysLeft <= 3
                ? "warning"
                : "";

        return '<div class="assignment-item">' +
            '<div><h3>' + dashboardEscape(assignment.title || "Untitled Assignment") +
            '</h3><p>' + dashboardEscape(assignment.subject || "No subject") +
            '</p></div><span class="deadline ' + deadlineClass + '">' +
            deadlineText + '</span></div>';
    }).join("");
}

function displayTodayStudyPlan(sessions) {
    var container = document.getElementById("todayStudyPlanList");
    var todayKey = dashboardDateKey(new Date());

    var todaysSessions = sessions.filter(function (session) {
        return session.date === todayKey;
    });

    todaysSessions.sort(function (first, second) {
        return String(first.startTime || "").localeCompare(
            String(second.startTime || "")
        );
    });

    if (todaysSessions.length === 0) {
        container.innerHTML =
            '<p class="dashboard-empty-message">No study sessions planned for today. <a href="planner.html">Add one in your planner.</a></p>';
        return;
    }

    container.innerHTML = todaysSessions.map(function (session) {
        var time = String(session.startTime || "Time not set");
        var timeParts = time.split(":");
        var displayTime = time;

        if (timeParts.length >= 2 && !isNaN(Number(timeParts[0]))) {
            var hour = Number(timeParts[0]);
            var minute = timeParts[1];
            var suffix = hour >= 12 ? "PM" : "AM";
            var twelveHour = hour % 12 || 12;

            displayTime = String(twelveHour).padStart(2, "0") +
                ":" + minute + " " + suffix;
        }

        return '<div class="study-item">' +
            '<div class="study-time">' + dashboardEscape(displayTime) + '</div>' +
            '<div><h3>' + dashboardEscape(session.subject || "Study Session") +
            '</h3><p>' + dashboardEscape(session.title || "Study session") +
            ' · ' + dashboardEscape(session.duration || 0) + 'h' +
            (session.completed ? ' · Completed' : '') +
            '</p></div></div>';
    }).join("");
}

function displayDashboardRecommendation(assignments, pending, weeklyHours, goal) {
    var element = document.getElementById("recommendationText");

    if (pending.length > 0) {
        var sorted = pending.slice().sort(function (first, second) {
            var firstDate = dashboardParseDate(first.dueDate);
            var secondDate = dashboardParseDate(second.dueDate);

            if (!firstDate) {
                return 1;
            }

            if (!secondDate) {
                return -1;
            }

            return firstDate - secondDate;
        });

        var next = sorted[0];

        element.textContent = "Focus on " + (next.title || "your next assignment") +
            (next.subject ? " for " + next.subject : "") +
            ". Open your assignments to check its deadline and plan a study session.";
        return;
    }

    if (weeklyHours < goal) {
        element.textContent = "You have completed " + dashboardFormatHours(weeklyHours) +
            " of your " + goal + "-hour weekly study goal. Plan another session to keep progressing.";
        return;
    }

    element.textContent = "Great work! You have reached your weekly study goal. Review your progress and prepare for your next study session.";
}

document.addEventListener("DOMContentLoaded", function () {
    if (!checkLogin()) {
        return;
    }

    displayUserName();

    var logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function (event) {
            event.preventDefault();
            logoutUser();
        });
    }

    if (document.getElementById("totalSubjectsStat")) {
        updateDashboard();
    }
});