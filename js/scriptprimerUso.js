document.addEventListener('DOMContentLoaded', function() {
    const botonHamburguesa = document.getElementById('botonHamburguesa');
    const navbarContenido = document.getElementById('navbar');

    if (botonHamburguesa && navbarContenido) {
        botonHamburguesa.addEventListener('click', function() {
            // Bootstrap Toggle maneja la clase 'show' en navbarContenido
            // la clase 'aria-expanded' de Bootstrap determina si navbar esta expandido
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                // Si el menú se va a expandir (aria-expanded es true después del clic y la clase navbar-scrolled es añadida)
                navbar.classList.add('navbar-scrolled');
            } else if (window.scrollY < 50){
                // Si el menú se va a colapsar y scroll es menor a 50 (aria-expanded es false después del clic y la clase navbar-scrolled es eliminada)
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }
});