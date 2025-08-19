// Función para aplicar formato al texto
function formatDoc(command, value) {
    document.execCommand(command, false, value);
}

const editNoteModal = document.getElementById('editNoteModal');
editNoteModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    
    // Extrae la información de los atributos data-*
    const noteTitle = button.getAttribute('data-note-title');


    modalNoteTitle.value = noteTitle;
    modalNoteContent.innerHTML = noteContent; // Usa innerHTML para el contenido HTML
});

// Lógica para guardar los cambios
document.getElementById('saveNoteChanges').addEventListener('click', () => {
    const noteTitle = document.getElementById('noteTitle').value;
    const noteContent = document.getElementById('noteContent').innerHTML;
    
    // Aquí puedes enviar los datos a tu API para guardarlos
    console.log("Título guardado:", noteTitle);
    console.log("Contenido guardado:", noteContent);

    // Cierra el modal después de guardar
    const modal = bootstrap.Modal.getInstance(editNoteModal);
    modal.hide();
    
    
     setTimeout(() => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }, 1);

    Swal.fire('¡Guardado!', 'Los cambios se han guardado con éxito.', 'success');

    
    

});