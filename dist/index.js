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

socket.on('chatMessage', (message) => {
  //Check wether to display message on right side or left side 
  //based on if its your message or the other persons message
  messageContainer.insertAdjacentHTML('beforeend', `
      <div class="p-6">
        <div class="bg-slate-300 rounded max-w-xl p-2 float-right">
          <span>
            <p class="text-right">${message}</p>
          </span>
        </div>
      </div>`);
});

