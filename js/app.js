document.addEventListener('DOMContentLoaded', function () {

    // Módulo de Utilitários e Efeitos Visuais
    const setupUtilitiesAndEffects = () => {
        // Lógica de Rolagem Suave + Reveal Trigger
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });

                    // Força o reveal imediato de qualquer elemento .reveal dentro da seção de destino
                    targetElement.querySelectorAll('.reveal').forEach(el => {
                        el.classList.add('animate-fade-in');
                    });

                    // Caso a própria seção seja um .reveal (como o #planos às vezes pode estar contido)
                    if (targetElement.classList.contains('reveal')) {
                        targetElement.classList.add('animate-fade-in');
                    }
                }
            });
        });

        // Lógica do Scroll Reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Lógica das Notificações de Compra
        if (window.Notiflix) {
            setInterval(() => {
                const messages = [
                    "<strong>Sucesso!</strong> Alguém acabou de garantir o acesso vitalício.",
                    "<strong>Aproveite!</strong> Um jogador garantiu o acesso vitalício.",
                    "<strong>Imperdível!</strong> Mais um jogador comprou o acesso permanente."
                ];
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                Notiflix.Notify.Success(randomMessage, { position: "left-bottom", plainText: false, timeout: 4000 });
            }, 10000 + Math.random() * 5000);
        }

        // Propagação de parâmetros de URL
        const params = new URLSearchParams(window.location.search);
        if ([...params].length > 0) {
            document.querySelectorAll(".purchase-link").forEach(link => {
                if (link.href && link.href.startsWith('http')) {
                    try {
                        const url = new URL(link.href);
                        params.forEach((value, key) => {
                            url.searchParams.set(key, value);
                        });
                        link.href = url.toString();
                    } catch (e) {
                        console.error("URL de checkout inválida:", link.href);
                    }
                }
            });
        }
    };

    // Módulo da Gamificação
    const setupGamification = () => {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const planosSection = document.getElementById('planos');
        const vitalicioPlanCard = document.getElementById('vitalicio-plan-card');
        let journeyCompleted = false;

        const tasks = {
            activated: { completed: false, points: 30, element: document.getElementById('task-1') },
            testedAim: { completed: false, points: 40, element: document.getElementById('task-2') },
            optimized: { completed: false, points: 30, element: document.getElementById('task-3') }
        };

        const updateGamifiedProgress = () => {
            if (journeyCompleted) return;
            let currentPoints = 0;
            if (tasks.activated.completed) currentPoints += tasks.activated.points;
            if (tasks.testedAim.completed) currentPoints += tasks.testedAim.points;
            if (tasks.optimized.completed) currentPoints += tasks.optimized.points;

            const percentage = Math.round((currentPoints / 100) * 100);
            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (progressText) progressText.textContent = `${percentage}%`;

            if (percentage === 100 && !journeyCompleted) {
                journeyCompleted = true;
                setTimeout(() => {
                    if (window.Notiflix) {
                        Notiflix.Notify.Success('<strong>OFERTA LIBERADA!</strong> Você provou seu valor. Confira o plano especial.', { plainText: false, timeout: 5000, fontSize: '16px', width: '320px' });
                    }
                    if (vitalicioPlanCard) {
                        vitalicioPlanCard.classList.remove('border-red-500', 'pulse-glow');
                        vitalicioPlanCard.classList.add('border-yellow-400');
                        vitalicioPlanCard.style.boxShadow = '0 0 40px rgba(250, 204, 21, 0.5)';
                    }
                    if (planosSection) {
                        planosSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            }
        };

        window.completeTask = (taskName) => {
            if (journeyCompleted || !tasks[taskName] || tasks[taskName].completed) return;
            tasks[taskName].completed = true;

            const taskElement = tasks[taskName].element;
            if (taskElement) {
                taskElement.classList.remove('text-gray-500');
                taskElement.classList.add('text-green-400');
                taskElement.querySelector('i').classList.replace('far', 'fas');
            }

            let achievementText = '';
            if (taskName === 'activated') achievementText = '<strong>CONQUISTA:</strong> Painel Ativado!';
            if (taskName === 'testedAim') achievementText = '<strong>CONQUISTA:</strong> Mira de Elite!';
            if (taskName === 'optimized') achievementText = '<strong>CONQUISTA:</strong> Máquina Otimizada!';

            if (achievementText && window.Notiflix) {
                Notiflix.Notify.Success(achievementText, { plainText: false, timeout: 3000 });
            }

            if (typeof fbq === 'function') {
                fbq('trackCustom', 'JornadaDoCapudo', {
                    mission_completed: taskName
                });
            }
            updateGamifiedProgress();
        };
    };

    // Módulo do Carrossel de Feedback
    const setupCarousel = () => {
        const carouselContent = document.getElementById('carousel-content');
        const dotsContainer = document.getElementById('carousel-dots');
        if (!carouselContent || !dotsContainer) return;

        const feedbackImages = ["https://i.imgur.com/NC8sgSy.png", "https://i.imgur.com/UajvZM1.png", "https://i.imgur.com/6LpvOAk.png", "https://i.imgur.com/Pd7spkl.png", "https://i.imgur.com/3GIql6p.png", "https://i.imgur.com/pRBfwHH.png", "https://i.imgur.com/jHHTrMH.png", "https://i.imgur.com/v7VueRe.png", "https://i.imgur.com/rWUmPO3.png", "https://i.imgur.com/66Z2P2J.png"];
        let currentSlide = 0;

        const getSlidesInView = () => window.innerWidth >= 768 ? 3 : 2;

        const updateCarousel = () => {
            if (!carouselContent || carouselContent.children.length === 0) return;
            const slidesInView = getSlidesInView();
            const maxSlideIndex = Math.max(0, feedbackImages.length - slidesInView);
            if (currentSlide > maxSlideIndex) currentSlide = maxSlideIndex;
            if (currentSlide < 0) currentSlide = 0;
            const itemWidth = carouselContent.children[0].offsetWidth;
            const transformValue = -currentSlide * itemWidth;
            carouselContent.style.transform = `translateX(${transformValue}px)`;

            document.querySelectorAll(".carousel-dot").forEach((dot, index) => {
                dot.classList.toggle("bg-red-500", index === currentSlide);
                dot.classList.toggle("bg-gray-700", index !== currentSlide);
            });
        };

        const renderCarousel = () => {
            const slidesInView = getSlidesInView();
            const slideWidthPercent = 100 / slidesInView;
            carouselContent.innerHTML = feedbackImages.map(src => `<div class="flex-shrink-0 p-2" style="width: ${slideWidthPercent}%"><img src="${src}" class="w-full h-auto rounded-lg" loading="lazy" alt="Feedback de cliente" /></div>`).join("");
            const numDots = Math.max(0, feedbackImages.length - slidesInView + 1);
            dotsContainer.innerHTML = Array.from({ length: numDots }).map((_, index) => `<button data-slide-to="${index}" class="carousel-dot w-2.5 h-2.5 rounded-full transition-colors duration-300"></button>`).join("");
            updateCarousel();
        };

        const navigateCarousel = (direction) => {
            const slidesInView = getSlidesInView();
            const maxSlideIndex = Math.max(0, feedbackImages.length - slidesInView);
            currentSlide += direction;
            if (currentSlide > maxSlideIndex) currentSlide = 0;
            else if (currentSlide < 0) currentSlide = maxSlideIndex;
            updateCarousel();
        };

        document.getElementById("next-slide")?.addEventListener("click", () => navigateCarousel(1));
        document.getElementById("prev-slide")?.addEventListener("click", () => navigateCarousel(-1));
        dotsContainer.addEventListener("click", e => {
            if (e.target.matches(".carousel-dot")) {
                currentSlide = parseInt(e.target.dataset.slideTo);
                updateCarousel();
            }
        });
        window.addEventListener("resize", renderCarousel);
        renderCarousel();
        setInterval(() => navigateCarousel(1), 5000);
    };

    // Módulo do FAQ
    const setupFAQ = () => {
        const faqContainer = document.getElementById('faq-container');
        if (!faqContainer) return;
        const faqData = [{ question: "O Painel FFH4X É seguro?", answer: "Sim! Nossos painéis são 100% seguros, testados e funcionam sem comprometer sua conta." }, { question: "Funciona em todos os celulares?", answer: "Sim, o Painel FFH4X é compatível com todos os dispositivos Android e iOS." }, { question: "Como recebo o acesso após a compra?", answer: "A entrega é 100% imediata. Assim que o pagamento for confirmado, você recebe automaticamente o link de download do painel e todas as instruções de instalação tanto no seu e-mail quanto no seu WhatsApp." }, { question: "Tenho garantia?", answer: "Sim! Oferecemos uma garantia de 7 dias. Se você não sentir uma melhora clara na sua jogabilidade ou não estiver satisfeito, devolvemos seu dinheiro." }];
        let openFaq = 0;

        const renderFaq = () => {
            faqContainer.innerHTML = faqData.map((e, t) => `<div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 ${openFaq === t ? "border-red-500/50" : ""}"><button data-faq-index="${t}" class="faq-toggle w-full flex justify-between items-center text-left p-6 cursor-pointer hover:bg-gray-800/50"><h4 class="font-semibold text-lg text-white pr-4">${e.question}</h4><div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-800/50 rounded-full"><span class="text-red-500 transition-transform duration-300 ${openFaq === t ? "rotate-180" : ""}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></span></div></button><div class="overflow-hidden transition-all duration-500 ease-in-out" style="max-height: ${openFaq === t ? "200px" : "0px"}"><div class="px-6 pb-6 pt-0"><p class="text-gray-400">${e.answer}</p></div></div></div>`).join("");
            document.querySelectorAll(".faq-toggle").forEach(btn => {
                btn.addEventListener("click", e => {
                    const t = parseInt(e.currentTarget.dataset.faqIndex);
                    openFaq = openFaq === t ? null : t;
                    renderFaq();
                });
            });
        };
        renderFaq();
    };

    // Módulo de Rastreamento de Checkout
    const setupTracking = () => {
        document.querySelectorAll('.purchase-link').forEach(link => {
            link.addEventListener("click", function (event) {
                if (typeof fbq !== 'function') return;
                const planCard = event.currentTarget.closest('div[data-plan-name]');
                if (!planCard) return;

                const planName = planCard.dataset.planName;
                const planValue = parseFloat(planCard.dataset.planValue);
                const contentId = `zimo_${planName.toLowerCase().replace(/ /g, '_')}`;

                fbq('track', 'AddToCart', {
                    content_ids: [contentId],
                    content_name: planName,
                    value: planValue,
                    currency: 'BRL'
                });
            });
        });
    };

    // Módulo do Simulador do App
    const setupAppSimulator = () => {
        const mainToggleBtn = document.getElementById('app-main-toggle-btn');
        const floatingPanel = document.getElementById('app-floating-panel');
        const navButtons = document.querySelectorAll('.app-nav-button');
        const panelPages = document.querySelectorAll('.app-panel-page');
        const statusIndicators = document.getElementById('status-indicators');
        const quickFunctions = document.getElementById('quick-functions');
        const statLatency = document.querySelector('[data-stat="latency"]');
        const statFps = document.querySelector('[data-stat="fps"]');
        const statPrecision = document.querySelector('[data-stat="precision"]');
        const allToggles = document.querySelectorAll('input[type="checkbox"]');
        const sensiSliders = document.querySelectorAll('.sensi-slider');
        const applyOptimizationBtn = document.getElementById('apply-optimization-btn');
        const generateConfigButton = document.getElementById('generate-config-button');
        const aiResultDiv = document.getElementById('ai-result');
        let isAppOn = false;
        const BASE_LATENCY = 45, BASE_FPS = 75, MAX_FPS = 120, BASE_PRECISION = 20;

        function updateDashboardStats() {
            if (!isAppOn) {
                if (statLatency) statLatency.textContent = '--';
                if (statFps) statFps.textContent = '--';
                if (statPrecision) statPrecision.textContent = '+0%';
                if (statLatency) [statLatency, statFps, statPrecision].forEach(el => el.classList.remove('text-green-400'));
                return;
            };
            let currentLatency = BASE_LATENCY, currentFps = BASE_FPS, currentPrecision = BASE_PRECISION;
            document.querySelectorAll('input[data-effect]:checked').forEach(toggle => {
                const effect = toggle.dataset.effect, value = parseInt(toggle.dataset.value, 10);
                if (effect === 'latency') currentLatency += value;
                if (effect === 'fps') currentFps += value;
                if (effect === 'precision') currentPrecision += value;
            });
            let totalSensi = 0;
            sensiSliders.forEach(slider => { totalSensi += parseInt(slider.value, 10) });
            currentPrecision += Math.max(0, Math.round((totalSensi / (sensiSliders.length || 1) - 100) / 10));
            statLatency.textContent = `${Math.max(17, currentLatency)}ms`;
            statFps.textContent = Math.min(MAX_FPS, currentFps);
            statPrecision.textContent = `+${currentPrecision}%`;
            [statLatency, statFps, statPrecision].forEach(el => el.classList.add('text-green-400'));
        }

        if (mainToggleBtn) {
            mainToggleBtn.addEventListener('click', () => {
                const toggleSpan = mainToggleBtn.querySelector('span');
                const toggleBg = mainToggleBtn.querySelector('div.w-\\[90\\%\\]'); // Selector mais estável (pelo tamanho)
                isAppOn = !isAppOn;

                if (isAppOn) {
                    toggleSpan.textContent = 'ON';
                    toggleSpan.classList.remove('text-[#E53935]');
                    toggleSpan.classList.add('text-green-500');
                    if (toggleBg) {
                        toggleBg.classList.remove('bg-gray-800');
                        toggleBg.style.backgroundColor = '#a7f3d0';
                    }
                    if (floatingPanel) floatingPanel.style.display = 'block';
                    mainToggleBtn.classList.remove('pulse-attention');
                    if (statusIndicators) statusIndicators.classList.remove('opacity-50');
                    if (quickFunctions) quickFunctions.classList.remove('opacity-50', 'pointer-events-none');
                    window.completeTask('activated');
                } else {
                    toggleSpan.textContent = 'OFF';
                    toggleSpan.classList.add('text-[#E53935]');
                    toggleSpan.classList.remove('text-green-500');
                    if (toggleBg) {
                        toggleBg.classList.add('bg-gray-800');
                        toggleBg.style.backgroundColor = ''; // Remove o verde inline
                    }
                    if (floatingPanel) floatingPanel.style.display = 'none';
                    mainToggleBtn.classList.add('pulse-attention');
                    if (statusIndicators) statusIndicators.classList.add('opacity-50');
                    if (quickFunctions) quickFunctions.classList.add('opacity-50', 'pointer-events-none');
                }
                updateDashboardStats();
            });
        }

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pageId = button.dataset.page;
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                panelPages.forEach(page => { if (page) page.style.display = page.id === pageId ? 'block' : 'none'; });
            });
        });

        sensiSliders.forEach(slider => {
            const valueDisplay = slider.previousElementSibling.querySelector('[data-sensi-value]');
            slider.addEventListener('input', (event) => {
                if (valueDisplay) valueDisplay.textContent = event.target.value;
                updateDashboardStats();
            });
        });

        allToggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                const syncId = toggle.dataset.sync;
                if (syncId) {
                    const targetToggle = document.getElementById(syncId);
                    if (targetToggle) targetToggle.checked = toggle.checked;
                }
                const mainId = toggle.id;
                document.querySelectorAll(`[data-sync="${mainId}"]`).forEach(t => { t.checked = toggle.checked; });

                if (toggle.dataset.gamifyTask === 'aim') {
                    const checkedAimToggles = document.querySelectorAll('input[data-gamify-task="aim"]:checked').length;
                    if (checkedAimToggles >= 3) {
                        window.completeTask('testedAim');
                    }
                }
                updateDashboardStats();
            });
        });

        document.querySelectorAll('.clickable-function').forEach(func => {
            func.addEventListener('click', (e) => {
                if (!e.target.matches('input') && !e.target.matches('label')) {
                    const checkbox = func.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                }
                func.classList.add('clicked');
                func.addEventListener('animationend', () => { func.classList.remove('clicked'); }, { once: true });
            });
        });

        if (generateConfigButton) {
            generateConfigButton.addEventListener('click', () => {
                if (aiResultDiv) {
                    aiResultDiv.classList.remove('hidden');
                    aiResultDiv.innerHTML = `<p class="text-yellow-400 text-center font-bold">Função indisponível na demonstração.<br><span class="font-normal text-xs text-gray-300">Disponível apenas na versão completa.</span></p>`;
                }
            });
        }

        if (applyOptimizationBtn) {
            applyOptimizationBtn.addEventListener('click', () => {
                const originalText = applyOptimizationBtn.innerHTML;
                applyOptimizationBtn.innerHTML = `<i class="fa-solid fa-spinner spin-loader"></i> Otimizando...`;
                applyOptimizationBtn.disabled = true;
                setTimeout(() => {
                    applyOptimizationBtn.innerHTML = `<i class="fa-solid fa-check"></i> Otimizado!`;
                    applyOptimizationBtn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
                    applyOptimizationBtn.classList.add('bg-green-600');
                    window.completeTask('optimized');
                    setTimeout(() => {
                        applyOptimizationBtn.innerHTML = originalText;
                        applyOptimizationBtn.disabled = false;
                        applyOptimizationBtn.classList.remove('bg-green-600');
                        applyOptimizationBtn.classList.add('bg-gray-700', 'hover:bg-gray-600');
                    }, 2000);
                }, 1500);
            });
        }
    };

    // --- INICIALIZAÇÃO DE TODOS OS MÓDULOS ---
    setupUtilitiesAndEffects();
    setupGamification();
    setupFAQ();
    setupTracking();
    setupAppSimulator();
});
