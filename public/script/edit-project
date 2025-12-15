 const API_URL = "http://localhost:3000/api/v1";
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const token = localStorage.getItem('user_token');

        if (!token) {
            alert('Vous devez être connecté');
            window.location.href = 'login.html';
        }

        if (!projectId) {
            alert('Projet introuvable');
            window.location.href = 'my-projects.html';
        }

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('deadline').min = today;

        // Fetch project details
        async function fetchProject() {
            try {
                const response = await fetch(`${API_URL}/projects/${projectId}`);
                const data = await response.json();
                
                if (response.ok) {
                    populateForm(data.project);
                    document.getElementById('loadingIndicator').style.display = 'none';
                    document.getElementById('formContainer').style.display = 'block';
                } else {
                    throw new Error('Projet introuvable');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors du chargement du projet');
                window.location.href = 'my-projects.html';
            }
        }

        // Populate form with project data
        function populateForm(project) {
            document.getElementById('title').value = project.title;
            document.getElementById('description').value = project.description;
            document.getElementById('category').value = project.category;
            document.getElementById('goalAmount').value = project.goalAmount;
            document.getElementById('currentAmount').value = project.currentAmount;
            
            // Format date for input
            const deadlineDate = new Date(project.deadline);
            const formattedDate = deadlineDate.toISOString().split('T')[0];
            document.getElementById('deadline').value = formattedDate;
        }

        // Handle form submission
        document.getElementById('projectForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const category = document.getElementById('category').value;
            const deadline = document.getElementById('deadline').value;

            // Validate deadline
            const selectedDate = new Date(deadline);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            if (selectedDate < currentDate) {
                alert('La date limite doit être postérieure à aujourd\'hui');
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
                    alert('Projet modifié avec succès !');
                    window.location.href = `project-details.html?id=${projectId}`;
                } else {
                    alert(data.message || 'Erreur lors de la modification du projet');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la modification du projet');
            }
        });

        // Initialize
        fetchProject();