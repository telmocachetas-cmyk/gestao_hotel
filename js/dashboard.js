const dashboardMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const dashboardCurrency = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function getDashboardYear() {
    const yearSelect = document.getElementById('dashYear');
    return Number(yearSelect && yearSelect.value) || new Date().getFullYear();
}

function reservationNights(reservation) {
    const start = new Date(reservation.checkIn + 'T00:00:00Z');
    const end = new Date(reservation.checkOut + 'T00:00:00Z');
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return 0;
    return Math.round((end - start) / 86400000);
}

function getDashboardData(year) {
    const yearReservations = reservas.filter(reservation => new Date(reservation.checkIn + 'T00:00:00Z').getUTCFullYear() === year);
    const activeReservations = yearReservations.filter(reservation => reservation.status === 'ativa');
    const monthlyRevenue = Array(12).fill(0);
    const monthlyNights = Array(12).fill(0);

    activeReservations.forEach(reservation => {
        const checkIn = new Date(reservation.checkIn + 'T00:00:00Z');
        const checkOut = new Date(reservation.checkOut + 'T00:00:00Z');
        const nights = reservationNights(reservation);
        if (nights === 0) return;

        monthlyRevenue[checkIn.getUTCMonth()] += Number(reservation.precoTotal) || 0;
        for (let date = new Date(checkIn); date < checkOut; date.setUTCDate(date.getUTCDate() + 1)) {
            if (date.getUTCFullYear() === year) monthlyNights[date.getUTCMonth()]++;
        }
    });

    const roomCount = quartos.length;
    const monthlyOccupancy = monthlyNights.map((nights, month) => {
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        return roomCount ? Math.min(100, Math.round((nights / (roomCount * daysInMonth)) * 100)) : 0;
    });
    const totalRevenue = monthlyRevenue.reduce((total, value) => total + value, 0);
    const bookedNights = monthlyNights.reduce((total, value) => total + value, 0);
    const yearNights = (new Date(Date.UTC(year + 1, 0, 1)) - new Date(Date.UTC(year, 0, 1))) / 86400000;
    const occupancy = roomCount ? Math.round((bookedNights / (roomCount * yearNights)) * 100) : 0;

    return { yearReservations, activeReservations, monthlyRevenue, monthlyNights, monthlyOccupancy, totalRevenue, bookedNights, occupancy };
}

function setDashboardText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function drawDashboardChart(canvasId, values, options) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const padding = { top: 15, right: 12, bottom: 30, left: options.percent ? 34 : 48 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    if (plotWidth <= 0 || plotHeight <= 0) return;
    const maxValue = options.percent ? 100 : Math.max(100, Math.ceil(Math.max(...values) / 100) * 100);
    const x = index => padding.left + (index / (values.length - 1)) * plotWidth;
    const y = value => padding.top + plotHeight - (value / maxValue) * plotHeight;

    context.font = '11px Arial, sans-serif';
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.strokeStyle = '#edf0f3';
    context.fillStyle = '#8a929b';
    for (let step = 0; step <= 4; step++) {
        const value = maxValue * step / 4;
        const lineY = y(value);
        context.beginPath();
        context.moveTo(padding.left, lineY);
        context.lineTo(width - padding.right, lineY);
        context.stroke();
        context.fillText(options.percent ? Math.round(value) + '%' : dashboardCurrency.format(value), padding.left - 7, lineY);
    }

    context.textAlign = 'center';
    context.textBaseline = 'top';
    dashboardMonths.forEach((month, index) => context.fillText(month, x(index), height - padding.bottom + 9));

    if (options.bars) {
        const barWidth = Math.min(22, (plotWidth / values.length) * 0.48);
        values.forEach((value, index) => {
            const barHeight = Math.max(0, (value / maxValue) * plotHeight);
            context.fillStyle = '#be9a65';
            context.beginPath();
            context.fillRect(x(index) - barWidth / 2, y(value), barWidth, barHeight);
        });
        return;
    }

    context.beginPath();
    values.forEach((value, index) => {
        if (index === 0) context.moveTo(x(index), y(value));
        else context.lineTo(x(index), y(value));
    });
    context.lineTo(x(values.length - 1), padding.top + plotHeight);
    context.lineTo(x(0), padding.top + plotHeight);
    context.closePath();
    const gradient = context.createLinearGradient(0, padding.top, 0, padding.top + plotHeight);
    gradient.addColorStop(0, 'rgba(190, 154, 101, 0.22)');
    gradient.addColorStop(1, 'rgba(190, 154, 101, 0.01)');
    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    values.forEach((value, index) => {
        if (index === 0) context.moveTo(x(index), y(value));
        else context.lineTo(x(index), y(value));
    });
    context.strokeStyle = '#be9a65';
    context.lineWidth = 2.5;
    context.lineJoin = 'round';
    context.stroke();
    values.forEach((value, index) => {
        context.beginPath();
        context.arc(x(index), y(value), 3, 0, Math.PI * 2);
        context.fillStyle = '#fff';
        context.fill();
        context.strokeStyle = '#be9a65';
        context.lineWidth = 2;
        context.stroke();
    });
}

function updateRoomStatusSummary() {
    const total = quartos.length;
    const counts = {
        ocupado: quartos.filter(room => room.status === 'ocupado').length,
        disponivel: quartos.filter(room => room.status === 'disponivel').length,
        manutencao: quartos.filter(room => room.status === 'manutencao').length
    };
    setDashboardText('occupiedCount', counts.ocupado);
    setDashboardText('availableCount', counts.disponivel);
    setDashboardText('maintenanceCount', counts.manutencao);
    setDashboardText('roomAvailability', `${counts.disponivel} disponíveis · ${counts.manutencao} em manutenção`);
    setDashboardText('occupancySummary', `${total ? Math.round(counts.ocupado / total * 100) : 0}% da capacidade`);
    [['occupiedBar', counts.ocupado], ['availableBar', counts.disponivel], ['maintenanceBar', counts.manutencao]].forEach(([id, count]) => {
        const bar = document.getElementById(id);
        if (bar) bar.style.width = `${total ? count / total * 100 : 0}%`;
    });
}

function updateRecentReservations(data) {
    const body = document.getElementById('recentReservations');
    if (!body) return;
    body.replaceChildren();
    const recent = [...data.yearReservations]
        .sort((a, b) => b.checkIn.localeCompare(a.checkIn) || b.id - a.id)
        .slice(0, 5);

    if (recent.length === 0) {
        const row = body.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.className = 'empty-state';
        cell.textContent = 'Ainda não existem reservas para este ano.';
        return;
    }

    recent.forEach(reservation => {
        const row = body.insertRow();
        const guest = row.insertCell();
        const avatar = document.createElement('span');
        avatar.className = 'guest-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = (reservation.cliente || '?').trim().charAt(0).toUpperCase();
        guest.appendChild(avatar);
        const guestName = document.createElement('strong');
        guestName.className = 'guest-name';
        guestName.textContent = reservation.cliente;
        guest.appendChild(guestName);

        const roomCell = row.insertCell();
        const room = quartos.find(item => item.id === reservation.quartoId);
        roomCell.textContent = room ? `Quarto ${room.numero}` : '—';
        const datesCell = row.insertCell();
        datesCell.textContent = `${formatDate(reservation.checkIn)} – ${formatDate(reservation.checkOut)}`;
        const statusCell = row.insertCell();
        const badge = document.createElement('span');
        badge.className = `status-pill ${reservation.status === 'ativa' ? 'status-active' : 'status-cancelled'}`;
        badge.textContent = reservation.status === 'ativa' ? 'Confirmada' : 'Cancelada';
        statusCell.appendChild(badge);
        const priceCell = row.insertCell();
        priceCell.className = 'text-end';
        priceCell.textContent = dashboardCurrency.format(Number(reservation.precoTotal) || 0);
    });
}

function updateRevenueBreakdown(monthlyRevenue) {
    const container = document.getElementById('managementInfo');
    if (!container) return;
    const maximum = Math.max(...monthlyRevenue, 1);
    container.replaceChildren();
    dashboardMonths.forEach((month, index) => {
        const row = document.createElement('div');
        row.className = 'revenue-month';
        const label = document.createElement('span');
        label.className = 'revenue-month-label';
        label.textContent = month;
        const track = document.createElement('span');
        track.className = 'revenue-track';
        const fill = document.createElement('span');
        fill.className = 'revenue-fill';
        fill.style.width = `${monthlyRevenue[index] / maximum * 100}%`;
        track.appendChild(fill);
        const amount = document.createElement('strong');
        amount.className = 'revenue-amount';
        amount.textContent = dashboardCurrency.format(monthlyRevenue[index]);
        row.append(label, track, amount);
        container.appendChild(row);
    });
}

function updateDashboard() {
    if (typeof quartos === 'undefined' || typeof reservas === 'undefined') return;
    syncDashboardYears();
    const year = getDashboardYear();
    const data = getDashboardData(year);
    const activeRooms = quartos.filter(room => room.status === 'ocupado').length;
    setDashboardText('totalRooms', quartos.length);
    setDashboardText('occupiedRooms', activeRooms);
    setDashboardText('totalReservations', data.activeReservations.length);
    setDashboardText('yearRevenue', dashboardCurrency.format(data.totalRevenue));
    setDashboardText('reservationSummary', `${data.yearReservations.length} no total · ${data.yearReservations.filter(item => item.status === 'cancelada').length} canceladas`);
    setDashboardText('revenueSummary', `Receita de ${year}`);
    setDashboardText('daysBooked', data.bookedNights);
    setDashboardText('occupancyRate', `${data.occupancy}%`);
    setDashboardText('avgRevenue', dashboardCurrency.format(data.bookedNights ? data.totalRevenue / data.bookedNights : 0));
    setDashboardText('cancellations', data.yearReservations.filter(item => item.status === 'cancelada').length);
    updateRoomStatusSummary();
    updateRecentReservations(data);
    updateRevenueBreakdown(data.monthlyRevenue);
    drawDashboardChart('occupancyChart', data.monthlyOccupancy, { percent: true });
    drawDashboardChart('revenueChart', data.monthlyRevenue, { bars: true });
}

function syncDashboardYears() {
    const yearSelect = document.getElementById('dashYear');
    if (!yearSelect) return;
    const selectedYear = Number(yearSelect.value);
    const years = [...new Set(reservas.map(reservation => new Date(reservation.checkIn + 'T00:00:00Z').getUTCFullYear()).filter(Number.isFinite))].sort((a, b) => b - a);
    if (!years.length) years.push(new Date().getFullYear());
    yearSelect.replaceChildren();
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
    yearSelect.value = String(years.includes(selectedYear) ? selectedYear : years[0]);
}

function initializeDashboard() {
    syncDashboardYears();
    const yearSelect = document.getElementById('dashYear');
    if (yearSelect) yearSelect.addEventListener('change', updateDashboard);
    const refresh = document.getElementById('refreshDashboard');
    if (refresh) refresh.addEventListener('click', updateDashboard);
    const exportButton = document.getElementById('exportDashboard');
    if (exportButton) exportButton.addEventListener('click', exportDashboardCsv);
    updateDashboard();
}

function exportDashboardCsv() {
    const year = getDashboardYear();
    const data = getDashboardData(year);
    const rows = [
        ['Mês', 'Receita confirmada (€)', 'Noites reservadas', 'Ocupação (%)'],
        ...dashboardMonths.map((month, index) => [month, data.monthlyRevenue[index], data.monthlyNights[index], data.monthlyOccupancy[index]])
    ];
    const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solar-do-mar-dashboard-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

window.addEventListener('resize', () => {
    if (document.getElementById('dashboard') && document.getElementById('dashboard').classList.contains('active')) updateDashboard();
});
