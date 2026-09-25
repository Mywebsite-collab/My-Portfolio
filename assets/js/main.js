// assets/js/main.js
// الوحدة الرئيسية - جميع الوظائف التفاعلية (نسخة مصححة محسّنة للأداء)
;(function() {
    'use strict';

    // ===== أدوات مساعدة للأداء (60fps) =====
    // Throttle: يحد من تكرار التنفيذ للوظائف المرتبطة بالـ scroll
    function throttle(fn, limit) {
        let inThrottle = false, lastArgs = null, rafScheduled = false;
        return function() {
            const ctx = this, args = arguments;
            if (inThrottle) {
                lastArgs = args;
                return;
            }
            inThrottle = true;
            fn.apply(ctx, args);
            setTimeout(() => {
                inThrottle = false;
                if (lastArgs) {
                    fn.apply(ctx, lastArgs);
                    lastArgs = null;
                }
            }, limit);
        };
    }

    // ===== Loading Screen (مع حماية ضد العناصر المفقودة) =====
    const loading = document.getElementById('loading-screen');
    const progressBar = loading ? loading.querySelector('.loading-progress span') : null;
    if (loading && progressBar) {
        document.body.style.overflow = 'hidden';
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                progressBar.style.width = '100%';
                setTimeout(() => {
                    loading.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
            } else {
                progressBar.style.width = progress + '%';
            }
        }, 200);
        // أمان: إخفاء شاشة التحميل بعد 5 ثوانٍ في أي حال
        setTimeout(() => {
            if (loading && !loading.classList.contains('hidden')) {
                loading.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }, 5000);
    }

    // ===== Custom Cursor =====
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    // استخدام rAF لتتبع الماوس بسلاسة 60fps
    if (cursor && follower) {
        let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0, rafId = null;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
            if (!rafId) rafId = requestAnimationFrame(updateFollower);
        });
        function updateFollower() {
            followerX += (mouseX - followerX) * 0.18;
            followerY += (mouseY - followerY) * 0.18;
            follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
            if (followerX !== mouseX || followerY !== mouseY) {
                rafId = requestAnimationFrame(updateFollower);
            } else {
                rafId = null;
            }
        }
        const hoverables = document.querySelectorAll('a, button, .btn');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('hover'));
            el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
        });
    }

    // ===== Header Scroll Effect =====
    const header = document.getElementById('header');

    // ===== Mobile Menu =====
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.querySelector('.nav-list');

    // ===== Scroll Progress =====
    const scrollProgress = document.getElementById('scrollProgress');

    // ===== Smooth Anchor + Active Link =====
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // ===== Back to Top Button =====
    const backToTop = document.getElementById('backToTop');

    // ===== موحّد: مستمع scroll واحد بـ throttle للأداء =====
    const onScroll = throttle(() => {
        const scrollY = window.scrollY;

        // 1) Header effect
        if (header) header.classList.toggle('scrolled', scrollY > 100);

        // 2) Scroll progress bar
        if (scrollProgress) {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            scrollProgress.style.width = pct + '%';
        }

        // 3) Active nav link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (scrollY >= sectionTop) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });

        // 4) Back to top visibility
        if (backToTop) backToTop.classList.toggle('visible', scrollY > 300);
    }, 16); // ~60fps (16ms = 60Hz)
    window.addEventListener('scroll', onScroll, { passive: true });

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => navList.classList.toggle('open'));
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => navList.classList.remove('open'));
        });
    }

    // ===== Scroll Reveal Animations =====
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // fallback للمتصفحات القديمة
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // ===== Project Filter & Gallery =====
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectsGrid = document.getElementById('projectsGrid');

    // حماية: تأكد أن projectsData معرّفة و أن الشبكة موجودة
    if (projectsGrid && typeof projectsData !== 'undefined') {
        function renderProjects(category) {
            category = category || 'all';
            const filtered = category === 'all' ? projectsData : projectsData.filter(p => p.category === category);
            projectsGrid.innerHTML = filtered.map(project => `
                <div class="project-card glass" data-category="${project.category}">
                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-links">
                            <a href="${project.live}" target="_blank" rel="noopener">عرض مباشر</a>
                            <a href="${project.github}" target="_blank" rel="noopener">GitHub</a>
                            <a href="${project.caseStudy}">دراسة حالة</a>
                        </div>
                    </div>
                </div>
            `).join('');
            // حركة ظهور البطاقات عبر rAF (أداء سلس)
            requestAnimationFrame(() => {
                document.querySelectorAll('.project-card').forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                });
            });
        }
        renderProjects();

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderProjects(btn.dataset.filter);
            });
        });
    }

    // ===== Number Counter =====
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10) || 0;
                    let current = 0;
                    const increment = Math.ceil(target / 60);
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = current;
                    }, 25);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(num => counterObserver.observe(num));
    }

    // ===== FAQ Accordion =====
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item.active').forEach(other => other.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // ===== Tilt cards =====
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (x - centerX) / 10;
            card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0) rotateY(0)';
        });
    });

    // ===== Magnetic Buttons =====
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ===== Contact Form =====
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    const submitBtn = document.getElementById('submitBtn');

    if (form && toast && submitBtn) {
        function showToast(msg, type) {
            toast.textContent = msg;
            toast.className = 'toast ' + type;
            setTimeout(() => { toast.className = 'toast'; }, 4000);
        }
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showToast('يرجى ملء جميع الحقول', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
                return;
            }

            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            await new Promise(resolve => setTimeout(resolve, 2000));
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showToast('تم إرسال رسالتك بنجاح! سأتواصل معك قريباً.', 'success');
            form.reset();
        });
    }

    // ===== Particles Background (Hero) - محسّن للأداء =====
    const canvas = document.getElementById('particles-canvas');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId = null;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = 'rgba(69, 162, 158, 0.6)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            const count = Math.min(100, Math.floor(canvas.width * canvas.height / 9000));
            particles = [];
            for (let i = 0; i < count; i++) particles.push(new Particle());
        }
        initParticles();

        // إيقاف الرسم عندما يكون الـ canvas خارج الشاشة (توفير CPU/GPU)
        let isHeroVisible = true;
        const heroSection = document.getElementById('hero');
        if (heroSection && 'IntersectionObserver' in window) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isHeroVisible = entry.isIntersecting;
                    if (isHeroVisible && !animationId) animateParticles();
                    else if (!isHeroVisible && animationId) { cancelAnimationFrame(animationId); animationId = null; }
                });
            }, { threshold: 0 });
            heroObserver.observe(heroSection);
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            // رسم خطوط الترابط
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(69, 162, 158, ${1 - dist / 150})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            if (isHeroVisible) animationId = requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // إعادة التحجيم بـ throttle
        const onResize = throttle(() => {
            resizeCanvas();
            initParticles();
        }, 200);
        window.addEventListener('resize', onResize, { passive: true });
    }

    // =============================================
    // ===== كود الكتاب ثلاثي الأبعاد (3D Book) =====
    // =============================================
    const book = document.querySelector('.book');
    const pages = document.querySelectorAll('.book');
    const allPages = document.querySelectorAll('.page');
    const prevBtn = document.querySelector('.book-nav.prev');
    const nextBtn = document.querySelector('.book-nav.next');
    const currentPageEl = document.querySelector('.current-page');
    const totalPagesEl = document.querySelector('.total-pages');

    if (book && allPages.length > 0) {
        const pageEls = allPages;
        let currentPage = 0;
        const totalPages = pageEls.length;
        let isAnimating = false;
        let isReversing = false;
        let reverseTimer = null;

        if (totalPagesEl) totalPagesEl.textContent = '/ ' + totalPages;

        function updateUI() {
            if (currentPageEl) {
                currentPageEl.textContent = Math.min(currentPage + 1, totalPages);
            }
            if (prevBtn) {
                const isFirst = (currentPage === 0);
                prevBtn.disabled = isFirst || isReversing;
                prevBtn.style.opacity = (isFirst || isReversing) ? '0.4' : '1';
                prevBtn.style.cursor = (isFirst || isReversing) ? 'default' : 'pointer';
            }
            if (nextBtn) {
                const isLast = (currentPage === totalPages);
                nextBtn.disabled = isLast || isReversing;
                nextBtn.style.opacity = (isLast || isReversing) ? '0.4' : '1';
                nextBtn.style.cursor = (isLast || isReversing) ? 'default' : 'pointer';
            }
            pageEls.forEach((page, index) => {
                if (page.classList.contains('flipped')) {
                    page.style.zIndex = 10 + index;
                } else {
                    page.style.zIndex = totalPages - index;
                }
            });
        }

        function flipPage(direction) {
            if (isAnimating || isReversing) return;
            const newPage = currentPage + direction;
            if (newPage < 0 || newPage > totalPages) return;
            if (direction === -1 && currentPage === 0) return;
            if (direction === 1 && currentPage === totalPages) return;

            isAnimating = true;
            const pageIndex = (direction === 1) ? currentPage : currentPage - 1;
            if (pageIndex < 0 || pageIndex >= totalPages) {
                isAnimating = false;
                return;
            }
            const page = pageEls[pageIndex];
            if (direction === 1) page.classList.add('flipped');
            else page.classList.remove('flipped');

            currentPage = newPage;
            updateUI();
            setTimeout(() => { isAnimating = false; }, 850);
        }

        // ===== Auto Reverse System (التراجع العكسي) =====
        function startAutoReverse() {
            // إذا كنا لم نصل إلى آخر صفحة، لا نبدأ التراجع
            if (currentPage !== totalPages) return;

            // إذا كان التراجع قيد التشغيل بالفعل، لا نبدأ آخر
            if (isReversing) return;

            // إلغاء أي timer قديم
            if (reverseTimer) clearTimeout(reverseTimer);

            // وضع العلم
            isReversing = true;
            book.classList.add('is-reversing');
            updateUI();

            // انتظر 2500ms قبل البدء بالتراجع
            reverseTimer = setTimeout(() => {
                performAutoReverse();
            }, 2500);
        }

        function performAutoReverse() {
            // دالة مساعدة لتراجع صفحة واحدة كل 250ms
            function reverseOneStep() {
                if (currentPage <= 0) {
                    // وصلنا إلى الغلاف الأمامي - انهي التراجع
                    finishAutoReverse();
                    return;
                }

                // تراجع صفحة واحدة
                flipPage(-1);

                // جدول الخطوة التالية بعد 250ms
                reverseTimer = setTimeout(reverseOneStep, 250);
            }

            // ابدأ التراجع
            reverseOneStep();
        }

        function finishAutoReverse() {
            // تأكد من الوصول إلى الصفحة 0 (الغلاف الأمامي)
            if (currentPage > 0) {
                currentPage = 0;
                updateUI();
            }

            // أزل جميع الصفحات المقلوبة
            pageEls.forEach(page => page.classList.remove('flipped'));

            // أعد تعيين z-index
            pageEls.forEach((page, index) => {
                page.style.zIndex = totalPages - index;
            });

            // أزل العلم والحالات
            isReversing = false;
            book.classList.remove('is-reversing');

            // أعد تفعيل التنقل
            updateUI();

            // إلغاء أي timer متبقي
            if (reverseTimer) clearTimeout(reverseTimer);
            reverseTimer = null;
        }

        function cancelAutoReverse() {
            if (!isReversing) return;

            // إلغاء Timer
            if (reverseTimer) clearTimeout(reverseTimer);
            reverseTimer = null;

            // أزل الحالات
            isReversing = false;
            book.classList.remove('is-reversing');

            // أعد تفعيل التنقل
            updateUI();
        }

        // ===== Event Listeners للأزرار =====
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isReversing) return;
                flipPage(1);
                // تحقق من إذا وصلنا إلى آخر صفحة
                setTimeout(() => {
                    if (currentPage === totalPages) {
                        startAutoReverse();
                    }
                }, 850);
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isReversing) {
                    cancelAutoReverse();
                    return;
                }
                flipPage(-1);
            });
        }

        // التنقل بالأسهم (RTL: يسار = التالي، يمين = السابق)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                if (isReversing) {
                    cancelAutoReverse();
                    return;
                }
                if (e.key === 'ArrowLeft') flipPage(1);
                else flipPage(-1);
                // تحقق من التراجع بعد التقليب
                setTimeout(() => {
                    if (currentPage === totalPages) {
                        startAutoReverse();
                    }
                }, 850);
            }
        });

        // السحب بالماوس واللمس
        let startX = 0, isDragging = false;
        const bookContainer = document.querySelector('.book-container');

        if (bookContainer) {
            const handleStart = (clientX) => { 
                if (isReversing) return;
                startX = clientX; 
                isDragging = true; 
            };
            const handleMove = (clientX) => {
                if (!isDragging || isReversing) return;
                const deltaX = clientX - startX;
                if (Math.abs(deltaX) > 40) {
                    if (deltaX < 0) flipPage(1);
                    else flipPage(-1);
                    isDragging = false;
                    startX = 0;
                    // تحقق من التراجع
                    setTimeout(() => {
                        if (currentPage === totalPages) {
                            startAutoReverse();
                        }
                    }, 850);
                }
            };
            const handleEnd = () => { isDragging = false; startX = 0; };

            bookContainer.addEventListener('mousedown', (e) => handleStart(e.clientX));
            document.addEventListener('mousemove', (e) => handleMove(e.clientX));
            document.addEventListener('mouseup', handleEnd);
            bookContainer.addEventListener('touchstart', (e) => handleStart(e.touches[0].clientX), { passive: true });
            document.addEventListener('touchmove', (e) => {
                if (isDragging) handleMove(e.touches[0].clientX);
            }, { passive: true });
            document.addEventListener('touchend', handleEnd, { passive: true });

            // تاثير الإمالة مع rAF
            let tiltRaf = null;
            bookContainer.addEventListener('mousemove', (e) => {
                if (tiltRaf) cancelAnimationFrame(tiltRaf);
                tiltRaf = requestAnimationFrame(() => {
                    const rect = bookContainer.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    book.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 3}deg)`;
                });
            });
            bookContainer.addEventListener('mouseleave', () => {
                if (tiltRaf) cancelAnimationFrame(tiltRaf);
                book.style.transform = 'rotateY(-4deg) rotateX(2deg)';
            });
        }

        // النقر على الصفحة للتنقل
        pageEls.forEach((page, index) => {
            page.addEventListener('click', (e) => {
                if (isReversing) return;
                if (e.target.closest('a') || e.target.closest('.btn-preview') || e.target.closest('.btn-details')) return;
                if (!page.classList.contains('flipped')) {
                    if (currentPage <= index) flipPage(1);
                } else {
                    if (currentPage > index + 1) flipPage(-1);
                }
                // تحقق من التراجع
                setTimeout(() => {
                    if (currentPage === totalPages) {
                        startAutoReverse();
                    }
                }, 850);
            });
        });

        updateUI();

        // فتح الصفحة الأولى تلقائياً بعد 1.5 ثانية
        setTimeout(() => {
            if (totalPages > 1) flipPage(1);
        }, 1500);

        // منع تحديد النص أثناء السحب
        document.addEventListener('selectstart', (e) => {
            if (isDragging) e.preventDefault();
        });

        if (typeof console !== 'undefined') console.log('📖 3D Portfolio Book ready with Auto Reverse!');
    }

})();
