const API_URL = "http://localhost:3000/api/v1";
        let rewardCount = 0;

        // Check authentication
        const token = localStorage.getItem('user_token');
        if (!token) {
            alert('Vous devez être connecté pour créer un projet');
            window.location.href = 'login.html';
        }

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('deadline').min = today;

        // Add reward
        document.getElementById('addRewardBtn').addEventListener('click', () => {
            rewardCount++;
            const rewardsList = document.getElementById('rewardsList');
            
            const rewardHTML = `
                <div class="reward-item" data-reward-id="${rewardCount}">
                    <button type="button" class="delete-reward" onclick="deleteReward(${rewardCount})">
                        <i class="ri-close-line"></i>
                    </button>
                    
                    <div class="form-group">
                        <label class="form-label">Titre de la récompense</label>
                        <input type="text" class="form-input reward-title" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea reward-description" style="min-height: 80px;"></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Montant minimum (DH)</label>
                            <input type="number" class="form-input reward-minAmount" min="1" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Stock (optionnel)</label>
                            <input type="number" class="form-input reward-stock" min="1" placeholder="Illimité si vide">
                        </div>
                    </div>
                </div>
            `;

            rewardsList.insertAdjacentHTML('beforeend', rewardHTML);
        });

        // Delete reward
        window.deleteReward = function(id) {
            const reward = document.querySelector(`[data-reward-id="${id}"]`);
            if (reward) {
                reward.remove();
            }
        };

        // Handle form submission
        document.getElementById('projectForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const category = document.getElementById('category').value;
            const goalAmount = parseFloat(document.getElementById('goalAmount').value);
            const deadline = document.getElementById('deadline').value;

            // Collect rewards
            const rewards = [];
            document.querySelectorAll('.reward-item').forEach(item => {
                const rewardTitle = item.querySelector('.reward-title').value;
                const rewardDescription = item.querySelector('.reward-description').value;
                const minAmount = parseFloat(item.querySelector('.reward-minAmount').value);
                const stock = item.querySelector('.reward-stock').value;

                if (rewardTitle && minAmount) {
                    rewards.push({
                        title: rewardTitle,
                        description: rewardDescription,
                        minAmount: minAmount,
                        stock: stock ? parseInt(stock) : null
                    });
                }
            });

            const projectData = {
                title,
                description,
                category,
                goalAmount,
                deadline,
                rewards
            };

            try {
                const response = await fetch(`${API_URL}/projects`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(projectData)
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Projet créé avec succès !');
                    window.location.href = `project-details.html?id=${data.project._id}`;
                } else {
                    alert(data.message || 'Erreur lors de la création du projet');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la création du projet');
            }
        });