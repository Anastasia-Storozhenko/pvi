
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Students</title>
    <link rel="stylesheet" href="./css/index.css">
    <link rel="stylesheet" href="./css/auth.css">
    
</head>
<body>
    
    <header class="header_main">
        <a href="./students.php" class="text_header">CMS</a>
        <button id="loginBtn">Log In</button>
        <div id="loginModal" class="modal_log">
            <div class="modal-content">
              <form id="loginForm">
                <label for="firstName">Логін (ім'я):</label>
                <input type="text" id="firstName" name="firstName" required>
                <label for="birth_date">Пароль (дата народження, YYYY-MM-DD):</label>
                <input type="text" id="birth_date" name="birth_date" required>
                <button type="submit">Увійти</button>
              </form>
            </div>
          </div>
        <div class="user_info">
            <a href="./messenges.php" class="notification-bell">
                <img src="./img/bell.png" alt="Notification" class="bell">
                <div class="popup" style="display: none;">
                    <div class="messenge-popup">
                        <div class="users-info">
                            <img src="./img/ava.jpg" alt="Ava" width="35" height="35" class="ava">
                            <p class="text-not">Romeo</p>
                        </div>
                        <div class="status-rectangle"></div>
                    </div>
                    
                    <div class="messenge-popup">
                        <div class="users-info">
                            <img src="./img/ava.jpg" alt="Ava" width="35" height="35" class="ava">
                            <p class="text-not">Romeo</p>
                        </div>
                        <div class="status-rectangle"></div>
                    </div>
                    <div class="messenge-popup">
                        <div class="users-info">
                            <img src="./img/ava.jpg" alt="Ava" width="35" height="35" class="ava">
                            <p class="text-not">Romeo</p>
                        </div>
                        <div class="status-rectangle"></div>
                    </div>
                    
                    
                </div>
            </a>
            <div class="user-block">
                <img src="./img/ava.jpg" alt="Ava" width="45" height="45" class="ava">
                <p class="name">Romeo</p>
                <div class="popup-ava" style="display: none;">
                        <p class="profa">Profile</p>
                        <p class="profa" id="logoutLink">Log Out</p>
                    
                </div>
            </div>

            </div>
    </header>   
    <nav class="navbar">
        <div class="burger-menu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        <div class="nav-links">
            <a href="./dashboard.php">Dashboard</a>
            <a href="./students.php" class="active">Students</a>
            <a href="./tasks.php">Tasks</a>
        </div>
    </nav>
    <h1 class="title">Students</h1>
    

    <div class="button-table">
        <button class="add-student-btn" id="openModal"> 
            <img class="addimg" src="./img/add.png" alt="add">
        </button>
        <table class="student-table" id="student-table">
        <thead>
            <tr>
                <th><input type="checkbox" aria-label="Select all rows"> </th>
                <th>Group</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Birthday</th>
                <th>Status</th>
                <th>Options</th>
            </tr>
        </thead>
        <tbody>
            
        </tbody>
    </table>
    </div>
   
    <div class="modal-overlay"></div>
    <div class="students-modal" id="students-modal">
        <div class="flowers">

        </div> 
        <span class="modal-close" id="closeModal">
            <img src="./img/close.png" alt="close">
        </span>
        <h2 class="titleForm" id="titleModal">Add Student</h2>
        <form class="student-form" id="student-form">
            <input type="hidden" id="student-id" name="id">
        
            <div class="infoForm">
                <div class="Lablesflex">
                    <label class="formGroup" for="group">Group</label>
                    <select class="groupValue" id="group" required>
                        <option value="" disabled selected>Select group</option>
                        <option value="pz-21">PZ-21</option>
                        <option value="pz-22">PZ-22</option>
                        <option value="pz-23">PZ-23</option>
                        <option value="pz-24">PZ-24</option>
                        <option value="pz-25">PZ-25</option>
                        <option value="pz-26">PZ-26</option>
                    </select>
                    <span class="error-message" id="group-error"></span>
                </div>
                <div class="Lablesflex">
                    <label for="first-name">First name</label>
                    <input type="text" id="first-name"  required title="Тільки українські або англійські літери, мінімум 2 символи">
                    <span class="error-message" id="first-name-error"></span>
                </div>
                <div class="Lablesflex">
                    <label for="last-name">Last name</label>
                    <input type="text" id="last-name"  required title="Тільки українські або англійські літери, мінімум 2 символи">
                    <span class="error-message" id="last-name-error"></span>
                </div>
                <div class="Lablesflex">
                    <label for="gender">Gender</label>
                    <select class="valueGender" id="gender" required>
                        <option value="" disabled selected>Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <span class="error-message" id="gender-error"></span>
                </div>
                <div class="Lablesflex">
                    <label for="birthday">Birthday</label>
                    <input type="date" id="birthday" required>
                    <span class="error-message" id="birthday-error"></span>
                </div>
            </div>
        
            <div class="modelBtns">
                <button class="cancBtn" type="button" id="canc-btn">Cancel</button>
                <button class="CreateBtn" type="button" id="create-btn">Create</button>
            </div>
        </form>
        
    </div >
    
   

    <div class="buton-plag">
        <button class="plagb"> &laquo; </button>
        <button class="plagb"> 1 </button>
        <button class="plagb"> 2 </button>
        <button class="plagb"> 3 </button>
        <button class="plagb"> 4 </button>
        <button class="plagb"> &raquo; </button>

    </div>
    <div class="pagination"></div>


    <div id="auth-overlay" class="auth-overlay"></div>
    
    <script src="scripts.js"></script>
    
    <script src="auth.js"></script>
</body>
</html>