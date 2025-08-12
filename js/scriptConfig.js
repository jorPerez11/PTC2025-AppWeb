document.addEventListener('DOMContentLoaded', function () {
    // --- Referencias a Elementos del DOM ---
    const profileImage = document.getElementById('profile-image');
    const fileUpload = document.getElementById('file-upload');
    const profileName = document.getElementById('profile-name');
    const userUsername = document.getElementById('user-username');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const userRole = document.getElementById('profile-role');
    const userPasswordSpan = document.getElementById('user-password');
    const passwordRow = document.getElementById('password-row');
    const togglePasswordIcon = document.getElementById('toggle-password');

    const moreOptionsBtn = document.getElementById('more-options-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const editProfileBtn = document.getElementById('edit-profile-btn');

    // --- Datos por Defecto y Claves de LocalStorage ---
    const DEFAULT_PROFILE_PIC = 'img/configImg/profilePhoto.png';
    const LS_KEYS = {
        name: 'user_name',
        username: 'user_username',
        email: 'user_email',
        role: 'user_role',
        phone: 'user_phone',
        password: 'user_password',
        profilePic: 'user_profile_pic'
    };

    // --- Cargar Datos del Usuario desde LocalStorage al Iniciar ---
    function loadUserData() {
        // Cargar datos de texto
        profileName.textContent = localStorage.getItem(LS_KEYS.name) || 'Pablo Martínez';
        userUsername.textContent = localStorage.getItem(LS_KEYS.username) || 'pabloGMartinez14';
        userEmail.textContent = localStorage.getItem(LS_KEYS.email) || 'pablomartinez14@gmail.com';
        if (role) {
            role.textContent = role.toUpperCase();
        }
        userRole.textContent = localStorage.getItem(LS_KEYS.role) || 'TÉCNICO';
        userPhone.textContent = localStorage.getItem(LS_KEYS.phone) || '+503 7693-2354';

        // Cargar foto de perfil
        const savedPic = localStorage.getItem(LS_KEYS.profilePic);
        profileImage.src = savedPic || DEFAULT_PROFILE_PIC;
    }

    // --- Lógica de Edición de Datos ---
    editProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Solicitar nuevos datos
        const newName = prompt('Ingresa tu nuevo nombre:', profileName.textContent);
        const newEmail = prompt('Ingresa tu nuevo email:', userEmail.textContent);
        const newPhone = prompt('Ingresa tu nuevo teléfono:', userPhone.textContent);

        // Actualizar y guardar si el usuario no canceló
        if (newName !== null) {
            profileName.textContent = newName;
            localStorage.setItem(LS_KEYS.name, newName);
        }
        if (newEmail !== null) {
            userEmail.textContent = newEmail;
            localStorage.setItem(LS_KEYS.email, newEmail);
        }
        if (newPhone !== null) {
            userPhone.textContent = newPhone;
            localStorage.setItem(LS_KEYS.phone, newPhone);
        }

        alert('¡Datos actualizados!');
        dropdownMenu.classList.remove('show');
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
                // Guardar la imagen en Base64 en localStorage
                localStorage.setItem(LS_KEYS.profilePic, imageDataUrl);
            }
            reader.readAsDataURL(file);
        }
    });

    // --- Lógica de Contraseña (Mostrar/Ocultar y Cambiar) ---
    let isPasswordVisible = false;

    togglePasswordIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que se dispare el evento del 'passwordRow'
        isPasswordVisible = !isPasswordVisible;
        const savedPassword = localStorage.getItem(LS_KEYS.password) || 'Password123!'; // Contraseña de ejemplo

        if (isPasswordVisible) {
            userPasswordSpan.textContent = savedPassword;
            togglePasswordIcon.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
        } else {
            userPasswordSpan.textContent = '••••••••••';
            togglePasswordIcon.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
        }
    });

    passwordRow.addEventListener('click', async () => {
        try {
            // 1. Pedir autenticación del sistema (PIN, Huella, Contraseña de la PC)
            // Esta es una medida de seguridad avanzada usando la API WebAuthn
            await navigator.credentials.get({ publicKey: { challenge: new Uint8Array(16), rp: { id: window.location.hostname, name: "Mi App" }, user: { id: new Uint8Array(16), name: "user", displayName: "User" }, pubKeyCredParams: [{ type: "public-key", alg: -7 }], timeout: 60000, } });

            // 2. Si la autenticación es exitosa, pedir la nueva contraseña
            const newPassword = prompt("Autenticación exitosa. Ingresa tu nueva contraseña:");

            if (newPassword === null) return; // El usuario canceló

            // 3. Validar la nueva contraseña
            const validation = validatePassword(newPassword);
            if (!validation.isValid) {
                alert(`La contraseña no es válida:\n- ${validation.errors.join('\n- ')}`);
                return;
            }

            // 4. Guardar la nueva contraseña
            localStorage.setItem(LS_KEYS.password, newPassword);
            if (isPasswordVisible) { // Si la contraseña era visible, la actualizamos
                userPasswordSpan.textContent = newPassword;
            }
            alert("¡Contraseña actualizada con éxito!");

        } catch (error) {
            console.error("Error de autenticación:", error);
            alert("No se pudo verificar tu identidad o la operación fue cancelada. Inténtalo de nuevo.");
        }
    });

    function validatePassword(password) {
        const errors = [];
        if (password.length < 8) errors.push("Debe tener al menos 8 caracteres.");
        if (!/[A-Z]/.test(password)) errors.push("Debe contener al menos una mayúscula.");
        if (!/[0-9]/.test(password)) errors.push("Debe contener al menos un número.");
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Debe contener al menos un símbolo especial.");

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // --- Lógica del Menú Desplegable "Más" ---
    moreOptionsBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    window.addEventListener('click', () => {
        if (dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    });

    // --- Carga inicial de datos ---
    loadUserData();
});