(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');
  var closeTimer = null;

  // Two-phase open/close so the mobile menu can transition instead of
  // snapping: 'is-rendered' switches display:none -> flex first (so the
  // fade-in has something to animate), then 'is-open' drives the actual
  // opacity/transform transition. Closing reverses the order, removing
  // 'is-rendered' only after the fade-out finishes.
  function openNav() {
    if (!mainNav) { return; }
    window.clearTimeout(closeTimer);
    mainNav.classList.add('is-rendered');
    void mainNav.offsetHeight;
    header.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    if (!mainNav) { return; }
    header.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      mainNav.classList.remove('is-rendered');
    }, 220);
  }

  if (navToggle && header && mainNav) {
    navToggle.addEventListener('click', function () {
      if (header.classList.contains('is-open')) { closeNav(); } else { openNav(); }
    });

    document.querySelectorAll('.main-nav a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  }

  var revealTargets = document.querySelectorAll('[data-reveal]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealTargets.length && !reduceMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      var requiredFields = form.querySelectorAll('[required]');
      var firstInvalid = null;

      requiredFields.forEach(function (field) {
        var wrapper = field.closest('.field');
        var isEmpty = !field.value || !field.value.trim();

        if (wrapper) {
          wrapper.classList.toggle('has-error', isEmpty);
        }
        if (isEmpty && !firstInvalid) {
          firstInvalid = field;
        }
      });

      if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus();
        return;
      }

      // FormSubmit handles the actual submission, so we let the browser
      // POST normally and show a brief status before the redirect.
      var status = form.querySelector('.form-status');
      if (status) {
        status.classList.remove('is-error');
        status.classList.add('is-success');
        status.textContent = status.getAttribute('data-sending-text') || 'Sending...';
      }
    });

    form.querySelectorAll('[required]').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrapper = field.closest('.field');
        if (wrapper) { wrapper.classList.remove('has-error'); }
      });
    });

    initChatForm(form);
  }

  // Turns the plain stacked form into a one-question-at-a-time chat.
  // It's still the same real <form> posting to Netlify; this only
  // changes how the fields are revealed. No JS = the original plain
  // form, fully functional.
  function initChatForm(contactForm) {
    var panel = contactForm.closest('.form-panel');
    var chatLog = panel ? panel.querySelector('.chat-log') : null;
    var fields = Array.prototype.slice.call(contactForm.querySelectorAll('.field[data-question]'));
    var formFoot = contactForm.querySelector('.form-foot');

    if (!chatLog || !fields.length || !formFoot) { return; }

    var introText = chatLog.getAttribute('data-intro');
    var outroText = chatLog.getAttribute('data-outro');
    var currentIndex = 0;

    function addBubble(role, text) {
      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble chat-bubble--' + role;
      bubble.textContent = text;
      chatLog.appendChild(bubble);
    }

    function showStep(index, shouldFocus) {
      fields.forEach(function (field, i) {
        field.classList.toggle('is-active', i === index);
      });

      if (index < fields.length) {
        formFoot.classList.add('is-hidden');
        addBubble('bot', fields[index].getAttribute('data-question'));
        var input = fields[index].querySelector('input, textarea');
        if (input && shouldFocus) {
          window.setTimeout(function () { input.focus(); }, 320);
        }
      } else {
        if (outroText) { addBubble('bot', outroText); }
        formFoot.classList.remove('is-hidden');
      }
    }

    function advance(field) {
      var input = field.querySelector('input, textarea');
      var isRequired = input.hasAttribute('required');
      var value = input.value.trim();

      if (isRequired && !value) {
        field.classList.add('has-error');
        input.focus();
        return;
      }

      field.classList.remove('has-error');
      if (value) { addBubble('user', value); }
      currentIndex += 1;
      showStep(currentIndex, true);
    }

    fields.forEach(function (field) {
      var input = field.querySelector('input, textarea');

      var actions = document.createElement('div');
      actions.className = 'step-actions';

      var nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'btn btn-primary btn-sm step-next';
      nextBtn.textContent = field.getAttribute('data-next') || 'Continue';
      nextBtn.addEventListener('click', function () { advance(field); });
      actions.appendChild(nextBtn);

      if (field.hasAttribute('data-optional')) {
        var skipBtn = document.createElement('button');
        skipBtn.type = 'button';
        skipBtn.className = 'btn btn-ghost btn-sm step-skip';
        skipBtn.textContent = field.getAttribute('data-skip') || 'Skip';
        skipBtn.addEventListener('click', function () {
          input.value = '';
          field.classList.remove('has-error');
          currentIndex += 1;
          showStep(currentIndex, true);
        });
        actions.appendChild(skipBtn);
      }

      field.appendChild(actions);

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && input.tagName !== 'TEXTAREA') {
          event.preventDefault();
          advance(field);
        }
      });
    });

    contactForm.classList.add('is-stepped');
    formFoot.classList.add('is-hidden');
    if (introText) { addBubble('bot', introText); }
    // Do not focus the first field during setup: browsers otherwise scroll
    // directly to the contact section instead of keeping the hero in view.
    showStep(0, false);
  }
})();
