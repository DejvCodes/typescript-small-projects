import chalk from "chalk"; // Library for styling console output
import inquirer from "inquirer"; // Library for creating interactive command-line prompts

// Type for the answer
type GuessAnswer = {
	userGuess: number;
}

type PlayAgain = {
	again: boolean;
}

// Range of numbers the player has to guess
const MIN = 1;
const MAX = 10;

// Function to generate a random number between MIN and MAX
const generateNumber = (): number => {
	return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
};

// Function to validate user input
const validateNumber = (input: string): string | boolean => {
	const num = Number(input);

	if (input.trim() === '' || isNaN(num)) {
		return 'Please enter a valid number';
	}

	if (!Number.isInteger(num)) {
		return 'Please enter a whole number';
	}

	if (num < MIN || num > MAX) {
		return `Number must be between ${MIN} and ${MAX}`;
	}

	return true;
};

// Function to handle the guessing game logic
const guessANumber = async () => {
	const randomNumber = generateNumber();
	let attempts = 0;

	try {
		while (true) {
			const answer = await inquirer.prompt<GuessAnswer>({
				type: 'input',
				name: 'userGuess',
				message: `Guess a number between ${MIN} and ${MAX}:`,
				validate: validateNumber,
				filter: (input: string) => Number(input)
			});

			attempts++;

			if (answer.userGuess === randomNumber) {
				const tries = attempts === 1 ? 'attempt' : 'attempts';
				console.log(chalk.green(`Congratulations! You guessed the correct number in ${attempts} ${tries}.`));
				break;
			} else if (answer.userGuess < randomNumber) {
				console.log(chalk.yellow('Too low! Try higher.'));
			} else {
				console.log(chalk.yellow('Too high! Try lower.'));
			}
		}
	} catch (error) {
		console.error(chalk.red('An error occurred. Please try again.'));
	}
};

// Main function to run the guessing game
const main = async (): Promise<void> => {
	while (true) {
		await guessANumber();

		const { again } = await inquirer.prompt<PlayAgain>({
			type: 'confirm',
			name: 'again',
			message: 'Do you want to play again?',
			default: false
		});

		if (!again) break;
	}

	console.log(chalk.green('Thank you for playing!'));
};

main();
