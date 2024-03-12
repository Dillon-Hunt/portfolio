// Commands to add
// 1. ls
// 2. ls -a (hidden files)
// 2. cd
// 3. cat
// 4. clear
// 5. help
// 6. exit
// 7. echo
// 8. history
// 9. pwd (print working directory)

// Ideas
// History stored in local storage
// Autocomplete
// Allow users to mkdir
// Allow users to touch
// Allow users to rm?
// Allow users to mv?
// Allow users to cp?

const LETTERS =
    'abcdefghijklmnopqrstuvwxyz' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '1234567890' +
    '.,;:!?-+*/=()[]{}' +
    ' ';

let typing_indicator = false;
let holding_meta = false;
let timeout_cursor = null;
let timeout_shell = null;
let timeout_shell_inactive = null;

shell = document.querySelector('#console');
shell_input = document.querySelector('#shell-input #input');
cursor = document.querySelector('#shell-input #cursor');

function update_cursor() {
    if (typing_indicator) {
        cursor.classList.remove('cursor-blink');
    } else {
        cursor.classList.add('cursor-blink');
    }
}

document.querySelector('body').addEventListener('keyup', (e) => {
    if (e.key === 'Meta' || e.key === 'Alt' || e.key === 'Control') {
        holding_meta = false;
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key == ' ') {
        e.preventDefault();
    }
});

document.querySelector('body').addEventListener('keydown', (e) => {
    if (e.key === 'Meta' || e.key === 'Alt' || e.key === 'Control') {
        holding_meta = true;
    } else {
        clearTimeout(timeout_shell);
        clearTimeout(timeout_cursor);
        clearTimeout(timeout_shell_inactive);
    }

    if (!holding_meta) {
        if (LETTERS.includes(e.key)) {
            timeout_cursor = setTimeout(() => {
                typing_indicator = false;
                update_cursor();
            }, 500);
            typing_indicator = true;
            shell_input.innerText += e.key;
        } else if (e.key === 'Backspace') {
            timeout_cursor = setTimeout(() => {
                typing_indicator = false;
                update_cursor();
            }, 500);
            shell_input.textContent = shell_input.textContent.slice(0, -1);
        } else if (e.key === 'ArrowRight') {
            select_autocomplete();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            typing_indicator = false;
            execute_command(shell_input.textContent);
            shell_input.textContent = '';
        }

        shell.classList.add('interacted');
        timeout_shell = setTimeout(() => {
            if (shell_input.textContent.trim() === '') {
                shell.classList.remove('interacted');
            }
        }, 5000);
        timeout_shell_inactive = setTimeout(() => {
            if (shell_input.textContent.trim() !== '') {
                cursor.classList.remove('cursor-blink');
            }
        }, 15000);
    }

    update_autocomplete(shell_input.textContent);
    update_cursor();
});

update_cursor();
