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

// FUNCIÓN PARA CALCULAR EL PROGRESO ANUAL EN PORCENTAJE
    function calculateYearProgress() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 de enero
        const endOfYear = new Date(now.getFullYear() + 1, 0, 1); // 1 de enero del siguiente año

        const totalDuration = endOfYear - startOfYear;
        const elapsedDuration = now - startOfYear;
        const progressPercentage = (elapsedDuration / totalDuration) * 100;

        // se usa math.round() para obtener el redondeado del numero
        return Math.min(100, Math.round(progressPercentage));
    }

document.addEventListener('DOMContentLoaded', async () => {

    // Carga los conteos de tickets primero para calcular el rendimiento
    const ticketCounts = await getTicketCounts();

    const rendimientoValue = calculatePerformanceValue(ticketCounts); // Valor calculado de la efectividad
    const progresoValue = calculateYearProgress(); // Valor de progreso anual
    const rendimientoRating = getPerformanceRating(rendimientoValue);

    

    // FUNCIÓN PARA ANIMAR NÚMEROS 

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

    //  LÓGICA PARA GRÁFICO DE RENDIMIENTO (PERSONALIZADO) 

    function initRendimientoChart(value, rating) {
        const needle = document.getElementById('gaugeNeedle');
        const starsContainer = document.getElementById('rendimientoStars');
        const rendimientoLabel = document.getElementById('rendimientoPercentage');
        
        // MOSTRAR LA CALIFICACIÓN DE TEXTO
        const ratingElement = document.getElementById('rendimientoLabel'); 
        if (ratingElement) {
             ratingElement.textContent = rating; // Actualiza el texto (Excelente, Bueno, etc.)
        }

        if (rendimientoLabel) {
            animateValue(rendimientoLabel, 0, value, 1500);
        }

        // Rotación de la aguja y estrellas
        const rotation = (value / 100) * 180 - 90;
        // La cuenta de estrellas también se ajusta correctamente con valor = 0
        const starCount = Math.max(0, Math.ceil(value / 20)); 

        let starsHTML = '';
        for (let i = 0; i < 5; i++) {
            starsHTML += `<i class="bi ${i < starCount ? 'bi-star-fill' : 'bi-star'}"></i>`;
        }
        starsContainer.innerHTML = starsHTML;

        setTimeout(() => { 
            needle.style.transform = `rotate(${rotation}deg)`; 
        }, 100);
    }

    // LÓGICA PARA GRÁFICO DE NUEVOS USUARIOS (APEXCHARTS) 

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

    // LÓGICA PARA GRÁFICO DE PROGRESO (PERSONALIZADO) 
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

    // INICIALIZAR TODO 
    initRendimientoChart(rendimientoValue, rendimientoRating);
    initNuevosUsuariosChart(newUsersData); 
    initProgresoChart(progresoValue);
    loadTicketCounts();


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


function calculatePerformanceValue(counts) {
    const closed = counts.cerradas || 0;
    const inProgress = counts.enProceso || 0;
    const pending = counts.enEspera || 0;
    
    const totalTickets = closed + inProgress + pending;

    if (totalTickets === 0) {
        // CORRECCIÓN: Si no hay tickets, el rendimiento es 0% (datos insuficientes)
        return 0; 
    }

    const performance = (closed / totalTickets) * 100;
    
    return Math.round(performance);
}

function getPerformanceRating(value) {
    if (value >= 90) return 'Excelente';
    if (value >= 70) return 'Notable';
    if (value >= 50) return 'Bueno';
    if (value >= 25) return 'Aceptable';
    return 'Deficiente';
}


});