document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
      window.location.href = 'login.html';
  } else {
      displayUserDashboard();
  }

  document.getElementById('logout-button').addEventListener('click', logout);
});

async function displayUserDashboard() {
  const response = await fetch('/api/auth/me', {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
  });

  if (response.ok) {
      const user = await response.json();
      
      document.getElementById('user-role').innerText = `Logged in as: ${user.role}`;
      
      if (user.role === 'employee') {
          document.getElementById('content').innerHTML = `
              <h2>Job Recommendations</h2>
              <form id="recommendation-form">
                  <input type="text" name="keywords" placeholder="Enter skills or job title" required>
                  <button type="submit">Get Recommendations</button>
              </form>
              <div id="recommended-jobs"></div>
          `;
          document.getElementById('recommendation-form').addEventListener('submit', getJobRecommendations);
      } else if (user.role === 'employer') {
          document.getElementById('content').innerHTML = `
              <h2>Post a Job</h2>
              <form id="post-job-form">
                  <input type="text" name="title" placeholder="Job Title" required>
                  <textarea name="description" placeholder="Job Description" required></textarea>
                  <button type="submit">Post Job</button>
              </form>
              <div id="job-status"></div>
          `;
          document.getElementById('post-job-form').addEventListener('submit', postJob);
      }
  } else {
      console.error('Error fetching user details');
      window.location.href = 'login.html';
  }
}

async function getJobRecommendations(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const keywords = formData.get("keywords");

  const response = await fetch("http://localhost:3000/api/recommend-jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ keywords }),
  });

  const recommendedJobs = await response.json();
  const jobContainer = document.getElementById("recommended-jobs");

  jobContainer.innerHTML = ""; //clears previous results btw

  //table
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  //header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headerCell1 = document.createElement("th");
  headerCell1.textContent = "Job Title";
  headerCell1.style.border = "1px solid #ddd";
  headerCell1.style.padding = "8px";

  const headerCell2 = document.createElement("th");
  headerCell2.textContent = "Posted By";
  headerCell2.style.border = "1px solid #ddd";
  headerCell2.style.padding = "8px";

  headerRow.appendChild(headerCell1);
  headerRow.appendChild(headerCell2);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  //body
  const tbody = document.createElement("tbody");
  recommendedJobs.forEach((job) => {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    const titleLink = document.createElement("a");
    titleLink.href = job.descriptionLink;
    titleLink.textContent = job.title;
    
    titleCell.appendChild(titleLink);
    titleCell.style.border = "1px solid #ddd";
    titleCell.style.padding = "8px";
    row.appendChild(titleCell);

    //employer column
    const employerCell = document.createElement("td");
    employerCell.textContent = job.employer; // employer's username
    employerCell.style.border = "1px solid #ddd";
    employerCell.style.padding = "8px";
    row.appendChild(employerCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  jobContainer.appendChild(table);
}



async function postJob(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const title = formData.get('title');
  const description = formData.get('description');

  const response = await fetch('/api/jobs/post-job', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, description })
  });

  const jobStatus = document.getElementById('job-status');
  if (response.ok) {
      jobStatus.innerText = 'Job posted successfully!';
  } else {
      jobStatus.innerText = 'Failed to post job.';
  }
}

async function getJobDetails(jobId) {
  const response = await fetch(`/api/job/${jobId}`);
  if (response.ok) {
    const jobData = await response.json();
    displayJobDetails(jobData);
  } else {
    console.error("Failed to fetch job details");
  }
}

function displayJobDetails(jobData) {
  const jobDetailsContainer = document.getElementById("job-details");
  jobDetailsContainer.innerHTML = `
        <h2>${jobData.title}</h2>
        <p><strong>Employer:</strong> ${jobData.employer}</p>
        <p><strong>Description:</strong> ${jobData.description}</p>
        <p><strong>Location:</strong> ${jobData.location}</p>
    `;
}



// function displayJobDescription(description) {
//   const descriptionContainer = document.getElementById("job-description");
//   if (!descriptionContainer) {
//     const newContainer = document.createElement("div");
//     newContainer.id = "job-description";
//     newContainer.style.marginTop = "20px";
//     newContainer.style.padding = "10px";
//     newContainer.style.border = "1px solid #ddd";
//     newContainer.style.backgroundColor = "#f9f9f9";
//     newContainer.innerText = description;
//     document.getElementById("recommended-jobs").appendChild(newContainer);
//   } else {
//     descriptionContainer.innerText = description;
//   }
// }

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}