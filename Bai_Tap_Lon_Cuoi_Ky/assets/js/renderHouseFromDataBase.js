var roomsAPI = "http://localhost:3000/api/rooms";

function start() {
    getRooms((rooms) => {
        renderRooms(rooms)
    });
}

start();

function getRooms(callback) {
    fetch(roomsAPI)
        .then(response => response.json())
        .then(callback)
}

function renderRooms(rooms) {
    var listRooms = document.querySelector('.house-lists');
    var htmls = rooms.map((room) => /*html*/`
        <li class="house-items fade-in">
            <div class="house-item">
                <div class="house-img">
                    <img src="${room.URLAnhPhong}" alt="${room.MaPhong}">
                </div>
                <div class="house-content">
                    <div class="house-district">${room.TieuDe}
                    </div>
                    <div class="house-address">${room.DiaChi}</div>
                    <div class="house-id">${room.MaPhong}</div>
                    <div class="house-price">${room.GiaThue}</div>
                    <div class="house-status">Tình trạng:
                        <span>${room.TrangThai}</span></div>
                </div>
            </div>
        </li>
    `)
    listRooms.innerHTML = htmls.join('');
}