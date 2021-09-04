const currentTime = new Date();
const hour = currentTime.getHours();
const min = currentTime.getMinutes();

const timer = document.querySelector('#timer');
timer.innerHTML = `${hour < 10 ? `0${hour}` : hour}:${
  min < 10 ? `0${min}` : min
}`;
