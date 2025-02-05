document
    .getElementById("post-job-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const title = formData.get("title");
        const description = formData.get("description");
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("/api/jobs/post-job", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description }),
            });

            if (response.ok) {
                document.getElementById("success-message").innerText =
                    "Job posted successfully!";
            }
        } catch (error) {
            console.error("Error posting job", error);
        }
    });