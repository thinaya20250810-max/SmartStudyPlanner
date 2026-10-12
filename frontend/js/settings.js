
var settingsStorageKey = "smartStudySettings";
var originalSettings = {};

function getSettingsValues() {
    var checkboxes = document.querySelectorAll(
        ".settings-content input[type='checkbox']"
    );

    return {
        emailNotifications: checkboxes[0].checked,
        assignmentReminders: checkboxes[1].checked,
        studyGoal: document.getElementById("studyGoal").value,
        sessionDuration: document.getElementById("sessionDuration").value,
        studyStart: document.getElementById("studyStart").value,
        studyEnd: document.getElementById("studyEnd").value,
        sessionReminders: checkboxes[2].checked,
        deadlineAlerts: checkboxes[3].checked,
        weeklySummary: checkboxes[4].checked,
        theme: document.getElementById("theme").value,
        language: document.getElementById("language").value
    };
}

function applyTheme(theme) {
    var oldStyle = document.getElementById("settingsThemeStyle");

    if (oldStyle) {
        oldStyle.remove();
    }

    if (theme !== "Dark") {
        return;
    }

    var style = document.createElement("style");
    style.id = "settingsThemeStyle";
    style.textContent = `
        body {
            background: #0f172a !important;
            color: #e2e8f0 !important;
        }

        .dashboard-page,
        .dashboard-content {
            background: #0f172a !important;
            color: #e2e8f0 !important;
        }

        .sidebar,
        .settings-card,
        .settings-content,
        .settings-actions {
            background: #1e293b !important;
            color: #e2e8f0 !important;
        }

        .settings-card h1,
        .settings-card h2,
        .settings-card h3,
        .settings-card p,
        .settings-page-header h1,
        .settings-page-header p,
        .settings-row p,
        .settings-form-group label,
        .security-option p,
        .danger-option p {
            color: #e2e8f0 !important;
        }

        .settings-form-group input,
        .settings-form-group select {
            background: #334155 !important;
            color: #ffffff !important;
            border-color: #475569 !important;
        }

        .sidebar .nav-item {
            color: #e2e8f0 !important;
        }
    `;

    document.head.appendChild(style);
}

function loadSettings() {
    var saved = localStorage.getItem(settingsStorageKey);

    if (saved) {
        try {
            var settings = JSON.parse(saved);
            var checkboxes = document.querySelectorAll(
                ".settings-content input[type='checkbox']"
            );

            checkboxes[0].checked = settings.emailNotifications !== false;
            checkboxes[1].checked = settings.assignmentReminders !== false;
            checkboxes[2].checked = settings.sessionReminders !== false;
            checkboxes[3].checked = settings.deadlineAlerts !== false;
            checkboxes[4].checked = settings.weeklySummary !== false;

            document.getElementById("studyGoal").value =
                settings.studyGoal || "15 hours";

            document.getElementById("sessionDuration").value =
                settings.sessionDuration || "60 minutes";

            document.getElementById("studyStart").value =
                settings.studyStart || "09:00";

            document.getElementById("studyEnd").value =
                settings.studyEnd || "18:00";

            document.getElementById("theme").value =
                settings.theme || "Light";

            document.getElementById("language").value =
                settings.language || "English";

        } catch (error) {
            console.error("Could not load settings:", error);
        }
    }

    originalSettings = getSettingsValues();
    applyTheme(document.getElementById("theme").value);
}

function saveSettings() {
    var settings = getSettingsValues();

    if (settings.studyStart && settings.studyEnd &&
        settings.studyStart >= settings.studyEnd) {
        alert("The preferred end time must be later than the start time.");
        return;
    }

    localStorage.setItem(settingsStorageKey, JSON.stringify(settings));

    originalSettings = Object.assign({}, settings);

    applyTheme(settings.theme);

    alert("Your settings have been saved successfully!");
}

function cancelSettings() {
    var settings = originalSettings;
    var checkboxes = document.querySelectorAll(
        ".settings-content input[type='checkbox']"
    );

    checkboxes[0].checked = settings.emailNotifications;
    checkboxes[1].checked = settings.assignmentReminders;
    checkboxes[2].checked = settings.sessionReminders;
    checkboxes[3].checked = settings.deadlineAlerts;
    checkboxes[4].checked = settings.weeklySummary;

    document.getElementById("studyGoal").value = settings.studyGoal;
    document.getElementById("sessionDuration").value = settings.sessionDuration;
    document.getElementById("studyStart").value = settings.studyStart;
    document.getElementById("studyEnd").value = settings.studyEnd;
    document.getElementById("theme").value = settings.theme;
    document.getElementById("language").value = settings.language;

    applyTheme(settings.theme);
}

function changePassword() {
    alert("Password changing will be available when backend authentication is implemented.");
}

function toggleTwoFactor(button) {
    if (button.dataset.enabled === "true") {
        button.dataset.enabled = "false";
        button.textContent = "Enable";
        alert("Two-factor authentication has been switched off in this demo.");
    } else {
        button.dataset.enabled = "true";
        button.textContent = "Enabled";
        alert("This is a visual demo only. Real two-factor authentication requires a backend.");
    }
}

function deleteAccountData() {
    var confirmed = confirm(
        "This will delete your saved Smart Study Planner data from this browser. Continue?"
    );

    if (!confirmed) {
        return;
    }

    var keys = [
        "smartStudyProfile",
        "smartStudySettings",
        "smartStudySubjects",
        "smartStudyAssignments",
        "smartStudySessions",
        "smartStudyCalendarEvents",
        "sampleSubjectsMigrated",
        "assignmentSamplesMigrated"
    ];

    keys.forEach(function (key) {
        localStorage.removeItem(key);
    });

    alert("Your saved planner data has been removed from this browser.");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    loadSettings();

    document.querySelector(".save-settings-button")
        .addEventListener("click", saveSettings);

    document.querySelector(".cancel-settings-button")
        .addEventListener("click", cancelSettings);

    var securityButtons = document.querySelectorAll(
        ".secondary-settings-button"
    );

    securityButtons[0].addEventListener("click", changePassword);

    securityButtons[1].addEventListener("click", function () {
        toggleTwoFactor(this);
    });

    document.querySelector(".delete-account-button")
        .addEventListener("click", deleteAccountData);

    document.getElementById("theme").addEventListener("change", function () {
        applyTheme(this.value);
    });
});