// =========================================================
// SMART STUDY PLANNER
// MAIN JAVASCRIPT FILE
// =========================================================


// =========================================================
// SHOW LOGGED-IN USER NAME
// =========================================================

function displayUserName() {

    // Get the saved user's name
    const userName = localStorage.getItem("currentUser");

    // Find the element where the name should appear
    const userNameElement = document.getElementById("userName");

    // If both exist, display the user's name
    if (userName && userNameElement) {

        userNameElement.textContent = userName;
    }
}


// Run the function when the page loads
displayUserName();

// =========================================================
// LOGOUT FUNCTION
// =========================================================

function logoutUser() {

    // Remove login information
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");

    // Go back to the login page
    window.location.href = "login.html";
}

// =========================================================
// CHECK LOGIN STATUS
// =========================================================

function checkLogin() {

    // Get the login status
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // If the user is not logged in
    if (isLoggedIn !== "true") {

        // Send the user to the login page
        window.location.href = "login.html";
    }
}
// Automatically protect application pages
checkLogin();