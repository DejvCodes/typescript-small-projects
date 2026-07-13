import chalk from 'chalk'; // Library for styling console output
import inquirer from 'inquirer'; // Library for creating interactive command-line prompts

type Answer = {
	userID: string;
	userPIN: string;
	transactionType: 'Quick withdrawal' | 'Custom withdrawal' | 'Deposit';
	quickAmount: number;
	customAmount: number;
	depositAmount: number;
}

// Initial balance and user credentials
let balance: number = 10000;
const userID: string = 'user';
const userPIN: string = '1111';

// Choices for quick withdrawal amounts
const quickWithdrawalChoices = [
	{ name: '1000 Kč', value: 1000 },
	{ name: '2000 Kč', value: 2000 },
	{ name: '3000 Kč', value: 3000 },
	{ name: '5000 Kč', value: 5000 },
];

// Function to format the price
const formatPrice = (value: number, locale: string = 'cs-CZ', currency: string = 'CZK') => {
	return Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

// Function to validate user ID input
const validateUserID = (input: string) => {
	if (!input || input.trim() === '') {
		return 'User ID cannot be empty';
	}

	if (input !== userID) {
		return 'Invalid User ID';
	}

	return true;
};

// Function to validate user PIN input
const validateUserPIN = (input: string) => {
	if (!input || input.trim() === '') {
		return 'User PIN cannot be empty';
	}

	if (input !== userPIN) {
		return 'Invalid User PIN';
	}

	return true;
};

// Function to validate withdrawal amount input
const validateAmount = (input: string) => {
	const amount = Number(input);

	if (isNaN(amount) || amount <= 0) {
		return 'Please enter a valid positive number';
	}

	if (amount > balance) {
		return 'Insufficient balance for this withdrawal, your current balance is: ' + formatPrice(balance);
	}

	return true;
};

// Function to validate deposit amount input
const validateDepositAmount = (input: string) => {
	const amount = Number(input);

	if (isNaN(amount) || amount <= 0) {
		return 'Please enter a valid positive number';
	}

	return true;
};

const atm = async (): Promise<void> => {
	try {
		const answers = await inquirer.prompt<Answer>([
			{
				type: 'input',
				name: 'userID',
				message: 'Enter your user ID:',
				validate: validateUserID,
			},
			{
				type: 'password',
				name: 'userPIN',
				message: 'Enter your PIN:',
				mask: '*',
				validate: validateUserPIN,
			},
			{
				type: 'select',
				name: 'transactionType',
				message: 'Select transaction type:',
				choices: ['Quick withdrawal', 'Custom withdrawal', 'Deposit'],
			},
			{
				type: 'select',
				name: 'quickAmount',
				message: 'Select quick withdrawal amount:',
				choices: quickWithdrawalChoices,
				when: (answers) => answers.transactionType === 'Quick withdrawal',
			},
			{
				type: 'input',
				name: 'customAmount',
				message: 'Enter custom withdrawal amount:',
				validate: validateAmount,
				when: (answers) => answers.transactionType === 'Custom withdrawal',
				filter: (input: string) => Number(input),
			},
			{
				type: 'input',
				name: 'depositAmount',
				message: 'Enter deposit amount:',
				validate: validateDepositAmount,
				when: (answers) => answers.transactionType === 'Deposit',
				filter: (input: string) => Number(input),
			}
		]);

		const { quickAmount, customAmount, depositAmount, transactionType } = answers;

		// Process the transaction based on the user choice
		if (transactionType === 'Deposit') {
			balance += depositAmount;
			console.log(chalk.green(`Deposit successful! New balance: ${formatPrice(balance)}`));

		} else {
			const withdrawalAmount = quickAmount || customAmount || 0;

			if (withdrawalAmount > balance) {
				console.log(chalk.red(`Insufficient balance for this withdrawal, your current balance is: ${formatPrice(balance)}`));
				return;
			}

			balance -= withdrawalAmount;
			console.log(chalk.green(`Withdrawal successful! New balance: ${formatPrice(balance)}`));
		}

	} catch (error) {
		console.error(chalk.red('An error occurred:'), error);
	}
};

// Start the ATM app
atm();
