/* eslint-disable no-undef */
/* eslint-disable indent */

function submitFilterProductsForm(form) {
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
                     if (response.error500) {
                            window.location.href = '/error500';
                     }
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

$('#resendOtpWithPasswordUpdate').click((e) => {
       e.preventDefault();
       $.ajax({
              type: 'post',
              url: '/resendOtp',
              success: (response) => {
                     if (response.error500) {
                            window.location.href = '/error500';
                     }
                     if (response.otpSent) {
                            $('#otpFormHeadingWithPasswordUpdate').text(
                                   'OTP has sent again',
                            );
                            $('#otp-form-with-password-update')[0].reset();
                     }
                     if (response.otpError) {
                            $('#otpWithPasswordUpdateError').text(
                                   otpError.message,
                            );
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
                     if (response.error500) {
                            window.location.href = '/error500';
                     }
                     const count =
                            parseInt($('.wishlistCount').attr('data-notify')) +
                            response.inc;
                     $('.wishlistCount').attr('data-notify', count);
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
                            if (response.error500) {
                                   window.location.href = '/error500';
                            }
                            if (response.added) {
                                   const count =
                                          parseInt(
                                                 $('.cartCount').attr(
                                                        'data-notify',
                                                 ),
                                          ) + 1;
                                   $('.cartCount').attr('data-notify', count);
                                   $('#addToCartError').text('');
                                   $('.num-product').val('1');
                            }
                            if (response.outOfStock) {
                                   $('#addToCartError').text('Out of stock');
                                   $('.num-product').val('1');
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
                     $.ajax({
                            type: 'post',
                            data,
                            url: '/updateCart',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href = '/error500';
                                   }
                                   if (response.updationSuccess) {
                                          $('.reload').load(
                                                 `${window.location.href} .reload > *`,
                                          );
                                          if (response.changeCount) {
                                                 const count =
                                                        parseInt(
                                                               $(
                                                                      '.cartCount',
                                                               ).attr(
                                                                      'data-notify',
                                                               ),
                                                        ) - 1;
                                                 $('.cartCount').attr(
                                                        'data-notify',
                                                        count,
                                                 );
                                          }
                                   }
                                   if (response.outOfStock) {
                                          $(
                                                 `#cartUpdationError${productId}${size}`,
                                          ).text('Out of stock');
                                   }
                            },
                     });
              } else if (credential === 'count') {
                     data.inc = inc;
                     $.ajax({
                            type: 'post',
                            data,
                            url: '/updateCart',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href = '/error500';
                                   }
                                   if (response.updationSuccess) {
                                          $('.reload').load(
                                                 `${window.location.href} .reload > *`,
                                          );
                                          if (response.changeCount) {
                                                 const count =
                                                        parseInt(
                                                               $(
                                                                      '.cartCount',
                                                               ).attr(
                                                                      'data-notify',
                                                               ),
                                                        ) - 1;
                                                 $('.cartCount').attr(
                                                        'data-notify',
                                                        count,
                                                 );
                                          }
                                   }
                                   if (response.outOfStock) {
                                          $(
                                                 `#cartUpdationError${productId}${size}`,
                                          ).text('Out of stock');
                                   }
                            },
                     });
              } else {
                     Swal.fire({
                            title: 'Are you sure?',
                            text: 'Do you really want to remove product from cart ?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, Remove',
                     }).then((result) => {
                            if (result.isConfirmed) {
                                   $.ajax({
                                          type: 'post',
                                          data,
                                          url: '/updateCart',
                                          success: (response) => {
                                                 if (response.error500) {
                                                        window.location.href =
                                                               '/error500';
                                                 }
                                                 if (response.updationSuccess) {
                                                        $('.reload').load(
                                                               `${window.location.href} .reload > *`,
                                                        );
                                                        if (
                                                               response.changeCount
                                                        ) {
                                                               const count =
                                                                      parseInt(
                                                                             $(
                                                                                    '.cartCount',
                                                                             ).attr(
                                                                                    'data-notify',
                                                                             ),
                                                                      ) - 1;
                                                               $(
                                                                      '.cartCount',
                                                               ).attr(
                                                                      'data-notify',
                                                                      count,
                                                               );
                                                        }
                                                 }
                                                 if (response.outOfStock) {
                                                        $(
                                                               `#cartUpdationError${productId}${size}`,
                                                        ).text('Out of stock');
                                                 }
                                          },
                                   });
                            }
                     });
              }
       }
}

function changeSavings(input, savings) {
       if (input.checked) {
              $('#maximumSavings').text(`Rs.${savings}`);
       } else {
              $('#maximumSavings').text('Rs.0');
       }
}

$('#couponForm').submit((e) => {
       e.preventDefault();
       $.ajax({
              type: 'post',
              data: $('#couponForm').serialize(),
              url: '/applyCoupon',
              success: (response) => {
                     if (response.error500) {
                            window.location.href = '/error500';
                     }
                     if (response.applyCouponSuccess) {
                            $('.reload').load(
                                   `${window.location.href} .reload > *`,
                            );
                            $('#applyCouponModal').modal('hide');
                            $('#applyCouponError').text('');
                     }
                     if (response.outOfLimit) {
                            $('#applyCouponError').text(
                                   'Coupon out of limit.Try another',
                            );
                     }
                     if (response.alreadyUsed) {
                            $('#applyCouponError').text('Coupon already used');
                     }
              },
       });
});

function clickCouponCheckbox(input, couponId) {
       $(`#couponCheckbox${couponId}`).trigger('click');
}

function cancelOrder(orderId) {
       Swal.fire({
              title: 'Are you sure?',
              text: 'Do you really want to cancel this order ?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes , cancel the order',
       }).then((result) => {
              if (result.isConfirmed) {
                     $.ajax({
                            type: 'post',
                            data: { orderId },
                            url: '/cancelOrder',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href = '/error500';
                                   }
                                   if (response.orderCancelsuccess) {
                                          location.reload();
                                   }
                            },
                     });
              }
       });
}

function cancelUpdate(inputName) {
       $(`#update${inputName}`).prop('disabled', true);
       $(`#update${inputName}EditButton`).prop('hidden', false);
       $(`#save${inputName}EditButton`).prop('hidden', true);
       $(`#cancel${inputName}EditButton`).prop('hidden', false);
       $(`#save${inputName}EditButton`)
              .next('.cancelProfileUpdate')
              .prop('hidden', true);
       $(`#update${inputName}Form`)[0].reset();
       $(`#update${inputName}Error`).text('');
}

function updateUsername() {
       // updation.credential = 'Username';
       // updation.message = 'Do your really want to update username ?';

       $('#updateUsername').prop('disabled', false);
       $('#updateUsernameEditButton').prop('hidden', true);
       $('#saveUsernameEditButton').prop('hidden', false);
       $('#saveUsernameEditButton')
              .next('.cancelProfileUpdate')
              .prop('hidden', false);

       $('#saveUsernameEditButton').click((e) => {
              // $('#updateUsernameForm').validate({
              //        rules: {
              //               username: {
              //                      required: true,
              //                      startwithCharacter: true,
              //                      rangelength: [3, 20],
              //               },
              //        },
              //        messages: {
              //               username: {
              //                      required: 'Enter username',
              //                      startwithCharacter:
              //                             'Must start with character',
              //                      rangelength:
              //                             'Length must between 3-20 characters',
              //               },
              //        },

              // });

              saveUpdateUsername();
       });
}

function updateEmail() {
       $('#saveEmailEditButton')
              .next('.cancelProfileUpdate')
              .prop('hidden', false),
              $('#updateEmail').prop('disabled', false);
       $('#updateEmailEditButton').prop('hidden', true);
       $('#saveEmailEditButton').prop('hidden', false);
       $('#saveEmailEditButton').click((e) => {
              saveUpdateEmail();
       });
}

function saveUpdateEmail() {
       $('#saveEmailEditButton')
              .next('.cancelProfileUpdate')
              .prop('hidden', false),
              $('#updateEmail').prop('disabled', false);
       $('#updateEmailEditButton').prop('hidden', true);
       $('#saveEmailEditButton').prop('hidden', false);
       $('#saveEmailEditButton').click((e) => {
              $('#updateEmailError').text('');
              Swal.fire({
                     title: 'Are you sure?',
                     text: 'Do your really want to update Email address ?',
                     icon: 'warning',
                     showCancelButton: true,
                     confirmButtonColor: '#3085d6',
                     cancelButtonColor: '#d33',
                     confirmButtonText: 'Yes, update',
              }).then((result) => {
                     if (result.isConfirmed) {
                            const form =
                                   document.getElementById('updateEmailForm');
                            formData = new FormData(form);
                            e.preventDefault();
                            $.ajax({
                                   type: 'post',
                                   data: formData,
                                   contentType: false,
                                   processData: false,
                                   url: '/updateProfile',
                                   success: (response) => {
                                          if (response.error500) {
                                                 window.location.href =
                                                        '/error500';
                                          }
                                          if (response.otpSent) {
                                                 $('#otpEmail').text(
                                                        response.email,
                                                 );
                                                 $('#emailOtpModal').modal(
                                                        'show',
                                                 );
                                          }
                                          if (
                                                 response.otpError ||
                                                 response.emailSendError ||
                                                 response.updationError
                                          ) {
                                                 $('#updateEmailError').text(
                                                        response.message,
                                                 );
                                          }
                                   },
                            });
                     }
              });
       });
}

function updatePassword() {
       Swal.fire({
              title: 'Are you sure?',
              text: 'Do your really want to update password ?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, update',
       }).then((result) => {
              if (result.isConfirmed) {
                     $.ajax({
                            type: 'post',
                            data: { password: true },
                            url: '/updateProfile',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href = '/error500';
                                   }
                                   if (response.otpSent) {
                                          $(
                                                 '#otpPhoneNumberPasswordUpdate',
                                          ).text(response.phoneNumber);
                                          $(
                                                 '#otpModalWithPasswordUpdation',
                                          ).modal('show');
                                   }
                                   if (response.otpError) {
                                          toastMixin.fire({
                                                 title: response.message,
                                                 icon: 'error',
                                                 animation: true,
                                          });
                                   }
                            },
                     });
              }
       });
}

// stopped here
function updatePhonenumber() {
       $('#savePhonenumberEditButton')
              .next('.cancelProfileUpdate')
              .prop('hidden', false),
              $('#updatePhonenumber').prop('disabled', false);
       $('#updatePhonenumberEditButton').prop('hidden', true);
       $('#savePhonenumberEditButton').prop('hidden', false);
       $('#savePhonenumberEditButton').click((e) => {
              $('#updatePhonenumberError').text('');
              Swal.fire({
                     title: 'Are you sure?',
                     text: 'Do your really want to update phone number ?',
                     icon: 'warning',
                     showCancelButton: true,
                     confirmButtonColor: '#3085d6',
                     cancelButtonColor: '#d33',
                     confirmButtonText: 'Yes, update',
              }).then((result) => {
                     if (result.isConfirmed) {
                            const form = document.getElementById(
                                   'updatePhonenumberForm',
                            );
                            formData = new FormData(form);
                            e.preventDefault();
                            $.ajax({
                                   type: 'post',
                                   data: formData,
                                   contentType: false,
                                   processData: false,
                                   url: '/updateProfile',
                                   success: (response) => {
                                          if (response.error500) {
                                                 window.location.href =
                                                        '/error500';
                                          }
                                          if (response.otpSent) {
                                                 $('#otpPhoneNumber').text(
                                                        `${response.phoneNumber}`,
                                                 );
                                                 $('#otpModal').modal('show');
                                                 $('#otp-form').attr(
                                                        'action',
                                                        '/verifyOtpAndUpdateUsername',
                                                 );
                                          }
                                          if (
                                                 response.otpError ||
                                                 response.updationError
                                          ) {
                                                 $(
                                                        '#updatePhonenumberError',
                                                 ).text(response.message);
                                          }
                                   },
                            });
                     }
              });
       });
}

function saveUpdateUsername() {
       Swal.fire({
              title: 'Are you sure?',
              text: 'Do your really want to update username ?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, update',
       }).then((result) => {
              if (result.isConfirmed) {
                     const form = document.getElementById('updateUsernameForm');
                     formData = new FormData(form);
                     $.ajax({
                            type: 'post',
                            data: formData,
                            contentType: false,
                            processData: false,
                            url: '/updateProfile',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href = '/error500';
                                   }
                                   if (response.updationSuccess) {
                                          Swal.fire(
                                                 'Success',
                                                 'Username updated successfully',
                                                 'success',
                                          );
                                          $('#headerUsername').text(
                                                 formData.get('username'),
                                          );

                                          $('#profileUsername').text(
                                                 formData.get('username'),
                                          );

                                          $('#updateUsername').prop(
                                                 'disabled',
                                                 true,
                                          );
                                          $('#updateUsernameEditButton').prop(
                                                 'hidden',
                                                 false,
                                          );
                                          $('#saveUsernameEditButton').prop(
                                                 'hidden',
                                                 true,
                                          );
                                          $('.cancelProfileUpdate').hide();
                                   }
                            },
                     });
              }
       });
}

function updateProfilePicture() {
       const form = document.getElementById('updateProfilePictureForm');
       const formData = new FormData(form);

       Swal.fire({
              title: 'Are you sure?',
              text: 'Do your really want to update profile picture ?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, update',
       }).then((result) => {
              if (result.isConfirmed) {
                     $.ajax({
                            type: 'post',
                            data: formData,
                            contentType: false,
                            processData: false,
                            url: '/updateProfile',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href = '/error500';
                                   }
                                   if (response.updationSuccess) {
                                          Swal.fire(
                                                 'Success',
                                                 'Profile picture updated successfully',
                                                 'success',
                                          );

                                          $('#updateButton').attr(
                                                 'hidden',
                                                 true,
                                          );
                                          $('#cancelButton').attr(
                                                 'hidden',
                                                 true,
                                          );
                                   }
                            },
                     });
              }
       });
}

document.addEventListener('DOMContentLoaded', (event) => {
       function OTPInput() {
              const inputs = document.querySelectorAll('#otp > *[id]');
              for (let i = 0; i < inputs.length; i++) {
                     inputs[i].addEventListener('keydown', (event) => {
                            if (event.key === 'Backspace') {
                                   inputs[i].value = '';
                                   if (i !== 0) inputs[i - 1].focus();
                            } else if (
                                   i === inputs.length - 1 &&
                                   inputs[i].value !== ''
                            ) {
                                   return true;
                            } else if (
                                   event.keyCode > 47 &&
                                   event.keyCode < 58
                            ) {
                                   inputs[i].value = event.key;
                                   if (i !== inputs.length - 1) {
                                          inputs[i + 1].focus();
                                   }
                                   event.preventDefault();
                            } else if (
                                   event.keyCode > 64 &&
                                   event.keyCode < 91
                            ) {
                                   inputs[i].value = String.fromCharCode(
                                          event.keyCode,
                                   );
                                   if (i !== inputs.length - 1) {
                                          inputs[i + 1].focus();
                                   }
                                   event.preventDefault();
                            }
                     });
              }
       }
       OTPInput();
});

function deleteAddress(addressId) {
       Swal.fire({
              title: 'Are you sure?',
              text: 'Do your really want to delete address?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete it',
       }).then((result) => {
              if (result.isConfirmed) {
                     $.ajax({
                            type: 'get',
                            url: `/deleteAddress/${addressId}`,
                            success(response) {
                                   if (response.error500) {
                                          window.location.href = '/error500';
                                   }
                                   if (response.addressDeleted) {
                                          $(`#addressDiv${addressId}`).remove();
                                          Swal.fire(
                                                 'Success',
                                                 'Status changed successfully',
                                                 'success',
                                          ).then(() => {
                                                 window.location.reload();
                                          });
                                   }
                            },
                     });
              }
       });
}
