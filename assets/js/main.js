// Main Portfolio JavaScript
// النسخة النهائية: تم إصلاح أخطاء قلب الصفحات والروابط المكسورة
;(function() {
    'use strict';

    function throttle(fn, limit) {
        let inThrottle = false, lastArgs = null;
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
        setTimeout(() => {
            if (loading && !loading.classList.contains('hidden')) {
                loading.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }, 5000);
    }

    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    if (cursor && follower) {
        let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0, rafId = null;
        function updateFollower() {
            followerX += (mouseX - followerX) * 0.18;
            followerY += (mouseY - followerY) * 0.18;
            follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
            if (Math.abs(followerX - mouseX) > 0.5 || Math.abs(followerY - mouseY) > 0.5) {
                rafId = requestAnimationFrame(updateFollower);
            } else {
                rafId = null;
            }
        }
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
            if (!rafId) rafId = requestAnimationFrame(updateFollower);
        });
        document.querySelectorAll('a, button, .btn').forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('hover'));
            el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
        });
    }

    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.querySelector('.nav-list');
    const scrollProgress = document.getElementById('scrollProgress');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const backToTop = document.getElementById('backToTop');

    const onScroll = throttle(() => {
        const scrollY = window.scrollY;
        if (header) header.classList.toggle('scrolled', scrollY > 100);
        if (scrollProgress) {
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const pct = scrollHeight > 0 ? (scrollY / scrollHeight) * 100 : 0;
            scrollProgress.style.width = pct + '%';
        }
        let current = '';
        sections.forEach(section => {
            if (scrollY >= section.offsetTop - 150) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
        if (backToTop) backToTop.classList.toggle('visible', scrollY > 300);
    }, 16);
    window.addEventListener('scroll', onScroll, { passive: true });

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => navList.classList.toggle('open'));
        navLinks.forEach(link => {
            link.addEventListener('click', () => navList.classList.remove('open'));
        });
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

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
        revealElements.forEach(el => el.classList.add('visible'));
    }

    const book = document.querySelector('.book');
    const bookContainer = document.querySelector('.book-container');
    const allPages = document.querySelectorAll('.page');
    const prevBtn = document.querySelector('.book-nav.prev');
    const nextBtn = document.querySelector('.book-nav.next');
    const currentPageEl = document.querySelector('.current-page');
    const totalPagesEl = document.querySelector('.total-pages');

    if (book && bookContainer && allPages.length > 0) {
        const totalPages = allPages.length;
        let currentPage = 0;
        let isAnimating = false;
        let isReversing = false;
        let reverseTimer = null;
        let startX = 0, isDragging = false;

        if (totalPagesEl) totalPagesEl.textContent = ' / ' + totalPages;

        function updateUI() {
            if (currentPageEl) currentPageEl.textContent = Math.min(currentPage + 1, totalPages);
            if (prevBtn) {
                const isFirst = currentPage === 0;
                prevBtn.disabled = isFirst || isReversing;
                prevBtn.style.opacity = (isFirst || isReversing) ? '0.4' : '1';
            }
            if (nextBtn) {
                const isLast = currentPage >= totalPages - 1;
                nextBtn.disabled = isLast || isReversing;
                nextBtn.style.opacity = (isLast || isReversing) ? '0.4' : '1';
            }
            allPages.forEach((page, index) => {
                const isFlipped = page.classList.contains('flipped');
                page.style.zIndex = isFlipped ? (10 + index) : (totalPages - index);
            });
        }

        function flipPage(direction) {
            if (isAnimating || isReversing) return;
            const newPage = currentPage + direction;
            if (newPage < 0 || newPage >= totalPages) return;
            if (direction === -1 && currentPage === 0) return;
            if (direction === 1 && currentPage >= totalPages - 1) return;

            isAnimating = true;
            const pageIndex = direction === 1 ? currentPage : currentPage - 1;
            if (pageIndex >= 0 && pageIndex < totalPages) {
                const page = allPages[pageIndex];
                if (direction === 1) page.classList.add('flipped');
                else page.classList.remove('flipped');
            }
            currentPage = newPage;
            updateUI();
            setTimeout(() => { isAnimating = false; }, 850);
        }

        function startAutoReverse() {
            if (currentPage !== totalPages - 1 || isReversing) return;
            if (reverseTimer) clearTimeout(reverseTimer);
            isReversing = true;
            book.classList.add('is-reversing');
            updateUI();
            reverseTimer = setTimeout(() => performAutoReverse(), 2500);
        }

        function performAutoReverse() {
            function reverseOneStep() {
                if (currentPage <= 0) {
                    finishAutoReverse();
                    return;
                }
                flipPage(-1);
                reverseTimer = setTimeout(reverseOneStep, 250);
            }
            reverseOneStep();
        }

        function finishAutoReverse() {
            if (currentPage > 0) {
                currentPage = 0;
                updateUI();
            }
            allPages.forEach(page => page.classList.remove('flipped'));
            allPages.forEach((page, index) => {
                page.style.zIndex = totalPages - index;
            });
            isReversing = false;
            book.classList.remove('is-reversing');
            updateUI();
            if (reverseTimer) clearTimeout(reverseTimer);
            reverseTimer = null;
        }

        function cancelAutoReverse() {
            if (!isReversing) return;
            if (reverseTimer) clearTimeout(reverseTimer);
            reverseTimer = null;
            isReversing = false;
            book.classList.remove('is-reversing');
            updateUI();
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isReversing) return;
                flipPage(1);
                setTimeout(() => {
                    if (currentPage >= totalPages - 1) startAutoReverse();
                }, 850);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isReversing) { cancelAutoReverse(); return; }
                flipPage(-1);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                if (isReversing) { cancelAutoReverse(); return; }
                if (e.key === 'ArrowLeft') flipPage(1);
                else flipPage(-1);
                setTimeout(() => {
                    if (currentPage >= totalPages - 1) startAutoReverse();
                }, 850);
            }
        });

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
                    setTimeout(() => {
                        if (currentPage >= totalPages - 1) startAutoReverse();
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

        allPages.forEach((page, index) => {
            page.addEventListener('click', (e) => {
                if (isReversing || e.target.closest('a') || e.target.closest('button')) return;
                if (!page.classList.contains('flipped')) {
                    if (currentPage <= index) flipPage(1);
                } else {
                    if (currentPage > index + 1) flipPage(-1);
                }
                setTimeout(() => {
                    if (currentPage >= totalPages - 1) startAutoReverse();
                }, 850);
            });
        });

        document.addEventListener('selectstart', (e) => {
            if (isDragging) e.preventDefault();
        });

        updateUI();
        setTimeout(() => {
            if (totalPages > 1) flipPage(1);
        }, 1500);
    }

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

        let isHeroVisible = true;
        const heroSection = document.getElementById('hero');
        if (heroSection && 'IntersectionObserver' in window) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isHeroVisible = entry.isIntersecting;
                    if (isHeroVisible && !animationId) animateParticles();
                    else if (!isHeroVisible && animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                });
            }, { threshold: 0 });
            heroObserver.observe(heroSection);
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
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
        const onResize = throttle(() => { resizeCanvas(); initParticles(); }, 200);
        window.addEventListener('resize', onResize, { passive: true });
    }
})();
