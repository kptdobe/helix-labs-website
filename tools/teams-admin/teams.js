import { API_ENDPOINT } from './config.js';

/* eslint-disable no-alert */
const myteams = document.getElementById('myteams');
const teamsContainer = document.getElementById('teams-container');

const key = document.getElementById('key');
const email = document.getElementById('email');

const persistFormFields = () => {
  localStorage.setItem('key', key.value);
  localStorage.setItem('email', email.value);
};

const getMyTeams = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/users/${email.value}/teams`, {
      headers: {
        'x-api-key': key.value,
      }
    });

    if (response.ok) {
      const teams = await response.json();
      return teams;
    }
  } catch (e) {};

  return [];
}

const getAllTeams = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/teams`, {
      headers: {
        'x-api-key': key.value,
      }
    });

    if (response.ok) {
      const teams = await response.json();
      return teams;
    }
  } catch (e) {};

  return [];
}

const refreshSaveButton = () => {
  const button = document.getElementById('save');

  const add = teamsContainer.querySelectorAll('.add');
  const remove = teamsContainer.querySelectorAll('.remove');

  if (add.length || remove.length) {
    button.removeAttribute('disabled');
  } else {
    button.setAttribute('disabled', true);
  }
};

const displayTeams = async () => {
  teamsContainer.innerHTML = '<span class="spinner"></span>';

  const teams = await getMyTeams();

  if (teams.length === 0) {
    teamsContainer.innerHTML = '<p>No teams found - invite user first.</p>';
    return;
  }
  
  const all = await getAllTeams();
  all.sort((a, b) => a.displayName.localeCompare(b.displayName));

  const ul = document.createElement('ul');

  all.forEach(team => {
    const found = teams.find(t => t.displayName === team.displayName);
    const li = document.createElement('li');
    li.classList.add(found ? 'member' : 'not-member');

    const title = document.createElement('h4');
    title.textContent = team.displayName;
    li.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = team.description;
    li.appendChild(description);

    ul.appendChild(li);

    li.addEventListener('click', () => {
      if (found) {
        if (li.classList.contains('remove')) {
          li.classList.remove('remove');
        } else {
          li.classList.add('remove');
        }
      } else {
        if (li.classList.contains('add')) {
          li.classList.remove('add');
        } else {
          li.classList.add('add');
        }
      }

      refreshSaveButton();
    });
  });

  const button = document.createElement('button');
  button.id = 'save';
  button.textContent = 'Save';
  button.disabled = true;
  button.classList.add('button');

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span>';
    const add = teamsContainer.querySelectorAll('.add');

    const body = {
      add: [],
      remove: [],
    };

    add.forEach(async (li) => {
      const displayName = li.querySelector('h4').textContent;
      body.add.push(displayName);
    });


    const remove = teamsContainer.querySelectorAll('.remove');

    remove.forEach(async (li) => {
      const displayName = li.querySelector('h4').textContent;
      body.remove.push(displayName);
    });

    try {
      const res = await fetch(`${API_ENDPOINT}/users/${email.value}/teams`, {
        method: 'POST',
        headers: {
          'x-api-key': key.value,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error(`Error saving updates: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.error(e);
    };

    displayTeams();
  });

  const wrapper = document.createElement('p');
  wrapper.classList.add('button-wrapper');
  wrapper.appendChild(button);

  teamsContainer.innerHTML = '';
  teamsContainer.appendChild(ul);
  teamsContainer.appendChild(wrapper);
}

/**
 * Handles site admin form submission.
 * @param {Event} e - Submit event.
 */
myteams.addEventListener('click', async (e) => {
  e.preventDefault();
  persistFormFields();

  displayTeams();
});

key.value = localStorage.getItem('key') || '';
email.value = localStorage.getItem('email') || '@adobe.com';

