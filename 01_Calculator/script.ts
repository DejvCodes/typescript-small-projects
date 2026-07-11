import chalk from "chalk"; // Library for styling console output
import inquirer from "inquirer"; // Library for creating interactive command-line prompts

// Type for the answers
type Answers = {
	firstNumber: number;
	secondNumber: number;
	operator: '+' | '-' | '*' | '/';
}

type Again = {
	again: boolean;
}

// Function to display error messages
const showError = (message: string) => {
	console.error(chalk.red(message));
};

// Shared validation and filtering for number inputs
const validateNumber = (input: string) =>
	input.trim() === '' || isNaN(Number(input))
		? 'Please enter a valid number'
		: true;

// Convert input to number
const toNumber = (input: string) => Number(input);

// Function to perform the calculation based on user input
const performCalculation = async (): Promise<void> => {
	try {
		const answers = await inquirer.prompt<Answers>([
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

		let result: number;

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
		console.log(chalk.cyan(`Result: ${firstNumber} ${operator} ${secondNumber} = ${finalResult}`));

	} catch (err) {
		console.error(chalk.red('Something went wrong:'), err);
	}
};

// Runs calculations in a loop until the user decides to stop
const main = async (): Promise<void> => {
	while (true) {
		await performCalculation();

		const { again } = await inquirer.prompt<Again>({
			type: 'confirm',
			name: 'again',
			message: 'Do you want to perform another calculation?',
			default: false
		});

		if (!again) break;
	}

	console.log(chalk.green('Thank you for using the calculator!'));
};

main();
