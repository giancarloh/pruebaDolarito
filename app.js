document.addEventListener('DOMContentLoaded', () => {
    const officialRateElement = document.getElementById('official-rate');
    const parallelRateElement = document.getElementById('parallel-rate');
    const averageRateElement = document.getElementById('average-rate');
    const updateTimeElement = document.getElementById('update-time');
    const currentYearElement = document.getElementById('current-year');
    const amountInput = document.getElementById('amount-input');
    const resultElement = document.getElementById('result');
    const copyButton = document.getElementById('copy-result');
    const themeToggle = document.getElementById('theme-toggle');
    const customRateInput = document.getElementById('custom-rate-input');
    const customRateValue = document.getElementById('custom-rate-value');

    let officialRate = 0;
    let averageRate = 0;
    let parallelRate = 0;
    let currentRate = 0;
    let currentMode = 'bs-to-usd';

    currentYearElement.textContent = new Date().getFullYear();

    async function fetchRates() {
        try {
            const officialResponse = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
            const officialData = await officialResponse.json();
            const parallelResponse = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo');
            const parallelData = await parallelResponse.json();

            averageRate = (officialData.promedio + parallelData.promedio) / 2;

            officialRate = officialData.promedio;
            parallelRate = parallelData.promedio;

            officialRateElement.textContent = `Bs. ${officialRate.toFixed(2)}`;
            parallelRateElement.textContent = `Bs. ${parallelRate.toFixed(2)}`;
            averageRateElement.textContent = `Bs. ${averageRate.toFixed(2)}`;
            
            const updateTime = new Date(officialData.fechaActualizacion);
            updateTimeElement.innerHTML = `<strong>Última actualización:</strong><br>${updateTime.toLocaleString('es-VE', { timeZone: 'America/Caracas' })}`;

            updateCurrentRate();
        } catch (error) {
            console.error('Error fetching rates:', error);
            officialRateElement.textContent = 'Error al cargar';
            parallelRateElement.textContent = 'Error al cargar';
            averageRateElement.textContent = 'Error al cargar';
        }
    }

    function updateCurrentRate() {
        const selectedRate = document.getElementById('rate-select').value;
        if (selectedRate === 'custom') {
            customRateInput.style.display = 'block';
            currentRate = parseFloat(customRateValue.value) || 0;
        } else {
            customRateInput.style.display = 'none';
            switch (selectedRate) {
                case 'official':
                    currentRate = officialRate;
                    break;
                case 'average':
                    currentRate = averageRate;
                    break;
                case 'parallel':
                    currentRate = parallelRate;
                    break;
            }
        }
        calculate();
    }

    function calculate() {
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount)) {
            resultElement.textContent = 'Por favor, ingrese un monto válido.';
            return;
        }

        let result;
        if (currentMode === 'bs-to-usd') {
            result = amount / currentRate;
            resultElement.textContent = `${amount.toFixed(2)} Bs = $${result.toFixed(2)}`;
        } else {
            result = amount * currentRate;
            resultElement.textContent = `$${amount.toFixed(2)} = ${result.toFixed(2)} Bs`;
        }
    }

    copyButton.addEventListener('click', () => {
        const selectedRate = document.getElementById('rate-select').value;
        let rateValue;
        let rateTypeText;
        
        if (selectedRate === 'custom') {
            rateValue = parseFloat(customRateValue.value) || 0;
            rateTypeText = `Dólar Personalizado (Bs. ${rateValue.toFixed(2)})`;
        } else {
            rateValue = {
                'official': officialRate,
                'average': averageRate,
                'parallel': parallelRate
            }[selectedRate];
            
            rateTypeText = {
                'official': `Dólar Oficial BCV`,
                'average': `Dólar Promedio`,
                'parallel': `Dólar Paralelo`
            }[selectedRate];
        }
        
        // Parse the current result to get the values
        const resultText = resultElement.textContent;
        let calculatedResult = '';
        let amount, convertedAmount;
        
        if (currentMode === 'bs-to-usd') {
            const match = resultText.match(/(\d+\.\d+)\s+Bs\s+=\s+\$(\d+\.\d+)/);
            if (match) {
                amount = match[1];
                convertedAmount = match[2];
                calculatedResult = `¡ Calculado en https://dolarito.online !\n*$ ${convertedAmount} USD* equivalen a *Bs ${amount}*\nTasa De Cambio Aplicada: *Bs ${rateValue.toFixed(2)}*\n\n¿Necesitas verificar otra cantidad?\n¡Visitanos ya! `;
            }
        } else {
            const match = resultText.match(/\$(\d+\.\d+)\s+=\s+(\d+\.\d+)\s+Bs/);
            if (match) {
                amount = match[1];
                convertedAmount = match[2];
                calculatedResult = `¡ Calculado en https://dolarito.online !\n*$ ${amount} USD* equivalen a *Bs ${convertedAmount}*\nTasa De Cambio Aplicada: *Bs ${rateValue.toFixed(2)}*\n\n¿Necesitas verificar otra cantidad?\n¡Visitanos ya! `;
            }
        }
        
        const shareText = encodeURIComponent(calculatedResult);
        const whatsappUrl = `https://wa.me/?text=${shareText}`;
        
        window.open(whatsappUrl, '_blank');
    });

    const conversionSelect = document.getElementById('conversion-select');
    
    conversionSelect.addEventListener('change', () => {
        currentMode = conversionSelect.value;
        if (currentMode === 'bs-to-usd') {
            amountInput.placeholder = 'Ingrese monto en Bolívares';
        } else {
            amountInput.placeholder = 'Ingrese monto en Dólares';
        }
        calculate();
    });

    amountInput.addEventListener('input', calculate);

    const rateSelect = document.getElementById('rate-select');
    rateSelect.addEventListener('change', updateCurrentRate);

    customRateValue.addEventListener('input', updateCurrentRate);

    // Theme toggle functionality
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
        document.body.classList.toggle('dark-mode', savedTheme === 'true');
        themeToggle.checked = savedTheme === 'true';
    } else {
        document.body.classList.toggle('dark-mode', prefersDark.matches);
        themeToggle.checked = prefersDark.matches;
    }
    
    const createAnimatedToggleIcons = () => {
        const slider = document.querySelector('.slider');
        
        const moonSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        moonSVG.setAttribute('class', 'moon-icon');
        moonSVG.setAttribute('width', '16');
        moonSVG.setAttribute('height', '16');
        moonSVG.setAttribute('viewBox', '0 0 24 24');
        moonSVG.setAttribute('fill', 'none');
        moonSVG.setAttribute('stroke', 'currentColor');
        moonSVG.setAttribute('stroke-width', '2');
        moonSVG.setAttribute('stroke-linecap', 'round');
        moonSVG.setAttribute('stroke-linejoin', 'round');
        moonSVG.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        moonSVG.style.position = 'absolute';
        moonSVG.style.left = '5px';
        moonSVG.style.top = '7px';
        moonSVG.style.color = '#fff';
        moonSVG.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        moonSVG.style.opacity = themeToggle.checked ? '0' : '1';
        moonSVG.style.transform = themeToggle.checked ? 'scale(0.7)' : 'scale(1)';
        
        const sunSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sunSVG.setAttribute('class', 'sun-icon');
        sunSVG.setAttribute('width', '16');
        sunSVG.setAttribute('height', '16');
        sunSVG.setAttribute('viewBox', '0 0 24 24');
        sunSVG.setAttribute('fill', 'none');
        sunSVG.setAttribute('stroke', 'currentColor');
        sunSVG.setAttribute('stroke-width', '2');
        sunSVG.setAttribute('stroke-linecap', 'round');
        sunSVG.setAttribute('stroke-linejoin', 'round');
        sunSVG.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        sunSVG.style.position = 'absolute';
        sunSVG.style.right = '5px';
        sunSVG.style.top = '7px';
        sunSVG.style.color = '#FDB813';
        sunSVG.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        sunSVG.style.opacity = themeToggle.checked ? '1' : '0';
        sunSVG.style.transform = themeToggle.checked ? 'scale(1)' : 'scale(0.7)';
        
        slider.appendChild(moonSVG);
        slider.appendChild(sunSVG);
        
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', themeToggle.checked);
            localStorage.setItem('darkMode', themeToggle.checked);
            
            moonSVG.style.opacity = themeToggle.checked ? '0' : '1';
            moonSVG.style.transform = themeToggle.checked ? 'scale(0.7)' : 'scale(1)';
            sunSVG.style.opacity = themeToggle.checked ? '1' : '0';
            sunSVG.style.transform = themeToggle.checked ? 'scale(1)' : 'scale(0.7)';
        });
    };
    
    createAnimatedToggleIcons();
    
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', themeToggle.checked);
        localStorage.setItem('darkMode', themeToggle.checked);
    });

    fetchRates();
    setInterval(fetchRates, 300000);
});
