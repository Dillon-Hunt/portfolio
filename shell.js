path = window.location.pathname;
article = document.querySelector('article');
autocomplete = document.querySelector(' #shell-input #autocomplete');

available_commands = ['bat', 'cat', 'cd', 'clear', 'echo', 'help', 'ls', 'ls -a'];
available_commands_messages = [
    'Jumps to a section (\'Prints\' page content to screen)',
    'Equivalent to bat',
    'Change directory',
    'Clear the terminal screen',
    'Output the arguments',
    'This help message',
    'List directory contents',
    'List directory contents including hidden files',
]

hidden_directories = ['.', '..'];

directories = [];
switch (path) {
    case '/':
    case '/portfolio/':
        directories = [...directories, 'photography', 'projects'];
        break;
    case '/projects/':
    case '/portfolio/projects/':
        directories = [...directories, 'mini-links', 'ocean-watch', 'study-minutes', 'logic-gate-simulator', 'cafe-web-app', 'social-media-app'];
        break;
}

sections = article.children;
section_ids = ['hero.md'];

for (let index = 0; index < sections.length; index++) {
    section_ids.push(sections[index].id);
}

cd_locations = [...hidden_directories, ...directories, ...section_ids];

function new_gap() {
    line = document.createElement('br');
    line.classList.add('gap');
    document.querySelector('#shell-output').appendChild(line);
}

function new_line(text, type) {
    line = document.createElement('p');
    line.textContent = text;
    line.classList.add(type);
    document.querySelector('#shell-output').appendChild(line);
}

function new_line_a(text, href, type) {
    line = document.createElement('a');
    line.textContent = text;
    line.setAttribute('href', href);
    line.classList.add(type);
    document.querySelector('#shell-output').appendChild(line);
}

function ls() {
    directories.forEach((directory) => {
        new_line_a(directory, `./${directory}`, 'dir');
    });

    section_ids.forEach((section_id) => {
        new_line_a(section_id, `#${section_id}`, 'file');
    });
}

function ls_a() {
    hidden_directories = ['.', '..'];

    hidden_directories.forEach((directory) => {
        new_line_a(directory, './', 'dir');
    });
}

// Might need to adjust the logic of cat() and cd() slightly if adding .file and ../
function cat(command) {
    cat_location = command.split(' ')[1].replace(/^\.\//, '');

    if (section_ids.includes(cat_location)) {
        window.location.replace(
            `${path[path.length - 1].replace(/^\/+/, '')}#${cat_location}`
        );
    } else if (cd_locations.includes(cat_location)) {
        new_line(`cat: ${cat_location}: Is a directory`, 'error');
    } else {
        new_line(`cat: ${cat_location}: No such file or directory`, 'error');
    }
}

function cd(command) {
    if (command.split(' ').length === 1) return;

    cd_location = command
        .split(' ')[1]
        .replace(/^\/+|\/+$/g, '')
        .replace(/^\.\//, '');

    if (section_ids.includes(cd_location)) {
        new_line_a(`cd: ${cd_location}: Not a directory`);
    } else if (cd_locations.includes(cd_location)) {
        if (cd_location === '..') {
            window.location.href = '../';
        } else if (directories.includes(cd_location)) {
            window.location.href = `./${cd_location}`;
        }
    } else {
        new_line_a(`cd: ${cd_location}: No such file or directory`);
    }
}

function get_echo(command) {
    let message = command.startsWith('echo')
        ? command.replace('echo', '')
        : command;
    let replacements = {};
    let errorMessage = null;

    // const regex = /\$\((.*?)\)/g;
    const regex = /\$\((?:[^()]|\([^()]*\))*\)/g; // Thanks ChatGPT
    const matches = message.match(regex);

    if (matches) {
        if (matches.includes('$(clear)')) {
            clear();
            return ['', errorMessage];
        }

        matches.forEach((match) => {
            if (!errorMessage) {
                let sub_command = match.slice(2, -1);

                let replacement = '';

                switch (sub_command) {
                    case 'ls': // TODO
                        break;
                    case 'ls -a': // TODO
                        break;
                    case 'cd':
                    case 'echo':
                        break; // Do nothing
                    case 'clear':
                        console.error('Something went wrong', command);
                        break;
                    default:
                        const sub_command_base = sub_command.split(' ')[0];

                        switch (sub_command_base) {
                            case 'cd':
                                break; // Do nothing
                            case 'echo':
                                const echo_result = get_echo(sub_command);
                                replacement = echo_result[0];
                                if (!errorMessage) {
                                    errorMessage = echo_result[1];
                                }
                                break;
                            case 'cat':
                            case 'bat':
                                if (!document.getElementById(sub_command.split(' ')[1])) {
                                    console.error('Something went wrong', command);
                                    errorMessage = `${sub_command_base}: ${sub_command.split(' ')[1]}: No such file or directory`;
                                } else {
                                    replacement = document
                                        .getElementById(sub_command.split(' ')[1])
                                        .textContent.replace(/\n\s*/g, '');
                                }
                                break;
                            default:
                                errorMessage = `command not found: ${sub_command_base}`;
                                break;
                        }
                        break;
                }

                replacements[match] = replacement;
            }
        });

        Object.keys(replacements).forEach((key) => {
            message = message.replaceAll(key, replacements[key]);
        });
    }

    return [message, errorMessage];
}

function echo(command) {
    const echo_result = get_echo(command);
    if (echo_result[1]) new_line(echo_result[1], 'error');
    else if (echo_result[0] !== '') new_line(echo_result[0], 'plain');
}

function clear() {
    document.querySelector('#shell-output').textContent = '';
}

function help() {
    new_line('Available commands:', 'plain');
    available_commands.forEach((command, index) => {
        new_line(`- ${command}: ${available_commands_messages[index]}`, 'plain');
    });
}


function execute_command(command) {
    command = command.trim();
    command_base = command.split(' ')[0];

    new_gap();
    new_line(`~ ${command}`, 'command');

    switch (command_base) {
        case 'help':
            help();
            break;
        case 'ls': // Currently unable to ls a directory
            if (command === 'ls -a') {
                ls_a();
                ls();
            } else if (command === 'ls') {
                ls();
            } else {
                new_line(`command not found: ${command}`, 'error');
            }
            break;
        case 'cat':
        case 'bat':
            if (command.split(' ').length <= 2) {
                cat(command);
            } else {
                new_line(`${command_base}: too many arguments`, 'error');
            }
            break;
        case 'cd':
            if (command.split(' ').length <= 2) {
                cd(command);
            } else {
                new_line('cd: too many arguments', 'error');
            }
            break;
        case 'clear':
            if (command.split(' ').length == 1) {
                clear();
            } else {
                new_line('clear: too many arguments', 'error');
            }
            break;
        case 'echo':
            echo(command);
            break;
        default:
            new_line(`command not found: ${command_base}`);
            break;
    }
}

function update_autocomplete(command) {
    command = command.trim();

    if (command.length === 0) {
        autocomplete.textContent = available_commands[6];
        return;
    }

    for (let index = 0; index < available_commands.length; index++) {
        if (available_commands[index].startsWith(command)) {
            autocomplete.textContent = available_commands[index];
            return;
        }
    }

    const command_base = command.split(' ')[0]; // Extract command.split(' ') as a variable

    switch (command_base) {
        case 'cd':
            suggested_location = [...directories, ...hidden_directories].filter(
                (location) =>
                    command.length === 2 ||
                    location.startsWith(
                        command.split(' ')[1]?.replace(/^\.\//, '')
                    )
            )[0];
            autocomplete.textContent = `${command_base} ${command.split(' ')[1]?.startsWith('./') ? `./${suggested_location || ''}` : suggested_location || ''}`;
            break;
        case 'cat':
        case 'bat':
            suggested_file = [...section_ids].filter(
                (file) =>
                    command.length === 3 ||
                    file.startsWith(command.split(' ')[1]?.replace(/^\.\//, ''))
            )[0];
            autocomplete.textContent = `${command_base} ${command.split(' ')[1]?.startsWith('./') ? `./${suggested_file || ''}` : suggested_file || ''}`;
            break;
        default:
            autocomplete.textContent = '';
    }
}

function select_autocomplete() {
    shell_input.textContent = autocomplete.textContent;
}
