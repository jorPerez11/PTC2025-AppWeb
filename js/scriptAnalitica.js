document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

document.addEventListener('DOMContentLoaded', () => {

    // --- VALORES CONFIGURABLES ---
    const rendimientoValue = 75; // Valor de 0 a 100
    const progresoValue = 35; // Valor de 0 a 100

    // --- FUNCIÓN PARA POPULAR TARJETAS DE RESUMEN ---
    function populateCards() {
        const cardData = {
            ticketsEnProceso: { title: 'Tickets En Proceso', number: 20, description: 'Solicitudes siendo gestionadas. Uno o más agentes se encargan.' },
            ticketsCerrados: { title: 'Tickets Completados', number: 37, description: 'Solicitudes que han sido resueltas. Los casos son almacenados.' },
            ticketsEnEspera: { title: 'Tickets En Espera', number: 5, description: 'Solicitudes a la espera de acción. Todavía no han sido atendidos' }
        };
        for (const [key, value] of Object.entries(cardData)) {
            if (document.getElementById(`${key}Title`)) {
                document.getElementById(`${key}Title`).textContent = value.title;
                document.getElementById(`${key}Number`).textContent = value.number;
                document.getElementById(`${key}Description`).textContent = value.description;
            }
        }
    }

    // --- FUNCIÓN PARA ANIMAR NÚMEROS ---
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.innerText = Math.floor(progress * (end - start) + start) + '%';
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    // --- 1. LÓGICA PARA GRÁFICO DE RENDIMIENTO (PERSONALIZADO) ---
    function initRendimientoChart(value) {
        const needle = document.getElementById('gaugeNeedle');
        const starsContainer = document.getElementById('rendimientoStars');
        const rotation = (value / 100) * 180 - 90;
        const starCount = Math.max(1, Math.ceil(value / 20));

        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
            starsHTML += `<i class="bi ${i < starCount ? 'bi-star-fill' : 'bi-star'}"></i>`;
        }
        starsContainer.innerHTML = starsHTML;

        setTimeout(() => { needle.style.transform = `rotate(${rotation}deg)`; }, 100);
    }

    // --- 2. LÓGICA PARA GRÁFICO DE NUEVOS USUARIOS (APEXCHARTS) ---
    function initNuevosUsuariosChart() {
        var options = {
            series: [{
                name: 'Usuarios',
                data: [50, 12, 22, 40, 44, 22]
            }],
            chart: {
                height: 250,
                type: 'bar',
                toolbar: { show: false },
                fontFamily: 'Montserrat, sans-serif'
            },
            plotOptions: {
                bar: {
                    borderRadius: 2,
                    columnWidth: '60%',
                }
            },
            dataLabels: { enabled: false },
            colors: ['#f48c06'],
            xaxis: {
                categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                labels: {
                    style: {
                        colors: '#6c757d',
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                max: 50,
                tickAmount: 5, // Define el número de divisiones en el eje Y (50, 40, 30, 20, 10, 0)
                labels: {
                    style: {
                        colors: '#6c757d',
                        fontSize: '12px'
                    }
                }
            },
            grid: {
                borderColor: '#f1f1f1',
                strokeDashArray: 4,
                yaxis: { lines: { show: true } },
                xaxis: { lines: { show: false } }
            }
        };

        var chart = new ApexCharts(document.querySelector("#barChartApex"), options);
        chart.render();
    }

    // --- 3. LÓGICA PARA GRÁFICO DE PROGRESO (PERSONALIZADO) ---
    function initProgresoChart(value) {
        const circle = document.getElementById('donutFill');
        const percentageLabel = document.getElementById('donutPercentage');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (value / 100) * circumference;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;

        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
            animateValue(percentageLabel, 0, value, 1500);
        }, 100);
    }

    // --- INICIALIZAR TODO ---
    populateCards();
    initRendimientoChart(rendimientoValue);
    initNuevosUsuariosChart(); // <- Se llama a la nueva función de ApexCharts
    initProgresoChart(progresoValue);
});