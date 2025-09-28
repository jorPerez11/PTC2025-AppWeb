// js/controllers/controllerConfig.js

import { getUserId, getUser, updateUser } from '../services/serviceConfig.js';

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
        phoneInput: document.getElementById('phone-input')
    };

    let currentUserId = null;
    let selectedFile = null;
    let editMode = 'view'; // 'view', 'photo', 'full'
    let isPhotoInputActive = false; // Control de estado

    // ELIMINACIÓN RADICAL DE TODOS LOS PHOTOINPUTS
    function destroyAllPhotoInputs() {

        // BUSCAR Y ELIMINAR TODOS LOS INPUTS DE ARCHIVO
        const allFileInputs = document.querySelectorAll('input[type="file"]');
        console.log(`🔍 Encontrados ${allFileInputs.length} inputs de archivo`);

        allFileInputs.forEach((input, index) => {
            console.log(`❌ Eliminando photoInput ${index + 1}:`, input.id || input.name || 'sin id');
            input.remove();
        });

        // BUSCAR ESPECÍFICAMENTE POR ID
        const photoInputById = document.getElementById('photo-input');
        if (photoInputById) {
            photoInputById.remove();
        }

        // BUSCAR POR NOMBRE
        const photoInputsByName = document.querySelectorAll('input[name="photo-input"]');
        photoInputsByName.forEach((input, index) => {
            console.log(`❌ Eliminando photoInput por nombre ${index + 1}:`, input.name);
            input.remove();
        });

        console.log('Todos los photoInputs eliminados');
    }

    // CREAR PHOTOINPUT ÚNICO Y CONTROLADO
    function createControlledPhotoInput() {
        destroyAllPhotoInputs();

        // CREAR NUEVO PHOTOINPUT CON ATRIBUTOS ESPECÍFICOS
        const photoInput = document.createElement('input');
        photoInput.type = 'file';
        photoInput.id = 'controlled-photo-input';
        photoInput.name = 'controlled-photo-input';
        photoInput.accept = 'image/*';
        photoInput.style.display = 'none';
        photoInput.style.position = 'fixed';
        photoInput.style.left = '-9999px';
        photoInput.style.top = '-9999px';

        document.body.appendChild(photoInput);
        domElements.photoInput = photoInput;

        console.log('PhotoInput controlado creado con éxito');
        return photoInput;
    }

    // INICIALIZAR ESTILOS DE LA IMAGEN
    function initializeImageStyles() {
        domElements.profileImage.style.cursor = 'default';
        domElements.profileImage.style.border = 'none';
        domElements.profileImage.title = '';
    }

    // FUNCIÓN PARA GUARDAR SOLO LA FOTO
    async function saveProfilePictureOnly() {
        if (!currentUserId || !selectedFile) {
            console.log('❌ No hay usuario o archivo seleccionado');
            return;
        }

        try {

            const formData = new FormData();
            formData.append('profilePicture', selectedFile);
            formData.append('name', domElements.profileName.textContent.trim());
            formData.append('email', domElements.userEmail.textContent.trim());
            formData.append('phone', domElements.userPhone.textContent.trim());

            const result = await updateUser(currentUserId, formData);
            console.log('✅ Foto guardada:', result);

            await loadProfileData();

            selectedFile = null;
            if (domElements.photoInput) {
                domElements.photoInput.value = '';
            }
            editMode = 'view';
            isPhotoInputActive = false;

            Swal.fire({
                title: '¡Éxito!',
                text: 'Foto de perfil actualizada correctamente',
                icon: 'success',
                timer: 3000
            });

        } catch (error) {
            console.error('❌ Error al guardar foto:', error);
            Swal.fire('Error', 'No se pudo actualizar la foto de perfil: ' + error.message, 'error');
        }
    }

    // CONFIGURACIÓN DEL PHOTO INPUT CONTROLADO
    function setupControlledPhotoInput() {
        // CREAR PHOTOINPUT CONTROLADO
        const photoInput = createControlledPhotoInput();

        // CONFIGURAR EVENT LISTENER ÚNICO
        photoInput.addEventListener('change', function (e) {

            if (!isPhotoInputActive) {
                console.log('🚫 Evento ignorado - PhotoInput no está activo');
                return;
            }

            const file = e.target.files[0];
            if (file) {
                selectedFile = file;

                // Previsualización inmediata
                const reader = new FileReader();
                reader.onload = function (e) {
                    domElements.profileImage.src = e.target.result;
                    console.log('🖼️ Imagen previsualizada correctamente');

                    // GUARDAR AUTOMÁTICAMENTE SOLO EN MODO "photo"
                    if (editMode === 'photo') {
                        console.log('🔄 MODO PHOTO - Guardando automáticamente...');
                        saveProfilePictureOnly();
                    } else {
                        console.log('📝 MODO FULL - Imagen lista para guardar manualmente');
                    }
                };
                reader.onerror = function (error) {
                    console.error('❌ Error en FileReader:', error);
                    isPhotoInputActive = false;
                };
                reader.readAsDataURL(file);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No se seleccionó archivo válido',
                    text: 'Por favor selecciona un archivo compatible antes de continuar.',
                    confirmButtonText: 'Aceptar'
                });

                selectedFile = null;
            }

            isPhotoInputActive = false;
        });
    }

    // FUNCIÓN SEGURA PARA ACTIVAR PHOTOINPUT
    function safelyActivatePhotoInput() {
        if (isPhotoInputActive) {
            return false;
        }

        if (!domElements.photoInput) {
            return false;
        }

        isPhotoInputActive = true;

        // USAR setTimeout PARA ASEGURAR ACTIVACIÓN
        setTimeout(() => {
            if (domElements.photoInput && isPhotoInputActive) {
                domElements.photoInput.click();
            } else {
                isPhotoInputActive = false;
            }
        }, 50);

        return true;
    }

    // BOTÓN CAMBIAR FOTO - SOLO FOTO
    domElements.changePhotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        editMode = 'photo';

        if (safelyActivatePhotoInput()) {
            console.log('Explorador activado desde "Cambiar foto"');
        }

        domElements.dropdownMenu.classList.remove('show');
    });

    // BOTÓN EDITAR PERFIL - MODO COMPLETO
    domElements.editProfileBtn.addEventListener('click', () => {
        editMode = 'full';
        domElements.profileCard.classList.add('edit-mode');
        domElements.dropdownMenu.classList.remove('show');
        domElements.saveProfileBtn.style.display = 'inline-block';
        domElements.cancelEditBtn.style.display = 'inline-block';
        domElements.nameInput.value = domElements.profileName.textContent.trim();
        domElements.emailInput.value = domElements.userEmail.textContent.trim();
        domElements.phoneInput.value = domElements.userPhone.textContent.trim();

        // Hacer la imagen clickeable SOLO en modo edición
        domElements.profileImage.style.cursor = 'pointer';
        domElements.profileImage.style.border = '3px solid #F48C06';
        domElements.profileImage.title = 'Haz clic para cambiar la foto';
    });

    // CLICK EN LA IMAGEN - SOLO EN MODO EDICIÓN COMPLETA
    domElements.profileImage.addEventListener('click', function (e) {

        // SOLO responder en modo 'full'
        if (editMode === 'full') {
            if (safelyActivatePhotoInput()) {
                console.log('Explorador activado desde imagen');
            }
        } else {
            // PREVENIR COMPORTAMIENTO EN MODO VISUAL
            e.preventDefault();
            e.stopPropagation();
        }
    });

    // PREVENIR CLICS ACCIDENTALES EN LA IMAGEN
    domElements.profileImage.addEventListener('mousedown', function (e) {
        if (editMode !== 'full') {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    // FUNCIÓN PARA CARGAR DATOS
    async function loadProfileData() {

        try {
            if (!currentUserId) {
                currentUserId = await getUserId();
            }

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

                if (domElements.profileImage) {
                    const defaultImage = 'img/configImg/profilePhoto.png';

                    if (userData.profilePictureUrl) {
                        domElements.profileImage.onload = function () {
                        };
                        domElements.profileImage.onerror = function () {
                            console.warn('Error cargando imagen del usuario, usando por defecto');
                            domElements.profileImage.src = defaultImage;
                        };
                        domElements.profileImage.src = userData.profilePictureUrl;
                    } else {
                        domElements.profileImage.src = defaultImage;
                    }
                }
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los datos del perfil.',
                icon: 'error',
                timer: 4000
            });
        }
    }

    // FUNCIÓN PARA GUARDAR (edición completa)
    async function handleSaveClick() {
        if (!currentUserId) {
            Swal.fire('Error', 'ID de usuario no encontrado', 'error');
            return;
        }

        try {
            const name = domElements.nameInput.value.trim();
            const email = domElements.emailInput.value.trim();
            const phone = domElements.phoneInput.value.trim();

            if (!name || !email) {
                Swal.fire('Error', 'Nombre y email son obligatorios', 'warning');
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);

            if (selectedFile) {
                formData.append('profilePicture', selectedFile);
            }

            const result = await updateUser(currentUserId, formData);

            await loadProfileData();

            // RESETEAR COMPLETAMENTE
            resetToViewMode();

            Swal.fire({
                title: '¡Éxito!',
                text: '¡Datos actualizados con éxito!',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error al guardar:', error);
            Swal.fire({
                title: 'Error al guardar',
                text: error.message || 'No se pudo guardar la información.',
                icon: 'error',
                timer: 4000
            });
        }
    }

    // FUNCIÓN PARA RESETEAR A MODO VISUAL
    function resetToViewMode() {
        editMode = 'view';
        domElements.profileCard.classList.remove('edit-mode');
        domElements.saveProfileBtn.style.display = 'none';
        domElements.cancelEditBtn.style.display = 'none';
        selectedFile = null;
        if (domElements.photoInput) {
            domElements.photoInput.value = '';
        }
        isPhotoInputActive = false;

        // RESTAURAR ESTILOS ORIGINALES DE LA IMAGEN
        initializeImageStyles();
    }

    // ASIGNAR EVENT LISTENERS
    domElements.saveProfileBtn.addEventListener('click', handleSaveClick);

    domElements.cancelEditBtn.addEventListener('click', () => {
        resetToViewMode();
        loadProfileData();
    });

    domElements.moreOptionsBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        domElements.dropdownMenu.classList.toggle('show');
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (event) => {
        if (!domElements.moreOptionsBtn.contains(event.target) &&
            !domElements.dropdownMenu.contains(event.target)) {
            domElements.dropdownMenu.classList.remove('show');
        }
    });

    // INICIALIZACIÓN
    function initialize() {
        initializeImageStyles();
        setupControlledPhotoInput();
        loadProfileData();
    }

    // INICIAR LA APLICACIÓN
    initialize();
});