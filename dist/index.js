// eslint-disable-next-line no-undef
const socket = io();

const { username, roomId } = Object.fromEntries(new URLSearchParams(window.location.search));

const form = document.getElementById('form');
const messageInput = document.getElementById('message');
const messageContainer = document.getElementById('message-container');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (messageInput.value) {
    socket.emit('chatMessage', messageInput.value);
    messageInput.value = '';
  }
});

socket.emit('join', { username, roomId });

socket.on('roomMessage', (message) => {
  messageContainer.insertAdjacentHTML('beforeend', `<p class="text-center">${message}</p>`);
});

socket.on('chatMessage', (message) => {
  const { user, body, date } = message;

  //If message is from current user then display it on the right else display on left
  if (user === username) {
    messageContainer.insertAdjacentHTML('beforeend', `
      <div class="p-6">
        <div class="bg-slate-300 rounded max-w-xl p-2 float-right">
          <span>
            <p class="text-right">${body}</p>
            <p class="text-right text-xs text-indigo-900">${date}</p>
          </span>
        </div>
      </div>`);
  } else {
    messageContainer.insertAdjacentHTML('beforeend', `
      <div class="p-6">
        <div class="bg-slate-300 rounded max-w-xl p-2 float-left">
          <span>
            <p class="text-right">${body}</p>
            <p class="text-right text-xs text-indigo-900">${date}</p>
          </span>
        </div>
      </div>`);
  }
});

