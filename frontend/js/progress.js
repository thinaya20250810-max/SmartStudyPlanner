function readSavedData(key) {
    try {
        var data = localStorage.getItem(key);
        var parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function getProgressSubjects() {
    return readSavedData("smartStudySubjects");
}

function getProgressAssignments() {
    return readSavedData("smartStudyAssignments");
}

function getProgressSessions() {
    return readSavedData("smartStudySessions");
}

function toNumber(value) {
    var number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
}

function escapeProgressHTML(value) {
    var characters = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
        return characters[character];
    });
}

function formatHours(hours) {
    return Number(hours.toFixed(2)).toString() + "h";
}

function formatLocalDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function parseLocalDate(value) {
    if (!value) {
        return null;
    }

    var parts = String(value).split("-");

    if (parts.length === 3) {
        var year = Number(parts[0]);
        var month = Number(parts[1]);
        var day = Number(parts[2]);
        var date = new Date(year, month - 1, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    var parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getStartOfWeek(date) {
    var start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var day = start.getDay();

    start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));

    return start;
}

function isThisWeek(value) {
    var date = parseLocalDate(value);

    if (!date) {
        return false;
    }

    var start = getStartOfWeek(new Date());
    var end = new Date(start);

    end.setDate(end.getDate() + 7);

    return date >= start && date < end;
}

function getAssignmentCompletion(assignments) {
    if (assignments.length === 0) {
        return 0;
    }

    var completed = assignments.filter(function (assignment) {
        return String(assignment.status || "").toLowerCase() === "completed";
    }).length;

    return Math.round(completed / assignments.length * 100);
}

function calculateStudyStreak(sessions) {
    var dates = new Set();

    sessions.forEach(function (session) {
        if (session.completed && session.date) {
            var date = parseLocalDate(session.date);

            if (date) {
                dates.add(formatLocalDate(date));
            }
        }
    });

    var current = new Date();
    current.setHours(0, 0, 0, 0);

    if (!dates.has(formatLocalDate(current))) {
        current.setDate(current.getDate() - 1);

        if (!dates.has(formatLocalDate(current))) {
            return 0;
        }
    }

    var streak = 0;

    while (dates.has(formatLocalDate(current))) {
        streak++;
        current.setDate(current.getDate() - 1);
    }

    return streak;
}

function getWeeklyStudyHours(sessions) {
    return sessions.reduce(function (total, session) {
        if (session.completed && isThisWeek(session.date)) {
            return total + toNumber(session.duration);
        }

        return total;
    }, 0);
}

function updateProgressStatistics(assignments, sessions) {
    var completed = assignments.filter(function (assignment) {
        return String(assignment.status || "").toLowerCase() === "completed";
    }).length;

    var percentage = getAssignmentCompletion(assignments);
    var hours = getWeeklyStudyHours(sessions);
    var streak = calculateStudyStreak(sessions);

    document.getElementById("overallProgressStat").textContent = percentage + "%";
    document.getElementById("studyHoursStat").textContent = formatHours(hours);
    document.getElementById("assignmentsStat").textContent = completed + "/" + assignments.length;
    document.getElementById("studyStreakStat").textContent = streak + (streak === 1 ? " Day" : " Days");
}

function updateProgressOverview(assignments, sessions) {
    var assignmentPercentage = getAssignmentCompletion(assignments);
    var weeklyHours = getWeeklyStudyHours(sessions);
    var weeklyPercentage = Math.min(100, Math.round(weeklyHours / 10 * 100));

    document.getElementById("overallProgressLabel").textContent = assignmentPercentage + "%";
    document.getElementById("weeklyGoalLabel").textContent = weeklyPercentage + "%";
    document.getElementById("assignmentProgressLabel").textContent = assignmentPercentage + "%";

    document.getElementById("overallProgressBar").style.width = assignmentPercentage + "%";
    document.getElementById("weeklyGoalBar").style.width = weeklyPercentage + "%";
    document.getElementById("assignmentProgressBar").style.width = assignmentPercentage + "%";

    document.getElementById("weeklyGoalDescription").textContent =
        formatHours(weeklyHours) + " studied out of 10h this week.";
}

function displayAchievements(assignments, sessions) {
    var container = document.getElementById("achievementList");

    var completedAssignments = assignments.filter(function (assignment) {
        return String(assignment.status || "").toLowerCase() === "completed";
    }).length;

    var completedSessions = sessions.filter(function (session) {
        return Boolean(session.completed);
    }).length;

    var streak = calculateStudyStreak(sessions);
    var weeklyHours = getWeeklyStudyHours(sessions);

    var achievements = [
        {
            icon: "🔥",
            title: "Study Streak",
            description: streak >= 7 ? "Reached a 7-day study streak!" : streak + "/7 consecutive study days.",
            unlocked: streak >= 7
        },
        {
            icon: "📚",
            title: "Study Starter",
            description: completedSessions >= 10 ? "Completed 10 study sessions!" : completedSessions + "/10 completed sessions.",
            unlocked: completedSessions >= 10
        },
        {
            icon: "🎯",
            title: "Assignment Hero",
            description: completedAssignments >= 10 ? "Completed 10 assignments!" : completedAssignments + "/10 completed assignments.",
            unlocked: completedAssignments >= 10
        },
        {
            icon: "⏱️",
            title: "Weekly Goal",
            description: weeklyHours >= 10 ? "Reached your 10-hour study goal!" : formatHours(weeklyHours) + " of 10h this week.",
            unlocked: weeklyHours >= 10
        }
    ];

    container.innerHTML = achievements.map(function (item) {
        return '<div class="achievement-item">' +
            '<div class="achievement-icon">' + item.icon + '</div>' +
            '<div><h3>' + escapeProgressHTML(item.title) +
            (item.unlocked ? " ✓" : "") + '</h3><p>' +
            escapeProgressHTML(item.description) + '</p></div></div>';
    }).join("");
}

function assignmentMatchesSubject(assignment, subject) {
    var assignmentSubject = String(assignment.subject || "").trim().toLowerCase();
    var subjectName = String(subject.name || "").trim().toLowerCase();
    var subjectCode = String(subject.code || "").trim().toLowerCase();

    return assignmentSubject !== "" &&
        (assignmentSubject === subjectName || assignmentSubject === subjectCode);
}

function displaySubjectProgress(subjects, assignments) {
    var container = document.getElementById("subjectProgressList");

    if (subjects.length === 0) {
        container.innerHTML = "<p>No subjects found. Add subjects to see your progress here.</p>";
        return;
    }

    var colours = [
        "progress-blue",
        "progress-green",
        "progress-orange",
        "progress-red",
        "progress-purple",
        "progress-gray"
    ];

    container.innerHTML = subjects.map(function (subject, index) {
        var matching = assignments.filter(function (assignment) {
            return assignmentMatchesSubject(assignment, subject);
        });

        var completed = matching.filter(function (assignment) {
            return String(assignment.status || "").toLowerCase() === "completed";
        }).length;

        var percentage = matching.length === 0 ? 0 : Math.round(completed / matching.length * 100);

        return '<div class="subject-progress-item">' +
            '<div class="subject-progress-header"><div>' +
            '<h3>' + escapeProgressHTML(subject.name || "Unnamed Subject") + '</h3>' +
            '<span>' + escapeProgressHTML(subject.code || "No subject code") + '</span>' +
            '<p>' + completed + ' of ' + matching.length + ' assignments completed</p>' +
            '</div><strong>' + percentage + '%</strong></div>' +
            '<div class="progress-bar"><div class="progress-fill ' +
            colours[index % colours.length] + '" style="width: ' +
            percentage + '%;"></div></div></div>';
    }).join("");
}

function displayRecentActivity(assignments, sessions) {
    var container = document.getElementById("recentActivityList");
    var activities = [];

    sessions.forEach(function (session) {
        if (session.completed) {
            activities.push({
                icon: "✅",
                title: "Completed " + (session.title || "study session"),
                description: (session.subject || "Study session") + " • " +
                    formatHours(toNumber(session.duration)),
                date: session.date
            });
        }
    });

    assignments.forEach(function (assignment) {
        if (String(assignment.status || "").toLowerCase() === "completed") {
            activities.push({
                icon: "📝",
                title: "Completed " + (assignment.title || "assignment"),
                description: assignment.subject || "Assignment",
                date: assignment.dueDate
            });
        }
    });

    activities.sort(function (first, second) {
        var firstDate = parseLocalDate(first.date);
        var secondDate = parseLocalDate(second.date);

        return (secondDate ? secondDate.getTime() : 0) -
            (firstDate ? firstDate.getTime() : 0);
    });

    if (activities.length === 0) {
        container.innerHTML = "<p>No completed activities yet.</p>";
        return;
    }

    container.innerHTML = activities.slice(0, 5).map(function (activity) {
        var label = "Date not available";
        var date = parseLocalDate(activity.date);

        if (date) {
            var today = new Date();
            today.setHours(0, 0, 0, 0);

            var yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            date.setHours(0, 0, 0, 0);

            if (date.getTime() === today.getTime()) {
                label = "Today";
            } else if (date.getTime() === yesterday.getTime()) {
                label = "Yesterday";
            } else {
                label = date.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });
            }
        }

        return '<div class="activity-item">' +
            '<div class="activity-icon">' + activity.icon + '</div>' +
            '<div class="activity-details"><h3>' +
            escapeProgressHTML(activity.title) + '</h3><p>' +
            escapeProgressHTML(activity.description) + '</p></div>' +
            '<span class="activity-time">' + escapeProgressHTML(label) +
            '</span></div>';
    }).join("");
}

function loadProgressPage() {
    var subjects = getProgressSubjects();
    var assignments = getProgressAssignments();
    var sessions = getProgressSessions();

    updateProgressStatistics(assignments, sessions);
    updateProgressOverview(assignments, sessions);
    displayAchievements(assignments, sessions);
    displaySubjectProgress(subjects, assignments);
    displayRecentActivity(assignments, sessions);
}

document.addEventListener("DOMContentLoaded", function () {
    loadProgressPage();
});
