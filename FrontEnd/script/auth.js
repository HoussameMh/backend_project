const API_URL = "http://localhost:3000/api/v1/auth"; 

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

// --- LOGIQUE LOGIN ---
const loginForm = document.getElementById('login__form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('email').value; 
        const password = document.getElementById('password').value; 
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                showToast("Connexion réussie ! Redirection...", "success");
                localStorage.setItem('user_token', data.token); 
                localStorage.setItem('user_info', JSON.stringify(data.user)); 
                console.log(data.user)
                setTimeout(() => {
                    window.location.href = 'index.html'; 
                    
                }, 1500);
            } else {
                showToast(data.message || "Erreur d'identifiants", "error");
            }
        } catch (error) {
            console.error("Erreur serveur:", error);
            showToast("Impossible de contacter le serveur.", "error");
        }
    });
}

// --- LOGIQUE REGISTER ---
const registerForm = document.getElementById('register__form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log("Inscription en cours...", { name, email, password });

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
    
                showToast("Compte créé ! Connectez-vous.", "success");
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
               showToast(data.message || "Erreur lors de l'inscription", "error");
            }
        } catch (error) {
            console.error("Erreur serveur:", error);
            console.log(error)
            showToast("Impossible de contacter le serveur.", "error");
        }
    });
}