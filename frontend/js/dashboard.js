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
  const keywords = formData.get('keywords');

  const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ keywords })
  });

  const recommendedJobs = await response.json();
  const jobContainer = document.getElementById('recommended-jobs');
  jobContainer.innerHTML = '';
  recommendedJobs.forEach(job => {
      const jobElement = document.createElement('div');
      jobElement.innerText = `Title: ${job.title}, Description: ${job.description}`;
      jobContainer.appendChild(jobElement);
  });
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

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}