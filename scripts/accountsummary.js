let SELECTED_CELLS = [];
let DATA = [];
// [
//     {
//         "name": "Expense Name",
//         "median": 2000
//         "amounts": [
//             1000,
//             2000,
//             3000
//         ],
//         "index": 0
//     }
// ]

function calculate(input, value) {
}

function onFocusText(event) {
}

function onBlurText(event) {
}



function handlePaste(event, input) {
    // Prevent the default paste behavior
    event.preventDefault();
    // Get the pasted content
    let pastedText = event.clipboardData.getData('text');
    // Split the pasted content by line breaks
    let lines = pastedText.split('\n');
    // Insert the pasted content into the input field
    if (input.value === '') {
        setValue(input, lines.shift());
    }
    // If there are remaining lines, create new cells for each line
    if (lines.length > 0) {
        // Create new rows for each remaining line
        let index = (() => {
            if (input.id === "0" || input.id === "2") {
                return 0;
            } else if (input.id === "1" || input.id === "3") {
                return 1;
            } else {
                console.error(input.id)
            }
        })();
        curInput = input;
        for (let i = 0; i < lines.length; i++) {
            if (!curInput.parentNode.parentNode.nextElementSibling) {
                let focusType = 0;
                createRow(lines[i], curInput, focusType);
                curInput = curInput.parentNode.parentNode.nextElementSibling.getElementsByTagName('input')[index];
            } else {
                curInput = curInput.parentNode.parentNode.nextElementSibling.getElementsByTagName('input')[index];
                setValue(curInput, lines[i])
            }
        }
    }
}


function handleKeyDown(event, input) {
    if (event.key === 'Enter') {
        if (!input.parentNode.parentNode.nextElementSibling) {
            event.preventDefault();
            console.log("1", input)

            createRow('', input)
        } else {
            let index = (() => {
                if (input.id === "0" || input.id === "2") {
                    return 0;
                } else if (input.id === "1" || input.id === "3") {
                    return 1;
                } else {
                    console.error(input.id)
                }
            })();
            input.parentNode.parentNode.nextElementSibling.getElementsByTagName('input')[index].focus();
        }
    } else if (event.key === 'Backspace' && input.value === '' && input.parentNode.parentNode.previousSibling) {
        event.preventDefault();
        removeRow(input);
        // Tab only if input is last in table
        // Not sure why but one nextSibling is not enough
    } else if (event.key === 'Tab' && !input.parentNode.parentNode.nextElementSibling && input.parentNode.previousElementSibling) {
        console.log("test")
        event.preventDefault();
        createRow('', input, 1);
    }
}

function formatCurrency(input) {
    // Remove any non-digit characters
    let value = input.value.replace(/[^\d.]/g, '');

    // Format the value as currency
    value = Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace(/^(-)?\$/, '$1');

    // Update the input value
    setValue(input, value);

    // Check for errors
    if (input.value === '0.00' || input.value === NaN || !isValidCurrency(input.value)) {
        input.style.background = 'pink';
    } else {
        input.style.background = 'white'; // Reset background color
    }
}

function unformatCurrency(input) {
    input.style.background = 'white';
    // Remove currency formatting to redisplay the number
    let value = input.value.replace(/[^\d.]/g, '');

    // Update the input value
    input.value = value;
    input.setSelectionRange(0, input.value.length);
}

function isValidCurrency(value) {
    // Check if the value is a valid currency format (e.g., $1,234.56)
    return /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/.test(value);
}


function createInput(value, id, isNumber) {
    let newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.onkeydown = function (event) { handleKeyDown(event, this) }
    newInput.onpaste = function (event) { handlePaste(event, this) }
    newInput.id = id;
    if (isNumber) {
        newInput.onfocus = function () { unformatCurrency(this) }
        newInput.onblur = function () { formatCurrency(this) }
    }
    setValue(newInput, value);
    return newInput;
}

function createRow(values, input, focusType = 0) {
    // Create new row
    let newRow = document.createElement('tr');
    let leftCell = document.createElement('td');
    let rightCell = document.createElement('td');
    // Determine based on columnIndex where to place the new input
    let inputToBeFocused = null;
    switch (input.id) {
        case "0":
            inputToBeFocused = createInput(values, 0, false);
            leftCell.appendChild(inputToBeFocused);
            rightCell.appendChild(createInput("", 1, true));
            break;
        case "1":
            inputToBeFocused = createInput(values, 1, true);
            leftCell.appendChild(createInput("", 0, false));
            rightCell.appendChild(inputToBeFocused);
            break;
        case "2":
            inputToBeFocused = createInput(values, 2, true);
            leftCell.appendChild(inputToBeFocused);
            rightCell.appendChild(createInput("", 3, false));
            break;
        case "3":
            inputToBeFocused = createInput(values, 3, false);
            leftCell.appendChild(createInput("", 2, true));
            rightCell.appendChild(inputToBeFocused);
            break;
        default:
            console.error(input.id)
    }

    newRow.appendChild(leftCell);
    newRow.appendChild(rightCell);
    input.parentNode.parentNode.parentNode.insertBefore(newRow, input.parentNode.parentNode.nextSibling);

    if (focusType === 0) {
        inputToBeFocused.focus();

    } else if (focusType === 1) {
        input.parentNode.parentNode.nextSibling.getElementsByTagName('input')[0].focus();
    }
}

function removeRow(input) {
    let row = input.parentNode.parentNode;
    // Check if last row exists
    if (row.previousSibling) {
        // Focus last input
        let index = (() => {
            if (input.id === "0" || input.id === "2") {
                return 0;
            } else if (input.id === "1" || input.id === "3") {
                return 1;
            } else {
                console.error(input.id)
            }
        })();
        row.previousSibling.getElementsByTagName('input')[index].focus();
        row.parentNode.removeChild(row);
    }
    // Also remove from selected
    // let index = SELECTED_CELLS.indexOf(input);
}

function setValue(input, value) {
    switch (input.id) {
        case "0":
            DATA.push({ "name": value, "median": null, "amounts": [], "index": DATA.length - 1 });
            countAmounts(DATA.length - 1);
            break;
        case "1":
            break;
        case "2":
            break;
        case "3":
            caclculate(input, value);
        default:
            console.error(input.id)
            input.value = value;
    }
}

// function deleteSelectedRows() {


// document.addEventListener("mousedown", function (event) {
//     deselectCells();
//     if (event.target.tagName === "INPUT") {
//         console.log(1)
//         SELECTED_CELLS.push(event.target);
//         document.addEventListener("mousemove", onMouseMove);
//         document.addEventListener("mouseup", onMouseUp);
//     }

//     function onMouseMove(event) {
//         console.log(event.target.tagName)
//         if (event.target.tagName === "INPUT" && !SELECTED_CELLS.includes(event.target)) {
//             console.log(2)
//             SELECTED_CELLS.push(event.target);
//             highlightSelectedCells();
//         }
//     }

//     function onMouseUp() {
//         document.removeEventListener("mousemove", onMouseMove);
//         document.removeEventListener("mouseup", onMouseUp);
//     }

//     function highlightSelectedCells() {
//         SELECTED_CELLS.forEach(function (cell) {
//             cell.style.backgroundColor = "lightblue";
//         });
//     }

//     function deselectCells() {
//         SELECTED_CELLS.forEach(function (cell) {
//             cell.style.backgroundColor = "";
//         });
//         SELECTED_CELLS = [];
//     }
// });
