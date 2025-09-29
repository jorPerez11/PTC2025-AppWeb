import { getTicketCounts } from '../services/serviceDashboard.js';

let ticketCounts = {
    enEspera: 0,
    enProceso: 0,
    cerradas: 0
};

// Espera a que el DOM esté completamente cargado para inicializar todo
document.addEventListener('DOMContentLoaded', function () {
    // 1. Inicialización de Tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // 2. Lógica para cargar la data de graficos
    initDashboardData();

    // 3. Lógica para el gráfico de Rendimiento
    const rendimientoValue = 93; // Valor de 0 a 100
    initRendimientoChart(rendimientoValue);
});

async function initDashboardData() {
    // 1. Espera a que los datos se carguen y actualicen 'ticketCounts'
    await loadTicketCounts(); 
    
    // 2. Ahora que los datos están cargados, inicializa los gráficos
    initCharts();
}

$(document).ready(function () {
    // 1. Inicialización del daterangepicker
    $('input[name="dates"]').daterangepicker({
        locale: {
            format: 'MM/DD/YYYY',
            separator: ' - ',
            applyLabel: 'Aplicar',
            cancelLabel: 'Cancelar',
            fromLabel: 'Desde',
            toLabel: 'Hasta',
            customRangeLabel: 'Rango Personalizado',
            weekLabel: 'S',
            daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
            monthNames: [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ],
            firstDay: 1
        },
        startDate: moment().subtract(29, 'days'),
        endDate: moment()
    });

    const daterangePickerInstance = $('input[name="dates"]').data('daterangepicker');

    $('#open-daterange-picker').on('click', function () {
        daterangePickerInstance.show();
    });
});


function initCharts(){

    const totalTickets = ticketCounts.enEspera + ticketCounts.enProceso + ticketCounts.cerradas;
    const percEspera = totalTickets > 0 ? (ticketCounts.enEspera / totalTickets) * 100 : 0;
    const percProceso = totalTickets > 0 ? (ticketCounts.enProceso / totalTickets) * 100 : 0;
    const percCerradas = totalTickets > 0 ? (ticketCounts.cerradas / totalTickets) * 100 : 0;

    // 2. Lógica de los gráficos (sin cambios, según tu petición)
    var solicitudesOptions = {
        chart: {
            type: 'bar',
            height: '100%',
            width: '100%',
            toolbar: { show: false },
            background: 'transparent'
        },
        series: [{
            data: [{ x: 'En Proceso', y: ticketCounts.enProceso , fillColor: '#FF7753' }, { x: 'Cerradas', y: ticketCounts.cerradas, fillColor: '#79DA66' }, { x: 'En Espera', y: ticketCounts.enEspera, fillColor: '#DC2F02' }]
        }],
        xaxis: { labels: { style: { fontSize: '12px', fontFamily: 'Poppins, Arial, sans-serif', fontWeight: 400, cssClass: 'apexcharts-xaxis-label' } } },
        yaxis: { labels: { style: { fontSize: '12px', fontFamily: 'Poppins, Arial, sans-serif', fontWeight: 400, cssClass: 'apexcharts-yaxis-label' } } },
        dataLabels: { enabled: false, style: { fontSize: '12px', fontFamily: 'Poppins, Arial, sans-serif', fontWeight: 'bold' } },
        plotOptions: { bar: { distributed: true, horizontal: false, columnWidth: '90%' } },
        grid: { show: true }
    };
    var chart1 = new ApexCharts(document.querySelector("#chart1"), solicitudesOptions);
    chart1.render();

    var productividadOptions = {
        series: [Math.round(percEspera), Math.round(percProceso), Math.round(percCerradas)],
        chart: {
            type: 'donut',
            height: 0,
            width: '100%',
            toolbar: { show: false },
            background: 'transparent'
        },
        labels: ['Tickets en Espera', 'Tickets en Proceso', 'Tickets Cerrados'],
        colors: ['#2196F3', '#00BCD4', '#00E396'],
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '60%', labels: { show: true, total: { show: true, showAlways: true, label: 'Total', fontSize: '25px', fontFamily: 'Poppins', fontWeight: 'bold', color: '#333333', formatter: function (w) { return w.globals.seriesTotals.reduce((a, b) => { return a + b }, 0) + '%' } }, value: { show: true, fontFamily: 'Poppins', fontWeight: 'bold' } } } } },
        legend: { position: 'left', offsetY: 80, height: 150, fontSize: '14px', fontFamily: 'Poppins', fontWeight: 'normal', labels: { colors: '#333333', useSeriesColors: false }, markers: { width: 10, height: 10, radius: 5, offsetX: -5 }, itemMargin: { vertical: 8 }, formatter: function (seriesName, opts) { return seriesName + " " + opts.w.globals.series[opts.seriesIndex] + "%" } },
        responsive: [{ breakpoint: 768, options: { chart: { height: 400 }, legend: { position: 'bottom', horizontalAlign: 'center', offsetY: 0, fontSize: '13px', itemMargin: { horizontal: 8, vertical: 0 } }, plotOptions: { pie: { donut: { size: '65%', labels: { total: { fontSize: '16px' } } } } } } }, { breakpoint: 992, options: { chart: { height: 400 }, legend: { position: 'left', offsetY: 100, fontSize: '13px', itemMargin: { horizontal: 80, vertical: 0 } }, plotOptions: { pie: { donut: { size: '65%', labels: { total: { fontSize: '16px' } } } } } } }, { breakpoint: 1667, options: { chart: { height: 370 }, legend: { position: 'bottom', offsetY: 0, height: 150, fontSize: '14px', itemMargin: { vertical: 8 } }, plotOptions: { pie: { donut: { size: '60%', labels: { total: { fontSize: '18px' } } } } } } }]
    };
    var chart2 = new ApexCharts(document.querySelector("#chart2"), productividadOptions);
    chart2.render();
}

/**
 * @name loadTicketCounts
 * @description Obtiene los datos del servicio y actualiza los elementos HTML con los conteos de tickets.
 * @CORRECCIÓN: Se agrega 'async' y 'await'.
 */
async function loadTicketCounts() { // <-- Agrega la palabra clave 'async' aquí
    try {
        const counts = await getTicketCounts(); // <-- Agrega 'await' aquí para esperar la respuesta

        ticketCounts = counts;

        if (document.getElementById('tickets-en-proceso')) {
            document.getElementById('tickets-en-proceso').textContent = counts.enProceso;
        }
        if (document.getElementById('tickets-cerradas')) {
            document.getElementById('tickets-cerradas').textContent = counts.cerradas;
        }
        if (document.getElementById('tickets-en-espera')) {
            document.getElementById('tickets-en-espera').textContent = counts.enEspera;
        }
    } catch (error) {
        console.error("No se pudo cargar el conteo de tickets:", error);
    }
}

/**
 * @name initRendimientoChart
 * @description Lógica para el gráfico de rendimiento personalizado.
 * @param {number} value - El valor de rendimiento de 0 a 100.
 */
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