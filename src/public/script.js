document.addEventListener("DOMContentLoaded", () => {
  // Register form handler
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch("/registrousuario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
          // Store the token and user info
          localStorage.setItem('jwtToken', result.token);
          localStorage.setItem('userEmail', result.user.email);
          
          alert(result.message);
          window.location.href = "/";
        } else {
          alert("Erro: " + result.message);
        }
      } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        alert('Erro ao cadastrar usuário.');
      }
    });
  }

  // Car registration form handler
  const carForm = document.getElementById("carForm");
  if (carForm) {
    carForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);
      
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          alert('Você precisa estar logado para anunciar um carro.');
          window.location.href = '/login';
          return;
        }

        const res = await fetch("/registrocarros", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const result = await res.json();

        if (res.ok) {
          alert(result.message);
          window.location.href = "/";
        } else {
          alert("Erro: " + result.message);
        }
      } catch (error) {
        console.error('Erro ao cadastrar carro:', error);
        alert('Erro ao cadastrar carro.');
      }
    });
  }
});