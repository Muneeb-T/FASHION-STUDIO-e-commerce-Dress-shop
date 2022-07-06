/* eslint-disable no-undef */
/* eslint-disable indent */
$.validator.addMethod('allowedChars', (value) =>
       /^[A-Za-z0-9\d=!\-@._*]*$/.test(value),
);
$.validator.addMethod('alphanumeric', (value) => /[a-zA-Z]/.test(value));
$.validator.addMethod('uppercase', (value) => /[A-Z]/.test(value));
$.validator.addMethod('containDigits', (value) => /\d/.test(value));
$.validator.addMethod('startwithCharacter', (value) => /^[a-zA-Z]/.test(value));
$.validator.addMethod('charactersOnly', (value) => /[a-zA-Z]/.test(value));

const toastMixin = Swal.mixin({
       toast: true,
       icon: 'success',
       title: 'General Title',
       animation: false,
       position: 'top-right',
       showConfirmButton: false,
       timer: 3000,
       timerProgressBar: true,
       didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
       },
});

$('#user-signup-form').validate({
       debug: false,
       errorClass: 'authError text-danger text-uppercase stext-111 text-center',
       highlight(element) {
              $(element).removeClass('text-uppercase');
       },
       errorPlacement(error, element) {
              error.insertAfter(element.parent('div'));
       },
       submitHandler(form) {
              const formData = `${$(form).serialize()}`;
              $.ajax({
                     type: 'POST',
                     url: '/signup',
                     data: `${formData}`,
                     success: (response) => {
                            if (response.otpSent) {
                                   $('#authModal').modal('hide');
                                   $('#otpPhoneNumber').text(
                                          $(
                                                 '#user-signup-form input[name="phone_number"]',
                                          ).val(),
                                   );
                                   $('#otpModal').modal('show');
                            }
                            if (response.exist) {
                                   $('#signupError').text(response.message);
                            }
                            if (response.otpError) {
                                   $('#otpError').text(otpError.message);
                            }
                     },
              });
       },
       rules: {
              username: {
                     required: true,
                     startwithCharacter: true,
                     rangelength: [3, 20],
              },
              email: {
                     required: true,
                     email: true,
                     startwithCharacter: true,
              },
              phone_number: {
                     required: true,
                     minlength: 10,
                     maxlength: 10,
              },
              password: {
                     required: true,
                     minlength: 8,
                     allowedChars: true,
                     alphanumeric: true,
                     containDigits: true,
                     rangelength: [8, 30],
              },
       },
       messages: {
              username: {
                     required: 'Enter username',
                     startwithCharacter: 'Must start with character',
                     rangelength: 'Length must between 3-20 characters',
              },
              email: {
                     required: 'Enter email address',
                     email: 'Enter valid email address',
                     startwithCharacter: 'Must start with character',
              },
              phone_number: {
                     required: 'Enter phone number',
                     minlength: 'Must contain 10 digits',
                     maxlength: 'Only 10 digits allowed',
              },
              password: {
                     required: 'Enter password',
                     allowedChars:
                            'Allowed characters : A-Z a-z 0-9 @ * _ - . !',
                     containDigits: 'Password must contain al least one digit',
                     rangelength: 'Length: 8 - 30 characters',
                     alphanumeric: 'Must contain characters',
              },
       },
});

$('#user-login-form').validate({
       debug: false,
       errorClass: 'authError text-danger text-uppercase stext-111 text-center',
       highlight(element) {
              $(element).removeClass('text-uppercase');
       },
       errorPlacement(error, element) {
              error.insertAfter(element.parent('div'));
       },

       submitHandler(form) {
              const formData = `${$(form).serialize()}`;
              $.ajax({
                     type: 'POST',
                     url: '/login',
                     data: `${formData}`,
                     success: (response) => {
                            if (response.loginSuccess) {
                                   window.location.reload();
                            }

                            if (response.loginError) {
                                   $('#loginError').text(response.message);
                            }
                     },
              });
       },
       rules: {
              usernameOrEmail: {
                     required: true,
                     startwithCharacter: true,
                     rangelength: [3, 50],
              },
              password: {
                     required: true,
                     minlength: 8,
                     allowedChars: true,
                     containDigits: true,
                     rangelength: [8, 30],
              },
       },
       messages: {
              usernameOrEmail: {
                     required: 'Enter username',
                     startwithCharacter: 'Must start with character',
                     rangelength: 'Length must between 3-50 characters',
              },
              password: {
                     required: 'Enter password',
                     allowedChars:
                            'Allowed characters : A-Z a-z 0-9 @ * _ - . !',
                     containDigits: 'Password must contain al least one digit',
                     rangelength: 'Length: 8 - 30 characters',
              },
       },
});

$('#otp-form').validate({
       debug: false,
       errorClass: 'authError text-danger text-uppercase stext-111 text-center',
       highlight(element) {
              $(element).removeClass('text-uppercase');
       },
       errorPlacement(error, element) {
              error.insertAfter(element.parent('div'));
       },
       submitHandler(form) {
              const formData = $(form).serialize();
              $.ajax({
                     type: 'POST',
                     url: '/verifySmsOtp',
                     data: formData,
                     success: (response) => {
                            if (response.verifcationFailed) {
                                   $('#otpError').text('Invalid OTP.Try again');
                            }
                            if (response.signupSuccess) {
                                   location.reload();
                            }
                     },
              });
       },
});

$('#applyCouponForm').validate({
       debug: false,
       errorClass: 'authError text-danger text-uppercase stext-111 text-center',
       highlight(element) {
              $(element).removeClass('text-uppercase');
       },
       errorPlacement(error, element) {
              error.insertAfter(element.parent('div'));
       },
       submitHandler(form) {
              const formData = `${$(form).serialize()}`;
              $.ajax({
                     type: 'POST',
                     url: '/applyCoupon',
                     data: `${formData}`,
                     success: (response) => {},
              });
       },
       rules: {
              couponCode: {
                     required: true,
              },
       },
       messages: {
              couponCode: {
                     required: 'Enter username',
              },
       },
});

function verifyPayment(payment, order) {
       $.ajax({
              type: 'POST',
              url: '/verifyRazorpayPayment',
              data: {
                     payment,
                     order,
              },
              success: (response) => {
                     if (response.paymentSuccess) {
                            location.href = '/orderSuccess';
                     } else {
                            location.href = '/wentWrong';
                     }
              },
       });
}

function razorpayPayment(order, userDetails) {
       const options = {
              key: 'rzp_test_sC8PLG9Tdz0SK6', // Enter the Key ID generated from the Dashboard
              amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
              currency: 'INR',
              name: 'FASHION STUDIO',
              description: 'Test Transaction',
              image: 'https://example.com/your_logo',
              order_id: order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
              handler(response) {
                     // alert(response.razorpay_payment_id);
                     // alert(response.razorpay_order_id);
                     // alert(response.razorpay_signature);
                     verifyPayment(response, order);
              },
              prefill: {
                     name: userDetails.username,
                     email: userDetails.email,
                     contact: userDetails.phone_number,
              },
              notes: {
                     address: 'Razorpay Corporate Office',
              },
              theme: {
                     color: '#3399cc',
              },
       };
       const rzp1 = new Razorpay(options);
       rzp1.on('payment.failed', (response) => {
              // alert(response.error.code);
              // alert(response.error.description);
              // alert(response.error.source);
              // alert(response.error.step);
              // alert(response.error.reason);
              // alert(response.error.metadata.order_id);
              // alert(response.error.metadata.payment_id);
       });

       rzp1.open();
}

$('#checkoutForm').validate({
       debug: false,
       errorClass: 'authError text-danger text-uppercase stext-111 text-center',
       highlight(element) {
              $(element).removeClass('text-uppercase');
       },
       errorPlacement(error, element) {
              error.insertAfter(element.parent('div'));
       },
       submitHandler(form) {
              const formData = $(form).serialize();
              $.ajax({
                     type: 'POST',
                     url: '/placeOrder',
                     data: `${formData}`,
                     success: (response) => {
                            if (response.cod) {
                                   location.href = '/orderSuccess';
                            }
                            if (response.online) {
                                   razorpayPayment(
                                          response.razorpayOrder,
                                          response.userDetails,
                                   );
                            }
                     },
              });
       },
});
