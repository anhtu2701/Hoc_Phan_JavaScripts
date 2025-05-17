// Demo Selection Sort
const numbers = [5, 3, 8, 4, 2];
const N = numbers.length;

for (let i = 0; i < N - 1; i++) {
    let min_idx = i;
    for (let j = i + 1; j < N; j++) {
        if (numbers[j] < numbers[min_idx]) {
                min_idx = j;
        }
    }
    [numbers[i], numbers[min_idx]] = [numbers[min_idx], numbers[i]];
}
console.log("Sorted array: " + numbers.join(", "));


