import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
    generateRandomPassword(length = 8) {
        const specialCharacters = '@$!%*?';
        const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';

        // Create arrays for each character type
        const specialArray = specialCharacters.split('');
        const lowercaseArray = lowercaseLetters.split('');
        const uppercaseArray = uppercaseLetters.split('');
        const numbersArray = numbers.split('');

        // Initialize an array to hold the password components
        const passwordArray = [];

        // Add at least one special character, one lowercase letter,
        // one uppercase letter, and one number to the passwordArray
        passwordArray.push(this.getRandomCharacter(specialArray));
        passwordArray.push(this.getRandomCharacter(lowercaseArray));
        passwordArray.push(this.getRandomCharacter(uppercaseArray));
        passwordArray.push(this.getRandomCharacter(numbersArray));

        // Generate the remaining characters randomly
        for (let i = 4; i < length; i++) {
            const randomCategory = Math.floor(Math.random() * 4);
            switch (randomCategory) {
                case 0:
                    passwordArray.push(this.getRandomCharacter(specialArray));
                    break;
                case 1:
                    passwordArray.push(this.getRandomCharacter(lowercaseArray));
                    break;
                case 2:
                    passwordArray.push(this.getRandomCharacter(uppercaseArray));
                    break;
                case 3:
                    passwordArray.push(this.getRandomCharacter(numbersArray));
                    break;
            }
        }

        // Shuffle the passwordArray to randomize the characters
        this.shuffleArray(passwordArray);

        return passwordArray.join('');
    }

    getRandomCharacter(charArray) {
        const randomIndex = Math.floor(Math.random() * charArray.length);
        return charArray[randomIndex];
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
