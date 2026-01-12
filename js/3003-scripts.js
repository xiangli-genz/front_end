const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get('bookingId');
const bookingCode = urlParams.get('bookingCode');
const amount = urlParams.get('amount');
const error = urlParams.get('error');

if (bookingCode || amount) {
    document.getElementById('booking-info').style.display = 'block';
    
    if (bookingCode) {
        document.getElementById('booking-code').textContent = bookingCode;
    }
    if (amount) {
        document.getElementById('booking-amount').textContent = 
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
}

if (error) {
    console.error('Payment error:', error);
}

function retryPayment() {
    if (bookingId) {
        window.location.href = `/booking/payment?bookingId=${bookingId}`;
    } else {
        window.location.href = '/booking';
    }
}

const paymentCode = urlParams.get('paymentCode');
const method = urlParams.get('method');

if (paymentCode || amount || method) {
    document.getElementById('payment-info').style.display = 'block';
    
    if (paymentCode) {
        document.getElementById('payment-code').textContent = paymentCode;
    }
    if (amount) {
        document.getElementById('payment-amount').textContent = 
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
    if (method) {
        const methodNames = {
            'momo': 'MoMo',
            'zalopay': 'ZaloPay',
            'vnpay': 'VNPay',
            'cash': 'Tiền mặt',
            'bank': 'Chuyển khoản'
        };
        document.getElementById('payment-method').textContent = methodNames[method] || method;
    }
}

const progressText = document.getElementById('progress-text');
const steps = [
    'Đang kiểm tra trạng thái...',
    'Đang xác thực thanh toán...',
    'Đang chờ xác nhận...',
    'Đang hoàn tất...'
];

let currentStep = 0;
setInterval(() => {
    currentStep = (currentStep + 1) % steps.length;
    progressText.textContent = steps[currentStep];
}, 3000);


