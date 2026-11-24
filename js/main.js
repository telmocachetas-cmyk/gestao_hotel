// ============================
// INICIALIZAÇÃO DO SISTEMA
// ============================

// Inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de Gestão Hoteleira - Solar do Mar iniciado');
    
    // Carregar dados iniciais
    loadRooms();
    loadReservations();
    loadRoomOptions();
    initializeDashboard();
    generateMiniCalendar();
    
    // Adicionar listeners para atualizar preço estimado
    const roomSelect = document.getElementById('roomSelect');
    const checkInDate = document.getElementById('checkInDate');
    const checkOutDate = document.getElementById('checkOutDate');
    
    if (roomSelect) {
        roomSelect.addEventListener('change', updatePriceEstimate);
    }
    
    if (checkInDate) {
        checkInDate.addEventListener('change', updatePriceEstimate);
    }
    
    if (checkOutDate) {
        checkOutDate.addEventListener('change', updatePriceEstimate);
    }
    
    const reservationYear = new Date().getFullYear();
    const minDate = `${reservationYear}-01-01`;
    const maxDate = `${reservationYear}-12-31`;
    
    if (checkInDate) {
        checkInDate.min = minDate;
        checkInDate.max = maxDate;
    }
    
    if (checkOutDate) {
        checkOutDate.min = minDate;
        checkOutDate.max = maxDate;
    }
    
    // Mensagem de boas-vindas
    setTimeout(() => {
        showMessage('Bem-vindo ao sistema de gestão do Solar do Mar!', 'info');
    }, 1000);
    
    // Atualizar contador de quartos no header
    updateHeaderStats();
    const footerYear = document.getElementById('footerYear');
    if (footerYear) footerYear.textContent = reservationYear;
});

// Atualizar estatísticas no header
function updateHeaderStats() {
    const headerRooms = document.getElementById('headerRoomsCount');
    if (headerRooms) {
        headerRooms.textContent = quartos.length;
    }
}

// Sobrescrever a função showMessage para design novo
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('reservationMessage');
    if (!messageElement) return;
    
    let icon = 'i';
    let className = 'alert-info';
    
    if (type === 'success') {
        icon = '✓';
        className = 'alert-success';
    } else if (type === 'danger' || type === 'error') {
        icon = '!';
        className = 'alert-danger';
    } else if (type === 'warning') {
        icon = '!';
        className = 'alert-warning';
    }
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert ${className}`;
    alertElement.setAttribute('role', 'alert');
    const symbol = document.createElement('strong');
    symbol.className = 'alert-symbol';
    symbol.textContent = icon;
    alertElement.append(symbol, document.createTextNode(` ${message}`));
    messageElement.replaceChildren(alertElement);

    setTimeout(() => {
        if (alertElement.parentNode === messageElement) alertElement.remove();
    }, 5000);
}

function generateMiniCalendar() {
    const calendar = document.getElementById('miniCalendar');
    if (!calendar) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const title = document.getElementById('miniCalendarTitle');
    if (title) title.textContent = `Disponibilidade — ${now.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}`;
    calendar.replaceChildren();

    ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(day => {
        const label = document.createElement('span');
        label.className = 'calendar-weekday';
        label.textContent = day;
        calendar.appendChild(label);
    });
    for (let blank = 0; blank < firstDay; blank++) {
        const empty = document.createElement('span');
        empty.className = 'calendar-empty';
        calendar.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateCell = document.createElement('span');
        dateCell.className = 'calendar-day';
        dateCell.textContent = day;
        calendar.appendChild(dateCell);
    }
}