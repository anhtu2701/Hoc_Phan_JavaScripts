function changeBackground() {
    const select = document.getElementById("backgroundSelect");
    const selectedValue = select.value;

    let imgUrl = selectedValue === 'mountain' ? "url('./assets/img/mountain.jpeg') top center / cover no-repeat" : "url('./assets/img/beach.jpg') top center / cover no-repeat";

    document.body.style.background = imgUrl;
};