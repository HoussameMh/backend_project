const API_URL = "http://localhost:3000/api/v1";
        const token = localStorage.getItem('user_token');

        if (!token) {
            window.location.href = 'login.html';
        }

        // Fetch donations
        async function fetchDonations() {
            try {
                const response = await fetch(`${API_URL}/donations`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.donations && data.donations.length > 0) {
                    displayDonations(data.donations);
                    updateStats(data.donations);
                } else {
                    document.getElementById('emptyState').style.display = 'block';
                }
            } catch (error) {
                console.error('Erreur:', error);
                document.getElementById('loadingIndicator').innerHTML = 
                    '<p style="color: #e74c3c;">Erreur lors du chargement</p>';
            }
        }

        // Update stats
        function updateStats(donations) {
            const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
            const totalRewards = donations.filter(d => d.selectedRewardId).length;

            document.getElementById('totalAmount').textContent = totalAmount + ' DH';
            document.getElementById('totalDonations').textContent = donations.length;
            document.getElementById('totalRewards').textContent = totalRewards;
        }

        // Display donations
        function displayDonations(donations) {
            const list = document.getElementById('donationsList');
            
            list.innerHTML = donations.map(donation => {
                const date = new Date(donation.donatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const statusClass = donation.status === 'completed' ? 'status-completed' : 'status-pending';
                const statusText = donation.status === 'completed' ? 'Complété' : 'En attente';

                return `
                    <div class="donation-card">
                        <div class="donation-icon">
                            <i class="ri-heart-fill"></i>
                        </div>
                        
                        <div class="donation-info">
                            <h3 class="project-title">${donation.project?.title || 'Projet supprimé'}</h3>
                            ${donation.project?.category ? 
                                `<span class="project-category">${donation.project.category}</span>` : 
                                ''
                            }
                            <div class="donation-date">
                                <i class="ri-calendar-line"></i> ${date}
                            </div>
                            ${donation.selectedRewardId ? 
                                '<div style="margin-top: 0.5rem; color: #2ecc71;"><i class="ri-gift-line"></i> Reward included</div>' : 
                                ''
                            }
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            ${donation.project ? 
                                `<div style="margin-top: 1rem;">
                                    <a href="project-details.html?id=${donation.project._id}" class="view-project-btn">
                                        <i class="ri-eye-line"></i> View Project
                                    </a>
                                </div>` : 
                                ''
                            }
                        </div>
                        
                        <div class="donation-amount">
                            <div class="amount-value">${donation.amount} DH</div>
                            <div class="amount-label">Contribution</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
         document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_info');
            localStorage.clear();
            window.location.reload();
        });

        // Initialize
        fetchDonations();