const tg = window.Telegram.WebApp;
const initData = tg.initData;
const initDataUnsafe = tg.initDataUnsafe;

const user = initDataUnsafe.user;
document.getElementById("username").textContent = user?.first_name || "Гость";

// 1. Отправка initData для верификации
fetch("/users/telegram-auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ init_data: initData })
})
  .then(res => res.json())
  .then(user => {
    localStorage.setItem("user", JSON.stringify(user));
    loadApartments();
  })
  .catch(err => {
    document.getElementById("apartments").innerHTML = "<p style='color:red;'>Ошибка авторизации</p>";
  });

// 2. Загрузка квартир
function loadApartments() {
  fetch("/apartments")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("apartments");
      container.innerHTML = ""; // очищаем

      data.forEach(ap => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <h3>${ap.title}</h3>
          <p>${ap.address}</p>
          <p>${ap.price_per_day} сум/сутки</p>
          <button onclick="book(${ap.id})">Забронировать</button>
        `;
        container.appendChild(div);
      });
    });
}

// 3. Бронирование квартиры
function book(apartment_id) {
  const start_date = prompt("Дата начала (ГГГГ-ММ-ДД):");
  const end_date = prompt("Дата окончания (ГГГГ-ММ-ДД):");

  fetch("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apartment_id, start_date, end_date })
  })
    .then(res => {
      if (!res.ok) throw new Error("Ошибка бронирования");
      return res.json();
    })
    .then(res => {
      alert("Бронирование отправлено! Ожидайте подтверждения.");
    })
    .catch(err => {
      alert("Ошибка: " + err.message);
    });
}
