## Small TypeScript Projects  

• Inquirer.js – Handles interactive prompts in the command line. <br>
• Chalk – Adds color to terminal messages. <br>
• tsx – Runs the TypeScript files directly, without a separate build step. <br>
• Node.js – JavaScript runtime for executing the application in the terminal. <br>

## 01_Calculator
• Interactive command-line Calculator built with TypeScript and Inquirer.js. <br>
• Supports basic arithmetic operations: +, -, *, /. <br>
• Prompts the user to enter two numbers and an operator, then displays the result in the terminal. <br>
• Validates the input and blocks division by zero. <br>
• Rounds the result to two decimal places. <br>
• Option to perform additional calculations after each result. <br>

## 02_GuessingGame
• Interactive command-line number GuessingGame built with TS and Inquirer.js. <br>
• Generates a random number between 1 and 10. <br>
• Prompts the user to guess the number and hints whether the guess is too high or too low. <br>
• Counts the attempts and shows the total once the number is guessed. <br>
• Option to play again after each round. <br> 

## 03_ATM
• Interactive command-line ATM simulation using TypeScript and Inquirer.js. <br>
• Starts with a login prompt for a user ID and a masked PIN (demo credentials: `user` / `1111`). <br>
• Allows users to select between "Quick withdrawal", "Custom withdrawal" or "Deposit". <br>
• Predefined quick withdrawal amounts (1000, 2000, 3000, 5000 Kč) or a custom amount. <br>
• Checks if the user has enough balance (starting balance: 10 000 Kč). <br>
• Includes a function to format amounts in CZK. <br> 

## 04_WordCounter 
• Interactive command-line WordCounter built with TypeScript and Inquirer.js. <br>
• Prompts the user to enter a sentence. <br>
• Splits the sentence into words and counts them. <br>
• Displays the total word count in the terminal using Chalk for styling. <br>
• Option to enter another sentence for counting.

## 🏃🏻 How to Run this App
1. Clone the repository: <br>
   • `git clone https://github.com/DejvCodes/typescript-small-projects.git` <br>
   • `cd typescript-small-projects` <br>
2. Navigate to the project you want to run: <br>
   • `cd 01_Calculator`, `cd 02_GuessingGame`, `cd 03_ATM` or `cd 04_WordCounter` <br>
3. Install dependencies: <br>
   • `npm install` <br>
4. Start the app: <br>
   • `npm start` <br>

## 💻 Tech Stack 
[![My Skills](https://skillicons.dev/icons?i=javascript,typescript,nodejs)](https://skillicons.dev)

## 📁 Project Structure
```
typescript-small-projects/
├── 01_Calculator/      # Calculator app with basic arithmetic operations
├── 02_GuessingGame/    # Number guessing game (1-10)
├── 03_ATM/             # ATM simulation with deposits and withdrawals
├── 04_WordCounter/     # Word counter for text input
├── LICENSE             # MIT License
└── README.md           # Project documentation
```

Each project is self-contained with its own `package.json`, `tsconfig.json`, `.editorconfig` and `script.ts`.

## 🔐 License 
[MIT License](LICENSE) 
