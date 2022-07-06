(function ($) {
  /* [ Load page ]
    =========================================================== */
  $('.animsition').animsition({
    inClass: 'fade-in',
    outClass: 'fade-out',
    inDuration: 500,
    outDuration: 500,
    linkElement: '.animsition-link',
    loading: true,
    loadingParentElement: 'html',
    loadingClass: 'animsition-loading-1',
    loadingInner: '<div class="loader05"></div>',
    timeout: false,
    timeoutCountdown: 5000,
    onLoadEvent: true,
    browser: ['animation-duration', '-webkit-animation-duration'],
    overlay: false,
    overlayClass: 'animsition-overlay-slide',
    overlayParentElement: 'html',
    transition(url) {
      window.location.href = url;
    },
  });

  /* [ Back to top ]
    =========================================================== */
  const windowH = $(window).height() / 2;

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > windowH) {
      $('#myBtn').css('display', 'flex');
    } else {
      $('#myBtn').css('display', 'none');
    }
  });

  $('#myBtn').on('click', () => {
    $('html, body').animate({ scrollTop: 0 }, 300);
  });

  /*= =================================================================
    [ Fixed Header ] */
  const headerDesktop = $('.container-menu-desktop');
  const wrapMenu = $('.wrap-menu-desktop');

  if ($('.top-bar').length > 0) {
    var posWrapHeader = $('.top-bar').height();
  } else {
    var posWrapHeader = 0;
  }

  if ($(window).scrollTop() > posWrapHeader) {
    $(headerDesktop).addClass('fix-menu-desktop');
    $(wrapMenu).css('top', 0);
  } else {
    $(headerDesktop).removeClass('fix-menu-desktop');
    $(wrapMenu).css('top', posWrapHeader - $(this).scrollTop());
  }

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > posWrapHeader) {
      $(headerDesktop).addClass('fix-menu-desktop');
      $(wrapMenu).css('top', 0);
    } else {
      $(headerDesktop).removeClass('fix-menu-desktop');
      $(wrapMenu).css(
        'top',
        posWrapHeader - $(this).scrollTop(),
      );
    }
  });

  /*= =================================================================
    [ Menu mobile ] */
  $('.btn-show-menu-mobile').on('click', function () {
    $(this).toggleClass('is-active');
    $('.menu-mobile').slideToggle();
  });

  const arrowMainMenu = $('.arrow-main-menu-m');

  for (let i = 0; i < arrowMainMenu.length; i++) {
    $(arrowMainMenu[i]).on('click', function () {
      $(this).parent().find('.sub-menu-m').slideToggle();
      $(this).toggleClass('turn-arrow-main-menu-m');
    });
  }

  $(window).resize(() => {
    if ($(window).width() >= 992) {
      if ($('.menu-mobile').css('display') == 'block') {
        $('.menu-mobile').css('display', 'none');
        $('.btn-show-menu-mobile').toggleClass('is-active');
      }

      $('.sub-menu-m').each(function () {
        if ($(this).css('display') == 'block') {
          console.log('hello');
          $(this).css('display', 'none');
          $(arrowMainMenu).removeClass(
            'turn-arrow-main-menu-m',
          );
        }
      });
    }
  });

  /*= =================================================================
    [ Show / hide modal search ] */
  $('.js-show-modal-search').on('click', function () {
    $('.modal-search-header').addClass('show-modal-search');
    $(this).css('opacity', '0');
  });

  $('.js-hide-modal-search').on('click', () => {
    $('.modal-search-header').removeClass('show-modal-search');
    $('.js-show-modal-search').css('opacity', '1');
  });

  $('.container-search-header').on('click', (e) => {
    e.stopPropagation();
  });

  /*= =================================================================
    [ Isotope ] */
  const $topeContainer = $('.isotope-grid');
  const $filter = $('.filter-tope-group');

  // filter items on button click
  $filter.each(() => {
    $filter.on('click', 'button', function () {
      const filterValue = $(this).attr('data-filter');
      $topeContainer.isotope({ filter: filterValue });
    });
  });

  // init Isotope
  $(window).on('load', () => {
    const $grid = $topeContainer.each(function () {
      $(this).isotope({
        itemSelector: '.isotope-item',
        layoutMode: 'fitRows',
        percentPosition: true,
        animationEngine: 'best-available',
        masonry: {
          columnWidth: '.isotope-item',
        },
      });
    });
  });

  const isotopeButton = $('.filter-tope-group button');

  $(isotopeButton).each(function () {
    $(this).on('click', function () {
      for (let i = 0; i < isotopeButton.length; i++) {
        $(isotopeButton[i]).removeClass('how-active1');
      }

      $(this).addClass('how-active1');
    });
  });

  /*= =================================================================
    [ Filter / Search product ] */
  $('.js-show-filter').on('click', function () {
    $(this).toggleClass('show-filter');
    $('.panel-filter').slideToggle(400);

    if ($('.js-show-search').hasClass('show-search')) {
      $('.js-show-search').removeClass('show-search');
      $('.panel-search').slideUp(400);
    }
  });

  $('.js-show-search').on('click', function () {
    $(this).toggleClass('show-search');
    $('.panel-search').slideToggle(400);

    if ($('.js-show-filter').hasClass('show-filter')) {
      $('.js-show-filter').removeClass('show-filter');
      $('.panel-filter').slideUp(400);
    }
  });

  /*= =================================================================
    [ Cart ] */
  $('.js-show-cart').on('click', () => {
    $('.js-panel-cart').addClass('show-header-cart');
  });

  $('.js-hide-cart').on('click', () => {
    $('.js-panel-cart').removeClass('show-header-cart');
  });

  /*= =================================================================
    [ Cart ] */
  $('.js-show-sidebar').on('click', () => {
    $('.js-sidebar').addClass('show-sidebar');
  });

  $('.js-hide-sidebar').on('click', () => {
    $('.js-sidebar').removeClass('show-sidebar');
  });

  /*= =================================================================
    [ +/- num product ] */
  $('.btn-num-product-down').on('click', function () {
    const numProduct = Number($(this).next().val());
    if (numProduct > 1) {
      $(this)
        .next()
        .val(numProduct - 1);
    }
  });

  $('.btn-num-product-up').on('click', function () {
    const numProduct = Number($(this).prev().val());
    $(this)
      .prev()
      .val(numProduct + 1);
  });

  /*= =================================================================
    [ Rating ] */
  $('.wrap-rating').each(function () {
    const item = $(this).find('.item-rating');
    let rated = -1;
    const input = $(this).find('input');
    $(input).val(0);

    $(item).on('mouseenter', function () {
      const index = item.index(this);
      let i = 0;
      for (i = 0; i <= index; i++) {
        $(item[i]).removeClass('zmdi-star-outline');
        $(item[i]).addClass('zmdi-star');
      }

      for (let j = i; j < item.length; j++) {
        $(item[j]).addClass('zmdi-star-outline');
        $(item[j]).removeClass('zmdi-star');
      }
    });

    $(item).on('click', function () {
      const index = item.index(this);
      rated = index;
      $(input).val(index + 1);
    });

    $(this).on('mouseleave', () => {
      let i = 0;
      for (i = 0; i <= rated; i++) {
        $(item[i]).removeClass('zmdi-star-outline');
        $(item[i]).addClass('zmdi-star');
      }

      for (let j = i; j < item.length; j++) {
        $(item[j]).addClass('zmdi-star-outline');
        $(item[j]).removeClass('zmdi-star');
      }
    });
  });

  /*= =================================================================
    [ Show modal1 ] */
  $('.js-show-modal1').on('click', (e) => {
    e.preventDefault();
    $('.js-modal1').addClass('show-modal1');
  });

  $('.js-hide-modal1').on('click', () => {
    $('.js-modal1').removeClass('show-modal1');
  });
}(jQuery));
