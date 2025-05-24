const display = document.querySelector('.line-border');
const buttons = document.querySelectorAll('button');

let expression = '';

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const btnValue = button.textContent;

        if (btnValue === 'C') {
            expression = '';
            display.textContent = '';
        } else if (btnValue === '=') {
            let safeExpression = expression.replace(/x/g, '*');

            try {
                let result = eval(safeExpression);
                display.textContent = result;
                expression = result.toString();
            } catch (error) {
                display.textContent = 'Error';
                expression = '';
            }
        } else {
            expression += btnValue;
            display.textContent = expression;
        }
    });
});