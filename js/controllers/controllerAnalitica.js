import {
    getTicketCounts,
    fetchNewUsersData
} from '../services/serviceAnalitica.js';



let nuevosUsuariosChart = null;

document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

document.addEventListener('DOMContentLoaded', async () => {

    // --- VALORES CONFIGURABLES ---
    const rendimientoValue = 75; // Valor de 0 a 100
    const progresoValue = 35; // Valor de 0 a 100

    

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

    /**
 * Inicializa o actualiza el gráfico de nuevos usuarios con usuarios registrados en cada mes
 * @param {object} chartData - Un objeto con las propiedades `categories` y `values`.
 */
   function initNuevosUsuariosChart(chartData) {
        var options = {
            series: [{
                name: 'Usuarios',
                data: chartData.values
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
                categories: chartData.categories,
                labels: {
                    style: {
                        colors: '#6c757d',
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                max: Math.max(...chartData.values) + 10,
                min: 0,
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

    const newUsersData = await fetchNewUsersData();

    // --- INICIALIZAR TODO ---
    initRendimientoChart(rendimientoValue);
    initNuevosUsuariosChart(newUsersData); // <- Se llama a la nueva función de ApexCharts
    initProgresoChart(progresoValue);
    loadTicketCounts();


    /**
 * @name loadTicketCounts
 * @description Obtiene los datos del servicio y actualiza los elementos HTML con los conteos de tickets.
 */
async function loadTicketCounts() {
    try {
        const counts = await getTicketCounts(); // Espera a que la respuesta de la API llegue

        // Actualiza los elementos con los IDs específicos en tu HTML
        if (document.getElementById('ticketsEnProcesoNumber')) {
            document.getElementById('ticketsEnProcesoNumber').textContent = counts.enProceso;
        }
        if (document.getElementById('ticketsCerradosNumber')) {
            document.getElementById('ticketsCerradosNumber').textContent = counts.cerradas;
        }
        if (document.getElementById('ticketsEnEsperaNumber')) {
            document.getElementById('ticketsEnEsperaNumber').textContent = counts.enEspera;
        }

        // Actualiza los títulos y descripciones (ya que populateCards fue eliminada)
            document.getElementById('ticketsEnProcesoTitle').textContent = 'Tickets En Proceso';
            document.getElementById('ticketsEnProcesoDescription').textContent = 'Solicitudes siendo gestionadas. Uno o más agentes se encargan.';

            document.getElementById('ticketsCerradosTitle').textContent = 'Tickets Completados';
            document.getElementById('ticketsCerradosDescription').textContent = 'Solicitudes que han sido resueltas. Los casos son almacenados.';

            document.getElementById('ticketsEnEsperaTitle').textContent = 'Tickets En Espera';
            document.getElementById('ticketsEnEsperaDescription').textContent = 'Solicitudes a la espera de acción. Todavía no han sido atendidos';


    } catch (error) {
        console.error("No se pudo cargar el conteo de tickets:", error);
    }
}



});