// Lớp Calculator để quản lý tất cả logic

class Calculator {

    constructor(previousOperandTextElement, currentOperandTextElement, historyContentElement, memoryContentElement, memoryButtons) {

        this.previousOperandTextElement = previousOperandTextElement;

        this.currentOperandTextElement = currentOperandTextElement;

        this.historyContentElement = historyContentElement;

        this.memoryContentElement = memoryContentElement;

        this.memoryButtons = memoryButtons;

        this.clear();

    }



    // Xóa toàn bộ (nút C)

    clear() {

        this.currentOperand = '0';

        this.previousOperand = '';

        this.operation = undefined;

        this.readyToReset = false;

        this.memory = 0;

        this.history = [];



        // THÊM BIẾN MỚI

        this.lastOperation = undefined;

        this.lastOperand = undefined;



        this.updateDisplay();

        this.updateHistoryDisplay();

        this.updateMemoryDisplay();

        this.updateMemoryButtons();

    }



    // Xóa mục nhập hiện tại (nút CE)

    clearEntry() {

        this.currentOperand = '0';

        this.updateDisplay();

    }



    // Xóa ký tự cuối (nút ←)

    backspace() {

        this.currentOperand = this.currentOperand.toString().slice(0, -1);

        if (this.currentOperand === '' || this.currentOperand === '-') {

            this.currentOperand = '0';

        }

        this.updateDisplay();

    }



    // Gắn số hoặc dấu chấm

    appendNumber(number) {

        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.readyToReset) {

            this.currentOperand = '';

            this.readyToReset = false;

           

            //Hủy logic lặp lại

            this.lastOperation = undefined;

            this.lastOperand = undefined;

        }

        if (number === '.' && (this.currentOperand === '0' || this.currentOperand === '')) {
            this.currentOperand = '0.'; // Gán thẳng thành '0.'
            this.updateDisplay();
            return; // Thoát hàm ngay
        }

        if (this.currentOperand === '0' && number !== '.') {

            this.currentOperand = number.toString();

        } else {

            this.currentOperand = this.currentOperand.toString() + number.toString();

        }

        this.updateDisplay();

    }



    // Chọn một phép toán

    chooseOperation(operation) {

        if (this.currentOperand === '' && this.previousOperand === '') return;

       

        if (this.previousOperand !== '' && this.operation != null){

            // Gọi compute nếu đã có phép tính trước đó

            this.compute();

        }

        this.operation = operation;

        this.previousOperand = this.currentOperand;

        this.readyToReset = true;



        // Hủy logic lặp lại

        this.lastOperation = undefined;

        this.lastOperand = undefined;

        this.updateDisplay();

    }



        // Xử lí các toán tử cơ bản (Hàm con mới)

    performCalculation(prev, current, operation) {

        let computation;

        switch (operation) {

            case '+':

                computation = prev + current;

                break;

            case '−':

                computation = prev - current;

                break;

            case '×':

                computation = prev * current;

                break;

            case '÷':

                if (current === 0) {

                    return 'Cannot divide by zero';

                }

                computation = prev / current;

                break;

            default:

                // Should not happen if called correctly

                return undefined;

        }

        // Làm tròn nếu kết quả có quá nhiều số thập phân (tùy chọn)

        // Ví dụ: làm tròn đến 10 chữ số thập phân

        // if (computation.toString().includes('.')) {

        //     computation = parseFloat(computation.toFixed(10));

        // }

        return computation;

    }



    //Hàm báo lỗi (Hàm con mới)

    showError(message) {

        this.currentOperand = message;

        this.previousOperandTextElement.innerText = '';

        this.operation = undefined;

        this.lastOperation = undefined; // Reset cả logic lặp lại khi có lỗi

        this.lastOperand = undefined;

        this.readyToReset = true;

        this.updateDisplay();

    }



    // Thực hiện tính toán (nút =) - *** HÀM ĐÃ ĐƯỢC VIẾT LẠI ***

    compute() {

        let computation;

        let prev = parseFloat(this.previousOperand); // Có thể là NaN

        const current = parseFloat(this.currentOperand);

   

        // KỊCH BẢN 2: Phép tính đầy đủ (ví dụ: 5 + 6 =)

        if(this.operation != null) {

            // Cần kiểm tra kỹ prev vì nó có thể là NaN nếu người dùng bấm 5 + rồi bấm = ngay

            // Hoặc sau khi dùng hàm đặc biệt, ví dụ sqrt(9) = 3 rồi bấm +

            if (isNaN(current)) return; // Nếu số hiện tại không hợp lệ thì thoát

            if (isNaN(prev)) {

                // Xử lý trường hợp như 5 + =, sẽ hiểu là 5 + 5

                prev = current;

            }



            // Lưu lại toán tử và toán hạng ĐỂ LẶP LẠI

            this.lastOperation = this.operation;

            this.lastOperand = current;

           

            // Tạo chuỗi biểu thức để hiển thị

            const fullExpression = `${this.getDisplayNumber(prev)} ${this.operation} ${this.getDisplayNumber(current)} =`;



            // Tính toán

            computation = this.performCalculation(prev, current, this.operation);

            if(computation === 'Cannot divide by zero'){

                this.showError(computation);

                return;

            }

            this.addHistory(fullExpression, computation);



            // Cập nhật trạng thái

            this.currentOperand = computation.toString();

            this.previousOperand = fullExpression;

            this.operation = undefined;

            this.readyToReset = true;



            this.updateDisplay();

            return; // Xong kịch bản 2

        }

       

        // KỊCH BẢN 3: Lặp lại phép tính (ví dụ: bấm = sau 5 + 2 = 7)

        if (this.lastOperation != null) {

            if (isNaN(current)) return; // Cần có kết quả trước đó (số 7)

           

            const lastOpValue = parseFloat(this.lastOperand);

            if(isNaN(lastOpValue)) return; // Cần có toán hạng cuối (số 2)



            prev = current; // Số 7 sẽ là toán hạng đầu tiên

            const operationToRepeat = this.lastOperation; // Phép '+'

            const operandToRepeat = lastOpValue; // Số 2

           

            const fullExpression = `${this.getDisplayNumber(prev)} ${operationToRepeat} ${this.getDisplayNumber(operandToRepeat)} =`;



            computation = this.performCalculation(prev, operandToRepeat, operationToRepeat);

            if (computation === 'Cannot divide by zero') {

                this.showError(computation);

                return;

            }

           

            this.addHistory(fullExpression, computation);

            this.currentOperand = computation.toString();

            this.previousOperand = fullExpression;

            // KHÔNG set this.operation ở đây vì nó đã undefined sẵn rồi

            this.readyToReset = true;

            this.updateDisplay();

            return; // Xong kịch bản 3

        }



        // KỊCH BẢN 1: Người dùng chỉ nhập số rồi bấm = (ví dụ: 5 =)

        if (this.operation == null) {

            if (isNaN(current)) return;

            //if (this.previousOperand.toString().endsWith('=')) return; // Vô hiệu hóa theo ý bạn

            const fullExpression = `${this.getDisplayNumber(current)} =`;



            this.addHistory(fullExpression, current);
            
            this.previousOperand = fullExpression;

            this.readyToReset = true;

            this.updateDisplay();

            // KHÔNG set lastOperation/lastOperand ở đây

            return; // Xong kịch bản 1

        }

    }

   

    // Xử lý các hàm đặc biệt (%, √, x², 1/x, ±)

    handleFunction(action) {

        const current = parseFloat(this.currentOperand);

        if (isNaN(current)) return;

        let result;

        let fullExpression = ''; // Khởi tạo chuỗi rỗng



        //Tách riêng 'negate' (±)

        // Nút (±) chỉ thay đổi số hiện tại, không hoàn thành phép tính

        if (action === 'negate') {

            this.currentOperand = (current * -1).toString();

            this.updateDisplay();

            return; // Thoát hàm sớm

        }

        //Hủy logic lặp lại

        this.lastOperation = undefined;

        this.lastOperand = undefined;

        //Thêm 'fullExpression' cho tất cả các trường hợp

        switch(action) {

            case 'percentage':

                fullExpression = `percentage(${this.getDisplayNumber(current)})`;

                result = current / 100;

                break;

            case 'sqrt':

                if (current < 0) {

                    this.currentOperand = "Invalid input";

                    this.previousOperandTextElement.innerText = ''; // Xóa dòng trên

                    this.readyToReset = true;

                    this.updateDisplay();

                    return;

                }

                fullExpression = `√(${this.getDisplayNumber(current)})`;

                result = Math.sqrt(current);

                break;

            case 'square':

                fullExpression = `sqr(${this.getDisplayNumber(current)})`;

                result = Math.pow(current, 2);

                break;

            case 'reciprocal':

                if (current === 0) {

                    this.currentOperand = "Cannot divide by zero";

                    this.previousOperandTextElement.innerText = ''; // Xóa dòng trên

                    this.readyToReset = true;

                    this.updateDisplay();

                    return;

                }

                fullExpression = `1/(${this.getDisplayNumber(current)})`;

                result = 1 / current;

                break;

            // 'negate' đã được xử lý ở trên

            default:

                return;

        }

       

        // Thêm vào lịch sử

        this.addHistory(fullExpression, result);

       

        // Cập nhật màn hình

        this.currentOperand = result.toString();

        this.previousOperand = fullExpression; // Gán biểu thức cho dòng trên

        this.operation = undefined;

        this.readyToReset = true;

       

        // THAY ĐỔI 3: Gọi 'updateDisplay' thay vì cập nhật thủ công

        this.updateDisplay();

    }



   

   

    // -- Logic Bộ nhớ --

    memoryStore() {

        this.memory = parseFloat(this.currentOperand);

        this.readyToReset = true;

        this.updateMemoryButtons();

        this.updateMemoryDisplay();

    }



    memoryRecall() {

        this.currentOperand = this.memory;

        this.updateDisplay();

    }



    memoryClear() {

        this.memory = 0;

        this.updateMemoryButtons();

        this.updateMemoryDisplay();

    }



    memoryAdd() {

        this.memory += parseFloat(this.currentOperand);

        this.readyToReset = true;

        this.updateMemoryDisplay();

    }



    memorySubtract() {

        this.memory -= parseFloat(this.currentOperand);

        this.readyToReset = true;

        this.updateMemoryDisplay();

    }

   

    // Cập nhật trạng thái (enabled/disabled) của nút MC, MR

    updateMemoryButtons() {

        const mcButton = this.memoryButtons.find(btn => btn.classList.contains('MC'));

        const mrButton = this.memoryButtons.find(btn => btn.classList.contains('MR'));

        if (this.memory === 0) {

            mcButton.classList.add('disabled');

            mrButton.classList.add('disabled');

        } else {

            mcButton.classList.remove('disabled');

            mrButton.classList.remove('disabled');

        }

    }



    // Cập nhật hiển thị bộ nhớ trong tab

    updateMemoryDisplay() {

        this.memoryContentElement.innerHTML = ''; // Xóa nội dung cũ

        if (this.memory === 0) {

             this.memoryContentElement.innerHTML = `<p class="empty-message">There's nothing saved in memory.</p>`;

        } else {

            const memoryElement = document.createElement('div');

            memoryElement.innerText = this.getDisplayNumber(this.memory);

            this.memoryContentElement.appendChild(memoryElement);

        }

    }





    // -- Logic Lịch sử --

    addHistory(expression, result) {

        this.history.unshift({ expression, result }); // Thêm vào đầu mảng

        if (this.history.length > 20) { // Giới hạn 20 mục

            this.history.pop();

        }

        this.updateHistoryDisplay();

    }

   

    updateHistoryDisplay() {

        this.historyContentElement.innerHTML = ''; // Xóa nội dung cũ

        if (this.history.length === 0) {

            this.historyContentElement.innerHTML = `<p class="empty-message">There's no history yet</p>`;

        } else {

            this.history.forEach(item => {

                const historyItem = document.createElement('div');

                historyItem.classList.add('history-item');

                historyItem.innerHTML = `

                    <div class="history-expression">${item.expression}</div>

                    <div class="history-result">${this.getDisplayNumber(item.result)}</div>

                `;

                this.historyContentElement.appendChild(historyItem);

            });

        }

    }





    // Định dạng số để hiển thị (thêm dấu phẩy)

// Định dạng số để hiển thị (thêm dấu phẩy)
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            // --- BẠN CÒN THIẾU DÒNG NÀY ---
            if (stringNumber.startsWith('.')) return '0.'; 
            // --- HẾT PHẦN THIẾU ---
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;

        // --- BẠN CÒN THIẾU KHỐI 'ELSE IF' NÀY ---
        } else if (stringNumber.endsWith('.') && !isNaN(integerDigits)) {
            // Logic này cũng giúp hiển thị '12.' đúng
            return `${integerDisplay}.`;
        // --- HẾT PHẦN THIẾU ---

        } else {
            return integerDisplay;
        }
    }



    // Cập nhật màn hình chính

    updateDisplay() {

        // Kiểm tra xem currentOperand có phải là chuỗi (báo lỗi) hay là số

        const currentAsFloat = parseFloat(this.currentOperand);

        if (isNaN(currentAsFloat) && typeof this.currentOperand === 'string') {

            // Nếu là chuỗi (ví dụ: "Cannot divide by zero"), hiển thị nó

            this.currentOperandTextElement.innerText = this.currentOperand;

        } else {

            // Nếu là số, định dạng nó

            this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);

        }



        // Xử lý dòng hiển thị mờ (phép tính)

        if (this.operation != null) {

            // 1. Khi đang gõ phép tính (ví dụ: 12 +)

            this.previousOperandTextElement.innerText =

                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;

        } else if (this.previousOperand.toString().includes('=') ||

                this.previousOperand.toString().includes('(')) {

            // 2. Khi vừa tính xong (ví dụ: 12 + 3 = hoặc sqrt(9))

            this.previousOperandTextElement.innerText = this.previousOperand;

        } else {

            // 3. Khi ở trạng thái C (clear)

            this.previousOperandTextElement.innerText = '';

        }

    }

}



// --- DOM Selection ---

const numberButtons = document.querySelectorAll('.btn-number');

const operatorButtons = document.querySelectorAll('.btn-operator');

const functionButtons = document.querySelectorAll('.btn-function');

const equalsButton = document.querySelector('[data-action="equals"]');

const memoryButtons = document.querySelectorAll('.memory-btn');



const previousOperandTextElement = document.querySelector('.previous-operand');

const currentOperandTextElement = document.querySelector('.current-operand');



const historyContentElement = document.querySelector('#history');

const memoryContentElement = document.querySelector('#memory');



const tabLinks = document.querySelectorAll('.tab-link');

const tabContents = document.querySelectorAll('.tab-content');



// --- Khởi tạo Calculator ---

const calculator = new Calculator(

    previousOperandTextElement,

    currentOperandTextElement,

    historyContentElement,

    memoryContentElement,

    Array.from(memoryButtons) // Chuyển NodeList thành Array

);



// --- Event Listeners ---

numberButtons.forEach(button => {

    button.addEventListener('click', () => {

        calculator.appendNumber(button.innerText);

    });

});



operatorButtons.forEach(button => {

    button.addEventListener('click', () => {

        calculator.chooseOperation(button.dataset.operator);

    });

});



equalsButton.addEventListener('click', () => {

    calculator.compute();

});



functionButtons.forEach(button => {

    button.addEventListener('click', () => {

        const action = button.dataset.action;

        if (action === 'clear') calculator.clear();

        if (action === 'clear-entry') calculator.clearEntry();

        if (action === 'backspace') calculator.backspace();

        if (['percentage', 'sqrt', 'square', 'reciprocal', 'negate'].includes(action)) {

            calculator.handleFunction(action);

        }

    });

});



memoryButtons.forEach(button => {

    button.addEventListener('click', () => {

        if (button.classList.contains('disabled')) return;

        if (button.classList.contains('MC')) calculator.memoryClear();

        if (button.classList.contains('MR')) calculator.memoryRecall();

        if (button.classList.contains('MS')) calculator.memoryStore();

        if (button.classList.contains('Mplus')) calculator.memoryAdd();

        if (button.classList.contains('Msub')) calculator.memorySubtract();

    });

});





// Logic chuyển Tab

tabLinks.forEach(link => {

    link.addEventListener('click', () => {

        const tab = link.dataset.tab;    



        // Xóa class 'active' khỏi tất cả các link và content

        tabLinks.forEach(l => l.classList.remove('active'));

        tabContents.forEach(c => c.classList.remove('active'));



        // Thêm class 'active' vào link và content được click

        link.classList.add('active');

        document.getElementById(tab).classList.add('active');

    });

});