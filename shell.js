path = window.location.pathname.split('/');
file = path[path.length - 1].split('.')[0];
article = document.querySelector('article');
autocomplete = document.querySelector(' #shell-input #autocomplete');

available_commands = ['ls', 'ls -a', 'cd', 'clear', 'echo'];

hidden_directories = ['.', '..'];

directories = [];
switch (file) {
    case 'index':
        directories = [...directories, 'Photography', 'Projects'];
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

// Will Need To Adjust Logic of cat() and cd() slightly if adding .files
function cat(command) {
    cat_location = command.split(' ')[1];

    if (section_ids.includes(cat_location)) {
        window.location.replace(`./${path[path.length - 1]}#${cat_location}`);
    } else if (cd_locations.includes(cat_location)) {
        new_line_a(`cat: ${cat_location}: Is a directory`);
    } else {
        new_line_a(`cat: ${cat_location}: No such file or directory`);
    }
}

function cd(command) {
    cd_location = command.split(' ')[1].replace(/^\/+|\/+$/g, '');

    if (section_ids.includes(cd_location)) {
        new_line_a(`cd: ${cd_location}: Not a directory`);
    } else if (cd_locations.includes(cd_location)) {
        if (cd_location === '..') {
            window.location.href = '../';
        } else if (directories.includes(cd_location)) {
            console.log(`./${cd_location}`);
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
                                replacement = document
                                    .getElementById(sub_command.split(' ')[1])
                                    .textContent.replace(/\n\s*/g, '');
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
    else new_line(echo_result[0], 'plain');
}

function clear() {
    document.querySelector('#shell-output').textContent = '';
}

function execute_command(command) {
    command = command.trim();
    command_base = command.split(' ')[0];

    new_gap();
    new_line(`~ ${command}`, 'command');

    switch (command_base) {
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
        autocomplete.textContent = available_commands[0];
        return;
    }

    for (let index = 0; index < available_commands.length; index++) {
        if (available_commands[index].startsWith(command)) {
            autocomplete.textContent = available_commands[index];
            return;
        }
    }

    const command_base = command.split(' ')[0];

    switch (command_base) {
        case 'cd':
            suggested_location = [...directories, ...hidden_directories].filter(
                (location) => location.startsWith(command.split(' ')[1])
            )[0];
            autocomplete.textContent = `${command_base} ${suggested_location || ''}`;
            break;
        case 'cat':
        case 'bat':
            suggested_file = [...section_ids].filter((file) =>
                file.startsWith(command.split(' ')[1])
            )[0];
            autocomplete.textContent = `${command_base} ${suggested_file || ''}`;
            break;
        default:
            autocomplete.textContent = '';
    }
}

function select_autocomplete() {
    shell_input.textContent = autocomplete.textContent;
}
