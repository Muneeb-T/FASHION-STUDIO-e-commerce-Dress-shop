/* eslint-disable prefer-regex-literals */
/* eslint-disable indent */
/* eslint-disable no-undef */

const toastMixin = Swal.mixin({
       toast: true,
       icon: 'success',
       title: 'General Title',
       animation: false,
       position: 'top-right',
       showConfirmButton: false,
       timer: 2000,
       timerProgressBar: true,
       didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
       },
});
$.validator.addMethod('allowedChars', (value) =>
       /^[A-Za-z0-9\d=!\-@._*]*$/.test(value),
);
$.validator.addMethod('alphanumeric', (value) => /[a-zA-Z]/.test(value));
$.validator.addMethod('uppercase', (value) => /[A-Z]/.test(value));
$.validator.addMethod('containDigits', (value) => /\d/.test(value));
$.validator.addMethod('startwithCharacter', (value) => /^[a-zA-Z]/.test(value));
$.validator.addMethod('charactersOnly', (value) => /[a-zA-Z]/.test(value));

$(document).ready(() => {
       $('#admin-login').validate({
              debug: false,
              errorClass: 'authError text-danger text-uppercase',
              highlight(element) {
                     $(element).removeClass('text-uppercase');
              },
              submitHandler(form) {
                     const formData = $(form).serialize();
                     const actionUrl = $(form).attr('action');
                     $.ajax({
                            type: 'POST',
                            url: actionUrl,
                            data: formData,
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   } else if (response.login) {
                                          window.location.href =
                                                 '/admin/dashboard';
                                   } else {
                                          toastMixin.fire({
                                                 title: 'Invalid username or password',
                                                 icon: 'error',
                                                 animation: true,
                                          });
                                   }
                            },
                     });
              },

              rules: {
                     username: {
                            required: true,
                            startwithCharacter: true,
                            rangelength: [8, 20],
                     },
                     password: {
                            required: true,
                            minlength: 8,
                            allowedChars: true,
                            containDigits: true,
                            uppercase: true,
                            rangelength: [8, 30],
                     },
              },
              messages: {
                     username: {
                            required: 'Enter username',
                            startwithCharacter: 'Must start with character',
                            rangelength: 'Length must between 8-20 characters',
                     },
                     password: {
                            required: 'Enter password',
                            uppercase: 'Must contain at least one uppercase character',
                            allowedChars:
                                   'Allowed characters : A-Z a-z 0-9 @ * _ - . !',
                            containDigits:
                                   'Password must contain al least one digit',
                            rangelength: 'Length: 8 - 30 characters',
                     },
              },
       });

       $('#add-category-form').validate({
              debug: false,
              errorClass: 'text-danger text-uppercase',
              errorElement: 'small',
              highlight(element) {
                     $(element).removeClass('text-uppercase');
              },
              errorPlacement(error, element) {
                     error.insertAfter(element.parent('div'));
              },
              rules: {
                     category: {
                            required: true,
                            charactersOnly: true,
                            rangelength: [5, 50],
                     },
              },
              messages: {
                     category: {
                            required: 'Enter category',
                            charactersOnly: 'Only characters are allowed',
                            rangelength: 'Length must between 5-50 characters',
                     },
              },
              submitHandler(form) {
                     const formData = $(form).serialize();
                     const actionUrl = $(form).attr('action');
                     $.ajax({
                            type: 'POST',
                            url: actionUrl,
                            data: formData,
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   }
                                   if (response.addCateogrySuccess) {
                                          Swal.fire(
                                                 'Success',
                                                 'Category added successfully',
                                                 'success',
                                          ).then(() => {
                                                 window.location.reload();
                                          });
                                   } else {
                                          $('#addCategoryError').text(
                                                 response.message,
                                          );
                                   }
                            },
                     });
              },
       });

       $('#add-product-form').validate({
              debug: false,
              errorClass: 'text-danger text-uppercase',
              errorElement: 'small',
              ignore: [],
              highlight(element) {
                     $(element).removeClass('text-uppercase');
              },
              errorPlacement(error, element) {
                     if (element.attr('name') === 'product_image') {
                            error.insertAfter(
                                   element.parent('div').parent('div'),
                            );
                     } else {
                            error.insertAfter(element);
                     }
              },
              submitHandler(form) {
                     const formData = new FormData(form);
                     const actionUrl = $(form).attr('action');

                     $.ajax({
                            type: 'POST',
                            url: actionUrl,
                            contentType: false,
                            processData: false,
                            data: formData,
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   }
                                   if (response.productAddSuccess) {
                                          Swal.fire(
                                                 'Success',
                                                 'Product added successfully',
                                                 'success',
                                          ).then(() => {
                                                 window.location.href =
                                                        '/admin/products/all';
                                          });
                                   }
                            },
                     });
              },

              rules: {
                     productName: {
                            required: true,
                            startwithCharacter: true,
                            alphanumeric: true,
                     },
                     brandName: {
                            required: true,
                            startwithCharacter: true,
                            alphanumeric: true,
                     },
                     type: {
                            required: true,
                     },
                     category: {
                            required: true,
                     },
                     price: {
                            required: true,
                            number: true,
                     },
                     description: {
                            required: true,
                            rangelength: [150, 500],
                     },
                     XS: {
                            required: true,
                            number: true,
                     },
                     S: {
                            required: true,
                            number: true,
                     },
                     M: {
                            required: true,
                            number: true,
                     },
                     L: {
                            required: true,
                            number: true,
                     },
                     XL: {
                            required: true,
                            number: true,
                     },
                     '2XL': {
                            required: true,
                            number: true,
                     },
                     '3XL': {
                            required: true,
                            number: true,
                     },
                     '4XL': {
                            required: true,
                            number: true,
                     },
                     product_image: {
                            required: true,
                     },
              },
              messages: {
                     productName: {
                            required: 'Enter product name',
                            startwithCharacter: 'Must start with character',
                            alphanumeric: 'Only numbers and alphabets allowed',
                     },
                     brandName: {
                            required: 'Enter brand name',
                            startwithCharacter: 'Must start with character',
                            alphanumeric: 'Only numbers and alphabets allowed',
                     },
                     type: {
                            required: 'Select type',
                     },
                     category: {
                            required: 'Select category',
                     },
                     price: {
                            required: 'Enter price',
                     },
                     description: {
                            required: 'Enter description',
                            rangelength:
                                   'Length must between 150-500 characters',
                     },
                     XS: {
                            required: '*',
                     },
                     S: {
                            required: '*',
                     },
                     M: {
                            required: '*',
                     },
                     L: {
                            required: '*',
                     },
                     XL: {
                            required: '*',
                     },
                     '2XL': {
                            required: '*',
                     },
                     '3XL': {
                            required: '*',
                     },
                     '4XL': {
                            required: '*',
                     },
                     product_image: {
                            required: 'Upload 4 images',
                     },
              },
       });

       $('#edit-product-form').validate({
              errorClass: 'text-danger text-uppercase',
              errorElement: 'small',
              ignore: [],
              highlight(element) {
                     $(element).removeClass('text-uppercase');
              },
              submitHandler(form) {
                     const formData = new FormData(form);
                     const actionUrl = $(form).attr('action');
                     $.ajax({
                            type: 'POST',
                            url: actionUrl,
                            contentType: false,
                            processData: false,
                            data: formData,
                            success: (response) => {
                                   if (response.error500) {
                                          window.location.href =
                                                 '/admin/error500';
                                   }
                                   if (response.productEditSuccess) {
                                          Swal.fire(
                                                 'Success',
                                                 'Product edited successfully',
                                                 'success',
                                          ).then(() => {
                                                 window.location.reload();
                                          });
                                   }
                            },
                     });
              },
              errorPlacement(error, element) {
                     if (element.attr('name') === 'product_image') {
                            error.insertAfter(
                                   element.parent('div').parent('div'),
                            );
                     } else {
                            error.insertAfter(element);
                     }
              },

              rules: {
                     productName: {
                            required: true,
                            startwithCharacter: true,
                            alphanumeric: true,
                     },
                     brandName: {
                            required: true,
                            startwithCharacter: true,
                            alphanumeric: true,
                     },
                     type: {
                            required: true,
                     },
                     category: {
                            required: true,
                     },
                     price: {
                            required: true,
                            number: true,
                     },
                     description: {
                            required: true,
                            rangelength: [150, 500],
                     },
                     XS: {
                            required: true,
                            number: true,
                     },
                     S: {
                            required: true,
                            number: true,
                     },
                     M: {
                            required: true,
                            number: true,
                     },
                     L: {
                            required: true,
                            number: true,
                     },
                     XL: {
                            required: true,
                            number: true,
                     },
                     '2XL': {
                            required: true,
                            number: true,
                     },
                     '3XL': {
                            required: true,
                            number: true,
                     },
                     '4XL': {
                            required: true,
                            number: true,
                     },
                     product_image: {
                            required: true,
                     },
              },
              messages: {
                     productName: {
                            required: 'Enter product name',
                            startwithCharacter: 'Must start with character',
                            alphanumeric: 'Only numbers and alphabets allowed',
                     },
                     brandName: {
                            required: 'Enter brand name',
                            startwithCharacter: 'Must start with character',
                            alphanumeric: 'Only numbers and alphabets allowed',
                     },
                     type: {
                            required: 'Select type',
                     },
                     category: {
                            required: 'Select category',
                     },
                     price: {
                            required: 'Enter price',
                     },
                     description: {
                            required: 'Enter description',
                            rangelength:
                                   'Length must between 150-500 characters',
                     },
                     XS: {
                            required: '*',
                     },
                     S: {
                            required: '*',
                     },
                     M: {
                            required: '*',
                     },
                     L: {
                            required: '*',
                     },
                     XL: {
                            required: '*',
                     },
                     '2XL': {
                            required: '*',
                     },
                     '3XL': {
                            required: '*',
                     },
                     '4XL': {
                            required: '*',
                     },
                     product_image: {
                            required: 'Upload 4 images',
                     },
              },
       });
});

$('#addBannerForm').validate({
       debug: false,
       errorClass: 'text-danger text-uppercase',
       errorElement: 'small',
       highlight(element) {
              $(element).removeClass('text-uppercase');
       },
       errorPlacement(error, element) {
              if (element.attr('name') === 'banner_images') {
                     error.insertAfter(element.parent('div').parent('div'));
              } else {
                     error.insertAfter(element);
              }
       },
       rules: {
              title: {
                     required: true,
                     rangelength: [8, 50],
              },
              subtitle: {
                     required: true,
                     rangelength: [8, 30],
              },
              banner_images: {
                     required(element) {
                            if ($('#appendedBannerUpdate').val() === 'update') {
                                   return false;
                            }
                            return true;
                     },
              },
       },
       messages: {
              title: {
                     required: 'Enter title',
                     rangelength: 'Length must between 8-50 characters',
              },
              subtitle: {
                     required: 'Enter subtitle',
                     rangelength: 'Length must between 8-30 characters',
              },
              banner_images: {
                     required: 'Upload image',
              },
       },
       submitHandler(form) {
              const imagePreview = $('#banner-file-input')[0].files[0];
              const title = $('#banner-title-input').val();
              const subtitle = $('#banner-subtitle-input').val();
              let imageUrl;
              if (imagePreview) {
                     imageUrl = window.URL.createObjectURL(imagePreview);
              } else {
                     imageUrl = $('#profilePic').attr('src');
                     console.log(imageUrl);
              }

              Swal.fire({
                     title: 'Do you want to save banner?',
                     html: `<div class="col-12">
                     <div class="mb-3 position-relative">
              
                         <img id="bannerImagePreview" src="${imageUrl}" alt="">
                         <h6 class="position-absolute font-weight-bold"
                             style="top: 40%; left:10%; z-index : 100;">
                             ${subtitle}
                         </h6>

                         <h1 class="position-absolute font-weight-bold"
                             style="top: 46%; left:10%; z-index : 100;">
                             ${title}
                         </h1>
                         <button
                             class="btn text-light btn-primary btn-sm border-0 position-absolute px-5 text-uppercase font-weight-bold"
                             style="top: 60%; left:10%; z-index : 100; cursor: default; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; margin: 4px 2px; border-radius: 30px; background-color: #717fe0">
                             Shop Now
                         </button>
                     </div>
                 </div>`,
                     showCancelButton: true,
                     confirmButtonText: 'Save',
                     customClass: 'swal-wide',
              }).then((result) => {
                     /* Read more about isConfirmed, isDenied below */
                     if (result.isConfirmed) {
                            const formData = new FormData(form);
                            const actionUrl = $(form).attr('action');

                            $.ajax({
                                   type: 'POST',
                                   url: actionUrl,
                                   contentType: false,
                                   processData: false,
                                   data: formData,
                                   success: (response) => {
                                          if (response.error500) {
                                                 window.location.href =
                                                        '/admin/error500';
                                          }
                                          if (response.bannerAddSuccess) {
                                                 $('.reload-parent').load(
                                                        `${window.location.href} .reload-child > *`,
                                                 );
                                                 toastMixin.fire({
                                                        animation: true,
                                                        title: response.update
                                                               ? 'Banner updated successfully'
                                                               : 'Banner added successfully',
                                                 });
                                                 $(form)[0].reset();
                                                 $('#profilePic').attr(
                                                        'src',
                                                        '/admin/banner-images/banner-thumbnail',
                                                 );
                                          }
                                          $('#addBannerForm').attr(
                                                 'action',
                                                 '/admin/addBanners',
                                          );
                                          $('#addBannerSubmitButton').text(
                                                 'Add banner',
                                          );
                                          $('#appendedBannerUpdate').remove();
                                          $('#appendedBannerId').remove();
                                   },
                            });
                     }
              });
       },
});

$('#add-coupon-form').validate({
       debug: false,
       errorClass: 'text-danger text-uppercase',
       errorElement: 'small',
       highlight(element) {
              $(element).removeClass('text-uppercase');
       },
       errorPlacement(error, element) {
              if (element.attr('name') === 'couponCode') {
                     error.insertAfter(element.parent('div'));
              } else {
                     error.insertAfter(element);
              }
       },
       rules: {
              couponCode: {
                     required: true,
                     rangelength: [4, 8],
              },
              discount: {
                     required: true,
              },
              validity: {
                     required: true,
              },
              minimumPurchaseAmount: {
                     required: true,
              },
              limit: {
                     required: true,
              },
       },
       messages: {
              couponCode: {
                     required: 'Enter coupon code',
                     rangelength: 'Length must between 4-8 characters',
              },
              discount: {
                     required: 'Enter discount percentage',
              },
              validity: {
                     required: 'Enter coupon validity',
              },
              minimumPurchaseAmount: {
                     required: 'Enter minimum purchase amount',
              },
              limit: {
                     required: 'Enter limit',
              },
       },
       submitHandler: (form) => {
              const formData = $(form).serialize();
              const actionUrl = $(form).attr('action');
              $.ajax({
                     type: 'POST',
                     url: actionUrl,
                     data: formData,
                     success: (response) => {
                            if (response.error500) {
                                   window.location.href = '/admin/error500';
                            }
                            if (response.couponAddSuccess) {
                                   Swal.fire(
                                          'Success',
                                          'Coupon added successfully',
                                          'success',
                                   ).then(() => {
                                          window.location.reload();
                                   });
                            }
                     },
              });
       },
});
