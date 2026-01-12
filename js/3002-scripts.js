// main-app/public/assets/js/scripts.js
// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-button-menu");
if (buttonMenuMobile) {
  const sider = document.querySelector(".sider");
  const siderOverlay = document.querySelector(".sider-overlay");

  buttonMenuMobile.addEventListener("click", () => {
    sider.classList.add("active");
    siderOverlay.classList.add("active");
  });

  siderOverlay.addEventListener("click", () => {
    sider.classList.remove("active");
    siderOverlay.classList.remove("active");
  });
}
// End Menu Mobile

// Schedule Section 8
const scheduleSection8 = document.querySelector(".section-8 .inner-schedule");
if (scheduleSection8) {
  const buttonCreate = scheduleSection8.querySelector(".inner-schedule-create");
  const listItem = scheduleSection8.querySelector(".inner-schedule-list");

  // Tạo mới
  if (buttonCreate) {
    buttonCreate.addEventListener("click", () => {
      const firstItem = listItem.querySelector(".inner-schedule-item");
      const cloneItem = firstItem.cloneNode(true);
      cloneItem.querySelector(".inner-schedule-head input").value = "";

      const body = cloneItem.querySelector(".inner-schedule-body");
      const id = `mce_${Date.now()}`;
      body.innerHTML = `<textarea textarea-mce id="${id}"></textarea>`;

      listItem.appendChild(cloneItem);

      initTinyMCE(`#${id}`);
    });
  }

  listItem.addEventListener("click", (event) => {
    // Đóng/mở item
    if (event.target.closest(".inner-more")) {
      const parentItem = event.target.closest(".inner-schedule-item");
      if (parentItem) {
        parentItem.classList.toggle("hidden");
      }
    }

    // Xóa item
    if (event.target.closest(".inner-remove")) {
      const parentItem = event.target.closest(".inner-schedule-item");
      const totalItem = listItem.querySelectorAll(
        ".inner-schedule-item"
      ).length;
      if (parentItem && totalItem > 1) {
        parentItem.remove();
      }
    }
  });

  // Sắp xếp
  new Sortable(listItem, {
    animation: 150, // Thêm hiệu ứng mượt mà
    handle: ".inner-move", // Chỉ cho phép kéo bằng class .inner-move
    onStart: (event) => {
      const textarea = event.item.querySelector("[textarea-mce]");
      const id = textarea.id;
      tinymce.get(id).remove();
    },
    onEnd: (event) => {
      const textarea = event.item.querySelector("[textarea-mce]");
      const id = textarea.id;
      initTinyMCE(`#${id}`);
    },
  });
}
// End Schedule Section 8

// Filepond Image
const listFilepondImage = document.querySelectorAll("[filepond-image]");
let filePond = {};
if (listFilepondImage.length > 0) {
  listFilepondImage.forEach((filepondImage) => {
    FilePond.registerPlugin(FilePondPluginImagePreview);
    FilePond.registerPlugin(FilePondPluginFileValidateType);

    let files = null;
    const elementImageDefault = filepondImage.closest("[image-default]");
    if (elementImageDefault) {
      const imageDefault = elementImageDefault.getAttribute("image-default");
      if (imageDefault) {
        files = [
          {
            source: imageDefault, // Đường dẫn ảnh
          },
        ];
      }
    }

    filePond[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: "+",
      files: files,
    });
  });
}
// End Filepond Image

// Filepond Image Multi
const listFilepondImageMulti = document.querySelectorAll(
  "[filepond-image-multi]"
);
let filePondMulti = {};
if (listFilepondImageMulti.length > 0) {
  listFilepondImageMulti.forEach((filepondImage) => {
    FilePond.registerPlugin(FilePondPluginImagePreview);
    FilePond.registerPlugin(FilePondPluginFileValidateType);

    let files = null;
    const elementListImageDefault = filepondImage.closest(
      "[list-image-default]"
    );
    if (elementListImageDefault) {
      let listImageDefault =
        elementListImageDefault.getAttribute("list-image-default");
      if (listImageDefault) {
        listImageDefault = JSON.parse(listImageDefault);
        files = [];
        listImageDefault.forEach((image) => {
          files.push({
            source: image, // Đường dẫn ảnh
          });
        });
      }
    }

    filePondMulti[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: "+",
      files: files,
    });
  });
}
// End Filepond Image Multi

// Biểu đồ doanh thu
const revenueChart = document.querySelector("#revenue-chart");
if(revenueChart) {
  let chart = null;
  const drawChart = (date) => {
    // Lấy tháng và năm hiện tại
      const currentMonth = date.getMonth() + 1; // getMonth() trả về giá trị từ 0 đến 11, nên cần +1
      const currentYear = date.getFullYear();

      // Tạo một đối tượng Date mới cho tháng trước
      // Nếu hiện tại là tháng 1 thì new Date(currentYear, 0 - 1, 1) sẽ tự động chuyển thành tháng 12 của năm trước.
      const previousMonthDate = new Date(currentYear, date.getMonth() - 1, 1);

      // Lấy tháng và năm từ đối tượng previousMonthDate
      const previousMonth = previousMonthDate.getMonth() + 1;
      const previousYear = previousMonthDate.getFullYear();

      // Lấy ra tổng số ngày
      const daysInMonthCurrent = new Date(currentYear, currentMonth, 0).getDate();
      const daysInMonthPrevious = new Date(previousYear, previousMonth, 0).getDate();
      const days = daysInMonthCurrent > daysInMonthPrevious ? daysInMonthCurrent : daysInMonthPrevious;
      const arrayDay = [];
      for(let i = 1; i <= days; i++) {
        arrayDay.push(i);
      }

      const dataFinal = {
        currentMonth: currentMonth,
        currentYear: currentYear,
        previousMonth: previousMonth,
        previousYear: previousYear,
        arrayDay: arrayDay
      };

      fetch(`/${pathAdmin}/dashboard/revenue-chart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            alert(data.message);
          }

          if(data.code == "success") {
            if(chart) {
              chart.destroy();
            }
            chart = new Chart(revenueChart, {
              type: 'line',
              data: {
                labels: arrayDay,
                datasets: [
                  {
                    label: `Tháng ${currentMonth}/${currentYear}`, // Nhãn của dataset
                    data: data.dataMonthCurrent, // Dữ liệu
                    borderColor: '#4379EE', // Màu viền
                    borderWidth: 1.5, // Độ dày của đường
                  },
                  {
                    label: `Tháng ${previousMonth}/${previousYear}`, // Nhãn của dataset
                    data: data.dataMonthPrevious, // Dữ liệu
                    borderColor: '#EF3826', // Màu viền
                    borderWidth: 1.5, // Độ dày của đường
                  }
                ]
              },
              options: {
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Ngày'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Doanh thu (VND)'
                    }
                  }
                },
                maintainAspectRatio: false, // Không giữ tỷ lệ khung hình mặc định
              }
            });
          }
        })
  }

  // Lấy ngày hiện tại
  const now = new Date();
  drawChart(now);

  const inputMonth = document.querySelector(".section-2 input[type='month']");
  inputMonth.addEventListener("change", () => {
    const value = inputMonth.value;
    drawChart(new Date(value));
  })
}
// Hết Biểu đồ doanh thu

// Category Create/Edit (validation-based handlers are defined in separate admin-only block)
// For pages that use plain forms (non-admin client), use the simpler handlers later in the file.
// This section intentionally left minimal to avoid duplicate handlers.
// Category create/edit are handled in the minimal form-specific code blocks found near the end of this file.


// Tours removed — not used in Booking-service frontend


// Orders (edit) removed — not used in Booking-service frontend


// Website settings removed — not used in Booking-service frontend


// Admin account create removed — not used in Booking-service frontend

// Admin account edit removed — not used in Booking-service frontend


// Roles create removed — not used in Booking-service frontend


// Roles edit removed — not used in Booking-service frontend


// Profile forms removed — not used in Booking-service frontend


// Sider
const sider = document.querySelector(".sider");
if (sider) {
  const pathNameCurrent = window.location.pathname;
  const splitPathNameCurrent = pathNameCurrent.split("/");
  const menuList = sider.querySelectorAll("a");
  menuList.forEach((item) => {
    const href = item.href;
    const pathName = new URL(href).pathname;
    const splitPathName = pathName.split("/");
    if (
      splitPathNameCurrent[1] == splitPathName[1] &&
      splitPathNameCurrent[2] == splitPathName[2]
    ) {
      item.classList.add("active");
    }
  });
}
// End Sider

// Logout
const buttonLogout = document.querySelector(".sider .inner-logout");
if (buttonLogout) {
  buttonLogout.addEventListener("click", () => {
    fetch(`/${pathAdmin}/account/logout`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code == "success") {
          window.location.href = `/${pathAdmin}/account/login`;
        }
      });
  });
}
// End Logout

// Alert
const alertTime = document.querySelector("[alert-time]");
if (alertTime) {
  let time = alertTime.getAttribute("alert-time");
  time = time ? parseInt(time) : 4000;
  setTimeout(() => {
    alertTime.remove(); // Xóa phần tử khỏi giao diện
  }, time);
}
// End Alert

// Button Delete
const listButtonDelete = document.querySelectorAll("[button-delete]");
if (listButtonDelete.length > 0) {
  listButtonDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const dataApi = button.getAttribute("data-api");

      fetch(dataApi, {
        method: "PATCH",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            alert(data.message);
          }

          if (data.code == "success") {
            window.location.reload();
          }
        });
    });
  });
}
// End Button Delete

// Filter Status
const filterStatus = document.querySelector("[filter-status]");
if (filterStatus) {
  const url = new URL(window.location.href);

  // Lắng nghe thay đổi lựa chọn
  filterStatus.addEventListener("change", () => {
    const value = filterStatus.value;
    if (value) {
      url.searchParams.set("status", value);
    } else {
      url.searchParams.delete("status");
    }

    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("status");
  if (valueCurrent) {
    filterStatus.value = valueCurrent;
  }
}
// End Filter Status

// Filter Created By
const filterCreatedBy = document.querySelector("[filter-created-by]");
if (filterCreatedBy) {
  const url = new URL(window.location.href);

  // Lắng nghe thay đổi lựa chọn
  filterCreatedBy.addEventListener("change", () => {
    const value = filterCreatedBy.value;
    if (value) {
      url.searchParams.set("createdBy", value);
    } else {
      url.searchParams.delete("createdBy");
    }

    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("createdBy");
  if (valueCurrent) {
    filterCreatedBy.value = valueCurrent;
  }
}
// End Filter Created By

// Filter Start Date
const filterStartDate = document.querySelector("[filter-start-date]");
if (filterStartDate) {
  const url = new URL(window.location.href);

  // Lắng nghe thay đổi lựa chọn
  filterStartDate.addEventListener("change", () => {
    const value = filterStartDate.value;
    if (value) {
      url.searchParams.set("startDate", value);
    } else {
      url.searchParams.delete("startDate");
    }

    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("startDate");
  if (valueCurrent) {
    filterStartDate.value = valueCurrent;
  }
}
// End Filter Start Date

// Filter End Date
const filterEndDate = document.querySelector("[filter-end-date]");
if (filterEndDate) {
  const url = new URL(window.location.href);

  // Lắng nghe thay đổi lựa chọn
  filterEndDate.addEventListener("change", () => {
    const value = filterEndDate.value;
    if (value) {
      url.searchParams.set("endDate", value);
    } else {
      url.searchParams.delete("endDate");
    }

    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("endDate");
  if (valueCurrent) {
    filterEndDate.value = valueCurrent;
  }
}
// End Filter End Date

// Filter Reset
const filterReset = document.querySelector("[filter-reset]");
if (filterReset) {
  const url = new URL(window.location.href);

  filterReset.addEventListener("click", () => {
    url.search = "";
    window.location.href = url.href;
  });
}
// End Filter Reset

// Check All
const checkAll = document.querySelector("[check-all]");
if (checkAll) {
  checkAll.addEventListener("click", () => {
    const listCheckItem = document.querySelectorAll("[check-item]");
    listCheckItem.forEach((item) => {
      item.checked = checkAll.checked;
    });
  });
}
// End Check All

// Change Multi
const changeMulti = document.querySelector("[change-multi]");
if (changeMulti) {
  const dataApi = changeMulti.getAttribute("data-api");
  const select = changeMulti.querySelector("select");
  const button = changeMulti.querySelector("button");

  button.addEventListener("click", () => {
    const option = select.value;
    const listInputChecked = document.querySelectorAll("[check-item]:checked");
    if (option && listInputChecked.length > 0) {
      const ids = [];
      listInputChecked.forEach((inputChecked) => {
        const id = inputChecked.getAttribute("check-item");
        ids.push(id);
      });

      const dataFinal = {
        option: option,
        ids: ids,
      };

      fetch(dataApi, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            alert(data.message);
          }

          if (data.code == "success") {
            window.location.reload();
          }
        });
    } else {
      alert("Vui lòng chọn option và bản ghi muốn thực hiện!");
    }
  });
}
// End Change Multi

// Search
const search = document.querySelector("[search]");
if (search) {
  const url = new URL(window.location.href);

  // Lắng nghe phím đang gõ
  search.addEventListener("keyup", (event) => {
    if (event.code == "Enter") {
      const value = search.value;
      if (value) {
        url.searchParams.set("keyword", value.trim());
      } else {
        url.searchParams.delete("keyword");
      }

      window.location.href = url.href;
    }
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("keyword");
  if (valueCurrent) {
    search.value = valueCurrent;
  }
}
// End Search

// Pagination
const pagination = document.querySelector("[pagination]");
if (pagination) {
  const url = new URL(window.location.href);

  // Lắng nghe thay đổi lựa chọn
  pagination.addEventListener("change", () => {
    const value = pagination.value;
    if (value) {
      url.searchParams.set("page", value);
    } else {
      url.searchParams.delete("page");
    }

    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("page");
  if (valueCurrent) {
    pagination.value = valueCurrent;
  }
}
// End Filter Status
// Booking Edit Form
const bookingEditForm = document.querySelector("#booking-edit-form");
if (bookingEditForm) {
  const validation = new JustValidate("#booking-edit-form");

  validation
    .addField("#fullName", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên!",
      },
      {
        rule: "minLength",
        value: 5,
        errorMessage: "Họ tên phải có ít nhất 5 ký tự!",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Họ tên không được vượt quá 50 ký tự!",
      },
    ])
    .addField("#phone", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại!",
      },
      {
        rule: "customRegexp",
        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        errorMessage: "Số điện thoại không đúng định dạng!",
      },
    ])
    .addField("#email", [
      {
        rule: "email",
        errorMessage: "Email không đúng định dạng!",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const fullName = event.target.fullName.value;
      const phone = event.target.phone.value;
      const email = event.target.email.value;
      const note = event.target.note.value;
      const paymentMethod = event.target.paymentMethod.value;
      const paymentStatus = event.target.paymentStatus.value;
      const status = event.target.status.value;

      const dataFinal = {
        fullName: fullName,
        phone: phone,
        email: email,
        note: note,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        status: status,
      };

      fetch(`/${pathAdmin}/booking/edit/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            alert(data.message);
          }

          if (data.code == "success") {
            window.location.reload();
          }
        });
    });
}
// End Booking Edit Form
// ===== GLOBAL STATE =====
const bookingState = {
    movieId: null,
    movieName: null,
    movieAvatar: null,
    movieDuration: null,
    movieAgeRating: null,
    cinema: '',
    date: '',
    time: '',
    format: '',
    selectedSeats: [],
    ticketPrice: 0,
    prices: {
        standard: 50000,
        vip: 60000,
        couple: 110000
    },
    combos: {},
    comboTotal: 0,
    customerInfo: {
        name: '',
        phone: '',
        email: '',
        note: ''
    },
    paymentMethod: 'cash',
    bookingId: null,
    bookingCode: null
};

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    console.log('=== PAGE LOADED ===', currentPage);
    
    // Load movie detail
    if (currentPage.includes('/movie/detail/')) {
        const movieId = currentPage.split('/').pop();
        loadMovieDetail(movieId);
    }
    
    // Initialize seat grid
    if (document.getElementById('seat-grid')) {
        console.log('Initializing seat grid...');
        initSeatGrid();
    }
    
    // Initialize combo page
    if (document.getElementById('page-combo-selection')) {
        console.log('Initializing combo page...');
        initComboPage();
    }
    
    // Initialize checkout page
    if (document.getElementById('page-checkout')) {
        console.log('Initializing checkout page...');
        initCheckoutPage();
    }
});

// ===== LOAD MOVIE DETAIL =====
async function loadMovieDetail(movieId) {
    try {
        const loadingEl = document.getElementById('loading-state');
        const contentEl = document.getElementById('movie-detail-content');
        
        const res = await fetch(`/api/movies/${movieId}`);
        const data = await res.json();
        
        if (data.code === 'success') {
            const movie = data.data.movie;
            
            // ✅ Save FULL movie data to state
            bookingState.movieId = movie._id;
            bookingState.movieName = movie.name;
            bookingState.movieAvatar = movie.avatar;
            bookingState.movieDuration = movie.duration;
            bookingState.movieAgeRating = movie.ageRating;
            bookingState.prices = movie.prices || bookingState.prices;
            
            // ✅ Update ALL movie info in UI
            document.getElementById('movie-avatar').src = movie.avatar;
            document.getElementById('movie-name').textContent = movie.name;
            document.getElementById('movie-age-rating').textContent = movie.ageRating;
            document.getElementById('movie-language').textContent = movie.language;
            document.getElementById('movie-duration').textContent = movie.duration;
            document.getElementById('movie-director').textContent = movie.director;
            document.getElementById('movie-cast').textContent = movie.cast;
            document.getElementById('movie-category').textContent = movie.category;
            document.getElementById('movie-description').textContent = movie.description;
            
            const releaseDate = new Date(movie.releaseDate);
            document.getElementById('movie-release-date').textContent = releaseDate.toLocaleDateString('vi-VN');
            
            // Render showtimes
            renderShowtimes(movie.showtimes);
            
            // Hide loading, show content
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
        }
    } catch (err) {
        console.error('Error loading movie:', err);
        document.getElementById('loading-state').innerHTML = `
            <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #EF5350;"></i>
            <p style="margin-top: 20px; color: #666;">Không thể tải thông tin phim!</p>
            <button onclick="window.location.href='/'" class="btn btn-primary" style="margin-top: 15px;">
                <i class="fa-solid fa-home"></i> Về trang chủ
            </button>
        `;
    }
}

// ===== RENDER SHOWTIMES =====
function renderShowtimes(showtimes) {
    if (!showtimes || showtimes.length === 0) return;
    
    const cinemaList = document.querySelector('.cinema-list');
    if (!cinemaList) return;
    
    // Group by cinema
    const grouped = {};
    showtimes.forEach(st => {
        if (!grouped[st.cinema]) {
            grouped[st.cinema] = {};
        }
        const dateKey = new Date(st.date).toISOString().split('T')[0];
        if (!grouped[st.cinema][dateKey]) {
            grouped[st.cinema][dateKey] = {
                times: st.times || [],
                format: st.format
            };
        }
    });
    
    cinemaList.innerHTML = '';
    
    Object.keys(grouped).forEach(cinema => {
        const cinemaItem = document.createElement('div');
        cinemaItem.className = 'cinema-item';
        
        let datesHTML = '<div class="date-tabs">';
        const dates = Object.keys(grouped[cinema]);
        dates.forEach((date, idx) => {
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
            const dayNum = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            
            datesHTML += `
                <div class="date-tab ${idx === 0 ? 'active' : ''}" data-date="${date}">
                    <div style="font-weight: 700;">${dayName}</div>
                    <div style="font-size: 12px;">${dayNum}</div>
                </div>
            `;
        });
        datesHTML += '</div>';
        
        let timesHTML = '<div class="time-slots">';
        const firstDate = dates[0];
        const times = grouped[cinema][firstDate].times;
        const format = grouped[cinema][firstDate].format;
        
        times.forEach(time => {
            timesHTML += `
                <div class="time-slot" data-time="${time}" data-format="${format}">
                    ${time} - ${format}
                </div>
            `;
        });
        timesHTML += '</div>';
        
        cinemaItem.innerHTML = `
            <div class="cinema-name"><i class="fa-solid fa-building"></i> ${cinema}</div>
            ${datesHTML}
            ${timesHTML}
        `;
        
        cinemaList.appendChild(cinemaItem);
    });
    
    attachShowtimeListeners();
}

// ===== ATTACH SHOWTIME LISTENERS =====
function attachShowtimeListeners() {
    document.querySelectorAll('.date-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const parent = this.closest('.cinema-item');
            parent.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            parent.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
            checkShowtimeSelection();
        });
    });
    
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            
            const cinemaItem = this.closest('.cinema-item');
            const cinemaName = cinemaItem.querySelector('.cinema-name').textContent.trim().split(' ').slice(1).join(' ');
            const activeDate = cinemaItem.querySelector('.date-tab.active');
            const dateValue = activeDate ? activeDate.getAttribute('data-date') : '';
            
            bookingState.cinema = cinemaName;
            bookingState.date = dateValue;
            bookingState.time = this.getAttribute('data-time');
            bookingState.format = this.getAttribute('data-format');
            
            checkShowtimeSelection();
        });
    });
    
    const btnToSeat = document.getElementById('btn-to-seat');
    if (btnToSeat) {
        btnToSeat.addEventListener('click', function() {
            if (bookingState.time) {
                sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
                window.location.href = '/booking/seat';
            }
        });
    }
}

function checkShowtimeSelection() {
    const btn = document.getElementById('btn-to-seat');
    if (btn) {
        btn.disabled = !bookingState.time;
    }
}

// ===== SEAT GRID =====
function initSeatGrid() {
    const seatGrid = document.getElementById('seat-grid');
    if (!seatGrid) return;
    
    // Load from sessionStorage
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        Object.assign(bookingState, JSON.parse(savedData));
    }
    
    // ✅ Update seat page info
    const avatarEl = document.getElementById('seat-movie-avatar');
    if (avatarEl && bookingState.movieAvatar) {
        avatarEl.src = bookingState.movieAvatar;
        avatarEl.style.display = 'block';
    }
    
    document.getElementById('seat-movie-name').textContent = bookingState.movieName || '-';
    document.getElementById('seat-cinema').textContent = bookingState.cinema || '-';
    document.getElementById('seat-date').textContent = bookingState.date ? 
        new Date(bookingState.date).toLocaleDateString('vi-VN') : '-';
    document.getElementById('seat-time').textContent = bookingState.time ? 
        `${bookingState.time} - ${bookingState.format}` : '-';
    
    // ✅ Update prices from movie data
    document.getElementById('price-standard').textContent = formatPrice(bookingState.prices.standard);
    document.getElementById('price-vip').textContent = formatPrice(bookingState.prices.vip);
    document.getElementById('price-couple').textContent = formatPrice(bookingState.prices.couple);
    
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 10;
    const vipRows = ['F', 'G', 'H'];
    const coupleRow = 'J';
    
    loadBookedSeats();
    
    rows.forEach(row => {
        const seatRow = document.createElement('div');
        seatRow.className = 'seat-row';
        
        if (row === coupleRow) {
            for (let i = 1; i <= seatsPerRow; i += 2) {
                const seatNum = `${row}${i}-${row}${i+1}`;
                const seat = createSeat(seatNum, 'couple', bookingState.prices.couple);
                seatRow.appendChild(seat);
            }
        } else {
            for (let i = 1; i <= seatsPerRow; i++) {
                const seatNum = `${row}${i}`;
                let type = 'normal';
                let price = bookingState.prices.standard;
                
                if (vipRows.includes(row)) {
                    type = 'vip';
                    price = bookingState.prices.vip;
                }
                
                const seat = createSeat(seatNum, type, price);
                seatRow.appendChild(seat);
            }
        }
        
        seatGrid.appendChild(seatRow);
    });
    
    const btnToCombo = document.getElementById('btn-to-combo');
    if (btnToCombo) {
        btnToCombo.addEventListener('click', function() {
            if (bookingState.selectedSeats.length > 0) {
                sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
                window.location.href = '/booking/combo';
            }
        });
    }
}

async function loadBookedSeats() {
    if (!bookingState.movieId || !bookingState.cinema || !bookingState.date || !bookingState.time) {
        return;
    }
    
    try {
        const url = `/api/bookings/seats/booked?movieId=${bookingState.movieId}&cinema=${encodeURIComponent(bookingState.cinema)}&date=${bookingState.date}&time=${encodeURIComponent(bookingState.time)}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.code === 'success' && data.data.bookedSeats) {
            data.data.bookedSeats.forEach(seatNum => {
                const seatEl = document.querySelector(`[data-seat="${seatNum}"]`);
                if (seatEl) {
                    seatEl.classList.add('seat-booked');
                    seatEl.style.pointerEvents = 'none';
                }
            });
        }
    } catch (err) {
        console.error('Error loading booked seats:', err);
    }
}

function createSeat(seatNum, type, price) {
    const seat = document.createElement('div');
    seat.className = `seat seat-${type}`;
    seat.textContent = seatNum;
    seat.setAttribute('data-seat', seatNum);
    seat.setAttribute('data-price', price);
    
    seat.addEventListener('click', function() {
        if (this.classList.contains('seat-booked')) return;
        toggleSeat(this);
    });
    
    return seat;
}

function toggleSeat(seatElement) {
    const seatNum = seatElement.getAttribute('data-seat');
    const price = parseInt(seatElement.getAttribute('data-price'));
    const type = seatElement.classList.contains('seat-vip') ? 'vip' : 
                 seatElement.classList.contains('seat-couple') ? 'couple' : 'standard';
    
    if (seatElement.classList.contains('selected')) {
        seatElement.classList.remove('selected');
        const index = bookingState.selectedSeats.findIndex(s => s.seatNumber === seatNum);
        if (index > -1) {
            bookingState.selectedSeats.splice(index, 1);
        }
    } else {
        seatElement.classList.add('selected');
        bookingState.selectedSeats.push({
            seatNumber: seatNum,
            type: type,
            price: price
        });
    }
    
    updateSeatDisplay();
}

function updateSeatDisplay() {
    const display = document.getElementById('selected-seats-display');
    const priceDisplay = document.getElementById('total-price');
    const btnNext = document.getElementById('btn-to-combo');
    
    if (!display || !priceDisplay) return;
    
    if (bookingState.selectedSeats.length === 0) {
        display.textContent = 'Chưa chọn ghế';
        priceDisplay.textContent = '0đ';
        if (btnNext) btnNext.disabled = true;
    } else {
        const seatNumbers = bookingState.selectedSeats.map(s => s.seatNumber).join(', ');
        display.textContent = seatNumbers;
        
        bookingState.ticketPrice = bookingState.selectedSeats.reduce((sum, s) => sum + s.price, 0);
        priceDisplay.textContent = formatPrice(bookingState.ticketPrice);
        if (btnNext) btnNext.disabled = false;
    }
}

// ===== COMBO PAGE =====
function initComboPage() {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        Object.assign(bookingState, JSON.parse(savedData));
    }
    
    const ticketPriceEl = document.getElementById('ticket-price-display');
    if (ticketPriceEl) {
        ticketPriceEl.textContent = formatPrice(bookingState.ticketPrice);
    }
    
    updateComboTotal();
}

function goToCheckout() {
    sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
    window.location.href = '/booking/checkout';
}

function changeComboQty(comboId, change) {
    const qtyElement = document.getElementById(`combo-qty-${comboId}`);
    if (!qtyElement) return;
    
    let currentQty = parseInt(qtyElement.textContent);
    let newQty = Math.max(0, currentQty + change);
    
    qtyElement.textContent = newQty;
    
    const comboCard = document.querySelector(`[data-combo="${comboId}"]`);
    const price = parseInt(comboCard.getAttribute('data-price'));
    const name = comboCard.querySelector('.combo-name').textContent;
    
    if (newQty > 0) {
        bookingState.combos[comboId] = {
            name: name,
            quantity: newQty,
            price: price
        };
    } else {
        delete bookingState.combos[comboId];
    }
    
    updateComboTotal();
}

function updateComboTotal() {
    bookingState.comboTotal = 0;
    for (let comboId in bookingState.combos) {
        const combo = bookingState.combos[comboId];
        bookingState.comboTotal += combo.price * combo.quantity;
    }
    
    const comboDisplay = document.getElementById('combo-price-display');
    if (comboDisplay) {
        comboDisplay.textContent = formatPrice(bookingState.comboTotal);
    }
    
    const totalDisplay = document.getElementById('total-with-combo');
    if (totalDisplay) {
        const total = bookingState.ticketPrice + bookingState.comboTotal;
        totalDisplay.textContent = formatPrice(total);
    }
}

// ===== CHECKOUT PAGE =====
function initCheckoutPage() {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        Object.assign(bookingState, JSON.parse(savedData));
    }
    
    console.log('=== CHECKOUT PAGE DATA ===', bookingState);
    
    updateCheckoutPage();
}

function updateCheckoutPage() {
    const elements = {
        movieName: document.getElementById('summary-movie-name'),
        movieDuration: document.getElementById('summary-movie-duration'),
        movieRating: document.getElementById('summary-movie-rating'),
        movieAvatar: document.getElementById('summary-movie-avatar'),
        cinema: document.getElementById('summary-cinema'),
        date: document.getElementById('summary-date'),
        time: document.getElementById('summary-time'),
        seats: document.getElementById('summary-seats'),
        combo: document.getElementById('summary-combo'),
        ticketPrice: document.getElementById('summary-ticket-price'),
        comboPrice: document.getElementById('summary-combo-price'),
        total: document.getElementById('summary-total')
    };
    
    // ✅ Movie info
    if (elements.movieName) elements.movieName.textContent = bookingState.movieName || '-';
    if (elements.movieDuration) elements.movieDuration.textContent = bookingState.movieDuration || '-';
    if (elements.movieRating) elements.movieRating.textContent = bookingState.movieAgeRating || '-';
    if (elements.movieAvatar && bookingState.movieAvatar) {
        elements.movieAvatar.src = bookingState.movieAvatar;
        elements.movieAvatar.style.display = 'block';
    }
    
    // Booking details
    if (elements.cinema) elements.cinema.textContent = bookingState.cinema || '--';
    if (elements.date) elements.date.textContent = bookingState.date ? 
        new Date(bookingState.date).toLocaleDateString('vi-VN') : '--';
    if (elements.time) elements.time.textContent = bookingState.time ? 
        `${bookingState.time} - ${bookingState.format}` : '--';
    
    if (elements.seats && bookingState.selectedSeats.length > 0) {
        elements.seats.textContent = bookingState.selectedSeats.map(s => s.seatNumber).join(', ');
    }
    
    const comboCount = Object.keys(bookingState.combos).length;
    if (elements.combo) {
        elements.combo.textContent = comboCount > 0 ? `${comboCount} combo` : 'Không';
    }
    
    // Prices
    if (elements.ticketPrice) elements.ticketPrice.textContent = formatPrice(bookingState.ticketPrice);
    if (elements.comboPrice) elements.comboPrice.textContent = formatPrice(bookingState.comboTotal);
    
    const total = bookingState.ticketPrice + bookingState.comboTotal;
    if (elements.total) elements.total.textContent = formatPrice(total);
    
    console.log('✓ Checkout page updated');
}

// ✅ SỬA HÀM NÀY
async function completeBooking() {
    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    const emailInput = document.getElementById('customer-email');
    const noteInput = document.getElementById('customer-note');
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    
    if (!nameInput || !phoneInput) {
        alert('Không tìm thấy form!');
        return;
    }
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : '';
    const note = noteInput ? noteInput.value.trim() : '';
    
    // Validation
    if (!name) {
        alert('Vui lòng nhập họ tên!');
        nameInput.focus();
        return;
    }
    
    if (!phone) {
        alert('Vui lòng nhập số điện thoại!');
        phoneInput.focus();
        return;
    }
    
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!phoneRegex.test(phone)) {
        alert('Số điện thoại không đúng định dạng!');
        phoneInput.focus();
        return;
    }
    
    const selectedPaymentMethod = paymentMethod ? paymentMethod.value : 'cash';
    
    // Prepare payload
    const payload = {
        movieId: bookingState.movieId,
        movieName: bookingState.movieName,
        movieAvatar: bookingState.movieAvatar,
        cinema: bookingState.cinema,
        showtimeDate: bookingState.date,
        showtimeTime: bookingState.time,
        showtimeFormat: bookingState.format,
        seats: bookingState.selectedSeats,
        combos: bookingState.combos,
        fullName: name,
        phone: phone,
        email: email,
        note: note,
        paymentMethod: selectedPaymentMethod
    };
    
    console.log('=== SENDING BOOKING ===', payload);
    
    try {
        const res = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (data.code === 'success') {
            const bookingId = data.data.bookingId;
            const bookingCode = data.data.bookingCode;
            
            // ✅ LƯU BOOKING INFO
            bookingState.bookingId = bookingId;
            bookingState.bookingCode = bookingCode;
            sessionStorage.setItem('bookingData', JSON.stringify(bookingState));
            
            // ✅ XỬ LÝ THEO PAYMENT METHOD
            if (selectedPaymentMethod === 'cash') {
                // ✅ TIỀN MẶT → CHUYỂN SANG PAYMENT SERVICE LUÔN
                // Payment service sẽ hiển thị thông tin booking + hướng dẫn thanh toán tại quầy
                window.location.href = `/payment/booking/${bookingId}?method=cash`;
                
            } else if (selectedPaymentMethod === 'momo') {
                // ✅ MOMO → CHUYỂN SANG PAYMENT SERVICE
                // Payment service sẽ tạo payment request và redirect tới MoMo
                window.location.href = `/payment/booking/${bookingId}?method=momo`;
                
            } else if (selectedPaymentMethod === 'zalopay') {
                // ✅ ZALOPAY
                window.location.href = `/payment/booking/${bookingId}?method=zalopay`;
                
            } else if (selectedPaymentMethod === 'bank') {
                // ✅ BANK TRANSFER
                window.location.href = `/payment/booking/${bookingId}?method=bank`;
                
            } else {
                // Fallback
                alert('Phương thức thanh toán không hợp lệ!');
            }
            
        } else {
            alert(data.message || 'Đặt vé thất bại!');
        }
    } catch (err) {
        console.error('Error creating booking:', err);
        alert('Không thể kết nối tới server!');
    }
}

// ===== UTILITY =====
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

// Sample data structure - replace with your actual dat
// Populate account list
const accountSelect = document.querySelector('[filter-created-by]');
data.accountAdminList.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.fullName;
    accountSelect.appendChild(option);
});

// Populate category table
const tbody = document.getElementById('categoryTableBody');
data.categoryList.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="inner-center">
            <input type="checkbox" class="inner-check" check-item="${item.id}">
        </td>
        <td>${item.name}</td>
        <td>
            <img src="${item.avatar}" class="inner-avatar">
        </td>
        <td class="inner-center">${item.position}</td>
        <td class="inner-center">
            ${item.status === 'active' 
                ? '<div class="badge badge-green">Hoạt động</div>' 
                : '<div class="badge badge-red">Dừng hoạt động</div>'}
        </td>
        <td>
            <div>${item.createdByFullName}</div>
            <div class="inner-time">${item.createdAtFormatted}</div>
        </td>
        <td>
            <div>${item.updatedByFullName}</div>
            <div class="inner-time">${item.updatedAtFormat}</div>
        </td>
        <td>
            <div class="inner-buttons">
                <a href="/${data.pathAdmin}/category/edit/${item.id}" class="inner-edit">
                    <i class="fa-regular fa-pen-to-square"></i>
                </a>
                <button class="inner-delete" button-delete data-api="/${data.pathAdmin}/category/delete/${item.id}">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        </td>
    `;
    tbody.appendChild(tr);
});

// Populate pagination
const paginationSelect = document.querySelector('[pagination]');
for (let i = 1; i <= data.pagination.totalPages; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Trang ${i}`;
    if (i === data.pagination.currentPage) {
        option.selected = true;
    }
    paginationSelect.appendChild(option);
}

// Update pagination label
const start = (data.pagination.currentPage - 1) * data.pagination.limit + 1;
const end = Math.min(data.pagination.currentPage * data.pagination.limit, data.pagination.totalRecords);
document.getElementById('paginationLabel').textContent = 
    `Hiển thị ${start} - ${end} của ${data.pagination.totalRecords}`;

// Update data-api for change-multi
document.querySelector('[change-multi]').setAttribute('data-api', `/${data.pathAdmin}/category/change-multi`);

// Update create button link
document.querySelector('.inner-button-create a').href = `/${data.pathAdmin}/category/create`;

// Check all functionality
document.querySelector('[check-all]').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('[check-item]');
    checkboxes.forEach(cb => cb.checked = this.checked);
});

// Filter reset
document.querySelector('[filter-reset]').addEventListener('click', function() {
    document.querySelector('[filter-status]').value = '';
    document.querySelector('[filter-created-by]').value = '';
    document.querySelector('[filter-start-date]').value = '';
    document.querySelector('[filter-end-date]').value = '';
});

// Search functionality (placeholder)
document.querySelector('[search]').addEventListener('input', function(e) {
    console.log('Searching for:', e.target.value);
    // Implement search logic here
});

// Delete button functionality (placeholder)
document.querySelectorAll('[button-delete]').forEach(btn => {
    btn.addEventListener('click', function() {
        const api = this.getAttribute('data-api');
        if (confirm('Bạn có chắc chắn muốn xóa?')) {
            console.log('Deleting via:', api);
            // Implement delete logic here
        }
    });
});

// Multi-action functionality (placeholder)
document.querySelector('[change-multi] button').addEventListener('click', function() {
    const action = this.previousElementSibling.querySelector('select').value;
    const checked = Array.from(document.querySelectorAll('[check-item]:checked'))
        .map(cb => cb.getAttribute('check-item'));
    
    if (!action) {
        alert('Vui lòng chọn hành động');
        return;
    }
    if (checked.length === 0) {
        alert('Vui lòng chọn ít nhất một mục');
        return;
    }
    
    console.log('Action:', action, 'Items:', checked);
    // Implement multi-action logic here
});

// Function to build hierarchical options (mixin replacement)
function buildOptions(categories, parentId = null, level = 0) {
    const options = [];
    const filtered = categories.filter(cat => {
        if (parentId === null) return !cat.parent;
        return cat.parent === parentId;
    });

    filtered.forEach(category => {
        const prefix = '--'.repeat(level);
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = prefix + (prefix ? ' ' : '') + category.name;
        options.push(option);

        // Recursively add children
        const children = buildOptions(categories, category.id, level + 1);
        options.push(...children);
    });

    return options;
}

// Populate parent category select
const parentSelect = document.getElementById('parent');
const options = buildOptions(data.categoryList);
options.forEach(option => parentSelect.appendChild(option));

// Update back link
document.getElementById('backLink').href = `/${data.pathAdmin}/category/list`;

// Initialize TinyMCE
tinymce.init({
    selector: '#description',
    height: 300,
    menubar: false,
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
});

// Initialize FilePond
const pond = FilePond.create(document.getElementById('avatar'), {
    labelIdle: 'Kéo thả ảnh hoặc <span class="filepond--label-action">Chọn file</span>',
    acceptedFileTypes: ['image/*'],
    maxFileSize: '5MB',
    imagePreviewHeight: 200,
    imageCropAspectRatio: '1:1',
    imageResizeTargetWidth: 500,
    imageResizeTargetHeight: 500,
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'center bottom',
    styleProgressIndicatorPosition: 'right bottom',
    styleButtonRemoveItemPosition: 'left bottom',
    styleButtonProcessItemPosition: 'right bottom'
});

// Add-image button: open FilePond dialog if initialized or fallback to native input
document.addEventListener('DOMContentLoaded', function() {
  const addImageBtn = document.getElementById('addImage');
  const avatarInput = document.getElementById('avatar');
  if (!addImageBtn) return;

  addImageBtn.addEventListener('click', function() {
    if (typeof pond !== 'undefined' && pond && typeof pond.browse === 'function') {
      pond.browse();
    } else if (avatarInput) {
      avatarInput.click();
    }
  });
});

// Form submission
document.getElementById('category-create-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get TinyMCE content
    const description = tinymce.get('description').getContent();

    // Get FilePond file
    const pondFiles = pond.getFiles();
    let avatarFile = null;
    if (pondFiles.length > 0) {
        avatarFile = pondFiles[0].file;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('parent', document.getElementById('parent').value);
    formData.append('position', document.getElementById('position').value);
    formData.append('status', document.getElementById('status').value);
    formData.append('description', description);
    
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }

    try {
        // Replace with your actual API endpoint
        const response = await fetch(`/${data.pathAdmin}/category/create`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert('Tạo danh mục thành công!');
            window.location.href = `/${data.pathAdmin}/category/list`;
        } else {
            alert('Lỗi: ' + (result.message || 'Không thể tạo danh mục'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi tạo danh mục');
    }
});

// Validation
document.getElementById('name').addEventListener('blur', function() {
    if (this.value.trim() === '') {
        this.style.borderColor = 'red';
    } else {
        this.style.borderColor = '';
    }
});

document.getElementById('position').addEventListener('input', function() {
    if (this.value < 1) {
        this.value = 1;
    }
});

// Function to build hierarchical options with selected value
        function buildOptions(categories, parentId = null, level = 0, selectedValue = null, excludeId = null) {
            const options = [];
            const filtered = categories.filter(cat => {
                // Exclude current category to prevent selecting itself as parent
                if (excludeId && cat.id === excludeId) return false;
                if (parentId === null) return !cat.parent;
                return cat.parent === parentId;
            });

            filtered.forEach(category => {
                const prefix = '--'.repeat(level);
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = prefix + (prefix ? ' ' : '') + category.name;
                
                // Set selected if matches
                if (selectedValue && category.id === selectedValue) {
                    option.selected = true;
                }
                
                options.push(option);

                // Recursively add children
                const children = buildOptions(categories, category.id, level + 1, selectedValue, excludeId);
                options.push(...children);
            });

            return options;
        }

        // Populate form with existing data
        document.getElementById('id').value = data.categoryDetail.id;
        document.getElementById('name').value = data.categoryDetail.name;
        document.getElementById('position').value = data.categoryDetail.position;
        document.getElementById('status').value = data.categoryDetail.status;
        document.getElementById('description').value = data.categoryDetail.description;

        // Populate parent category select (exclude current category)
        const parentSelectEdit = document.getElementById('parent');
        const optionsEdit = buildOptions(
            data.categoryList, 
            null, 
            0, 
            data.categoryDetail.parent,
            data.categoryDetail.id
        );
        optionsEdit.forEach(option => parentSelectEdit.appendChild(option));

        // Update back link
        document.getElementById('backLink').href = `/${data.pathAdmin}/category/list`;

        // Initialize TinyMCE with existing content
        tinymce.init({
            selector: '#description',
            height: 300,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            setup: function(editor) {
                editor.on('init', function() {
                    editor.setContent(data.categoryDetail.description);
                });
            }
        });

        // Image upload preview with default image
        const avatarInput = document.getElementById('avatar');
        const imagePreview = document.getElementById('imagePreview');
        const removeImageBtn = document.getElementById('removeImage');
        const imageUploadContainer = document.getElementById('imageUploadContainer');
        let selectedFile = null;
        let hasDefaultImage = false;

        // Load default image if exists
        if (data.categoryDetail.avatar) {
            imagePreview.src = data.categoryDetail.avatar;
            imagePreview.classList.add('show');
            removeImageBtn.classList.add('show');
            hasDefaultImage = true;
            imageUploadContainer.setAttribute('image-default', data.categoryDetail.avatar);
        }

        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                selectedFile = file;
                hasDefaultImage = false;
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    imagePreview.src = event.target.result;
                    imagePreview.classList.add('show');
                    removeImageBtn.classList.add('show');
                };
                
                reader.readAsDataURL(file);
            }
        });

        removeImageBtn.addEventListener('click', function() {
            avatarInput.value = '';
            
            // If there's a default image, restore it
            if (imageUploadContainer.getAttribute('image-default')) {
                imagePreview.src = imageUploadContainer.getAttribute('image-default');
                imagePreview.classList.add('show');
                removeImageBtn.classList.add('show');
                hasDefaultImage = true;
                selectedFile = null;
            } else {
                imagePreview.src = '';
                imagePreview.classList.remove('show');
                removeImageBtn.classList.remove('show');
                selectedFile = null;
                hasDefaultImage = false;
            }
        });

        // Form submission
        document.getElementById('category-edit-form').addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get TinyMCE content
            const description = tinymce.get('description').getContent();

            // Create FormData
            const formData = new FormData();
            formData.append('id', document.getElementById('id').value);
            formData.append('name', document.getElementById('name').value);
            formData.append('parent', document.getElementById('parent').value);
            formData.append('position', document.getElementById('position').value);
            formData.append('status', document.getElementById('status').value);
            formData.append('description', description);
            
            // Only append new image if user selected one
            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            try {
                // Replace with your actual API endpoint
                const response = await fetch(`/${data.pathAdmin}/category/edit/${data.categoryDetail.id}`, {
                    method: 'PATCH',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Cập nhật danh mục thành công!');
                    window.location.href = `/${data.pathAdmin}/category/list`;
                } else {
                    alert('Lỗi: ' + (result.message || 'Không thể cập nhật danh mục'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi cập nhật danh mục');
            }
        });

        // Validation
        document.getElementById('name').addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = 'red';
            } else {
                this.style.borderColor = '';
            }
        });

        document.getElementById('position').addEventListener('input', function() {
            if (this.value < 1) {
                this.value = 1;
            }
        });
        // ===== IMAGE UPLOAD HANDLER =====
function initImageUpload() {
  const avatarInput = document.getElementById('avatar');
  const imagePreview = document.getElementById('imagePreview');
  const removeImageBtn = document.getElementById('removeImage');
  const previewContainer = document.getElementById('preview-container');
  const uploadLabel = document.getElementById('upload-label');
  const imageUploadContainer = document.getElementById('imageUploadContainer');
  
  if (!avatarInput || !imagePreview || !removeImageBtn || !previewContainer) {
    return;
  }

  let selectedFile = null;
  let hasDefaultImage = false;

  // Load default image if exists (for edit page)
  if (imageUploadContainer && imageUploadContainer.hasAttribute('image-default')) {
    const defaultImage = imageUploadContainer.getAttribute('image-default');
    if (defaultImage) {
      imagePreview.src = defaultImage;
      previewContainer.classList.add('show');
      removeImageBtn.classList.add('show');
      hasDefaultImage = true;
    }
  }

  // Handle file selection
  avatarInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        avatarInput.value = '';
        return;
      }

      selectedFile = file;
      hasDefaultImage = false;
      
      const reader = new FileReader();
      
      reader.onload = function(event) {
        imagePreview.src = event.target.result;
        previewContainer.classList.add('show');
        removeImageBtn.classList.add('show');
      };
      
      reader.readAsDataURL(file);
    } else {
      alert('Vui lòng chọn file ảnh hợp lệ!');
      avatarInput.value = '';
    }
  });

  // Handle remove image
  removeImageBtn.addEventListener('click', function(e) {
    e.preventDefault();
    avatarInput.value = '';
    
    // If there's a default image, restore it
    if (imageUploadContainer && imageUploadContainer.hasAttribute('image-default')) {
      const defaultImage = imageUploadContainer.getAttribute('image-default');
      if (defaultImage) {
        imagePreview.src = defaultImage;
        previewContainer.classList.add('show');
        removeImageBtn.classList.add('show');
        hasDefaultImage = true;
        selectedFile = null;
        return;
      }
    }
    
    // Otherwise, hide preview
    imagePreview.src = '';
    previewContainer.classList.remove('show');
    removeImageBtn.classList.remove('show');
    selectedFile = null;
    hasDefaultImage = false;
  });

  return { selectedFile, hasDefaultImage };
}

// Initialize TinyMCE
function initTinyMCE(selector) {
  if (typeof tinymce === 'undefined') {
    console.error('TinyMCE not loaded');
    return;
  }

  tinymce.init({
    selector: selector || '#description',
    height: 300,
    menubar: false,
    language: 'vi',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
  });
}

// ===== CATEGORY CREATE FORM =====
const categoryCreateForm = document.querySelector("#category-create-form");
if (categoryCreateForm) {
  // Initialize image upload
  const imageUpload = initImageUpload();
  
  // Initialize TinyMCE
  initTinyMCE('#description');

  categoryCreateForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const parent = document.getElementById('parent').value;
    const position = document.getElementById('position').value;
    const status = document.getElementById('status').value;
    const avatarInput = document.getElementById('avatar');
    const description = tinymce.get('description') ? tinymce.get('description').getContent() : '';

    // Validation
    if (!name) {
      alert('Vui lòng nhập tên danh mục!');
      document.getElementById('name').focus();
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('parent', parent);
    formData.append('position', position);
    formData.append('status', status);
    formData.append('description', description);

    // Add avatar if selected
    if (avatarInput.files.length > 0) {
      formData.append('avatar', avatarInput.files[0]);
    }

    try {
      const response = await fetch(`/${pathAdmin}/category/create`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.code === 'success') {
        alert('Tạo danh mục thành công!');
        window.location.href = `/${pathAdmin}/category/list`;
      } else {
        alert('Lỗi: ' + (data.message || 'Không thể tạo danh mục'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi tạo danh mục');
    }
  });

  // Validation on blur
  document.getElementById('name').addEventListener('blur', function() {
    if (this.value.trim() === '') {
      this.style.borderColor = 'red';
    } else {
      this.style.borderColor = '';
    }
  });

  document.getElementById('position').addEventListener('input', function() {
    if (this.value < 1) {
      this.value = 1;
    }
  });
}

// ===== CATEGORY EDIT FORM =====
const categoryEditForm = document.querySelector("#category-edit-form");
if (categoryEditForm) {
  // Initialize image upload
  const imageUpload = initImageUpload();
  
  // Initialize TinyMCE
  initTinyMCE('#description');

  categoryEditForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const id = document.getElementById('id').value;
    const name = document.getElementById('name').value.trim();
    const parent = document.getElementById('parent').value;
    const position = document.getElementById('position').value;
    const status = document.getElementById('status').value;
    const avatarInput = document.getElementById('avatar');
    const description = tinymce.get('description') ? tinymce.get('description').getContent() : '';

    // Validation
    if (!name) {
      alert('Vui lòng nhập tên danh mục!');
      document.getElementById('name').focus();
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('parent', parent);
    formData.append('position', position);
    formData.append('status', status);
    formData.append('description', description);

    // Add avatar if new file selected
    if (avatarInput.files.length > 0) {
      const file = avatarInput.files[0];
      const imageUploadContainer = document.getElementById('imageUploadContainer');
      
      // Check if it's a new file (not the default image)
      if (imageUploadContainer && imageUploadContainer.hasAttribute('image-default')) {
        const defaultImage = imageUploadContainer.getAttribute('image-default');
        if (!defaultImage.includes(file.name)) {
          formData.append('avatar', file);
        }
      } else {
        formData.append('avatar', file);
      }
    }

    try {
      const response = await fetch(`/${pathAdmin}/category/edit/${id}`, {
        method: 'PATCH',
        body: formData
      });

      const data = await response.json();

      if (data.code === 'success') {
        alert('Cập nhật danh mục thành công!');
        window.location.reload();
      } else {
        alert('Lỗi: ' + (data.message || 'Không thể cập nhật danh mục'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra khi cập nhật danh mục');
    }
  });

  // Validation on blur
  document.getElementById('name').addEventListener('blur', function() {
    if (this.value.trim() === '') {
      this.style.borderColor = 'red';
    } else {
      this.style.borderColor = '';
    }
  });

  document.getElementById('position').addEventListener('input', function() {
    if (this.value < 1) {
      this.value = 1;
    }
  });
}

