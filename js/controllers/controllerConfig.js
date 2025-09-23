// js/controllers/controllerConfig.js

import { getUserId, getUser, updateUser, updateUserProfilePicture } from '../services/serviceConfig.js';

document.addEventListener('DOMContentLoaded', function () {
    const domElements = {
        profileImage: document.getElementById('profile-image'),
        profileName: document.getElementById('profile-name'),
        userUsername: document.getElementById('user-username'),
        userEmail: document.getElementById('user-email'),
        userPhone: document.getElementById('user-phone'),
        userRole: document.getElementById('profile-role'),
        profileCard: document.querySelector('.profile-card'),
        userJoinDate: document.getElementById('profile-join-date'),
        moreOptionsBtn: document.getElementById('more-options-btn'),
        dropdownMenu: document.getElementById('dropdown-menu'),
        changePhotoBtn: document.getElementById('change-photo-btn'),
        editProfileBtn: document.getElementById('edit-profile-btn'),
        saveProfileBtn: document.getElementById('save-profile-btn'),
        cancelEditBtn: document.getElementById('cancel-edit-btn'),
        nameInput: document.getElementById('name-input'),
        emailInput: document.getElementById('email-input'),
        phoneInput: document.getElementById('phone-input'),
        photoInput: document.getElementById('photo-input')
    };

    let currentUserId = null;
    let selectedFile = null;

    // Función para previsualizar la imagen seleccionada y guardar el archivo
    function handlePhotoInput() {
        const file = domElements.photoInput.files[0];
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = function (e) {
                domElements.profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Eventos para la subida de foto
    domElements.photoInput.addEventListener('change', handlePhotoInput);

    // Click en la imagen de perfil
    domElements.profileImage.addEventListener('click', (e) => {
        if (editMode === 'full' || editMode === 'photo') {
            domElements.photoInput.click();
        }
    });

    // Botón para cambiar solo la foto
    domElements.changePhotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // <--- evita que el click llegue al profileImage
        editMode = 'photo';
        domElements.photoInput.click();
        domElements.dropdownMenu.classList.remove('show');
    });


    async function loadProfileData() {
        if (!currentUserId) {
            try {
                currentUserId = await getUserId();
            } catch (error) {
                console.error('No se pudo obtener el ID del usuario:', error);
                Swal.fire({
                    title: 'Error de autenticación',
                    text: 'No se pudo obtener el ID de usuario. Por favor, inicie sesión de nuevo.',
                    icon: 'error',
                    timer: 4000,
                    showConfirmButton: false
                });
                return;
            }
        }

        try {
            const userData = await getUser(currentUserId);
            if (userData) {
                domElements.profileName.textContent = userData.name || '';
                domElements.userUsername.textContent = userData.username || '';
                domElements.userEmail.textContent = userData.email || '';
                domElements.userPhone.textContent = userData.phone || '';

                if (userData.rol && userData.rol.displayName) {
                    domElements.userRole.textContent = userData.rol.displayName.toUpperCase();
                } else {
                    domElements.userRole.textContent = 'ROL NO DISPONIBLE';
                }

                if (userData.registrationDate) {
                    const registrationDate = new Date(userData.registrationDate);
                    domElements.userJoinDate.textContent = `Se unió el ${registrationDate.toLocaleDateString('es-ES')}`;
                } else {
                    domElements.userJoinDate.textContent = 'Fecha de unión no disponible';
                }

                domElements.profileImage.src = userData.profilePictureUrl || '../../img/configImg/profilePhoto.png';
            }
        } catch (error) {
            console.error('Error al cargar los datos del usuario:', error);
            Swal.fire({
                title: 'Error al cargar perfil',
                text: 'No se pudieron cargar los datos del perfil.',
                icon: 'error',
                timer: 4000,
                showConfirmButton: false
            });
        }
    }

    async function handleSaveClick() {
        if (!currentUserId) {
            Swal.fire({
                title: 'Guardado fallido',
                text: 'No se puede guardar sin un ID de usuario.',
                icon: 'warning',
                timer: 4000,
                showConfirmButton: false
            });
            return;
        }

        // Usa FormData directamente
        const formData = new FormData();
        formData.append('name', domElements.nameInput.value.trim());
        formData.append('email', domElements.emailInput.value.trim());
        formData.append('phone', domElements.phoneInput.value.trim());

        if (selectedFile) {
            formData.append('profilePicture', selectedFile);
        }

        try {
            console.log('Datos que se enviarán en el FormData:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Llama al servicio con el FormData completo
            await updateUser(currentUserId, formData);

            await loadProfileData();

            // Limpieza UI
            domElements.profileCard.classList.remove('edit-mode');
            domElements.saveProfileBtn.style.display = 'none';
            domElements.cancelEditBtn.style.display = 'none';
            selectedFile = null;
            domElements.photoInput.value = '';

            Swal.fire({
                title: '¡Éxito!',
                text: '¡Datos actualizados con éxito!',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            Swal.fire({
                title: 'Error al guardar',
                text: 'No se pudo guardar la información. Por favor, intente de nuevo.',
                icon: 'error',
                timer: 4000,
                showConfirmButton: false
            });
        }
    }


    domElements.editProfileBtn.addEventListener('click', () => {
        domElements.profileCard.classList.add('edit-mode');
        domElements.dropdownMenu.classList.remove('show');
        domElements.saveProfileBtn.style.display = 'inline-block';
        domElements.cancelEditBtn.style.display = 'inline-block';
        domElements.nameInput.value = domElements.profileName.textContent.trim();
        domElements.emailInput.value = domElements.userEmail.textContent.trim();
        domElements.phoneInput.value = domElements.userPhone.textContent.trim();
    });

    domElements.saveProfileBtn.addEventListener('click', handleSaveClick);

    domElements.cancelEditBtn.addEventListener('click', () => {
        domElements.profileCard.classList.remove('edit-mode');
        domElements.saveProfileBtn.style.display = 'none';
        domElements.cancelEditBtn.style.display = 'none';
        loadProfileData();
        selectedFile = null;
        domElements.photoInput.value = '';
    });

    domElements.moreOptionsBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        domElements.dropdownMenu.classList.toggle('show');
    });

    loadProfileData();
});
