document.addEventListener('DOMContentLoaded', function () {
    // --- Referencias a Elementos del DOM ---
    const profileImage = document.getElementById('profile-image');
    const fileUpload = document.getElementById('file-upload');
    const profileName = document.getElementById('profile-name');
    const userUsername = document.getElementById('user-username');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const userRole = document.getElementById('profile-role');
    const profileCard = document.querySelector('.profile-card'); // Referencia al contenedor principal

    const moreOptionsBtn = document.getElementById('more-options-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- Datos por Defecto y Claves de LocalStorage ---
    const DEFAULT_PROFILE_PIC = 'img/configImg/profilePhoto.png';
    const LS_KEYS = {
        name: 'user_name',
        username: 'user_username',
        email: 'user_email',
        role: 'user_role',
        phone: 'user_phone',
        profilePic: 'user_profile_pic'
    };

    // Referencias a los inputs de edición
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const phoneInput = document.getElementById('phone-input');

    // --- Cargar Datos del Usuario desde LocalStorage al Iniciar ---
    function loadUserData() {
        // Cargar datos de texto
        profileName.textContent = localStorage.getItem(LS_KEYS.name) || 'Pablo Martínez';
        userUsername.textContent = localStorage.getItem(LS_KEYS.username) || 'pabloGMartinez14';
        userEmail.textContent = localStorage.getItem(LS_KEYS.email) || 'pablomartinez14@gmail.com';
        userPhone.textContent = localStorage.getItem(LS_KEYS.phone) || '+503 7693-2354';
        userRole.textContent = localStorage.getItem(LS_KEYS.role) || 'TÉCNICO';

        // Cargar foto de perfil
        const savedPic = localStorage.getItem(LS_KEYS.profilePic);
        profileImage.src = savedPic || DEFAULT_PROFILE_PIC;
    }

    // --- Lógica del Menú Desplegable "Más" ---
    moreOptionsBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    window.addEventListener('click', (event) => {
        if (!moreOptionsBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // --- Lógica para Cambiar Foto de Perfil ---
    changePhotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileUpload.click();
        dropdownMenu.classList.remove('show');
    });

    fileUpload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageDataUrl = e.target.result;
                profileImage.src = imageDataUrl;
                /* localStorage.setItem(LS_KEYS.profilePic, imageDataUrl); */
            }
            reader.readAsDataURL(file);
        }
    });

    // Lógica para el botón de edición
    editProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Ahora añadimos la clase a 'profile-card'
        profileCard.classList.add('edit-mode');
        dropdownMenu.classList.remove('show');

        // Lógica para mostrar los botones de Guardar y Descartar
        saveProfileBtn.style.display = 'inline-block';
        cancelEditBtn.style.display = 'inline-block';

        // Rellenar los inputs con los valores actuales
        nameInput.value = profileName.textContent.trim();
        emailInput.value = userEmail.textContent.trim();
        phoneInput.value = userPhone.textContent.trim();
    });

    // --- Lógica para Guardar Cambios ---
    saveProfileBtn.addEventListener('click', () => {
        // Guardar datos en localStorage
        localStorage.setItem(LS_KEYS.name, nameInput.value);
        localStorage.setItem(LS_KEYS.email, emailInput.value);
        localStorage.setItem(LS_KEYS.phone, phoneInput.value);

        // Actualizar el DOM
        profileName.textContent = nameInput.value;
        userEmail.textContent = emailInput.value;
        userPhone.textContent = phoneInput.value;

        // Volver al modo de visualización
        profileCard.classList.remove('edit-mode'); // Corregido, la clase está en profileCard

        // Ocultar los botones de Guardar y Descartar
        saveProfileBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';

        Swal.fire({
            title: '¡Datos actualizados!',
            text: 'Los cambios se guardaron correctamente.',
            icon: 'success',
            showConfirmButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Genial'
        });
    });

    // --- Lógica para Cancelar Edición ---
    cancelEditBtn.addEventListener('click', () => {
        // Volver al modo de visualización sin guardar
        profileCard.classList.remove('edit-mode'); // Corregido, la clase está en profileCard

        // Ocultar los botones de Guardar y Descartar
        saveProfileBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
    });

    // --- Carga inicial de datos ---
    loadUserData();
});