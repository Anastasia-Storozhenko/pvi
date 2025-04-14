document.addEventListener("DOMContentLoaded", () => {
    
    const loginModal = document.getElementById("loginModal");
    const loginBtn = document.getElementById("loginBtn");
    const loginForm = document.getElementById("loginForm");
    const authOverlay = document.getElementById("auth-overlay");
    const logoutLink = document.getElementById("logoutLink");
    const userBlock = document.querySelector(".user-block");
    const userName = document.querySelector(".name");
    const popupAva = document.querySelector(".popup-ava");

    // Перевірка наявності всіх елементів
    if (!loginModal || !loginBtn || !loginForm || !authOverlay || !logoutLink || !userBlock || !userName || !popupAva) {
        console.error("One or more required elements are missing in the DOM:", {
            loginModal, loginBtn, loginForm, authOverlay, logoutLink, userBlock, userName, popupAva
        });
        return;
    }

    // Перевіряємо, чи користувач уже залогінений
    fetch('check_login.php', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("Check login response:", data); // Логування для діагностики
        if (data.logged_in) {
            document.body.classList.add('authenticated');
            loginBtn.style.display = 'none';
            userBlock.style.display = 'flex';
            userName.textContent = data.first_name;
        } else {
            document.body.classList.remove('authenticated');
            loginBtn.style.display = 'block';
            userBlock.style.display = 'none';
        }
    })
    .catch(error => {
        console.error("Error checking login status:", error);
        // За замовчуванням блокуємо доступ, якщо сталася помилка
        document.body.classList.remove('authenticated');
        loginBtn.style.display = 'block';
        userBlock.style.display = 'none';
    });

    // Відкриваємо модальне вікно логіну
    loginBtn.addEventListener("click", () => {
        loginModal.style.display = "block";
        authOverlay.style.display = "block";
    });

    // Обробка логіну
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const birthDate = document.getElementById('birth_date').value.trim();

        console.log("First Name:", firstName);
        console.log("Birth Date:", birthDate);


        fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `firstName=${encodeURIComponent(firstName)}&birthDate=${encodeURIComponent(birthDate)}`
        })
        .then(response => response.json())
        .then(data => {
            console.log("Login response:", data); // Логування для діагностики
            if (data.success) {
                authOverlay.style.display = 'none';
                loginModal.style.display = 'none';
                loginBtn.style.display = 'none';
                userBlock.style.display = 'flex';
                userName.textContent = firstName;
                document.body.classList.add('authenticated');
               
               
                alert(data.message);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('Помилка сервера. Спробуйте ще раз.');
        });
    });

    // Показуємо/ховаємо випадаюче меню при натисканні на ім'я
    userName.addEventListener("click", () => {
        popupAva.style.display = popupAva.style.display === "none" ? "block" : "none";
    });

    // Обробка виходу
    logoutLink.addEventListener("click", () => {
        console.log("Logout clicked"); // Логування для діагностики
        fetch('logout.php', {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log("Logout response:", data); // Логування для діагностики
            if (data.success) {
                document.body.classList.remove('authenticated');
                loginBtn.style.display = 'block';
                userBlock.style.display = 'none';
                popupAva.style.display = 'none';
                alert("Ви вийшли з системи.");
            } else {
                alert("Помилка при виході.");
            }
        })
        .catch(error => {
            console.error("Error during logout:", error);
            alert("Помилка сервера при виході.");
        });


});

});