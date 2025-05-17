// Kiem tra xem mang co toan so chan hay khong
// const arr = [2, 4, 6, 8, 10, 15];

function solve(arr) {
    for ( let i = 0; i < arr.length; i++) {
        if (arr[i] % 2 != 0) {
            return false;
        }
    }
    return true;
}

if (solve(arr)) {
    console.log("Mang toan so chan");
} else {
    console.log("Mang khong toan so chan");
}

// Selection sort
function selectionSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }
    return arr;
}

const arr = [5, 3, 8, 4, 2];
document.write(selectionSort(arr).join(", "));