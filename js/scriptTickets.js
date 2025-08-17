const API_URL = "https://retoolapi.dev/K5cKBM/tbTickets";

const estados = {
  'En espera': 'en-espera-list',
  'En progreso': 'en-progreso-list',
  'Completado': 'completado-list'
};

const badgeColors = {
  'En espera': 'danger',
  'En progreso': 'warning',
  'Completado': 'success'
};

// SVG copiados de Figma para cada estado
const calendarIcons = {
  'En espera': `
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
  <g clip-path="url(#clip0_76_620)">
    <path d="M17.4167 1.78116H14.8438V0.593658C14.8439 0.436185 14.7814 0.285121 14.6701 0.173697C14.5588 0.0622731 14.4079 -0.000383159 14.2504 -0.00048814C14.0929 -0.000593122 13.9419 0.0618618 13.8304 0.173137C13.719 0.284413 13.6564 0.435394 13.6562 0.592866V1.78116H10.0938V0.593658C10.0938 0.515685 10.0785 0.438466 10.0487 0.366409C10.0189 0.294352 9.97522 0.228869 9.92013 0.173697C9.86503 0.118526 9.7996 0.0747466 9.72758 0.0448599C9.65557 0.0149731 9.57837 -0.000436168 9.5004 -0.000488149C9.34292 -0.000593131 9.19186 0.0618618 9.08043 0.173137C8.96901 0.284413 8.90635 0.435394 8.90625 0.592866V1.78116H5.34375V0.593658C5.3438 0.515685 5.3285 0.438466 5.29871 0.366409C5.26891 0.294352 5.22522 0.228869 5.17012 0.173697C5.11503 0.118526 5.0496 0.0747466 4.97758 0.0448599C4.90557 0.0149731 4.82837 -0.000436168 4.7504 -0.000488149C4.59292 -0.000593131 4.44186 0.0618618 4.33044 0.173137C4.21901 0.284413 4.15635 0.435394 4.15625 0.592866V1.78116H1.58333C1.16354 1.78116 0.760937 1.94786 0.464027 2.24463C0.167118 2.54139 0.000209894 2.94391 0 3.3637V17.4158C0 17.8357 0.166815 18.2384 0.463748 18.5354C0.76068 18.8323 1.16341 18.9991 1.58333 18.9991H17.4167C17.8366 18.9991 18.2393 18.8323 18.5363 18.5354C18.8332 18.2384 19 17.8357 19 17.4158V3.3637C18.9998 2.94391 18.8329 2.54139 18.536 2.24463C18.2391 1.94786 17.8365 1.78116 17.4167 1.78116ZM17.8125 17.4166C17.8125 17.5214 17.7709 17.622 17.6968 17.6962C17.6228 17.7704 17.5223 17.8122 17.4175 17.8124H1.58333C1.47835 17.8124 1.37767 17.7707 1.30344 17.6965C1.2292 17.6222 1.1875 17.5216 1.1875 17.4166V3.36449C1.18771 3.25965 1.22951 3.15917 1.30372 3.08511C1.37793 3.01104 1.47849 2.96945 1.58333 2.96945H4.15625V4.15695C4.15615 4.31442 4.2186 4.46549 4.32988 4.57691C4.44115 4.68833 4.59213 4.75099 4.7496 4.7511C4.90708 4.7512 5.05814 4.68875 5.16956 4.57747C5.28099 4.46619 5.34365 4.31521 5.34375 4.15774V2.96945H8.90625V4.15695C8.90615 4.31442 8.9686 4.46549 9.07988 4.57691C9.19115 4.68833 9.34213 4.75099 9.4996 4.7511C9.65708 4.7512 9.80814 4.68875 9.91957 4.57747C10.031 4.46619 10.0936 4.31521 10.0938 4.15774V2.96945H13.6562V4.15695C13.6561 4.31442 13.7186 4.46549 13.8299 4.57691C13.9412 4.68833 14.0921 4.75099 14.2496 4.7511C14.4071 4.7512 14.5581 4.68875 14.6696 4.57747C14.781 4.46619 14.8436 4.31521 14.8438 4.15774V2.96945H17.4167C17.5214 2.96966 17.6217 3.01135 17.6958 3.08539C17.7698 3.15943 17.8115 3.25978 17.8117 3.36449L17.8125 17.4166Z" fill="#DC2F02"/>
    <path d="M4.15625 7.125H6.53125V8.90625H4.15625V7.125ZM4.15625 10.0938H6.53125V11.875H4.15625V10.0938ZM4.15625 13.0625H6.53125V14.8438H4.15625V13.0625ZM8.3125 13.0625H10.6875V14.8438H8.3125V13.0625ZM8.3125 10.0938H10.6875V11.875H8.3125V10.0938ZM8.3125 7.125H10.6875V8.90625H8.3125V7.125ZM12.4688 13.0625H14.8438V14.8438H12.4688V13.0625ZM12.4688 10.0938H14.8438V11.875H12.4688V10.0938ZM12.4688 7.125H14.8438V8.90625H12.4688V7.125Z" fill="#DC2F02"/>
  </g>
  <defs>
    <clipPath id="clip0_76_620">
      <rect width="19" height="19" fill="white"/>
    </clipPath>
  </defs>
</svg>
  `,
  'En progreso': `
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
  <g clip-path="url(#clip0_77_697)">
    <path d="M17.4167 1.78116H14.8438V0.593658C14.8439 0.436185 14.7814 0.285121 14.6701 0.173697C14.5588 0.0622731 14.4079 -0.000383159 14.2504 -0.00048814C14.0929 -0.000593122 13.9419 0.0618618 13.8304 0.173137C13.719 0.284413 13.6564 0.435394 13.6562 0.592866V1.78116H10.0938V0.593658C10.0938 0.515685 10.0785 0.438466 10.0487 0.366409C10.0189 0.294352 9.97522 0.228869 9.92013 0.173697C9.86503 0.118526 9.7996 0.0747466 9.72758 0.0448599C9.65557 0.0149731 9.57837 -0.000436168 9.5004 -0.000488149C9.34292 -0.000593131 9.19186 0.0618618 9.08043 0.173137C8.96901 0.284413 8.90635 0.435394 8.90625 0.592866V1.78116H5.34375V0.593658C5.3438 0.515685 5.3285 0.438466 5.29871 0.366409C5.26891 0.294352 5.22522 0.228869 5.17012 0.173697C5.11503 0.118526 5.0496 0.0747466 4.97758 0.0448599C4.90557 0.0149731 4.82837 -0.000436168 4.7504 -0.000488149C4.59292 -0.000593131 4.44186 0.0618618 4.33044 0.173137C4.21901 0.284413 4.15635 0.435394 4.15625 0.592866V1.78116H1.58333C1.16354 1.78116 0.760937 1.94786 0.464027 2.24463C0.167118 2.54139 0.000209894 2.94391 0 3.3637V17.4158C0 17.8357 0.166815 18.2384 0.463748 18.5354C0.76068 18.8323 1.16341 18.9991 1.58333 18.9991H17.4167C17.8366 18.9991 18.2393 18.8323 18.5363 18.5354C18.8332 18.2384 19 17.8357 19 17.4158V3.3637C18.9998 2.94391 18.8329 2.54139 18.536 2.24463C18.2391 1.94786 17.8365 1.78116 17.4167 1.78116ZM17.8125 17.4166C17.8125 17.5214 17.7709 17.622 17.6968 17.6962C17.6228 17.7704 17.5223 17.8122 17.4175 17.8124H1.58333C1.47835 17.8124 1.37767 17.7707 1.30344 17.6965C1.2292 17.6222 1.1875 17.5216 1.1875 17.4166V3.36449C1.18771 3.25965 1.22951 3.15917 1.30372 3.08511C1.37793 3.01104 1.47849 2.96945 1.58333 2.96945H4.15625V4.15695C4.15615 4.31442 4.2186 4.46549 4.32988 4.57691C4.44115 4.68833 4.59213 4.75099 4.7496 4.7511C4.90708 4.7512 5.05814 4.68875 5.16956 4.57747C5.28099 4.46619 5.34365 4.31521 5.34375 4.15774V2.96945H8.90625V4.15695C8.90615 4.31442 8.9686 4.46549 9.07988 4.57691C9.19115 4.68833 9.34213 4.75099 9.4996 4.7511C9.65708 4.7512 9.80814 4.68875 9.91957 4.57747C10.031 4.46619 10.0936 4.31521 10.0938 4.15774V2.96945H13.6562V4.15695C13.6561 4.31442 13.7186 4.46549 13.8299 4.57691C13.9412 4.68833 14.0921 4.75099 14.2496 4.7511C14.4071 4.7512 14.5581 4.68875 14.6696 4.57747C14.781 4.46619 14.8436 4.31521 14.8438 4.15774V2.96945H17.4167C17.5214 2.96966 17.6217 3.01135 17.6958 3.08539C17.7698 3.15943 17.8115 3.25978 17.8117 3.36449L17.8125 17.4166Z" fill="#F48C06"/>
    <path d="M4.15625 7.125H6.53125V8.90625H4.15625V7.125ZM4.15625 10.0938H6.53125V11.875H4.15625V10.0938ZM4.15625 13.0625H6.53125V14.8438H4.15625V13.0625ZM8.3125 13.0625H10.6875V14.8438H8.3125V13.0625ZM8.3125 10.0938H10.6875V11.875H8.3125V10.0938ZM8.3125 7.125H10.6875V8.90625H8.3125V7.125ZM12.4688 13.0625H14.8438V14.8438H12.4688V13.0625ZM12.4688 10.0938H14.8438V11.875H12.4688V10.0938ZM12.4688 7.125H14.8438V8.90625H12.4688V7.125Z" fill="#F48C06"/>
  </g>
  <defs>
    <clipPath id="clip0_77_697">
      <rect width="19" height="19" fill="white"/>
    </clipPath>
  </defs>
</svg>
  `,
  'Completado': `
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
  <g clip-path="url(#clip0_77_776)">
    <path d="M17.4167 1.78116H14.8438V0.593658C14.8439 0.436185 14.7814 0.285121 14.6701 0.173697C14.5588 0.0622731 14.4079 -0.000383159 14.2504 -0.00048814C14.0929 -0.000593122 13.9419 0.0618618 13.8304 0.173137C13.719 0.284413 13.6564 0.435394 13.6562 0.592866V1.78116H10.0938V0.593658C10.0938 0.515685 10.0785 0.438466 10.0487 0.366409C10.0189 0.294352 9.97522 0.228869 9.92013 0.173697C9.86503 0.118526 9.7996 0.0747466 9.72758 0.0448599C9.65557 0.0149731 9.57837 -0.000436168 9.5004 -0.000488149C9.34292 -0.000593131 9.19186 0.0618618 9.08043 0.173137C8.96901 0.284413 8.90635 0.435394 8.90625 0.592866V1.78116H5.34375V0.593658C5.3438 0.515685 5.3285 0.438466 5.29871 0.366409C5.26891 0.294352 5.22522 0.228869 5.17012 0.173697C5.11503 0.118526 5.0496 0.0747466 4.97758 0.0448599C4.90557 0.0149731 4.82837 -0.000436168 4.7504 -0.000488149C4.59292 -0.000593131 4.44186 0.0618618 4.33044 0.173137C4.21901 0.284413 4.15635 0.435394 4.15625 0.592866V1.78116H1.58333C1.16354 1.78116 0.760937 1.94786 0.464027 2.24463C0.167118 2.54139 0.000209894 2.94391 0 3.3637V17.4158C0 17.8357 0.166815 18.2384 0.463748 18.5354C0.76068 18.8323 1.16341 18.9991 1.58333 18.9991H17.4167C17.8366 18.9991 18.2393 18.8323 18.5363 18.5354C18.8332 18.2384 19 17.8357 19 17.4158V3.3637C18.9998 2.94391 18.8329 2.54139 18.536 2.24463C18.2391 1.94786 17.8365 1.78116 17.4167 1.78116ZM17.8125 17.4166C17.8125 17.5214 17.7709 17.622 17.6968 17.6962C17.6228 17.7704 17.5223 17.8122 17.4175 17.8124H1.58333C1.47835 17.8124 1.37767 17.7707 1.30344 17.6965C1.2292 17.6222 1.1875 17.5216 1.1875 17.4166V3.36449C1.18771 3.25965 1.22951 3.15917 1.30372 3.08511C1.37793 3.01104 1.47849 2.96945 1.58333 2.96945H4.15625V4.15695C4.15615 4.31442 4.2186 4.46549 4.32988 4.57691C4.44115 4.68833 4.59213 4.75099 4.7496 4.7511C4.90708 4.7512 5.05814 4.68875 5.16956 4.57747C5.28099 4.46619 5.34365 4.31521 5.34375 4.15774V2.96945H8.90625V4.15695C8.90615 4.31442 8.9686 4.46549 9.07988 4.57691C9.19115 4.68833 9.34213 4.75099 9.4996 4.7511C9.65708 4.7512 9.80814 4.68875 9.91957 4.57747C10.031 4.46619 10.0936 4.31521 10.0938 4.15774V2.96945H13.6562V4.15695C13.6561 4.31442 13.7186 4.46549 13.8299 4.57691C13.9412 4.68833 14.0921 4.75099 14.2496 4.7511C14.4071 4.7512 14.5581 4.68875 14.6696 4.57747C14.781 4.46619 14.8436 4.31521 14.8438 4.15774V2.96945H17.4167C17.5214 2.96966 17.6217 3.01135 17.6958 3.08539C17.7698 3.15943 17.8115 3.25978 17.8117 3.36449L17.8125 17.4166Z" fill="#32C91E"/>
    <path d="M4.15625 7.125H6.53125V8.90625H4.15625V7.125ZM4.15625 10.0938H6.53125V11.875H4.15625V10.0938ZM4.15625 13.0625H6.53125V14.8438H4.15625V13.0625ZM8.3125 13.0625H10.6875V14.8438H8.3125V13.0625ZM8.3125 10.0938H10.6875V11.875H8.3125V10.0938ZM8.3125 7.125H10.6875V8.90625H8.3125V7.125ZM12.4688 13.0625H14.8438V14.8438H12.4688V13.0625ZM12.4688 10.0938H14.8438V11.875H12.4688V10.0938ZM12.4688 7.125H14.8438V8.90625H12.4688V7.125Z" fill="#32C91E"/>
  </g>
  <defs>
    <clipPath id="clip0_77_776">
      <rect width="19" height="19" fill="white"/>
    </clipPath>
  </defs>
</svg>
  `
};

async function obtenerTickets() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    const tickets = await res.json();
    mostrarDatos(tickets);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
  }
}

function mostrarDatos(ticketsData) {
  const conteoEstados = {
    'En espera': 0,
    'En progreso': 0,
    'Completado': 0
  };

  // Vacía cada contenedor
  Object.values(estados).forEach(id => {
    const c = document.getElementById(id);
    if (c) c.innerHTML = '';
  });

  ticketsData.forEach(ticket => {
    const estado = ticket.status;
    conteoEstados[estado]++;

    const container = document.getElementById(estados[estado]);
    if (!container) {
      console.warn(`Contenedor para estado "${estado}" no existe.`);
      return;
    }

    // Ajuste de campos: usa `id`, `userId` y `updateDate`
    const rawId    = ticket.id;
    const rawDate  = ticket.updateDate;
    const rawUser  = ticket.userId;

    // Formatea número de ticket
    const ticketNumber = String(rawId).padStart(4, '0');

    // Formatea fecha (DD/MM/YYYY)
    const creationDate = rawDate
      ? new Date(rawDate).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      : 'N/A';

    // Construye la tarjeta
    const card = document.createElement('div');
    card.className = 'ticket-card mb-3';
    


    card.innerHTML = `
      <h6>${ticket.title}</h6>
      <p class="mb-1 datos">
        <small>#${ticketNumber} · ${rawUser || 'N/A'}</small>
      </p>
      <div class="ticket-fecha">
        ${calendarIcons[estado] || ''}
        <p class="mb-0 ms-1"><small>${creationDate}</small></p>
      </div>

    <div class="dropdown">
        <button class="status-badge status-${badgeColors[estado] || 'default'} dropdown-toggle" 
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                data-ticket-id="${ticket.id}"
                data-ticket-status="${ticket.status}">
            <span>${ticket.status}</span>
        </button>
        <ul class="dropdown-menu">
            <li style="cursor: pointer"><a class="dropdown-item" data-new-status="En espera">En espera</a></li>
            <li style="cursor: pointer"><a class="dropdown-item" data-new-status="En progreso">En progreso</a></li>
            <li style="cursor: pointer"><a class="dropdown-item" data-new-status="Completado">Completado</a></li>
        </ul>

        <div class="chat-button" id="chatButton">
          <i class="fas fa-comment-alt"></i>
        </div>
    </div>
      
    `;


    //EventListener para cada elemento del dropdown
    card.addEventListener('click', (event) => {
        // Asegura que el evento no se propague
        event.stopPropagation();

        const dropdownItem = event.target.closest('.dropdown-item');
        if (dropdownItem) {
            const ticketId = event.currentTarget.querySelector('button').dataset.ticketId;
            const newStatus = dropdownItem.dataset.newStatus;
            
            // Llama a la función de actualización
            actualizarEstadoTicket(ticketId, newStatus);
        }
    });

    card.querySelector('.chat-button').addEventListener('click', (event) => {
        // Detiene la propagación para evitar que el click de la tarjeta se active
        event.stopPropagation();
        window.location.href = 'chat.html';
    });

    container.appendChild(card);
  });

  async function actualizarEstadoTicket(ticketId, newStatus){
    try {
        // La URL para actualizar un ticket específico
        const updateURL = `${API_URL}/${ticketId}`;
        
        const res = await fetch(updateURL, {
            method: 'PATCH', // O 'PUT', dependiendo de tu API
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) {
            throw new Error(`Error al actualizar el ticket: ${res.status}`);
        }

        console.log(`Ticket ${ticketId} actualizado a estado: ${newStatus}`);
        
        // Vuelve a cargar los datos para reflejar los cambios
        obtenerTickets();

    } catch (error) {
        console.error("Error al actualizar el estado del ticket:", error);
    }
  }

  
  // Actualiza contadores
  document.querySelector('#en-espera-header-count').innerText   = `(${conteoEstados['En espera']})`;
  document.querySelector('#en-progreso-header-count').innerText = `(${conteoEstados['En progreso']})`;
  document.querySelector('#completado-header-count').innerText   = `(${conteoEstados['Completado']})`;
}



// Llamada inicial para que se carguen los datos que vienen del servidor
obtenerTickets();