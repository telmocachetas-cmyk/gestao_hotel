function initGallery() {
    updateHeaderStats();
    setupTabListeners();
}

function setupTabListeners() {
    const tabLinks = [...document.querySelectorAll('.main-nav .nav-link')];
    const panels = [...document.querySelectorAll('.tab-pane')];
    const tabTitle = document.getElementById('currentTabTitle');
    const tabDescription = document.getElementById('currentTabDescription');
    const tabKicker = document.getElementById('currentTabKicker');
    const tabInfo = {
        quartos: { title: 'Gestão de Quartos', description: 'Visualize e gerencie todos os quartos do hotel', kicker: 'OPERAÇÕES' },
        reservas: { title: 'Reservas e Tarifas', description: 'Consulte estadias, estados e tarifas do hotel', kicker: 'HOSPEDAGENS' },
        'nova-reserva': { title: 'Nova Reserva', description: 'Registe uma estadia e consulte o preço antes de confirmar', kicker: 'NOVA ESTADIA' },
        dashboard: { title: 'Dashboard de Gestão', description: 'Acompanhe a operação e o desempenho do Solar do Mar', kicker: 'ANÁLISE' },
        galeria: { title: 'Solar do Mar Hotel & SPA', description: 'Descubra o hotel e os serviços disponíveis', kicker: 'O HOTEL' }
    };

    function activateTab(id, updateLocation) {
        if (!tabInfo[id]) id = 'quartos';
        panels.forEach(panel => {
            const active = panel.id === id;
            panel.classList.toggle('active', active);
            panel.classList.toggle('show', active);
            panel.setAttribute('aria-hidden', String(!active));
        });
        tabLinks.forEach(link => {
            const active = link.hash === `#${id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        const info = tabInfo[id];
        if (tabTitle) tabTitle.textContent = info.title;
        if (tabDescription) tabDescription.textContent = info.description;
        if (tabKicker) tabKicker.textContent = info.kicker;
        if (updateLocation && window.location.hash !== `#${id}`) window.location.hash = id;
        if (id === 'dashboard') requestAnimationFrame(updateDashboard);
    }

    tabLinks.forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        activateTab(link.hash.slice(1), true);
    }));
    window.addEventListener('hashchange', () => activateTab(window.location.hash.slice(1), false));
    activateTab(window.location.hash.slice(1), false);
}

function loadGalleryData() {
    updateHeaderStats();
}

document.addEventListener('DOMContentLoaded', initGallery);
