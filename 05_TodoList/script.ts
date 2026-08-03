import chalk from 'chalk'; // Library for styling console output
import inquirer from 'inquirer'; // Library for creating interactive command-line prompts
import {readFile, writeFile} from 'node:fs/promises'; // Promise-based file system API

// Type for a single task stored in todos.json
type Todo = {
	id: number;
	title: string;
	done: boolean;
}

// All options the main menu can return
type MenuAction = 'list' | 'add' | 'toggle' | 'remove' | 'quit';

// Answer shape returned by the main menu prompt
type MenuAnswer = {
	action: MenuAction;
}

// Path to the JSON file where tasks are stored, relative to this script
const dataFile = new URL('./todos.json', import.meta.url);

// Function to read the saved tasks from disk
const loadTodos = async (): Promise<Todo[]> => {
	try {
		const content = await readFile(dataFile, 'utf-8');
		return JSON.parse(content) as Todo[];

	} catch (error) {
		// Missing file means this is the first run, so start with an empty list
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return [];
		}

		throw error;
	}
};

// Function to save the tasks
const saveTodos = async (todos: Todo[]): Promise<void> => {
	await writeFile(dataFile, JSON.stringify(todos, null, 2), 'utf-8');
}; 

// Function to validate the task title entered by the user
const validateTitle = (input: string) => {
	if (!input || input.trim() === '') {
		return 'Task cannot be empty';
	}

	return true;
};

// Function to turn tasks into inquirer choices
const toChoices = (todos: Todo[]) => {
	return todos.map((todo) => ({
		name: `${todo.done ? '[x]' : '[ ]'} ${todo.title}`,
		value: todo.id,
	}));
};

// Function to list the tasks in a nice format
const listTodos = (todos: Todo[]): void => {
	if (todos.length === 0) {
		console.log(chalk.yellow('Your todo list is empty.'));
		return;
	}

	console.log(chalk.blue.bold('\nYour tasks:'));

	todos.forEach((todo, index) => {
		const line = `${index + 1}. ${todo.done ? '[x]' : '[ ]'} ${todo.title}`;
		console.log(todo.done ? chalk.green.strikethrough(line) : chalk.white(line));
	});

	const doneCount = todos.filter((todo) => todo.done).length;
	console.log(chalk.gray(`\n${doneCount} of ${todos.length} done\n`));
};

// Function to add a new task
const addTodo = async (todos: Todo[]): Promise<Todo[]> => {
	const { title } = await inquirer.prompt<{ title: string }>([
		{
			type: 'input',
			name: 'title',
			message: 'Enter a new task:',
			validate: validateTitle,
		}
	]);

	// Generate a new ID by finding the maximum existing ID and adding 1
	const nextId = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;

	const newTodos = [
		...todos,
		{ id: nextId, title: title.trim(), done: false }
	];

	console.log(chalk.green(`Task added: ${title.trim()}`));

	return newTodos;
};

// Function to toggle the done status of a task
const toggleTodo = async (todos: Todo[]): Promise<Todo[]> => {
	if (todos.length === 0) {
		console.log(chalk.yellow('There is nothing to check off yet.'));
		return todos;
	}

	const { id } = await inquirer.prompt<{ id: number }>([
		{
			type: 'select',
			name: 'id',
			message: 'Select a task to toggle:',
			choices: toChoices(todos),
		}
	]);

	const newTodos = todos.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo);
	const toggled = newTodos.find((todo) => todo.id === id)!; // id comes from the list, so it always exists

	console.log(toggled.done
		? chalk.green(`Done: ${toggled.title}`)
		: chalk.yellow(`Reopened: ${toggled.title}`)
	);

	return newTodos;
};

// Function to remove a task
const removeTodo = async (todos: Todo[]): Promise<Todo[]> => {
	if (todos.length === 0) {
		console.log(chalk.yellow('There is nothing to delete yet.'));
		return todos;
	}

	const { id } = await inquirer.prompt<{ id: number }>([
		{
			type: 'select',
			name: 'id',
			message: 'Select a task to delete:',
			choices: toChoices(todos),
		}
	]);

	const removed = todos.find((todo) => todo.id === id)!; // id comes from the list, so it always exists

	const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
		{
			type: 'confirm',
			name: 'confirmed',
			message: `Really delete "${removed.title}"?`,
			default: false,
		}
	]);

	if (!confirmed) {
		console.log(chalk.gray('Nothing was deleted.'));
		return todos;
	}

	console.log(chalk.red(`Deleted: ${removed.title}`));
	return todos.filter((todo) => todo.id !== id);
};

// Main function to run the Todo List app
const main = async () => {
	try {
		let todos = await loadTodos();
		console.log(chalk.blue.bold('Todo List'));

		while (true) {
			const { action } = await inquirer.prompt<MenuAnswer>([
				{
					type: 'select',
					name: 'action',
					message: 'What do you want to do?',
					choices: [
						{ name: 'Show tasks', value: 'list' },
						{ name: 'Add task', value: 'add' },
						{ name: 'Toggle task', value: 'toggle' },
						{ name: 'Delete task', value: 'remove' },
						{ name: 'Quit', value: 'quit' },
					],
				}
			]);

			if (action === 'quit') {
				console.log(chalk.green('Thank you for using the Todo List!'));
				break;
			}

			// Listing does not change anything, so there is nothing to save
			if (action === 'list') {
				listTodos(todos);
				continue;
			}

			// Run the selected action based on the user choice
			if (action === 'add') {
				todos = await addTodo(todos);
			} else if (action === 'toggle') {
				todos = await toggleTodo(todos);
			} else {
				todos = await removeTodo(todos);
			}

			// Persist after every change so nothing is lost on exit
			await saveTodos(todos);
		}

	} catch (error) {
		console.error(chalk.red('An error occurred:'), error);
	}
};

// Start the Todo List app
main();
