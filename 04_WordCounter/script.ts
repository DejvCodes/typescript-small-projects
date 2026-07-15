import chalk from 'chalk'; // Library for styling console output
import inquirer from 'inquirer'; // Library for creating interactive command-line prompts

// Type for the answer
type AskAgain = {
	again: boolean;
}

// Function to validate user input
const validateSentence = (input: string) => {
	if (!input || input.trim() === '') {
		return 'Input cannot be empty';
	}
	return true;
};

// Function to count words in a sentence
const wordCounter = async () => {
	try {
		const answers = await inquirer.prompt<{ sentence: string }>([
			{
				type: 'input',
				name: 'sentence',
				message: 'Enter a sentence to count the words:',
				validate: validateSentence
			}
		]);

		// trim() is required: leading/trailing whitespace would produce empty entries in the split result
		const wordCount = answers.sentence.trim().split(/\s+/).length;
		console.log(chalk.blue(`Word count: ${wordCount}`));

	} catch (error) {
		console.error(chalk.red('An error occurred:'), error);
	}
};

// Main function to run the Word Counter app
const main = async () => {
	while (true) {
		await wordCounter();

		const { again } = await inquirer.prompt<AskAgain>([
			{
				type: 'confirm',
				name: 'again',
				message: 'Do you want to count words again?',
				default: false
			}
		]);

		if (!again) {
			console.log(chalk.green('Thank you for using the Word Counter!'));
			break;
		}
	}
};

// Start the Word Counter app
main();
