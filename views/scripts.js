document.addEventListener("DOMContentLoaded", function () { // код всередині виконався після повного завантаження HTML
    const modal = document.getElementById("students-modal");
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const studentTable = document.querySelector("#student-table tbody");
    const createBtn = document.getElementById("create-btn");
    const cancBtn = document.getElementById("canc-btn");
    const headerCheckbox = document.querySelector("#student-table thead input[type='checkbox']"); //чекбокс у заголовку таблиці 
    const overlay = document.querySelector('.modal-overlay');

    const groupSelect = document.getElementById('group');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const genderSelect = document.getElementById('gender');
    const birthdayInput = document.getElementById('birthday');

    if (!groupSelect) console.error('group не знайдено');
    if (!firstNameInput) console.error('first-name не знайдено');
    if (!lastNameInput) console.error('last-name не знайдено');
    if (!genderSelect) console.error('gender не знайдено');
    if (!birthdayInput) console.error('birthday не знайдено');
    if (!createBtn) console.error('create-btn не знайдено');
    if (!studentTable) console.error('Таблиця не знайдена');
  /*
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => console.log("Service Worker registered"))
          .catch((err) => console.error("Service Worker registration failed", err));
      }
    */
   // Перевірка автентифікації
   // Функція для завантаження студентів
   let currentPage = 1;
   const studentsPerPage = 5;

   function loadStudents(page = 1) {
    currentPage = page;

    
    fetch(`get_students.php?page=${page}&limit=${studentsPerPage}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            studentTable.innerHTML = '';
            data.students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="studentCheckbox" aria-label="Select row"></td>
                    <td>${student.group_name}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.gender}</td>
                    <td>${student.birthday}</td>
                    <td>${student.status ?? 'passive'}</td>
                    <td>
                        <button class="editBtn" data-id="${student.id}" >Edit</button>
                        <button class="cancelBtn" data-id="${student.id}">Delete</button>
                    </td>
                `;
                studentTable.appendChild(row);
                const editButton = row.querySelector('.editBtn');
                const deleteButton = row.querySelector('.cancelBtn');
                const checkbox = row.querySelector('.studentCheckbox');
                if (editButton) {
                    editButton.addEventListener("click", () => editRow(editButton));
                } else {
                    console.error("Edit button not found in row:", row);
                }

             

                if (deleteButton) {
                    deleteButton.addEventListener("click", () => deleteRow(deleteButton));
                } else {
                    console.error("Delete button not found in row:", row);
                }

                if (checkbox) {
                    checkbox.addEventListener("change", (e) => toggleRowButtons(e.target));
                } else {
                    console.error("Checkbox not found in row:", row);
                }
                updatePagination(data.total, data.page);

                
            });
        } else {
            console.error("Error loading students:", data.message);
        }
    })
    .catch(error => {
        console.error("Error fetching students:", error);
    });

}


    const burgerMenu = document.querySelector('.burger-menu'); //знаходить елемент з класом .burger-menu
    burgerMenu.addEventListener('click', function () {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active'); // Додає "active", якщо його немає видаляє
    });

    openModalBtn.addEventListener("click", function () { 
        modal.classList.add("active");
        createBtn.textContent = "Create";
        titleModal.textContent="Add student";
        modal.currentRow = null; //Очищає поле
        overlay.classList.add('active');
    });

    closeModalBtn.addEventListener("click", function () {
        modal.classList.remove("active");
        overlay.classList.remove('active');
        resetForm();
        
    });
    overlay.addEventListener('click', () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    });


    window.addEventListener("click", function (event) {
        
        if (event.target === modal) { // чи клікнули по модальному вінкі не по вмісту
            modal.classList.remove("active");
            resetForm();
            overlay.classList.remove('active');
        }
    });

    cancBtn.addEventListener("click", function() {
        overlay.classList.remove('active');
        const group = groupSelect.value.trim(); //.trim() — видаляє пробіли
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const gender = genderSelect.value.trim();
        const birthday = birthdayInput.value.trim();
    
        if (!group || !firstName || !lastName || !gender || !birthday) {
            modal.classList.remove("active");
            resetForm();
            return;
        }

        if (createBtn.textContent === "Create") {
            addStudent();
        } else if (createBtn.textContent === "Save") {
            updateStudent();
        }
        
        
    });

    createBtn.addEventListener("click", function () {
        if (createBtn.textContent === "Create") {
            addStudent();
        } else if (createBtn.textContent === "Save") {
            updateStudent();
        }
        
       
    });

    headerCheckbox.addEventListener("change", function() { //виконує код щоразу, коли користувач ставить або знімає галочку у чекбоксі заголовка
        const allCheckboxes = studentTable.querySelectorAll(".studentCheckbox"); //шукає всі чекбокси з класом
        const isChecked = this.checked; // Отримуємо стан головного чекбоксу
    
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked; //Усі чекбокси отримують той самий стан, що і головний.
            toggleRowButtons(checkbox); //  активує або деактивує кнопки редагування/видалення у рядках
        });
    });
    

    let studentIdCounter = 1;

    const nameRegex = /^[A-Za-zА-ЯҐЄІЇа-яґєії]{1,}([-'][A-Za-zА-ЯҐЄІЇа-яґєії]{1,})?$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Формат дати YYYY-MM-DD
    const digitRegex = /\d/; // Перевірка на наявність цифр
    
    function showError(fieldId, errorId, message) {
        if (!fieldId) {
            console.error('fieldId не визначено або порожнє. Перевірте виклик функції.');
            return;
        }
        const field = document.getElementById(fieldId); // Отримуємо елемент поля
    const error = document.getElementById(errorId); // Отримуємо елемент помилки
        if (!field) {
            console.error(`Елемент із ID "${fieldId}" не знайдено в DOM`);
            return;
        }
        const parent = field.parentElement; // Батьківський елемент поля
        let sideError = parent.querySelector('.side-error'); // Бічний елемент помилки
    
        if (!sideError) {
            sideError = document.createElement('span');
            sideError.className = 'side-error';
            parent.appendChild(sideError);
        }
    
        field.classList.add('invalid'); // Додаємо клас для стилізації невалідного поля
        field.classList.remove('valid'); // Видаляємо клас валідного поля
        error.textContent = message; // Встановлюємо текст помилки
        error.style.display = 'block'; // Показуємо елемент помилки
        sideError.textContent = message; // Встановлюємо текст бічної помилки
    }
    
    function clearError(fieldId, errorId) {
        if (!fieldId) {
            console.error('fieldId не визначено або порожнє. Перевірте виклик функції.');
            return;
        }
        const field = document.getElementById(fieldId);
        const error = document.getElementById(errorId);
        if (!field) {
            console.error(`Елемент із ID "${fieldId}" не знайдено в DOM`);
            return;
        }
        const parent = field.parentElement;
        const sideError = parent.querySelector('.side-error');
    
        field.classList.remove('invalid'); // Видаляємо клас невалідного поля
        field.classList.add('valid'); // Додаємо клас валідного поля
        error.textContent = ''; // Очищаємо текст помилки
        error.style.display = 'none'; // Ховаємо елемент помилки
        if (sideError) {
        sideError.textContent = ''; // Очищаємо бічну помилку
        }
    }
    
    function capitalizeFirstLetter(value) {
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); // Перша буква велика, решта маленькі
    }
    
    function validateField(fieldId, value, regex, errorId, errorMessage) {
        if (!value) {
            showError(fieldId, errorId, 'Поле не може бути порожнім');
            return false;
        } else if (!regex.test(value)) {
            showError(fieldId, errorId, errorMessage);
            return false;
        }
        clearError(fieldId, errorId);
        return true;
    }
    
    function validateForm() {
        // Отримуємо значення полів (з перевіркою на існування елементів)
        const group = groupSelect ? groupSelect.value : '';
        const firstName = firstNameInput ? firstNameInput.value.trim() : '';
        const lastName = lastNameInput ? lastNameInput.value.trim() : '';
        const gender = genderSelect ? genderSelect.value : '';
        const birthday = birthdayInput ? birthdayInput.value : '';
    
        if (firstNameInput) firstNameInput.value = capitalizeFirstLetter(firstName);
        if (lastNameInput) lastNameInput.value = capitalizeFirstLetter(lastName);
    
        let isValid = true;
    
        if (!group) {
            showError('group', 'group-error', 'Виберіть групу');
            isValid = false;
        } else {
            clearError('group', 'group-error');
        }
    
        if (!validateField('first-name', firstName, nameRegex, 'first-name-error', digitRegex.test(firstName) ? 'Цифри в імені не дозволені' : 'Тільки літери, мінімум 2 символи')) {
            isValid = false;
        }
    
        if (!validateField('last-name', lastName, nameRegex, 'last-name-error', digitRegex.test(lastName) ? 'Цифри в прізвищі не дозволені' : 'Тільки літери, мінімум 2 символи')) {
            isValid = false;
        }
    
        if (!gender) {
            showError('gender', 'gender-error', 'Виберіть стать');
            isValid = false;
        } else {
            clearError('gender', 'gender-error');
        }
    
        if (!birthday || !dateRegex.test(birthday)) {
            showError('birthday', 'birthday-error', 'Вкажіть коректну дату');
            isValid = false;
        } else {
            const birthDate = new Date(birthday);
            const minDate = new Date('2002-01-01');
            const maxDate = new Date('2007-12-31');
            if (birthDate < minDate || birthDate > maxDate) {
                showError('birthday', 'birthday-error', 'Дата має бути між 2002 і 2007 роками');
                isValid = false;
            } else {
                clearError('birthday', 'birthday-error');
            }
        }
    
        return isValid;
    }
    // Обмеження років у календарі
// Обмеження років у календарі
if (birthdayInput) {
    birthdayInput.setAttribute('min', '2002-01-01');
    birthdayInput.setAttribute('max', '2007-12-31');
}

// Динамічна валідація при вводі
[firstNameInput, lastNameInput].forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            const value = capitalizeFirstLetter(input.value.trim());
            input.value = value;
            if (value && nameRegex.test(value)) {
                clearError(input.id, `${input.id}-error`);
            } else if (value) {
                showError(input.id, `${input.id}-error`, digitRegex.test(value) ? 'Цифри не дозволені' : 'Тільки літери, мінімум 2 символи');
            } else {
                showError(input.id, `${input.id}-error`, 'Поле не може бути порожнім');
            }
        });
    }
});

if (birthdayInput) {
    birthdayInput.addEventListener('input', () => {
        const value = birthdayInput.value;
        if (value && dateRegex.test(value)) {
            const birthDate = new Date(value);
            const minDate = new Date('2002-01-01');
            const maxDate = new Date('2007-12-31');
            if (birthDate >= minDate && birthDate <= maxDate) {
                clearError('birthday', 'birthday-error');
            } else {
                showError('birthday', 'birthday-error', 'Дата має бути між 2002 і 2007 роками');
            }
        } else {
            showError('birthday', 'birthday-error', 'Вкажіть коректну дату');
        }
    });
}

if (groupSelect) {
    groupSelect.addEventListener('change', () => {
        if (groupSelect.value) {
            clearError('group', 'group-error');
        } else {
            showError('group', 'group-error', 'Виберіть групу');
        }
    });
}

if (genderSelect) {
    genderSelect.addEventListener('change', () => {
        if (genderSelect.value) {
            clearError('gender', 'gender-error');
        } else {
            showError('gender', 'gender-error', 'Виберіть стать');
        }
    });
}

    function addStudent() {
        
        if (!validateForm()) {
            return;
        }
        
        
        const group = groupSelect.value;
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const gender = genderSelect.value;
        const birthday = birthdayInput.value;
    
        // Перевірка на заповненість полів
        if (!group || !firstName || !lastName || !gender || !birthday) {
            alert("Будь ласка, заповніть усі поля!");
            return;
        }
    
       

        



    const formData = new FormData();
    formData.append('group', group);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('gender', gender);
    formData.append('birthday', birthday);

    // Логування даних для діагностики
    console.log("Form data being sent:", {
        group, first_name: firstName, last_name: lastName, gender, birthday
    });

    fetch('add_student.php', {
        method: 'POST',
        body: new URLSearchParams(formData),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text(); // Спочатку отримуємо текст, щоб перевірити відповідь
    })
    .then(text => {
        console.log("Raw response:", text); // Логування сирої відповіді
        return JSON.parse(text); // Парсимо JSON
    })
    .then(data => {
        console.log("Add student response:", data);
        if (data.success) {
             // Створення нової строки
        const newRow = studentTable.insertRow();
        const studentId = studentIdCounter++;
        newRow.setAttribute('data-id', studentId); // Зберігаємо id як атрибут рядка

        // Встановлюємо id у приховане поле (якщо потрібно для відправки форми)
       document.getElementById('student-id').value = studentId;
        // Визначення, чи є студент "ROMEO"
        const isTargetStudent = firstName.toUpperCase() === "ROMEO";
    
        // Створення клітинок
        const checkboxCell = newRow.insertCell();
        const groupCell = newRow.insertCell();
        const nameCell = newRow.insertCell();
        const genderCell = newRow.insertCell();
        const birthdayCell = newRow.insertCell();
        const statusCell = newRow.insertCell();
        const actionsCell = newRow.insertCell();

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "studentCheckbox";
        checkbox.addEventListener("change", (e) => toggleRowButtons(e.target));
        checkboxCell.appendChild(checkbox);
    

        groupCell.textContent = group;
    
   
        nameCell.textContent = `${firstName} ${lastName}`;
    
  
        genderCell.textContent = gender;
    

        birthdayCell.textContent = birthday;
    
    
        const statusContainer = document.createElement("div");
        statusContainer.style.display = "flex";
        statusContainer.style.justifyContent = "left";
        statusContainer.style.alignItems = "center";
        statusContainer.style.width = "100%";
        statusContainer.style.height = "100%";
    
        const statusIcon = document.createElement("div");
        statusIcon.style.width = "20px";
        statusIcon.style.height = "20px";
        statusIcon.style.backgroundColor = isTargetStudent ? "green" : "gray";
        statusIcon.style.borderRadius = "50%";
    
        statusContainer.appendChild(statusIcon);
        statusCell.appendChild(statusContainer);

        const editButton = document.createElement("button");
        editButton.className = "editBtn";
        editButton.disabled = true;
        editButton.addEventListener("click", () => editRow(editButton));
        const editIcon = document.createElement("img");
        editIcon.src = "./img/pencil.png";
        editIcon.alt = "Edit";
        editIcon.width = 20;
        editButton.appendChild(editIcon);
    
        const deleteButton = document.createElement("button");
        deleteButton.className = "cancelBtn";
        deleteButton.disabled = true;
        deleteButton.addEventListener("click", () => deleteRow(deleteButton));
        const deleteIcon = document.createElement("img");
        deleteIcon.src = "./img/cancel.png";
        deleteIcon.alt = "Delete";
        deleteIcon.width = 20;
        deleteButton.appendChild(deleteIcon);
    
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        loadStudents(currentPage);
            alert(data.message);
        } else {
            clearErrors();
            if (data.errors) {
                if (data.errors.group) document.getElementById("group-error").textContent = data.errors.group;
                if (data.errors.first_name) document.getElementById("first-name-error").textContent = data.errors.first_name;
                if (data.errors.last_name) document.getElementById("last-name-error").textContent = data.errors.last_name;
                if (data.errors.gender) document.getElementById("gender-error").textContent = data.errors.gender;
                if (data.errors.birthday) document.getElementById("birthday-error").textContent = data.errors.birthday;
                if (data.errors.duplicate) alert(data.errors.duplicate);
            } else {
                alert(data.message);
            }
        }
    })
    .catch(error => {
        console.error("Error adding student:", error);
        alert("Помилка сервера. Спробуйте ще раз.");
    });
       
      
        modal.classList.remove("active");
        overlay.classList.remove('active');
        resetForm();

    }

    const modal1 = {
        currentRow: null,
        originalData: null
    };
    

    window.editRow = function(button) {
        overlay.classList.add('active');
        const row = button.closest('tr');
        const cells = row.getElementsByTagName('td');
    
        // Отримуємо оригінальні значення для ідентифікації студента
        const [firstName, lastName] = cells[2].textContent.trim().split(' ');
        const originalData = {
            first_name: firstName || '',
            last_name: lastName || '',
            birthday: cells[4].textContent.trim()
        };
    
        // Зберігаємо оригінальні дані в об’єкті modal
        modal1.originalData = originalData;
    
        // Заповнюємо форму поточними значеннями
        groupSelect.value = cells[1].textContent.trim();
        firstNameInput.value = firstName || '';
        lastNameInput.value = lastName || '';
        genderSelect.value = cells[3].textContent.trim();
        birthdayInput.value = cells[4].textContent.trim();
    
        // Очищаємо помилки
        ['group', 'first-name', 'last-name', 'gender', 'birthday'].forEach(id => {
            clearError(id, `${id}-error`);
        });
    
        createBtn.textContent = "Save";
        titleModal.textContent = "Edit Student";
        modal1.currentRow = row;
    
        modal.classList.add("active");
    };
    
    function updateStudent() {
        if (!validateForm()) {
            return;
        }
    
        const group = groupSelect.value;
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const gender = genderSelect.value;
        const birthday = birthdayInput.value;
    
        // Перевірка на заповненість полів
        if (!group || !firstName || !lastName || !gender || !birthday) {
            alert("Будь ласка, заповніть усі поля!");
            return;
        }
       
    
        const row = modal1.currentRow;
        if (!row) {
            console.error("Рядок для оновлення не знайдено!");
            return;
        }
          // Перевіряємо, чи встановлений чекбокс для цього рядка
         const checkbox = row.querySelector('.studentCheckbox');
         if (!checkbox.checked) {
             alert("Будь ласка, виберіть студента, встановивши чекбокс!");
             return;
         }
    
       
    
        // Отримуємо оригінальні дані для ідентифікації студента
        const originalData = modal1.originalData;
        if (!originalData) {
            console.error("Оригінальні дані для редагування не знайдені!");
            return;
        }
    
        const formData = new FormData();
        formData.append('original_first_name', originalData.first_name);
        formData.append('original_last_name', originalData.last_name);
        formData.append('original_birthday', originalData.birthday);
        formData.append('group', group);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('gender', gender);
        formData.append('birthday', birthday);
    
        // Логування даних для діагностики
        console.log("Form data being sent for update:", {
            original_first_name: originalData.first_name,
            original_last_name: originalData.last_name,
            original_birthday: originalData.birthday,
            group, first_name: firstName, last_name: lastName, gender, birthday
        });
    
        fetch('edit_student.php', {
            method: 'POST',
            body: new URLSearchParams(formData),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.text();
        })
        .then(text => {
            console.log("Raw response:", text);
            return JSON.parse(text);
        })
        .then(data => {
            console.log("Update student response:", data);
            if (data.success) {
                // Оновлення вмісту клітинок
                row.cells[1].textContent = data.student.group_name;
                row.cells[2].textContent = `${data.student.first_name} ${data.student.last_name}`;
                row.cells[3].textContent = data.student.gender;
                row.cells[4].textContent = data.student.birthday;
    
                // Закриваємо модальне вікно і скидаємо форму
                modal.classList.remove("active");
                overlay.classList.remove('active');
                resetForm();
                loadStudents(currentPage);
                alert(data.message);
            } else {
                clearErrors();
                if (data.errors) {
                    if (data.errors.group) document.getElementById("group-error").textContent = data.errors.group;
                    if (data.errors.first_name) document.getElementById("first-name-error").textContent = data.errors.first_name;
                    if (data.errors.last_name) document.getElementById("last-name-error").textContent = data.errors.last_name;
                    if (data.errors.gender) document.getElementById("gender-error").textContent = data.errors.gender;
                    if (data.errors.birthday) document.getElementById("birthday-error").textContent = data.errors.birthday;
                    if (data.errors.duplicate) alert(data.errors.duplicate);
                    if (data.errors.original_data) alert(data.errors.original_data);
                } else {
                    alert(data.message);
                }
            }
        })
        .catch(error => {
            console.error("Error updating student:", error);
            alert("Помилка сервера. Спробуйте ще раз.");
        });
    }
    
    function resetForm() {
        groupSelect.value = "";
        firstNameInput.value = "";
        lastNameInput.value = "";
        genderSelect.value = "";
        birthdayInput.value = "";
        createBtn.textContent = "Create";
        titleModal.textContent="Add student";
        modal.currentRow = null;
        document.getElementById('student-id').value = "";

        ['group', 'first-name', 'last-name', 'gender', 'birthday'].forEach(id => {
            const field = document.getElementById(id);
            field.classList.remove('valid', 'invalid');
            field.style.border = '2px solid #ccc'; // Повертаємо нейтральний колір
            field.style.backgroundColor = ''; // Очищаємо фон
            document.getElementById(`${id}-error`).style.display = 'none';
        });
        
    }

    window.deleteRow = function () {
        const checkedRows = document.querySelectorAll('.studentCheckbox:checked');
    
        if (checkedRows.length === 0) {
            alert('Будь ласка, виберіть хоча б одного студента для видалення');
            return;
        }
    
        // Збираємо дані студентів для видалення
        const studentsToDelete = Array.from(checkedRows).map(checkbox => {
            const row = checkbox.closest('tr');
            const [firstName, lastName] = row.querySelector('td:nth-child(3)').textContent.trim().split(' ');
            const birthday = row.querySelector('td:nth-child(5)').textContent.trim();
            return {
                first_name: firstName || '',
                last_name: lastName || '',
                birthday: birthday
            };
        });
    
        // Збираємо імена студентів для відображення в модальному вікні
        const studentNames = studentsToDelete.map(student => `${student.first_name} ${student.last_name}`);
    
        // Створюємо модальне вікно
        const modal = document.createElement('div');
        modal.className = 'modal';
    
        // Контейнер для вмісту модального вікна
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
    
        // Кнопка закриття
        const closeButton = document.createElement('span');
        closeButton.className = 'delmodal-close';
        closeButton.id = 'delcloseModal';
        const closeIcon = document.createElement('img');
        closeIcon.src = './img/close.png';
        closeIcon.alt = 'close';
        closeButton.appendChild(closeIcon);
    
        // Заголовок
        const title = document.createElement('h2');
        title.className = 'deltitle';
        title.textContent = 'Warning';
    
        // Текст із іменами студентів
        const message = document.createElement('p');
        message.className = 'deltext';
        message.textContent = `Are you sure you want to delete user ${studentNames.join(', ')}?`;
    
        // Контейнер для кнопок
        const modalButtons = document.createElement('div');
        modalButtons.className = 'modal-buttons';
    
        // Кнопка "Cancel"
        const cancelButton = document.createElement('button');
        cancelButton.id = 'cancelBtn';
        cancelButton.textContent = 'Cancel';
    
        // Кнопка "OK"
        const okButton = document.createElement('button');
        okButton.id = 'okBtn';
        okButton.textContent = 'OK';
    
        // Додаємо елементи до відповідних контейнерів
        modalButtons.appendChild(cancelButton);
        modalButtons.appendChild(okButton);
        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(message);
        modalContent.appendChild(modalButtons);
        modal.appendChild(modalContent);
    
        // Додаємо модальне вікно до body
        document.body.appendChild(modal);
    
        // Обробники подій
        closeButton.onclick = function () {
            document.body.removeChild(modal);
        };
    
        cancelButton.onclick = function () {
            document.body.removeChild(modal);
        };
    
        okButton.onclick = function () {
            // Надсилаємо запит на сервер для видалення студентів
            fetch('delete_student.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ students: studentsToDelete }),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Видаляємо рядки з таблиці
                    checkedRows.forEach(checkbox => {
                        const row = checkbox.closest('tr');
                        if (modal1.currentRow === row) { 
                            modal1.currentRow = null;    
                        }
                        row.remove();
                    });
                    updateHeaderCheckbox(); // Оновлення чекбокса в заголовку (якщо є)
                    loadStudents(currentPage);
                    alert('Студенти успішно видалені');
                } else {
                    alert('Помилка видалення: ' + (data.message || 'Невідома помилка'));
                }
            })
            .catch(error => {
                console.error("Error deleting students:", error);
                alert('Помилка сервера при видаленні студентів. Спробуйте ще раз.');
            })
            .finally(() => {
                document.body.removeChild(modal);
            });
        };
    };
        
        

    
    window.toggleRowButtons = function(checkbox) {
        const row = checkbox.closest('tr');
        const editBtn = row.querySelector('.editBtn');
        const deleteBtn = row.querySelector('.cancelBtn'); 
        
        
        editBtn.disabled = !checkbox.checked; //Увімкнення/вимкнення кнопок залежно від стану чекбокса
        deleteBtn.disabled = !checkbox.checked;
        
        updateHeaderCheckbox();
    }

    // Оновлення стану чекбокса в заголовку
    function updateHeaderCheckbox() {
        const allCheckboxes = studentTable.querySelectorAll('.studentCheckbox');
        const checkedCount = Array.from(allCheckboxes).filter(cb => cb.checked).length; //Обчислення кількості вибраних чекбоксів
        
        if (checkedCount === 0) {
            headerCheckbox.checked = false;
            headerCheckbox.indeterminate = false;
        } else if (checkedCount === allCheckboxes.length) {
            headerCheckbox.checked = true;
            headerCheckbox.indeterminate = false;
        } else {
            headerCheckbox.checked = false;
            headerCheckbox.indeterminate = true;
        }
    }

  
document.querySelector('.notification-bell').addEventListener('mouseover', function() {
    this.querySelector('.popup').style.display = 'block';
});

document.querySelector('.notification-bell').addEventListener('mouseout', function() {
    this.querySelector('.popup').style.display = 'none';
});

document.querySelector('.user-block').addEventListener('mouseover', function() {
    this.querySelector('.popup-ava').style.display = 'block';
});

document.querySelector('.user-block').addEventListener('mouseout', function() {
    this.querySelector('.popup-ava').style.display = 'none';
});

function updatePagination(totalStudents, currentPage) {
    const paginationContainer = document.querySelector('.buton-plag');
    paginationContainer.innerHTML = ''; // Очищаємо попередні кнопки

    const totalPages = Math.ceil(totalStudents / studentsPerPage);

    // Додаємо кнопку "«" (назад)
    const prevButton = document.createElement('button');
    prevButton.className = 'plagb';
    prevButton.textContent = '«';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            loadStudents(currentPage - 1);
        }
    });
    paginationContainer.appendChild(prevButton);

    // Додаємо кнопки для сторінок
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'plagb';
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active'); // Виділяємо поточну сторінку
        }
        pageButton.addEventListener('click', () => {
            loadStudents(i);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Додаємо кнопку "»" (вперед)
    const nextButton = document.createElement('button');
    nextButton.className = 'plagb';
    nextButton.textContent = '»';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadStudents(currentPage + 1);
        }
    });
    paginationContainer.appendChild(nextButton);
}



loadStudents();

});    