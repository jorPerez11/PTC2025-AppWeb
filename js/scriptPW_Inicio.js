document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
});

$(document).ready(function () {
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

    $('#open-daterange-picker').on('click', function () {
        daterangePickerInstance.show();
    });


    // Opciones para el gráfico de Solicitudes (Barra)
    var solicitudesOptions = {
        chart: {
            type: 'bar',
            height: '100%', // El gráfico ocupará el 100% de la altura de su contenedor CSS
            width: '100%', // El gráfico ocupará el 100% del ancho de su contenedor CSS
            toolbar: {
                show: false
            },
            background: 'transparent'
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
        }],
        xaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Poppins, Arial, sans-serif',
                    fontWeight: 400,
                    cssClass: 'apexcharts-xaxis-label',
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Poppins, Arial, sans-serif',
                    fontWeight: 400,
                    cssClass: 'apexcharts-yaxis-label',
                }
            }
        },
        dataLabels: {
            enabled: false,
            style: {
                fontSize: '12px',
                fontFamily: 'Poppins, Arial, sans-serif',
                fontWeight: 'bold',
            }
        },
        plotOptions: {
            bar: {
                distributed: true, // Para usar los fillColors definidos
                horizontal: false,
                columnWidth: '90%', // Ancho de las barras
            }
        },
        grid: {
            show: true
        }
    };
    var chart1 = new ApexCharts(document.querySelector("#chart1"), solicitudesOptions);
    chart1.render();


    // Opciones para el gráfico de Productividad (Donut)
    var productividadOptions = {
        series: [36, 30, 34],
        chart: {
            type: 'donut',
            height: 0, // **Altura por defecto para DESKTOP GRANDE**. Coincide con el min-height del CSS.
            width: '100%',
            toolbar: {
                show: false
            },
            background: 'transparent'
        },
        labels: ['Tickets en Espera', 'Tickets en Proceso', 'Tickets Cerrados'],
        colors: ['#2196F3', '#00BCD4', '#00E396'],
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '60%', // Valor por defecto (desktop más grande)
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Total',
                            fontSize: '18px',
                            fontFamily: 'Poppins',
                            fontWeight: 'bold',
                            color: '#333333',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => {
                                    return a + b
                                }, 0) + '%'
                            }
                        },
                        value: {
                            show: true,
                            fontFamily: 'Poppins',
                            fontWeight: 'bold'
                        }
                    }
                }
            }
        },
        legend: {
            position: 'left', // Valor por defecto (desktop más grande)
            offsetY: 80,
            height: 150, // Altura de la leyenda, ajústala si es muy grande
            fontSize: '14px',
            fontFamily: 'Poppins',
            fontWeight: 'normal',
            labels: {
                colors: '#333333',
                useSeriesColors: false
            },
            markers: {
                width: 10,
                height: 10,
                radius: 5,
                offsetX: -5
            },
            itemMargin: {
                vertical: 8
            },
            formatter: function (seriesName, opts) {
                return seriesName + " " + opts.w.globals.series[opts.seriesIndex] + "%"
            }
        },
        responsive: [
            // Móviles: hasta 767.98px
            {
                breakpoint: 768, // Esto cubre de 0px a 767.98px
                options: {
                    chart: {
                        height: 400, // **AJUSTE CLAVE PARA TABLET**. Un poco más grande, leyenda puede ir abajo.
                    },
                    legend: {
                        position: 'bottom', // **LEYENDA ABAJO PARA TABLET** si el espacio horizontal es limitado
                        horizontalAlign: 'center',
                        fontSize: '13px',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 0
                        }
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '65%', // Tamaño de donut intermedio
                                labels: {
                                    total: {
                                        fontSize: '16px',
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // Tabletas: 768px a 991.98px
            {
                breakpoint: 992, // Esto cubre de 768px a 991.98px
                options: {
                    chart: {
                        height: 400, // **AJUSTE CLAVE PARA TABLET**. Un poco más grande, leyenda puede ir abajo.
                    },
                    legend: {
                        position: 'bottom', // **LEYENDA ABAJO PARA TABLET** si el espacio horizontal es limitado
                        offsetY: 0,
                        horizontalAlign: 'center',
                        fontSize: '13px',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 0
                        }
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '65%', // Tamaño de donut intermedio
                                labels: {
                                    total: {
                                        fontSize: '16px',
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // Desktop: 992px y más
            {
                breakpoint: 1667, // Esto cubre de 992px a 1199.98px (desktop mediano)
                options: {
                    chart: {
                        height: 370, // **AJUSTE CLAVE PARA DESKTOP MEDIANO**. Menor que el por defecto.
                    },
                    legend: {
                        position: 'bottom', // Leyenda a la izquierda para desktop
                        offsetY: 0,
                        height: 150,
                        fontSize: '14px',
                        itemMargin: {
                            vertical: 8
                        }
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '60%', // Tamaño de donut más grande
                                labels: {
                                    total: {
                                        fontSize: '18px',
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // No se necesita un breakpoint específico para "Extra Large" (1200px y más),
            // ya que las opciones base (`height: 380`, `legend.position: 'left'`) se aplicarán.
        ]
    };

    var chart2 = new ApexCharts(document.querySelector("#chart2"), productividadOptions);
    chart2.render();

});


document.addEventListener('DOMContentLoaded', () => {

    // --- VALORES CONFIGURABLES ---
    const rendimientoValue = 93; // Valor de 0 a 100

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

    // --- INICIALIZAR TODO ---
    initRendimientoChart(rendimientoValue);
});