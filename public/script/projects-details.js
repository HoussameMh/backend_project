const API_URL = "http://localhost:3000/api/v1";
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        let selectedReward = null;
        let projectData = null;

        // Fetch project details
        async function fetchProjectDetails() {
            try {
                const response = await fetch(`${API_URL}/projects/${projectId}`);
                const data = await response.json();
                projectData = data.project;
                displayProject(projectData);
                fetchBackers();
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors du chargement du projet');
            }
        }

        // Display project
        function displayProject(project) {
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('projectContent').style.display = 'block';

            document.getElementById('projectCategory').textContent = project.category;
            document.getElementById('projectTitle').textContent = project.title;
            document.getElementById('projectCreator').textContent = project.createdBy?.name || 'Anonyme';
            document.getElementById('projectDescription').textContent = project.description;

            document.getElementById('currentAmount').textContent = project.currentAmount;
            document.getElementById('goalAmount').textContent = project.goalAmount;
            document.getElementById('backersCount').textContent = project.backersCount || 0;

            const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            document.getElementById('daysLeft').textContent = daysLeft > 0 ? daysLeft : 0;

            const percentage = Math.min((project.currentAmount / project.goalAmount) * 100, 100);
            document.getElementById('progressFill').style.width = percentage + '%';

            // Display rewards
            const rewardsList = document.getElementById('rewardsList');
            if (project.rewards && project.rewards.length > 0) {
                rewardsList.innerHTML = project.rewards.map(reward => `
                    <div class="reward-card" data-reward-id="${reward._id}">
                        <div class="reward-title">${reward.title}</div>
                        <div class="reward-amount">Min. ${reward.minAmount} DH</div>
                        <p>${reward.description || ''}</p>
                        ${reward.stock !== null ? `<div class="reward-stock">Stock: ${reward.stock} / ${reward.claimers} réclamés</div>` : ''}
                    </div>
                `).join('');

                // Add click events to rewards
                document.querySelectorAll('.reward-card').forEach(card => {
                    card.addEventListener('click', () => {
                        document.querySelectorAll('.reward-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        const rewardId = card.dataset.rewardId;
                        selectedReward = project.rewards.find(r => r._id === rewardId);
                        document.getElementById('donationAmount').value = selectedReward.minAmount;
                    });
                });
            } else {
                rewardsList.innerHTML = '<p style="color: #666;">Aucune récompense disponible</p>';
            }

            // Display updates
            const updatesList = document.getElementById('updatesList');
            if (project.updates && project.updates.length > 0) {
                updatesList.innerHTML = project.updates.map(update => `
                    <div class="update-item">
                        <div class="update-date">${new Date(update.date).toLocaleDateString('fr-FR')}</div>
                        <div class="update-title">${update.title}</div>
                        <p>${update.content}</p>
                    </div>
                `).join('');
            } else {
                updatesList.innerHTML = '<p style="color: #666;">Aucune actualité pour le moment</p>';
            }
        }

        // Fetch backers
        async function fetchBackers() {
            try {
                const response = await fetch(`${API_URL}/projects/${projectId}/backers`);
                const data = await response.json();
                
                const backersList = document.getElementById('backersList');
                if (data.backers && data.backers.length > 0) {
                    backersList.innerHTML = data.backers.map(backer => `
                        <div class="backer-item">
                            <div class="backer-avatar">${backer.name.charAt(0).toUpperCase()}</div>
                            <div>${backer.name}</div>
                        </div>
                    `).join('');
                } else {
                    backersList.innerHTML = '<p style="color: #666;">Aucun contributeur pour le moment</p>';
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        }

        // Handle donation
        document.getElementById('donationForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const token = localStorage.getItem('user_token');
            if (!token) {
                alert('Vous devez être connecté pour faire un don');
                window.location.href = 'login.html';
                return;
            }

            const amount = parseFloat(document.getElementById('donationAmount').value);

            try {
                const response = await fetch(`${API_URL}/donations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount,
                        project: projectId,
                        selectedRewardId: selectedReward?._id
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Don effectué avec succès !');
                    window.location.reload();
                } else {
                    alert(data.msg || 'Erreur lors du don');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors du don');
            }
        });

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });

        // Initialize
        if (projectId) {
            fetchProjectDetails();
        } else {
            alert('Projet introuvable');
            window.location.href = 'index.html';
        }