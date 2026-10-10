
// =========================================
// SMART STUDY PLANNER
// SUBJECTS FUNCTIONALITY
// =========================================


// =========================================
// GET SAVED SUBJECTS
// =========================================

function getSubjects() {

    const savedSubjects = localStorage.getItem("smartStudySubjects");

    let subjects = savedSubjects ? JSON.parse(savedSubjects) : [];

    // Restore the original sample subjects only once
    if (localStorage.getItem("sampleSubjectsMigrated") !== "true") {

        const sampleSubjects = [
            {
                id: 1604,
                name: "Database Systems",
                code: "CM1604",
                description: "Learn database design, SQL, normalization and database management."
            },
            {
                id: 1603,
                name: "Java Programming",
                code: "CM1603",
                description: "Learn object-oriented programming, Java development and problem solving."
            },
            {
                id: 1606,
                name: "Mathematics",
                code: "CM1606",
                description: "Study differentiation, integration, statistics and mathematical concepts."
            },
            {
                id: 1605,
                name: "Web Technology",
                code: "CM1605",
                description: "Learn HTML, CSS, JavaScript and modern web development."
            },
            {
                id: 1602,
                name: "Programming",
                code: "CM1602",
                description: "Develop programming skills using Python and Java."
            },
            {
                id: 1601,
                name: "Data Structures",
                code: "CM1601",
                description: "Learn algorithms, data structures, searching, sorting and complexity."
            }
        ];

        sampleSubjects.forEach(function(sample) {

            const alreadyExists = subjects.some(function(subject) {
                return subject.code.toLowerCase() === sample.code.toLowerCase();
            });

            if (!alreadyExists) {
                subjects.push(sample);
            }
        });

        localStorage.setItem(
            "smartStudySubjects",
            JSON.stringify(subjects)
        );

        localStorage.setItem("sampleSubjectsMigrated", "true");
    }

    return subjects;
}


// =========================================
// SAVE SUBJECTS
// =========================================

function saveSubjects(subjects) {

    localStorage.setItem(
        "smartStudySubjects",
        JSON.stringify(subjects)
    );
}


// =========================================
// DISPLAY SUBJECTS
// =========================================

function displaySubjects() {

    const subjects = getSubjects();

    const subjectsGrid = document.getElementById("subjectsGrid");

    const subjectCount = document.getElementById("subjectCount");

    // Stop if the required HTML elements do not exist
    if (!subjectsGrid || !subjectCount) {
        return;
    }

    // Update the total subject count
    subjectCount.textContent =
        `You currently have ${subjects.length} subjects.`;

    // Clear existing cards
    subjectsGrid.innerHTML = "";

    // Show a message if there are no subjects
    if (subjects.length === 0) {

        subjectsGrid.textContent =
            "No subjects yet. Click Add Subject to get started!";

        return;
    }

    // Create a card for every subject
    subjects.forEach(function(subject) {

        const card = document.createElement("div");
        card.className = "subject-card";

        const cardTop = document.createElement("div");
        cardTop.className = "subject-card-top";

        const icon = document.createElement("div");
        icon.className = "subject-icon";
        icon.textContent = "📚";

        const code = document.createElement("span");
        code.className = "subject-code";
        code.textContent = subject.code;

        cardTop.appendChild(icon);
        cardTop.appendChild(code);

        const heading = document.createElement("h2");
        heading.textContent = subject.name;

        const description = document.createElement("p");
        description.className = "subject-description";
        description.textContent =
            subject.description || "No description added.";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "view-subject-button";
        deleteButton.textContent = "Delete Subject";

        deleteButton.addEventListener("click", function() {
            deleteSubject(subject.id);
        });

        card.appendChild(cardTop);
        card.appendChild(heading);
        card.appendChild(description);
        card.appendChild(deleteButton);

        subjectsGrid.appendChild(card);
    });
}


// =========================================
// ADD A SUBJECT
// =========================================

function addSubject() {

    const name = prompt("Enter the subject name:");

    if (name === null) {
        return;
    }

    if (name.trim() === "") {
        alert("Please enter a subject name.");
        return;
    }

    const code = prompt("Enter the subject code:");

    if (code === null) {
        return;
    }

    if (code.trim() === "") {
        alert("Please enter a subject code.");
        return;
    }

    const subjects = getSubjects();

    // Prevent duplicate subject codes
    const duplicate = subjects.some(function(subject) {

        return subject.code.toLowerCase() === code.trim().toLowerCase();

    });

    if (duplicate) {

        alert("A subject with this code already exists.");

        return;
    }

    // Create the new subject
    const newSubject = {
        id: Date.now(),
        name: name.trim(),
        code: code.trim(),
        description: ""
    };

    // Add the subject to the list
    subjects.push(newSubject);

    // Save and refresh the page content
    saveSubjects(subjects);

    displaySubjects();

    alert("Subject added successfully!");
}


// =========================================
// DELETE A SUBJECT
// =========================================

function deleteSubject(subjectId) {

    const confirmed = confirm(
        "Are you sure you want to delete this subject?"
    );

    if (!confirmed) {
        return;
    }

    const subjects = getSubjects().filter(function(subject) {

        return subject.id !== subjectId;

    });

    saveSubjects(subjects);

    displaySubjects();
}


// =========================================
// INITIALISE SUBJECTS PAGE
// =========================================

const addSubjectButton = document.getElementById("addSubjectButton");

if (addSubjectButton) {

    addSubjectButton.addEventListener("click", addSubject);

}

displaySubjects();