const API_URL = "http://localhost:3000/api/v1";
        const token = localStorage.getItem('user_token');
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        let currentProjectId = null;

        if (!token) {
            window.location.href = 'login.html';
        }

        // Fetch my projects
        async function fetchMyProjects() {
            try {
                const response = await fetch(`${API_URL}/projects`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                
                const myProjects = data.projects.filter(p => 
                    p.createdBy._id === userInfo.userId || p.createdBy === userInfo.userId
                );

                if (myProjects.length === 0) {
                    document.getElementById('emptyState').style.display = 'block';
                } else {
                    displayProjects(myProjects);
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        }

        // Display projects
        function displayProjects(projects) {
            const grid = document.getElementById('projectsGrid');
            grid.innerHTML = projects.map(project => {
                const percentage = Math.min((project.currentAmount / project.goalAmount) * 100, 100);
                const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="project-card">
                        <div class="project-info">
                            <div class="project-header">
                                <div>
                                    <h3 class="project-title">${project.title}</h3>
                                    <span class="project-category">${project.category}</span>
                                </div>
                            </div>
                            
                            <p class="project-description">${project.description?.substring(0, 150)}...</p>
                            
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%"></div>
                            </div>
                            
                            <div class="project-stats">
                                <div class="stat">
                                    <div class="stat-value">${project.currentAmount} DH</div>
                                    <div class="stat-label">sur ${project.goalAmount} DH</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value">${project.backersCount || 0}</div>
                                    <div class="stat-label">contributeurs</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value">${daysLeft > 0 ? daysLeft : 0}</div>
                                    <div class="stat-label">jours restants</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="project-actions">
                            <a href="project-details.html?id=${project._id}" class="btn btn-primary btn-small">
                                <i class="ri-eye-line"></i> Voir
                            </a>
                            <button class="btn btn-success btn-small" onclick="openUpdateModal('${project._id}')">
                                <i class="ri-newspaper-line"></i> Actualité
                            </button>
                            <a href="edit-project.html?id=${project._id}" class="btn btn-secondary btn-small">
                                <i class="ri-edit-line"></i> Modifier
                            </a>
                            <button class="btn btn-danger btn-small" onclick="deleteProject('${project._id}')">
                                <i class="ri-delete-bin-line"></i> Supprimer
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Delete project
        window.deleteProject = async function(id) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

            try {
                const response = await fetch(`${API_URL}/projects/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    alert('Projet supprimé avec succès');
                    fetchMyProjects();
                } else {
                    alert('Erreur lors de la suppression');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression');
            }
        };

        // Open update modal
        window.openUpdateModal = function(projectId) {
            currentProjectId = projectId;
            document.getElementById('updateModal').classList.add('show');
        };

        // Close update modal
        window.closeUpdateModal = function() {
            document.getElementById('updateModal').classList.remove('show');
            document.getElementById('updateForm').reset();
            currentProjectId = null;
        };

        // Handle update submission
        document.getElementById('updateForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('updateTitle').value;
            const content = document.getElementById('updateContent').value;

            try {
                const response = await fetch(`${API_URL}/projects/${currentProjectId}/updates`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, content })
                });

                if (response.ok) {
                    alert('Actualité publiée avec succès !');
                    closeUpdateModal();
                } else {
                    alert('Erreur lors de la publication');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la publication');
            }
        });

        // Close modal when clicking outside
        document.getElementById('updateModal').addEventListener('click', (e) => {
            if (e.target.id === 'updateModal') {
                closeUpdateModal();
            }
        });

        // Initialize
        fetchMyProjects();