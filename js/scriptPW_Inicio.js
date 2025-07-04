document.addEventListener('DOMContentLoaded', function () {
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
return new bootstrap.Tooltip(tooltipTriggerEl)
    })
});

$(document).ready(function() {
    // Inicialización del daterangepicker
    $('input[name="dates"]').daterangepicker({

        
        locale: {
            format: 'MM/DD/YYYY', // Formato visible en el input del picker
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
            firstDay: 1 // Lunes como primer día de la semana
        },

        startDate: moment().subtract(29, 'days'), // Ejemplo: 30 días atrás
        endDate: moment() 
    })
    
    $('#open-daterange-picker').on('click', function() {
        // Abre el daterangepicker programáticamente
        daterangePickerInstance.show();
    });




    var solicitudes = {
        chart: {
            type: 'bar'
        },
        series: [{
            data: [{
                x: 'Abiertas',
                y: 14,
                fillColor: '#68C0FF',
                }, {
                x: 'En Proceso',
                y: 20,
                fillColor: '#33D8A4',
                }, {
                x: 'Cerradas',
                y: 32,
                fillColor: '#79DA66',
                }, {
                x: 'En Espera',
                y: 6,
                fillColor: '#FF7753'
            }]
        }]
    }
    var chart1 = new ApexCharts(document.querySelector("#chart1"), solicitudes);  
    chart1.render();


    var options = {
        chart: {
            type: 'bar'
        },
        series: [{
            data: [{
                x: 'Abiertas',
                y: 14,
                fillColor: '#68C0FF',
                }, {
                x: 'En Proceso',
                y: 20,
                fillColor: '#33D8A4',
                }, {
                x: 'Cerradas',
                y: 32,
                fillColor: '#333',
                }, {
                x: 'En Espera',
                y: 6,
                fillColor: '#FF7753'
            }]
        }]
    }




    var productividadOptions = {
        series: [36, 30, 34], // Porcentajes de Tickets Atendidos, En Proceso, Cerrados
        chart: {
            type: 'donut',
            height: 400, // Altura del gráfico
            toolbar: {
                show: false
            },
            background: 'transparent' // Fondo transparente
        },
        labels: ['Tickets Atendidos', 'Tickets en Proceso', 'Tickets Cerrados'], // Etiquetas para la leyenda
        colors: ['#2196F3', '#00BCD4', '#00E396'], // Colores para cada sección del donut
        dataLabels: {
            enabled: false // Desactivar etiquetas de datos en las porciones (para que solo se vea "Total 100%")
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '55%', // Tamaño del "agujero" del donut
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Total',
                            fontSize: '16px',
                            fontFamily: 'Poppins', // Usa tu fuente principal
                            fontWeight: 'bold',
                            color: '#333333',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => {
                                    return a + b
                                }, 0) + '%' // Asume que las series suman 100%
                            }
                        },
                        value: {
                            show: true,
                            fontFamily: 'Poppins',
                            fontWeight: 'bold' // Oculta los porcentajes individuales dentro del donut
                        }
                    }
                }
            }
        },
        legend: {
            position: 'left', // Posición de la leyenda (a la izquierda como en tu imagen)
            offsetY: 0,
            height: 150, // Altura para la leyenda
            fontSize: '14px',
            fontFamily: 'Poppins',
            fontWeight: 'normal',
            labels: {
                colors: '#333333', // Color del texto de la leyenda
                useSeriesColors: false // Usa los colores definidos en 'colors' de las series
            },
            markers: {
                width: 10,
                height: 10,
                radius: 5,
                offsetX: -5
            },
            formatter: function(seriesName, opts) {
                // Formatear la leyenda para que muestre el nombre y el porcentaje
                // Asumiendo que tus series son porcentajes
                return seriesName + " " + opts.w.globals.series[opts.seriesIndex] + "%"
            }
        },
        responsive: [{
            // Cuando la pantalla es menor o igual a 768px (breakpoint común para tabletas/móviles)
            breakpoint: 768,
            options: {
                chart: {
                    height: 280, // Ajusta la altura para pantallas más pequeñas
                    width: '100%', // Asegura que el ancho sea 100%
                },
                legend: {
                    position: 'bottom', // Mueve la leyenda a la parte inferior para ahorrar espacio horizontal
                    offsetY: 0, // Resetear el offset si la posición cambia
                    offsetX: 0,
                    horizontalAlign: 'center' // Centrar la leyenda en la parte inferior
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '70%', // Puedes ajustar el tamaño del donut si lo necesitas
                        }
                    }
                }
            }
        },
        {
            // Otro breakpoint, por ejemplo, para móviles muy pequeños
            breakpoint: 480,
            options: {
                chart: {
                    height: 200, // Una altura aún menor para pantallas muy pequeñas
                    width: '100%'
                },
                legend: {
                    position: 'bottom',
                    offsetY: 0,
                    offsetX: 0,
                    horizontalAlign: 'center',
                    fontSize: '12px' // Letra más pequeña para la leyenda
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '80%', // Puedes hacer el donut más pequeño para dejar más espacio al texto si es necesario
                            labels: {
                                total: {
                                    fontSize: '14px', // Ajustar tamaño de "Total 100%"
                                }
                            }
                        }
                    }
                }
            }
        }]
        
    };
    
    var chart2 = new ApexCharts(document.querySelector("#chart2"), productividadOptions);  
    chart2.render();
        
});




