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
        if (this.readyToReset) { // <-- Thêm logic vào đây
            this.currentOperand = '';
            this.readyToReset = false;
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
        
        if (this.previousOperand !== '') {
            // Gọi compute nếu đã có phép tính trước đó
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.readyToReset = true; 
        this.updateDisplay();
    }

    // Thực hiện tính toán (nút =)
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Chỉ tính toán nếu có đủ 2 số và phép toán
        if (isNaN(prev) || isNaN(current) || this.operation == null) return;
        
        // Tạo chuỗi biểu thức để hiển thị
        const fullExpression = `${this.getDisplayNumber(prev)} ${this.operation} ${this.getDisplayNumber(current)} =`;

        switch (this.operation) {
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
                    this.currentOperand = "Cannot divide by zero";
                    this.previousOperandTextElement.innerText = ''; // Xóa dòng trên
                    this.updateDisplay();
                    this.readyToReset = true;
                    this.operation = undefined;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        this.addHistory(fullExpression, computation); // Lưu vào lịch sử
        
        // Cập nhật màn hình
        this.currentOperand = computation;
        this.previousOperand = fullExpression; // <-- THAY ĐỔI QUAN TRỌNG
        this.operation = undefined;
        this.readyToReset = true;
        
        // Cập nhật hiển thị MỘT LẦN DUY NHẤT ở cuối
        this.previousOperandTextElement.innerText = this.previousOperand;
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
}
    
    // Xử lý các hàm đặc biệt (%, √, x², 1/x, ±)
    handleFunction(action) {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        let result;
        switch(action) {
            case 'percentage':
                result = current / 100;
                break;
            case 'sqrt':
                if (current < 0) {
                     this.currentOperand = "Invalid input";
                     this.readyToReset = true;
                     this.updateDisplay();
                     return;
                }
                result = Math.sqrt(current);
                break;
            case 'square':
                result = Math.pow(current, 2);
                break;
            case 'reciprocal':
                if (current === 0) {
                    this.currentOperand = "Cannot divide by zero";
                    this.readyToReset = true;
                    this.updateDisplay();
                    return;
                }
                result = 1 / current;
                break;
            case 'negate':
                result = current * -1;
                break;
        }
        this.currentOperand = result;
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
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    // Cập nhật màn hình chính
// Cập nhật màn hình chính
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);

        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            // <-- THÊM KHỐI ELSE NÀY
            // Nếu không có phép toán, xóa dòng trên đi (trừ trường hợp vừa tính xong)
            if (this.previousOperand.toString().includes('=')) {
                this.previousOperandTextElement.innerText = this.previousOperand;
            } else {
                this.previousOperandTextElement.innerText = '';
            }
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
