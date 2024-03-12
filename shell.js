path = window.location.pathname.split('/');
file = path[path.length - 1].split('.')[0];
article = document.querySelector('article');
autocomplete = document.querySelector(' #shell-input #autocomplete');

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

function clear_output() {
    document.querySelector('#shell-output').textContent = '';
}

function execute_command(command) {
    command = command.trim();

    new_gap();
    new_line(`~ ${command}`, 'command');

    switch (command.split(' ')[0]) {
        case 'ls':
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
            if (command.split(' ').length <= 2) {
                cat(command);
            } else {
                new_line('cat: too many arguments', 'error');
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
                clear_output();
            } else {
                new_line('clear: too many arguments', 'error');
            }
            break;

        default:
            new_line(`command not found: ${command}`);
            break;
    }
}

available_commands = ['ls', 'ls -a', 'cd', 'clear', 'echo'];

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

    if (command.startsWith('cd')) {
        suggested_location = [
            ...directories,
            ...hidden_directories,
        ].filter((location) => location.startsWith(command.split(' ')[1]))[0];
        autocomplete.textContent = `cd ${suggested_location || ''}`;
    } else if (command.startsWith('cat')) {
        suggested_location = [
            ...section_ids,
        ].filter((location) => location.startsWith(command.split(' ')[1]))[0];
        autocomplete.textContent = `cat ${suggested_location || ''}`;
    } else {
        autocomplete.textContent = '';
    }
}

function select_autocomplete() {
    shell_input.textContent = autocomplete.textContent;
}
