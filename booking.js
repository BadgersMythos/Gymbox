const moment = require('moment');
const {
  login,
  logout,
  getGymboxTimeTable,
  postBooking,
  completeBasket
} = require('./requests');

const { extractTimeTable, dateFormat } = require('./timetable');
const classes = require('./classes.json');

const filterToBook = (lessons) => {
  let classesToBook = Object.keys(classes)
    .filter(date => moment().add(2, 'day').isAfter(moment(date)) && moment().isBefore(moment(date)))
    .map(date =>
      lessons[date]
        .find(l => {
          return (
            l.className === classes[date].className
            && l.time === classes[date].time
          );
        })
    )
    .filter(Boolean);

    return classesToBook.filter(l => {
      if (!l.canBook) {
        console.log(`Can't book class ${l.className} at ${l.time}`)
        return false
      }

      return true;
    })
};

const bookClasses = (lessons) => {
  if (lessons && lessons.length > 0) {
    console.log('Lessons about to book: ', lessons);
    return Promise.all(lessons.map(postBooking));
  }

  console.error('No lessons to book today');
  throw new Error('No lessons to book today');
};

const main = (email, password) => {
  login(email, password)
    .then(getGymboxTimeTable)
    .then(extractTimeTable)
    .then(filterToBook)
    .then(bookClasses)
    .then(completeBasket)
    .then(logout)
    .catch(err => {
      logout().then(() => {
        console.log('Couldn\'t complete the booking');
      })
    })
};

module.exports = {
  main
};
