/* eslint-disable no-undef */
/* eslint-disable indent */

function submitFilterProductsForm(form) {
       console.log($(form).serialize());
       $('.reload-parent')
              .load(
                     `${window.location.href}?${$(
                            form,
                     ).serialize()} .reload-parent > *`,
              )
              .hide()
              .fadeIn('slow');

       // $.ajax({
       //        type: 'GET',
       //        url: window.location.href,
       //        success: (response) => {
       //               $('.reload-parent').load(
       //                      `${window.location.href} .reload-child > *`,
       //               );
       //        },
       // });
}

function saveFilterCategoryChecked(categoryId) {
       let existingEntries = JSON.parse(localStorage.getItem('filterCategory'));

       if (existingEntries === null) existingEntries = [];

       const isChecked = document.getElementById(
              `filterCategoryCheckbox${categoryId}`,
       ).checked;
       if (isChecked && existingEntries.indexOf(categoryId) === -1) {
              existingEntries.push(categoryId);
       }

       if (!isChecked && existingEntries.indexOf(categoryId) !== -1) {
              existingEntries.splice(existingEntries.indexOf(categoryId), 1);
       }

       localStorage.setItem('filterCategory', JSON.stringify(existingEntries));
}

function saveFilterByPriceRadio(filterKey) {
       localStorage.setItem('filterByPrice', filterKey);
       $('#filterByPriceUl li .filter-link-active').removeClass(
              'filter-link-active',
       );
       $(`#filterByPriceLink${filterKey}`).addClass('filter-link-active');
}

function saveFilterByPriceRangeRadio(filterKey) {
       localStorage.setItem('filterByPriceRange', filterKey);
       $('#filterByPriceRangeUl li .filter-link-active').removeClass(
              'filter-link-active',
       );
       $(`#filterByPriceRangeLink${filterKey}`).addClass('filter-link-active');
}

$(document).ready(() => {
       // const checkedCategoryBoxes = JSON.parse(
       //        localStorage.getItem('filterCategory'),
       // );
       // checkedCategoryBoxes.forEach((element) => {
       //        $(`#filterCategoryCheckbox${element}`).attr('checked', true);
       // });
       // const filterPriceKey = localStorage.getItem('filterByPrice');
       // $(`#filterByPrice${filterPriceKey}`).attr('checked', true);
       // $(`#filterByPriceLink${filterPriceKey}`).addClass('filter-link-active');
       // const filterPriceRangeKey = localStorage.getItem('filterByPriceRange');
       // $(`#filterPriceRange${filterPriceRangeKey}`).attr('checked', true);
       // $(`#filterByPriceRangeLink${filterPriceRangeKey}`).addClass(
       //        'filter-link-active',
       // );
});

function uncheckFilterCheckboxes() {
       localStorage.removeItem('filterCategory');
}

function changeFilterPriceValue(e, serialnumber) {
       e.preventDefault();
       $(`#filterByPrice${serialnumber}`).trigger('click');
}

function changeFilterPriceRangeValue(e, value) {
       e.preventDefault();
       console.log(value);
       $(`#filterPriceRange${value}`).trigger('click');
}

function phoneNumberTenDigitsOnly(e, element) {
       if (element.value.length >= 10) {
              e.preventDefault();
       }
}

$('#resendOtp').click((e) => {
       e.preventDefault();
       $.ajax({
              type: 'post',
              url: '/resendOtp',
              success: (response) => {
                     if (response.otpSent) {
                            $('#otpFormHeading').text('OTP has sent again');
                            $('#otp-form')[0].reset();
                     }
                     if (response.otpError) {
                            $('#otpResendError').text(otpError.message);
                     }
              },
       });
});

$('input[type=number]').keypress((evt) => {
       if (
              (evt.which !== 8 && evt.which !== 0 && evt.which < 48) ||
              evt.which > 57
       ) {
              evt.preventDefault();
       }
});

function addToWishlist(productId, button) {
       $.ajax({
              type: 'post',
              data: { product: productId },
              url: '/addToWishlist',
              success: (response) => {
                     const count =
                            parseInt($('#wishlistCount').attr('data-notify')) +
                            response.inc;
                     $('#wishlistCount').attr('data-notify', count);
                     if (response.inc === 1) {
                            if (button === 'fromProductsView') {
                                   $(`.icon-heart1${productId}`).attr(
                                          'hidden',
                                          true,
                                   );
                                   $(`.icon-heart2${productId}`).attr(
                                          'hidden',
                                          false,
                                   );
                            }
                            if (button === 'quickView') {
                                   $('.wishlist-button').html(
                                          '<span class="material-icons mr-2">favorite</span> wishlisted',
                                   );
                            }
                     } else {
                            if (button === 'fromProductsView') {
                                   $(`.icon-heart2${productId}`).attr(
                                          'hidden',
                                          true,
                                   );
                                   $(`.icon-heart1${productId}`).attr(
                                          'hidden',
                                          false,
                                   );
                            }
                            if (button === 'fromWishlistView') {
                                   // $(
                                   //        `#wishlistedProduct-${productId}`,
                                   // ).remove();
                                   $('.reload-parent')
                                          .load(
                                                 `${window.location.href} .reload-parent > *`,
                                          )
                                          .hide()
                                          .fadeIn('slow');
                            }
                            if (button === 'quickView') {
                                   $('.wishlist-button').html(
                                          '<span class="material-icons mr-2">favorite</span> wishlist',
                                   );
                            }
                     }
              },
       });
}

$(document).ready(() => {
       $('#add-to-bag-form').submit((e) => {
              e.preventDefault();
              $.ajax({
                     type: 'post',
                     data: $('#add-to-bag-form').serialize(),
                     url: '/addToBag',
                     success: (response) => {
                            if (response.added) {
                                   const count =
                                          parseInt(
                                                 $('#cartCount').attr(
                                                        'data-notify',
                                                 ),
                                          ) + 1;
                                   $('#cartCount').attr('data-notify', count);
                            }
                     },
              });
       });
});

function updateCart(credential, size, productId, inc) {
       if (
              (parseInt($(`#cartCount${productId}${size}`).val()) === 1 &&
                     parseInt(inc) === -1) ||
              (credential === 'size' &&
                     size === $(`#selectSize${productId}${size}`).val())
       ) {
       } else {
              const data = {
                     credential,
                     size,
                     productId,
              };
              if (credential === 'size') {
                     data.inc = $(`#selectSize${productId}${size}`).val();
              }
              if (credential === 'count') {
                     data.inc = inc;
              }
              $.ajax({
                     type: 'post',
                     data,
                     url: '/updateCart',
                     success: (response) => {
                            if (response.updationSuccess) {
                                   $('.reload').load(
                                          `${window.location.href} .reload > *`,
                                   );
                                   if (response.changeCount) {
                                          const count =
                                                 parseInt(
                                                        $('#cartCount').attr(
                                                               'data-notify',
                                                        ),
                                                 ) - 1;
                                          $('#cartCount').attr(
                                                 'data-notify',
                                                 count,
                                          );
                                   }
                            }
                     },
              });
       }
}

function changeSavings(input, savings) {
       if (input.checked) {
              $('#maximumSavings').text(`Rs.${savings}`);
       } else {
              $('#maximumSavings').text('Rs.0');
       }
}

$('#applyCouponForm').submit((e) => {
       e.preventDefault();
       $.ajax({
              type: 'post',
              data: $('#applyCouponForm').serialize(),
              url: '/applyCoupon',
              success: (response) => {
                     if (response.applyCouponSuccess) {
                            $('#applyCouponModal').modal('hide');
                     }
              },
       });
});
