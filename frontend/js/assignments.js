
/* =========================================
   SMART STUDY PLANNER
   ASSIGNMENTS MANAGEMENT
   ========================================= */

const ASSIGNMENTS_KEY = "smartStudyAssignments";
const ASSIGNMENT_SAMPLES_KEY = "assignmentSamplesMigrated";


// =========================================
// SUBJECTS
// =========================================

function getAvailableSubjects() {
    const saved = localStorage.getItem("smartStudySubjects");

    if (saved) {
        return JSON.parse(saved);
    }

    // Fallback if sample subjects have not been loaded yet
    return [
        { id: 1604, name: "Database Systems", code: "CM1604" },
        { id: 1603, name: "Java Programming", code: "CM1603" },
        { id: 1606, name: "Mathematics", code: "CM1606" },
        { id: 1605, name: "Web Technology", code: "CM1605" },
        { id: 1602, name: "Programming", code: "CM1602" },
        { id: 1601, name: "Data Structures", code: "CM1601" }
    ];
}


function getSubjectName(subjectCode) {
    const subject = getAvailableSubjects().find(function(item) {
        return item.code === subjectCode;
    });

    return subject ? subject.name : subjectCode;
}


function populateSubjectOptions() {
    const subjectSelect = document.getElementById("assignmentSubject");
    const subjectFilter = document.getElementById("subjectFilter");

    const subjects = getAvailableSubjects();

    subjectSelect.innerHTML = '<option value="">Choose a subject</option>';
    subjectFilter.innerHTML = '<option value="all">All Subjects</option>';

    subjects.forEach(function(subject) {
        const formOption = document.createElement("option");
        formOption.value = subject.code;
        formOption.textContent = subject.name + " (" + subject.code + ")";
        subjectSelect.appendChild(formOption);

        const filterOption = document.createElement("option");
        filterOption.value = subject.code;
        filterOption.textContent = subject.name;
        subjectFilter.appendChild(filterOption);
    });
}


// =========================================
// LOAD AND SAVE ASSIGNMENTS
// =========================================

function getAssignments() {
    const saved = localStorage.getItem(ASSIGNMENTS_KEY);
    let assignments = saved ? JSON.parse(saved) : [];

    // Add example assignments only once for a new assignment list
    if (localStorage.getItem(ASSIGNMENT_SAMPLES_KEY) !== "true") {
        const sampleAssignments = [
            {
                id: "sample-db",
                title: "Database Coursework",
                subjectCode: "CM1604",
                dueDate: getDateAfterDays(3),
                priority: "High",
                estimatedHours: 4,
                description: "Complete the database coursework.",
                status: "Pending"
            },
            {
                id: "sample-java",
                title: "Java Project",
                subjectCode: "CM1603",
                dueDate: getDateAfterDays(5),
                priority: "Medium",
                estimatedHours: 3,
                description: "Continue the Java programming project.",
                status: "In Progress"
            },
            {
                id: "sample-web",
                title: "Web Technology Report",
                subjectCode: "CM1605",
                dueDate: getDateAfterDays(8),
                priority: "Low",
                estimatedHours: 2,
                description: "Prepare the Web Technology report.",
                status: "Pending"
            },
            {
                id: "sample-maths",
                title: "Mathematics Exercises",
                subjectCode: "CM1606",
                dueDate: getDateAfterDays(10),
                priority: "Medium",
                estimatedHours: 2,
                description: "Practise the current mathematics topics.",
                status: "Completed"
            }
        ];

        sampleAssignments.forEach(function(sample) {
            const exists = assignments.some(function(item) {
                return item.id === sample.id;
            });

            if (!exists) {
                assignments.push(sample);
            }
        });

        localStorage.setItem(ASSIGNMENT_SAMPLES_KEY, "true");
        saveAssignments(assignments);
    }

    return assignments;
}


function saveAssignments(assignments) {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}


function getDateAfterDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// =========================================
// SUMMARY COUNTS
// =========================================

function updateAssignmentSummary(assignments) {
    document.getElementById("totalAssignments").textContent =
        assignments.length;

    document.getElementById("pendingAssignments").textContent =
        assignments.filter(function(item) {
            return item.status === "Pending";
        }).length;

    document.getElementById("inProgressAssignments").textContent =
        assignments.filter(function(item) {
            return item.status === "In Progress";
        }).length;

    document.getElementById("completedAssignments").textContent =
        assignments.filter(function(item) {
            return item.status === "Completed";
        }).length;
}


// =========================================
// DISPLAY ASSIGNMENTS
// =========================================

function displayAssignments() {
    const assignments = getAssignments();
    const list = document.getElementById("assignmentsList");

    updateAssignmentSummary(assignments);

    const searchText = document.getElementById("searchAssignments")
        .value.trim().toLowerCase();

    const subjectFilter = document.getElementById("subjectFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;
    const priorityFilter = document.getElementById("priorityFilter").value;

    const filtered = assignments.filter(function(item) {
        const matchesSearch =
            item.title.toLowerCase().includes(searchText) ||
            getSubjectName(item.subjectCode).toLowerCase().includes(searchText);

        const matchesSubject =
            subjectFilter === "all" || item.subjectCode === subjectFilter;

        const matchesStatus =
            statusFilter === "all" || item.status === statusFilter;

        const matchesPriority =
            priorityFilter === "all" || item.priority === priorityFilter;

        return matchesSearch && matchesSubject &&
            matchesStatus && matchesPriority;
    });

    list.innerHTML = "";

    if (filtered.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent =
            "No assignments match your filters. Try changing your search.";
        list.appendChild(emptyMessage);
        return;
    }

    filtered.sort(function(a, b) {
        return a.dueDate.localeCompare(b.dueDate);
    });

    filtered.forEach(function(item) {
        const card = document.createElement("article");
        card.className = "assignment-card";

        const header = document.createElement("div");
        header.className = "assignment-card-header";

        const title = document.createElement("h2");
        title.textContent = item.title;

        const priority = document.createElement("span");
        priority.className = "assignment-priority priority-" +
            item.priority.toLowerCase().replace(" ", "-");
        priority.textContent = item.priority + " Priority";

        header.appendChild(title);
        header.appendChild(priority);

        const subject = document.createElement("p");
        subject.textContent = "📚 " + getSubjectName(item.subjectCode);

        const dueDate = document.createElement("p");
        dueDate.textContent = "📅 Due: " + formatDate(item.dueDate);

        const hours = document.createElement("p");
        hours.textContent = "⏱ Estimated study time: " +
            item.estimatedHours + " hours";

        const description = document.createElement("p");
        description.textContent = item.description || "No description added.";

        const statusRow = document.createElement("div");
        statusRow.className = "assignment-card-actions";

        const statusLabel = document.createElement("label");
        statusLabel.textContent = "Status: ";

        const statusSelect = document.createElement("select");
        statusSelect.setAttribute("aria-label", "Assignment status");

        ["Pending", "In Progress", "Completed"].forEach(function(status) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            option.selected = item.status === status;
            statusSelect.appendChild(option);
        });

        statusSelect.addEventListener("change", function() {
            updateAssignmentStatus(item.id, statusSelect.value);
        });

        statusLabel.appendChild(statusSelect);
        statusRow.appendChild(statusLabel);

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "view-subject-button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function() {
            editAssignment(item.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "view-subject-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            deleteAssignment(item.id);
        });

        statusRow.appendChild(editButton);
        statusRow.appendChild(deleteButton);

        card.appendChild(header);
        card.appendChild(subject);
        card.appendChild(dueDate);
        card.appendChild(hours);
        card.appendChild(description);
        card.appendChild(statusRow);

        list.appendChild(card);
    });
}


function formatDate(dateString) {
    if (!dateString) {
        return "Not set";
    }

    const parts = dateString.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
}


// =========================================
// SHOW AND HIDE FORM
// =========================================

function openAssignmentForm() {
    document.getElementById("assignmentForm").reset();
    document.getElementById("assignmentId").value = "";
    document.getElementById("assignmentFormHeading").textContent =
        "Add New Assignment";
    document.getElementById("saveAssignmentButton").textContent =
        "Save Assignment";

    document.getElementById("assignmentHours").value = "2";
    document.getElementById("assignmentPriority").value = "Medium";
    document.getElementById("assignmentFormCard").hidden = false;

    document.getElementById("assignmentTitle").focus();
    document.getElementById("assignmentFormCard").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function closeAssignmentForm() {
    document.getElementById("assignmentFormCard").hidden = true;
    document.getElementById("assignmentForm").reset();
    document.getElementById("assignmentId").value = "";
}


// =========================================
// ADD OR EDIT ASSIGNMENT
// =========================================

function handleAssignmentSubmit(event) {
    event.preventDefault();

    const id = document.getElementById("assignmentId").value;
    const title = document.getElementById("assignmentTitle").value.trim();
    const subjectCode = document.getElementById("assignmentSubject").value;
    const dueDate = document.getElementById("assignmentDueDate").value;
    const priority = document.getElementById("assignmentPriority").value;
    const estimatedHours = Number(
        document.getElementById("assignmentHours").value
    );
    const description = document.getElementById(
        "assignmentDescription"
    ).value.trim();

    if (!title || !subjectCode || !dueDate) {
        alert("Please complete the title, subject, and due date.");
        return;
    }

    if (!Number.isFinite(estimatedHours) ||
        estimatedHours < 0.5 || estimatedHours > 500) {
        alert("Estimated hours must be between 0.5 and 500.");
        return;
    }

    const assignments = getAssignments();

    if (id) {
        const index = assignments.findIndex(function(item) {
            return String(item.id) === id;
        });

        if (index === -1) {
            alert("Assignment could not be found.");
            return;
        }

        assignments[index] = {
            ...assignments[index],
            title: title,
            subjectCode: subjectCode,
            dueDate: dueDate,
            priority: priority,
            estimatedHours: estimatedHours,
            description: description
        };

    } else {
        assignments.push({
            id: String(Date.now()),
            title: title,
            subjectCode: subjectCode,
            dueDate: dueDate,
            priority: priority,
            estimatedHours: estimatedHours,
            description: description,
            status: "Pending"
        });
    }

    saveAssignments(assignments);
    closeAssignmentForm();
    displayAssignments();

    alert(id ? "Assignment updated successfully!" :
        "Assignment added successfully!");
}


// =========================================
// EDIT ASSIGNMENT
// =========================================

function editAssignment(id) {
    const assignment = getAssignments().find(function(item) {
        return String(item.id) === String(id);
    });

    if (!assignment) {
        alert("Assignment could not be found.");
        return;
    }

    document.getElementById("assignmentId").value = assignment.id;
    document.getElementById("assignmentTitle").value = assignment.title;
    document.getElementById("assignmentSubject").value =
        assignment.subjectCode;
    document.getElementById("assignmentDueDate").value = assignment.dueDate;
    document.getElementById("assignmentPriority").value = assignment.priority;
    document.getElementById("assignmentHours").value =
        assignment.estimatedHours;
    document.getElementById("assignmentDescription").value =
        assignment.description || "";

    document.getElementById("assignmentFormHeading").textContent =
        "Edit Assignment";
    document.getElementById("saveAssignmentButton").textContent =
        "Update Assignment";
    document.getElementById("assignmentFormCard").hidden = false;

    document.getElementById("assignmentFormCard").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// =========================================
// UPDATE STATUS
// =========================================

function updateAssignmentStatus(id, newStatus) {
    const assignments = getAssignments();

    const assignment = assignments.find(function(item) {
        return String(item.id) === String(id);
    });

    if (!assignment) {
        return;
    }

    assignment.status = newStatus;

    saveAssignments(assignments);
    displayAssignments();
}


// =========================================
// DELETE ASSIGNMENT
// =========================================

function deleteAssignment(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) {
        return;
    }

    const remaining = getAssignments().filter(function(item) {
        return String(item.id) !== String(id);
    });

    saveAssignments(remaining);
    displayAssignments();
}


// =========================================
// INITIALISE PAGE
// =========================================

document.getElementById("addAssignmentButton").addEventListener(
    "click",
    openAssignmentForm
);

document.getElementById("cancelAssignmentButton").addEventListener(
    "click",
    closeAssignmentForm
);

document.getElementById("assignmentForm").addEventListener(
    "submit",
    handleAssignmentSubmit
);

document.getElementById("searchAssignments").addEventListener(
    "input",
    displayAssignments
);

document.getElementById("subjectFilter").addEventListener(
    "change",
    displayAssignments
);

document.getElementById("statusFilter").addEventListener(
    "change",
    displayAssignments
);

document.getElementById("priorityFilter").addEventListener(
    "change",
    displayAssignments
);

document.getElementById("logoutButton").addEventListener(
    "click",
    function(event) {
        event.preventDefault();

        if (typeof logoutUser === "function") {
            logoutUser();
        } else {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        }
    }
);

populateSubjectOptions();
displayAssignments();