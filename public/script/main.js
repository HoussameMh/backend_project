const API_URL = "http://localhost:3000/api/v1";
        let allProjects = [];

        
        function checkAuth() {
            const token = localStorage.getItem('user_token');
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            
            if (token) {
                document.getElementById('authButtons').style.display = 'none';
                document.getElementById('userMenu').style.display = 'block';
                document.getElementById('myProjectsLink').style.display = 'block';
                document.getElementById('myDonationsLink').style.display = 'block';
                
                const userName = userInfo.name || 'U';
                document.getElementById('userAvatar').textContent = userName.charAt(0).toUpperCase();
            }
        }

       
        document.getElementById('userAvatar')?.addEventListener('click', () => {
            document.getElementById('dropdown').classList.toggle('show');
        });

        
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_info');
            window.location.reload();
        });

       
        async function fetchProjects() {
            try {
                const searchTerm = document.getElementById('searchInput').value;
                const category = document.getElementById('categoryFilter').value;
                const sort = document.getElementById('sortFilter').value;

                let url = `${API_URL}/projects?`;
                if (searchTerm) url += `title=${searchTerm}&`;
                if (category) url += `category=${category}&`;
                if (sort) url += `sort=${sort}&`;

                const response = await fetch(url);
                const data = await response.json();
                
                allProjects = data.projects;
                displayProjects(allProjects);
            } catch (error) {
                console.error('Erreur:', error);
                document.getElementById('loadingIndicator').innerHTML = 
                    '<p style="color: #e74c3c;">Erreur de chargement des projets</p>';
            }
        }

        
        function displayProjects(projects) {
            const grid = document.getElementById('projectsGrid');
            const loading = document.getElementById('loadingIndicator');
            
            loading.style.display = 'none';

            if (projects.length === 0) {
                grid.innerHTML = '<p style="text-align:center; color:#666; grid-column: 1/-1;">Aucun projet trouvé</p>';
                return;
            }

            grid.innerHTML = projects.map(project => {
                const percentage = Math.min((project.currentAmount / project.goalAmount) * 100, 100);
                const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="project-card" onclick="window.location.href='project-details.html?id=${project._id}'">
                        <div class="project-image">
                            <i class="ri-lightbulb-line"></i>
                        </div>
                        <div class="project-content">
                            <span class="project-category">${project.category}</span>
                            <h3 class="project-title">${project.title}</h3>
                            <p class="project-description">${project.description?.substring(0, 100)}...</p>
                            
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%"></div>
                            </div>
                            
                            <div class="project-stats">
                                <div class="stat">
                                    <span class="stat-value">${project.currentAmount} DH</span>
                                    <span class="stat-label">sur ${project.goalAmount} DH</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${project.backersCount || 0}</span>
                                    <span class="stat-label">contributeurs</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${daysLeft > 0 ? daysLeft : 0}</span>
                                    <span class="stat-label">jours restants</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        
        document.getElementById('searchInput').addEventListener('input', fetchProjects);
        document.getElementById('categoryFilter').addEventListener('change', fetchProjects);
        document.getElementById('sortFilter').addEventListener('change', fetchProjects);

        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('dropdown')?.classList.remove('show');
            }
        });

        
        checkAuth();
        fetchProjects();