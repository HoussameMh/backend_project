const API_URL = "http://localhost:3000/api/v1";
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');
const token = localStorage.getItem('user_token');

if (!token) {
    alert('You must be logged in');
    window.location.href = 'login.html';
}

if (!projectId) {
    
    alert('Project not found');
    window.location.href = 'my-projects.html';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.className = "show"; 
    toast.classList.add(type);

    setTimeout(function(){ 
        toast.className = toast.className.replace("show", ""); 
        setTimeout(() => { toast.className = ""; }, 300);
    }, 3000);
}

const today = new Date().toISOString().split('T')[0];
document.getElementById('deadline').min = today;

async function fetchProject() {
    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`);
        const data = await response.json();
        
        if (response.ok) {
            populateForm(data.project);
            document.getElementById('formContainer').style.display = 'block';
        } else {
            throw new Error('Project not found');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading project');
        window.location.href = 'my-projects.html';
    }
}

function populateForm(project) {
    document.getElementById('title').value = project.title;
    document.getElementById('description').value = project.description;
    document.getElementById('category').value = project.category;
    document.getElementById('goalAmount').value = project.goalAmount;
    document.getElementById('currentAmount').value = project.currentAmount;

    const deadlineDate = new Date(project.deadline);
    const formattedDate = deadlineDate.toISOString().split('T')[0];
    document.getElementById('deadline').value = formattedDate;
}

document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const deadline = document.getElementById('deadline').value;

    
    const selectedDate = new Date(deadline);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (selectedDate < currentDate) {
        
        alert('The deadline must be in the future');
        return;
    }

    const projectData = {
        title,
        description,
        category,
        deadline
    };

    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
        });

        const data = await response.json();

        if (response.ok) {
          
            showToast('Project updated successfully!','success');
            setTimeout(()=>{
                window.location.href = `project-details.html?id=${projectId}`
            },2000)
            ;
        } else {
           
            showToast(data.message || 'Error updating project','error');
        }
    } catch (error) {
        console.error('Error:', error);
       
        alert('Error updating project');
    }
});

 document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_info');
            localStorage.clear();
            window.location.reload();
        });

fetchProject();