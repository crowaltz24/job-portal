// Get modal elements
const loginModal = document.getElementById("loginModal");
const signUpModal = document.getElementById("signUpModal");
const dashboardModal = document.getElementById("dashboardModal");

// Get buttons that open modals
const loginBtn = document.getElementById("loginBtn");
const signUpBtn = document.getElementById("signUpBtn");
const dashboardBtn = document.getElementById("dashboardBtn");

// Get spans to close modals
const closeLogin = document.getElementById("closeLogin");
const closeSignUp = document.getElementById("closeSignUp");
const closeDashboard = document.getElementById("closeDashboard");

// Open modals
loginBtn.onclick = () => loginModal.style.display = "block";
signUpBtn.onclick = () => signUpModal.style.display = "block";
dashboardBtn.onclick = () => dashboardModal.style.display = "block";

// Close modals
closeLogin.onclick = () => loginModal.style.display = "none";
closeSignUp.onclick = () => signUpModal.style.display = "none";
closeDashboard.onclick = () => dashboardModal.style.display = "none";

// Close modals if clicked outside modal
window.onclick = function(event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target == signUpModal) {
        signUpModal.style.display = "none";
    }
    if (event.target == dashboardModal) {
        dashboardModal.style.display = "none";
    }
};
