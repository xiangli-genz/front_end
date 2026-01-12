const serviceUrl = 'http://localhost:3002';

// Dữ liệu mẫu để test

async function loadBookingInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');
  const paymentCode = urlParams.get('paymentCode');
  const bookingCode = urlParams.get('bookingCode');
  const useDemo = urlParams.get('demo'); // Thêm tham số demo

  // Nếu có tham số demo hoặc không có bookingId/bookingCode, dùng dữ liệu mẫu
  if (useDemo === 'true' || (!bookingId && !bookingCode)) {
    console.log('Sử dụng dữ liệu mẫu');
    setTimeout(() => {
      displayBooking(sampleBooking);
      generateQRCode(sampleBooking);
    }, 1000); // Giả lập loading
    return;
  }

  try {
    let booking;

    if (bookingId) {
      const response = await fetch(`${serviceUrl}/api/bookings/${bookingId}`);
      if (!response.ok) throw new Error('Không tìm thấy booking');
      const data = await response.json();
      booking = data.data.booking;
    } else if (bookingCode) {
      const response = await fetch(`${serviceUrl}/api/bookings?code=${bookingCode}`);
      if (!response.ok) throw new Error('Không tìm thấy booking');
      const data = await response.json();
      booking = data.data.booking;
    }

    displayBooking(booking);
    generateQRCode(booking);
  } catch (error) {
    console.error('Error loading booking:', error);
    // Nếu API lỗi, fallback sang dữ liệu mẫu
    console.log('API lỗi, sử dụng dữ liệu mẫu');
    displayBooking(sampleBooking);
    generateQRCode(sampleBooking);
  }
}

function displayBooking(booking) {
  document.getElementById('bookingCodeDisplay').textContent = booking.bookingCode;
  
  document.getElementById('movieName').textContent = booking.movieName || 'Chưa có thông tin';
  document.getElementById('cinema').textContent = booking.cinema || 'Chưa có thông tin';
  
  if (booking.showtime) {
    const date = new Date(booking.showtime.date);
    document.getElementById('showtimeDate').textContent = date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('showtimeTime').textContent = booking.showtime.time;
  }

  const seatsContainer = document.getElementById('seatsContainer');
  seatsContainer.innerHTML = '';
  if (booking.seats && booking.seats.length > 0) {
    booking.seats.forEach(seat => {
      const badge = document.createElement('div');
      badge.className = 'seat-badge';
      badge.textContent = seat.seatNumber;
      seatsContainer.appendChild(badge);
    });
  }

  if (booking.combos && booking.combos.length > 0) {
    document.getElementById('combosSection').style.display = 'block';
    const combosContainer = document.getElementById('combosContainer');
    combosContainer.innerHTML = '';
    
    booking.combos.forEach(combo => {
      const comboDiv = document.createElement('div');
      comboDiv.className = 'combo-item';
      comboDiv.innerHTML = `
        <div class="combo-name">${combo.name}</div>
        <div class="combo-details">
          <span>Số lượng: ${combo.quantity}</span>
          <span>${combo.totalPrice.toLocaleString('vi-VN')}đ</span>
        </div>
      `;
      combosContainer.appendChild(comboDiv);
    });
  }

  document.getElementById('customerName').textContent = booking.fullName || '-';
  document.getElementById('customerPhone').textContent = booking.phone || '-';
  document.getElementById('customerEmail').textContent = booking.email || '-';

  const methodNames = {
    'cash': 'Tiền mặt',
    'momo': 'MoMo',
    'zalopay': 'ZaloPay',
    'vnpay': 'VNPay',
    'bank': 'Chuyển khoản',
    'credit': 'Thẻ tín dụng'
  };
  document.getElementById('paymentMethod').textContent = methodNames[booking.paymentMethod] || booking.paymentMethod;

  const statusEl = document.getElementById('paymentStatus');
  if (booking.paymentStatus === 'paid') {
    statusEl.textContent = 'Đã thanh toán';
    statusEl.className = 'payment-status paid';
    document.getElementById('unpaidAlert').style.display = 'none';
  } else {
    statusEl.textContent = 'Chưa thanh toán';
    statusEl.className = 'payment-status unpaid';
    document.getElementById('unpaidAlert').style.display = 'flex';
  }

  document.getElementById('subTotal').textContent = (booking.subTotal || 0).toLocaleString('vi-VN') + 'đ';
  
  if (booking.comboTotal > 0) {
    document.getElementById('comboTotalRow').style.display = 'flex';
    document.getElementById('comboTotal').textContent = booking.comboTotal.toLocaleString('vi-VN') + 'đ';
  }

  if (booking.discount > 0) {
    document.getElementById('discountRow').style.display = 'flex';
    document.getElementById('discount').textContent = '-' + booking.discount.toLocaleString('vi-VN') + 'đ';
  }

  document.getElementById('totalAmount').textContent = (booking.total || 0).toLocaleString('vi-VN') + 'đ';

  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('successContent').style.display = 'block';
}

function generateQRCode(booking) {
  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';

  // Tạo dữ liệu QR code
  const qrData = JSON.stringify({
    bookingCode: booking.bookingCode,
    movieName: booking.movieName,
    cinema: booking.cinema,
    showtime: booking.showtime,
    seats: booking.seats.map(s => s.seatNumber).join(', '),
    total: booking.total
  });

  // Sử dụng thư viện QRCode.js
  new QRCode(qrContainer, {
    text: qrData,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function downloadQRCode() {
  const canvas = document.querySelector('#qrcode canvas');
  if (!canvas) {
    alert('QR code chưa được tạo');
    return;
  }

  // Chuyển canvas thành image và download
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `qr-code-${document.getElementById('bookingCodeDisplay').textContent}.png`;
  link.href = url;
  link.click();
}

function downloadTicket() {
  // Tạo nội dung vé để download dưới dạng PDF hoặc image
  // Có thể sử dụng thư viện như html2canvas hoặc jsPDF
  window.print();
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('errorContent').style.display = 'block';
}

window.addEventListener('DOMContentLoaded', loadBookingInfo);