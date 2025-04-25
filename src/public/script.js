document.addEventListener("DOMContentLoaded", () => {
  

  // ----- Login -----
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const senha = loginForm.senha.value;

      try {
        const res = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          window.location.href = "/";
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert("Erro ao fazer login. Tente novamente.");
      }
    });
  } else {
    console.warn("Login form não encontrado.");
  }

  // ----- Cadastro -----
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function register(event) {
      event.preventDefault();


      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());

      if (data.senha !== data.confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
      }

      delete data.confirmarSenha;

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
          alert(result.message);
          event.target.reset();
        } else {
          alert("Erro: " + result.message);
        }
      } catch (error) {
       
        alert('Erro ao cadastrar usuário.');
      }
    });
  } else {
    console.warn("Formulário de cadastro não encontrado.");
  }
});
