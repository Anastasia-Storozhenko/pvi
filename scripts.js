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

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => console.log("Service Worker registered"))
          .catch((err) => console.error("Service Worker registration failed", err));
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

    const nameRegex = /^[A-Za-zА-ЯҐЄІЇа-яґєії]{2,}$/; // Тільки літери, мінімум 2 символи
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Формат дати YYYY-MM-DD
    const digitRegex = /\d/; // Перевірка на наявність цифр
    
    function showError(fieldId, errorId, message) {
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
        let sideError = parent.querySelector('.side-error');
    
        if (!sideError) {
            sideError = document.createElement('span');
            sideError.className = 'side-error';
            parent.appendChild(sideError);
        }
    
        field.classList.add('invalid');
        field.classList.remove('valid');
        error.textContent = message;
        error.style.display = 'block';
        sideError.textContent = message;
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
    
        field.classList.remove('invalid');
        field.classList.add('valid');
        error.textContent = '';
        error.style.display = 'none';
        if (sideError) {
            sideError.textContent = '';
        }
    }
    
    function capitalizeFirstLetter(value) {
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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

        const studentData = {
            id: studentId,
            group: group,
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            birthday: birthday,
            status: firstName.toUpperCase() === "ROMEO" ? "green" : "gray"
        };
        console.log('Додано нового студента:', JSON.stringify(studentData, null, 2));

        modal.classList.remove("active");
        overlay.classList.remove('active');
        resetForm();

    }

    window.editRow = function(button) {
        overlay.classList.add('active');
        const row = button.closest('tr');
        const cells = row.getElementsByTagName('td');
    
        const studentId = row.getAttribute('data-id');
        document.getElementById('student-id').value = studentId;
    
        groupSelect.value = cells[1].textContent.trim();
        const [firstName, lastName] = cells[2].textContent.trim().split(' ');
        firstNameInput.value = firstName || '';
        lastNameInput.value = lastName || '';
        genderSelect.value = cells[3].textContent.trim();
        birthdayInput.value = cells[4].textContent.trim();
    
        // Робимо всі поля зеленими
        ['group', 'first-name', 'last-name', 'gender', 'birthday'].forEach(id => {
            clearError(id, `${id}-error`);
        });
    
        createBtn.textContent = "Save";
        titleModal.textContent = "Edit Student";
        modal.currentRow = row;
    
        modal.classList.add("active");
    }
    function updateStudent() {
        if (!validateForm()) {
            return;
        }
        overlay.classList.add('active');
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
    
        // Отримання рядка для оновлення
        const row = modal.currentRow;
        if (!row) {
            console.error("Рядок для оновлення не знайдено!");
            return;
        }

        const studentId = document.getElementById('student-id').value;
          row.setAttribute('data-id', studentId);
    
        // Оновлення вмісту клітинок
        row.cells[1].textContent = group;
        row.cells[2].textContent = `${firstName} ${lastName}`;
        row.cells[3].textContent = gender;
        row.cells[4].textContent = birthday;
    
        // Оновлення статусу (іконка)
        const isTargetStudent = firstName.toUpperCase() === "ROMEO";
    
        // Очищаємо попередній вміст клітинки статусу
        row.cells[5].innerHTML = "";
    
        // Створюємо контейнер для статусу
        const statusContainer = document.createElement("div");
        statusContainer.className = "status-container";
    
        // Створюємо іконку статусу
        const statusIcon = document.createElement("div");
        statusIcon.className = `status-icon ${isTargetStudent ? "green" : "gray"}`;
    
        // Додаємо іконку до контейнера, а контейнер до клітинки
        statusContainer.appendChild(statusIcon);
        row.cells[5].appendChild(statusContainer);
        
        const studentData = {
            id: row.getAttribute('data-id'),
            group: group,
            firstName: firstName,
            lastName: lastName,
            gender: gender,
            birthday: birthday,
            status: firstName.toUpperCase() === "ROMEO" ? "green" : "gray"
        };
    
        // Виводимо JSON у консоль
        console.log("Оновлені дані студента:", JSON.stringify(studentData, null, 2));
        // Закриття модального вікна і скидання форми
        modal.classList.remove("active");
        overlay.classList.remove('active');
        resetForm();
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

    // Збираємо імена студентів
    const studentNames = Array.from(checkedRows).map(checkbox => {
        const row = checkbox.closest('tr');
        const name = row.querySelector('td:nth-child(3)')?.textContent.trim() || 'Error';
        const id = row.getAttribute('data-id') || 'Unknown ID';
        return `${name} `; //(ID: ${id})
    });

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
        checkedRows.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (modal.currentRow === row) {
                modal.currentRow = null;
            }
            row.remove();
        });
        updateHeaderCheckbox(); // Оновлення чекбокса в заголовку (якщо є)
        document.body.removeChild(modal);
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






});    