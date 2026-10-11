var profileStorageKey = "smartStudyProfile";
var originalProfile = {};

function getProfileFields() {
    return {
        fullName: document.getElementById("fullName"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        location: document.getElementById("location"),
        institution: document.getElementById("institution"),
        programme: document.getElementById("programme"),
        academicYear: document.getElementById("academicYear"),
        semester: document.getElementById("semester")
    };
}

function getProfileValues() {
    var fields = getProfileFields();
    var profile = {};

    Object.keys(fields).forEach(function (key) {
        profile[key] = fields[key].value.trim();
    });

    return profile;
}

function saveProfileValues(profile) {
    localStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

function updateProfileOverview(profile) {
    var name = profile.fullName || "Student";
    var email = profile.email || "No email added";

    document.querySelector(".profile-overview-info h2").textContent = name;
    document.querySelector(".profile-overview-info p").textContent = email;

    var avatar = document.querySelector(".profile-large-avatar");
    avatar.textContent = name.charAt(0).toUpperCase();
}

function updateProfileCompletion(profile) {
    var requiredFields = [
        profile.fullName,
        profile.email,
        profile.phone,
        profile.location,
        profile.institution,
        profile.programme,
        profile.academicYear,
        profile.semester
    ];

    var completedFields = requiredFields.filter(function (value) {
        return value !== "";
    }).length;

    var percentage = Math.round(
        completedFields / requiredFields.length * 100
    );

    document.querySelector(".completion-percentage").textContent =
        percentage + "%";

    var progressFill = document.querySelector(
        ".profile-completion-card .progress-fill"
    );

    progressFill.style.width = percentage + "%";

    var message = document.querySelector(".completion-message");

    if (percentage === 100) {
        message.textContent = "Your profile is complete. Great job!";
    } else {
        var missingFields = [];

        if (!profile.phone) {
            missingFields.push("phone number");
        }

        if (!profile.location) {
            missingFields.push("location");
        }

        if (!profile.institution) {
            missingFields.push("institution");
        }

        if (!profile.programme) {
            missingFields.push("programme");
        }

        if (missingFields.length > 0) {
            message.textContent =
                "Add your " + missingFields.join(", ") +
                " to complete your profile.";
        } else {
            message.textContent =
                "Complete the remaining fields to finish your profile.";
        }
    }
}

function fillProfileFields(profile) {
    var fields = getProfileFields();

    Object.keys(fields).forEach(function (key) {
        if (profile[key] !== undefined) {
            fields[key].value = profile[key];
        }
    });
}

function loadProfile() {
    var savedProfile = localStorage.getItem(profileStorageKey);

    if (savedProfile) {
        try {
            var parsedProfile = JSON.parse(savedProfile);

            if (parsedProfile && typeof parsedProfile === "object") {
                fillProfileFields(parsedProfile);
            }
        } catch (error) {
            console.error("Could not load profile:", error);
        }
    }

    var profile = getProfileValues();

    originalProfile = Object.assign({}, profile);

    updateProfileOverview(profile);
    updateProfileCompletion(profile);
}

function saveProfile() {
    var profile = getProfileValues();

    if (!profile.fullName) {
        alert("Please enter your full name.");
        document.getElementById("fullName").focus();
        return;
    }

    if (!profile.email) {
        alert("Please enter your email address.");
        document.getElementById("email").focus();
        return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(profile.email)) {
        alert("Please enter a valid email address.");
        document.getElementById("email").focus();
        return;
    }

    saveProfileValues(profile);

    originalProfile = Object.assign({}, profile);

    updateProfileOverview(profile);
    updateProfileCompletion(profile);

    alert("Your profile has been saved successfully!");
}

function cancelProfileChanges() {
    fillProfileFields(originalProfile);

    updateProfileOverview(originalProfile);
    updateProfileCompletion(originalProfile);
}

function enableProfileEditing() {
    var firstField = document.getElementById("fullName");

    firstField.focus();
    firstField.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function changePassword() {
    alert(
        "Password changing is not available yet. " +
        "It can be implemented when the backend is added."
    );
}

document.addEventListener("DOMContentLoaded", function () {
    loadProfile();

    document.querySelector(".save-profile-button")
        .addEventListener("click", saveProfile);

    document.querySelector(".cancel-profile-button")
        .addEventListener("click", cancelProfileChanges);

    document.querySelector(".edit-profile-button")
        .addEventListener("click", enableProfileEditing);

    document.querySelector(".change-password-button")
        .addEventListener("click", changePassword);
});