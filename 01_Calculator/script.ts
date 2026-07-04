import chalk from "chalk"; // Library for styling console output
import inquirer from "inquirer"; // Library for creating interactive command-line prompts

// Type for the answers
type Answers = {
	firstNumber: number;
	secondNumber: number;
	operator: '+' | '-' | '*' | '/';
}

type Again = {
    again: boolean
}

// Function to display error messages in red
const showError = (message: string) => {
	console.error(chalk.red(message));
};

// Function to perform the calculation based on user input
const performCalculation = async (): Promise<void> => {
	try {
		const answers: Answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'firstNumber',
				message: 'Enter the first number:',
				validate: (input: string) => {
					const firstNumber = Number(input);

					if (typeof firstNumber !== 'number' || isNaN(firstNumber) || input.trim() === '') {
						return 'Please enter a valid number';
					}
					return true;
				},
				filter: (input: string) => Number(input) // Convert input to number
			},
			{
				type: 'input',
				name: 'secondNumber',
				message: 'Enter the second number:',
				validate: (input: string) => {
					const secondNumber = Number(input);
					if (typeof secondNumber !== 'number' || isNaN(secondNumber) || input.trim() === '') {
						return 'Please enter a valid number';
					}
					return true;
				},
				filter: (input: string) => Number(input) // Convert input to number
			},
			{
				type: 'select',
				name: 'operator',
				choices: ['+', '-', '*', '/'],
				message: 'Select an operator:'
			}
		]);

		// Destructuring
		const { firstNumber, secondNumber, operator } = answers;

		// Default result variable
		let result: number;

		// Validate the operator
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

		// Display the result
		console.log(`Result: ${firstNumber} ${operator} ${secondNumber} = ${result}`);

		const again: Again = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'again',
				message: 'Do you want to perform another calculation?',
				default: false
			}
		])

		if (again.again) {
			await performCalculation();
		} else {
			console.log(chalk.green('Thank you for using the calculator!'));
		}

	} catch (err) {
		console.error(chalk.red('Something went wrong:'), err);
	}
};

performCalculation();
