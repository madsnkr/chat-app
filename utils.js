class Chat {
  #users = [];
  constructor() { }

  join = user => {
    this.#users.push(user);
    return user;
  };

  usernameTaken = (username, roomId) => {
    return this.#users.find(user => user.room === roomId && user.name === username);
  };

  getUser = id => this.#users.find(user => user.id === id);

  leave = id => {
    const allUsers = this.#users.filter(user => user.id !== id);
    return this.#users.splice(0, this.#users.length, ...allUsers)[0];
  };

  getUsers = roomId => this.#users.filter(user => user.room === roomId);
}


module.exports = new Chat();
