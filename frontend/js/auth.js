document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const username = formData.get('username');
            const password = formData.get('password');

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard.html';
            } else {
                alert(data.message);
            }
        });
    } else {
        console.error("Login form not found.");
    }
});


document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");
    const role = formData.get("role");

    try {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, role }),
        });

        if (response.ok) {
            window.location.href = 'index.html';
        } else {
            const errorMessage = await response.json();
            document.getElementById("error-message").innerText = errorMessage.message;
            document.getElementById("error-message").style.display = "block";
        }
    } catch (error) {
        console.error("Error during signup", error);
    }
});