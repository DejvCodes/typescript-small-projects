"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk")); // Library for styling console output
const inquirer_1 = __importDefault(require("inquirer")); // Library for creating interactive command-line prompts
// Function to display error messages
const showError = (message) => {
    console.error(chalk_1.default.red(message));
};
// Shared validation and filtering for number inputs
const validateNumber = (input) => input.trim() === '' || isNaN(Number(input))
    ? 'Please enter a valid number'
    : true;
// Convert input to number
const toNumber = (input) => Number(input);
// Function to perform the calculation based on user input
const performCalculation = async () => {
    try {
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'firstNumber',
                message: 'Enter the first number:',
                validate: validateNumber,
                filter: toNumber
            },
            {
                type: 'input',
                name: 'secondNumber',
                message: 'Enter the second number:',
                validate: validateNumber,
                filter: toNumber
            },
            {
                type: 'select',
                name: 'operator',
                choices: ['+', '-', '*', '/'],
                message: 'Select an operator:'
            }
        ]);
        const { firstNumber, secondNumber, operator } = answers;
        let result;
        // Check for division by zero
        if (operator === '/' && secondNumber === 0) {
            showError('Division by zero is not allowed');
            return;
        }
        // Perform the calculation based on the operator
        switch (operator) {
            case '+':
                result = firstNumber + secondNumber;
                break;
            case '-':
                result = firstNumber - secondNumber;
                break;
            case '*':
                result = firstNumber * secondNumber;
                break;
            case '/':
                result = firstNumber / secondNumber;
                break;
            default:
                throw new Error('Invalid operator');
        }
        const finalResult = Math.round(result * 100) / 100;
        // Display the result
        console.log(chalk_1.default.cyan(`Result: ${firstNumber} ${operator} ${secondNumber} = ${finalResult}`));
    }
    catch (err) {
        console.error(chalk_1.default.red('Something went wrong:'), err);
    }
};
// Runs calculations in a loop until the user decides to stop
const main = async () => {
    while (true) {
        await performCalculation();
        const { again } = await inquirer_1.default.prompt({
            type: 'confirm',
            name: 'again',
            message: 'Do you want to perform another calculation?',
            default: false
        });
        if (!again)
            break;
    }
    console.log(chalk_1.default.green('Thank you for using the calculator!'));
};
main();
