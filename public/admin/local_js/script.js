/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable indent */

function editCategory(categoryId) {
       $(`#edit-category-error-${categoryId}`).text('');
       $(`#category-edit-button-${categoryId}`).text('SAVE');
       const disabled = $(`#category-name-input-${categoryId}`).is(':disabled');
       if (disabled) {
              $(`#category-name-input-${categoryId}`).removeClass(
                     'shadow-none background-disabled border-0',
              );
              $(`#category-name-input-${categoryId}`).prop(
                     'disabled',
                     !disabled,
              );
       }
       if (!disabled) {
              const value = $(`#category-name-input-${categoryId}`).val();
              if (value === '') {
                     $(`#edit-category-error-${categoryId}`).text(
                            'Enter category',
                     );
                     return false;
              }
              const onlyCharacters = /[a-zA-Z]/.test(value);
              if (!onlyCharacters) {
                     $(`#edit-category-error-${categoryId}`).text(
                            'Only characters are allowed',
                     );
                     return false;
              }

              if (value.length < 5 || value.length > 50) {
                     $(`#edit-category-error-${categoryId}`).text(
                            'Length: 5 - 50 characters',
                     );
                     return false;
              }

              Swal.fire({
                     title: 'Do you want to save the changes?',
                     showDenyButton: true,
                     showCancelButton: true,
                     confirmButtonText: 'Save',
                     denyButtonText: "Don't save",
              }).then((result) => {
                     /* Read more about isConfirmed, isDenied below */
                     if (result.isConfirmed) {
                            $.ajax({
                                   type: 'POST',
                                   url: '/admin/edit-category',
                                   data: {
                                          categoryId,
                                          name: $(
                                                 `#category-name-input-${categoryId}`,
                                          ).val(),
                                   }, // serializes the form's elements.
                                   success(data) {
                                          if (data.error500) {
                                                 window.location.href =
                                                        '/admin/error500';
                                          }
                                          if (data.updationSuccess) {
                                                 Swal.fire(
                                                        'Saved!',
                                                        '',
                                                        'success',
                                                 );
                                                 $(
                                                        `#category-name-input-${categoryId}`,
                                                 ).addClass(
                                                        'shadow-none background-disabled border-0',
                                                 );
                                                 $(
                                                        `#category-name-input-${categoryId}`,
                                                 ).prop('disabled', !disabled);
                                                 $(
                                                        `#category-edit-button-${categoryId}`,
                                                 ).text('EDIT');
                                          } else {
                                                 $(
                                                        `#edit-category-error-${categoryId}`,
                                                 ).text(
                                                        'Category already exist',
                                                 );
                                          }
                                   },
                            });
                     } else if (result.dismiss === Swal.DismissReason.cancel) {
                            $(`#edit-category-form-${categoryId}`)[0].reset();

                            $(`#category-name-input-${categoryId}`).addClass(
                                   'shadow-none background-disabled border-0',
                            );
                            $(`#category-name-input-${categoryId}`).prop(
                                   'disabled',
                                   !disabled,
                            );
                            $(`#category-edit-button-${categoryId}`).text(
                                   'EDIT',
                            );
                     }
              });
       }
}

$('#select-product-type').change(function (e) {
       e.preventDefault();
       const selected = $(this).val();
       console.log(selected);
       const sizeChartKids = [
              '2-3Y',
              '3-5Y',
              '5-7Y',
              '7-9Y',
              '9-10Y',
              '10-12Y',
              '12-14Y',
              '14-16Y',
       ];
       const sizeChartMenAndWomen = [
              'XS',
              'S',
              'M',
              'L',
              'XL',
              '2XL',
              '3XL',
              '4XL',
       ];

       $.each($('.size-chart-row').children('div'), (index) => {
              if (selected === 'men' || selected === 'women') {
                     $(
                            `.size-chart-row div:nth-child(${index + 1}) input`,
                     ).attr('placeholder', sizeChartMenAndWomen[index]);

                     $(
                            `.size-chart-row div:nth-child(${index + 1}) input`,
                     ).attr('name', sizeChartMenAndWomen[index]);
                     $(
                            `.size-chart-row div:nth-child(${index + 1}) label`,
                     ).text(sizeChartMenAndWomen[index]);
              } else {
                     $(
                            `.size-chart-row div:nth-child(${index + 1}) input`,
                     ).attr('placeholder', sizeChartKids[index]);
                     $(
                            `.size-chart-row div:nth-child(${index + 1}) input`,
                     ).attr('name', sizeChartKids[index]);
                     $(
                            `.size-chart-row div:nth-child(${index + 1}) label`,
                     ).text(sizeChartKids[index]);
              }
       });
});

$(document).ready(() => {
       $('#edit-product-form :input').prop('disabled', true);

       $('#edit-product-button').click((e) => {
              $('#edit-product-form :input').prop('disabled', false);
              $('#cancel-edit-product-button').prop('hidden', false);
              $('#edit-product-button').prop('hidden', true);
              $('#delete-product-button').prop('hidden', true);
       });
       $('#cancel-edit-product-button').click((e) => {
              $('#edit-product-form :input').prop('disabled', true);
              $('#cancel-edit-product-button').prop('hidden', true);
              $('#edit-product-form').trigger('reset');
              $('#edit-product-button').prop('hidden', false);
              $('#delete-product-button').prop('hidden', false);
       });
});

function viewOrEditDropdownList(productType, productCategory) {
       $(`.edit-type-element option[value='${productType}']`).prop(
              'selected',
              'selected',
       );

       $(
              `.edit-product-category-element option[value='${productCategory}']`,
       ).prop('selected', 'selected');
}

function deleteProduct(e, productId, view) {
       e.preventDefault();
       Swal.fire({
              title: 'Are you sure?',
              text:
                     view !== 'restore'
                            ? "You won't be able to revert this!"
                            : 'Product will be restored',
              icon: view === 'restore' ? 'success' : 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText:
                     view === 'restore' ? 'Yes restore it!' : 'Yes, delete it!',
       }).then((result) => {
              if (result.isConfirmed) {
                     $.ajax({
                            type: 'get',
                            url: `/admin/delete-product/${productId}`,
                            success(response) {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   }
                                   if (response.deleted) {
                                          Swal.fire(
                                                 view === 'restore'
                                                        ? 'Restored'
                                                        : 'Deleted!',
                                                 'Your file has been deleted.',
                                                 'success',
                                          );

                                          if (view === 'single-view') {
                                                 location.href =
                                                        '/admin/products/all';
                                          }
                                          if (
                                                 view === 'table' ||
                                                 view === 'restore'
                                          ) {
                                                 $(
                                                        `#product-row-${productId}`,
                                                 ).remove();
                                          }
                                   }
                            },
                     });
              }
       });
}

function deleteCategory(e, categoryId, isRestore) {
       e.preventDefault();
       Swal.fire({
              title: 'Are you sure?',
              icon: isRestore === 'true' ? 'success' : 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText:
                     isRestore === 'true'
                            ? 'Yes, restore it!'
                            : 'Yes, delete it!',
       }).then((result) => {
              if (result.isConfirmed) {
                     $.ajax({
                            type: 'get',
                            url: `/admin/delete-category/${categoryId}`,
                            success(response) {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   }
                                   if (response.deleted) {
                                          Swal.fire(
                                                 isRestore === 'true'
                                                        ? 'Restored'
                                                        : 'Deleted!',
                                                 isRestore === 'true'
                                                        ? 'Category has been restored'
                                                        : 'Category has been deleted.',
                                                 'success',
                                          );
                                          $(
                                                 `#category-row-${categoryId}`,
                                          ).remove();
                                   }
                            },
                     });
              }
       });
}

function allowOnlyLetters(e, input) {
       let charCode;
       if (window.event) {
              charCode = window.event.keyCode;
       } else if (e) {
              charCode = e.which;
       } else {
              return true;
       }
       if (
              (charCode > 64 && charCode < 91) ||
              (charCode > 96 && charCode < 123) ||
              charCode === 32
       ) {
              return true;
       }

       return false;
}

function allowAlphanuemricOnly(e, input) {
       let keyCode;
       if (window.event) {
              keyCode = window.event.keyCode;
       } else if (e) {
              keyCode = e.which;
       } else {
              return true;
       }
       if (
              !(keyCode === 32) && // space
              !(keyCode > 47 && keyCode < 58) && // numeric (0-9)
              !(keyCode > 64 && keyCode < 91) && // upper alpha (A-Z)
              !(keyCode > 96 && keyCode < 123)
       ) {
              return false;
       }

       return true;
}

$('input[type=number]').keypress((evt) => {
       if (
              (evt.which !== 8 && evt.which !== 0 && evt.which < 48) ||
              evt.which > 57
       ) {
              return false;
       }
});

function blockUser(event, userId) {
       const buttonText = $(`#blockUserButton${userId}`).text();

       Swal.fire({
              title: 'Are you sure?',
              text:
                     buttonText === 'Block'
                            ? 'Do you want to block user ?'
                            : 'Do you want to unblock user ?',
              icon: buttonText === 'Block' ? 'warning' : 'success',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: buttonText === 'Block' ? 'Block' : 'Unblock',
       }).then((result) => {
              if (result.isConfirmed) {
                     $.ajax({
                            type: 'post',
                            data: { userId },
                            url: '/admin/blockUser',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   }
                                   if (response.blockOrUnblockSuccess) {
                                          $(
                                                 `#blockUserButton${userId}`,
                                          ).toggleClass(
                                                 'badge-complete badge-pending',
                                          );

                                          if (
                                                 $(
                                                        `#blockUserButton${userId}`,
                                                 ).text() === 'Block'
                                          ) {
                                                 $(
                                                        `#blockUserButton${userId}`,
                                                 ).text('Unblock');
                                          } else {
                                                 $(
                                                        `#blockUserButton${userId}`,
                                                 ).text('Block');
                                          }
                                          $(`#userRow${userId}`).remove();
                                   }
                            },
                     });
              }
       });
}

function updateBanner(bannerId, updation, title, subtitle, image) {
       if (updation === 'remove') {
              Swal.fire({
                     title: 'Are you sure to delete this?',
                     text: "You won't be able to revert this!",
                     icon: 'warning',
                     showCancelButton: true,
                     confirmButtonColor: '#3085d6',
                     cancelButtonColor: '#d33',
                     confirmButtonText: 'Yes, delete it!',
              }).then((result) => {
                     if (result.isConfirmed) {
                            $.ajax({
                                   type: 'post',
                                   data: { bannerId, updation },
                                   url: '/admin/updateBanner',
                                   success: (response) => {
                                          if (response.error500) {
                                                 window.location.href =
                                                        '/admin/error500';
                                          }
                                          if (response.updationSuccess) {
                                                 toastMixin.fire({
                                                        animation: true,
                                                        title: 'Banner deleted successfully',
                                                 });
                                                 $(
                                                        `#bannerView${bannerId}`,
                                                 ).remove();
                                          }
                                   },
                            });
                     }
              });
       }
       if (updation === 'edit') {
              $('#banner-title-input').val(title);
              $('#banner-subtitle-input').val(subtitle);
              $('#profilePic').attr('src', image);
              $('#addBannerSubmitButton').text('Update banner');
              $('#addBannerForm').attr('action', '/admin/updateBanner');
              $('#addBannerForm')
                     .append(`<input type="text" name="bannerId" id="appendedBannerId" value="${bannerId}" /hidden>
                              <input type="text" name="updation" id="appendedBannerUpdate" value="update" /hidden>`);

              $('html, body').animate({ scrollTop: 0 }, 'fast');
       }
}

function generateCouponCode() {
       let text = '';
       const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

       for (let i = 0; i < 8; i++) {
              text += possible.charAt(
                     Math.floor(Math.random() * possible.length),
              );
       }

       $('#coupon-code-input').val(text);
}

function deleteCoupon(event, couponId) {
       event.preventDefault();
       Swal.fire({
              title: 'Are you sure to delete this?',
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete it!',
       }).then((result) => {
              if (result.isConfirmed) {
                     $.ajax({
                            type: 'post',
                            data: { couponId },
                            url: '/admin/deleteCoupon',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   }
                                   if (response.couponDelete) {
                                          toastMixin.fire({
                                                 animation: true,
                                                 title: 'Coupon deleted successfully',
                                          });
                                          $(`#couponRow${couponId}`).remove();
                                   }
                            },
                     });
              }
       });
}

function onlyTwoNumbers(input) {
       if (input.value.length > 1) {
              return false;
       }
}

function changeOrderStatus(orderId) {
       Swal.fire({
              title: 'Are you sure?',
              text: 'Do you really want to change order status ?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes , change it',
       }).then((result) => {
              if (result.isConfirmed) {
                     const status = $(`#order-status${orderId}`).val();
                     $.ajax({
                            type: 'post',
                            data: { orderId, status },
                            url: '/admin/changeOrderStatus',
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   }
                                   if (response.orderStatusChangeSuccess) {
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
              } else {
                     return false;
              }
       });
}

function readMessage(messageId, productId) {

       $.ajax({
              type: 'post',
              data: { messageId },
              url: '/admin/readMessage',
              success: (response) => {
                     if (response.error500) {
                            window.location.href = '/admin/error500';
                     }
                     if (response.messageReadSuccess) {
                            location.href = `/admin/product/${productId}`;
                     }
              },
       });
}
