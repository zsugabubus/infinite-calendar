'use strict';

const REPEAT_NEVER = 0;
const REPEAT_DAILY = 1;
const REPEAT_WEEKLY = 2;
const REPEAT_MONTHLY = 3;
const REPEAT_YEARLY = 4;

function Event() {
  switch (arguments.length) {
    case 1:
      let src = arguments[0];
      this.about = src.about;
      this.date = src.date;
      if(src.id !== undefined) this.id = src.id;

      if ((src = src.repeat)) {
        const dst = (this.repeat = {});

        dst.type = src.type;

        if (src.interval) dst.interval = src.interval;
        if (src.until) dst.until = src.until;
        if (src.days) dst.days = src.days;
        if (src.duration) dst.duration = src.duration;

      }
      break;
    case 2:
      this.date = +arguments[0];
      this.about = arguments[1];
      break;
  }

};

Event.prototype.getDate = function(repeatType) {
  return new Date(this.date);
};

Event.prototype.getID = function(repeatType) {
  return this.id;
};

Event.prototype.setRepeatType = function(repeatType) {
  if (repeatType === REPEAT_NEVER) {
    delete this.repeat;
    return;
  }

  this.repeat = {
    type: repeatType
  };

};


Event.prototype.getDuration = function() {
  return this.duration;
};

Event.prototype.setDuration = function(duration) {
  if (duration > 0 || duration === -1) this.duration = duration;
  else delete this.duration;
};

Event.prototype.getRepeatType = function() {
  return this.repeat ? this.repeat.type : REPEAT_NEVER;
};

Event.prototype.getRepeatDayIndexes = function() {

  if (!this.repeat || this.repeat.type !== REPEAT_WEEKLY) throw 'invalid repeating';

  const z = this.repeat.days;
  if(z) {
    let r = [];
    for(let i = 0;i<7;i++) {
      if(z & (1 << i)) r.push(i);
    }
    return r;
  } else {
    return new Date(this.date).getUTCDay();
  }
};

Event.prototype.getRepeatDays = function() {

  if (!this.repeat || this.repeat.type !== REPEAT_WEEKLY) throw 'invalid repeating';

  return this.repeat.days || (1 << new Date(this.date).getUTCDay());
};

Event.prototype.setRepeatDays = function(days) {

  if (!this.repeat || this.repeat.type !== REPEAT_WEEKLY) return false;

  this.repeat.days = days;

  if (this.repeat.days === (1 << new Date(this.date).getUTCDay())) {
    delete this.repeat.days;
  }

  return true;

};

Event.prototype.setRepeatDay = function(day, state) {

  if (!this.repeat || this.repeat.type !== REPEAT_WEEKLY) throw 'invalid repeating';

  if (state) this.repeat.days = (this.repeat.days || 0) | (1 << day);
  else this.repeat.days = (this.repeat.days || 0) & ~(1 << day);

  if (this.repeat.days === (1 << new Date(this.date).getUTCDay())) {
    delete this.repeat.days;
  }

};

Event.prototype.getRepeatInterval = function() {

  if (!this.repeat) throw 'no repeating';

  return this.repeat.interval || 1;
};

Event.prototype.setRepeatInterval = function(interval) {

  if (!this.repeat) return false;

  if (interval > 1) this.repeat.interval = interval;
  else delete this.repeat.interval;

  return true;
};

Event.prototype.getRepeatUntil = function() {

  if (!this.repeat) throw 'no repeating';

  if(!this.repeat.until) return undefined
  else return new Date(this.repeat.until);
};

Event.prototype.setRepeatUntil = function(date) {

  if (!this.repeat) return false;

  if (+date) this.repeat.until = +date;
  else delete this.repeat.until;

  return true;

};

Event.prototype.getAbout = function(date) {
  return this.about.replace("%EY%", new Date(date - this.date).getFullYear());

};

Event.prototype.getOccures = function(startDate, endDate, n = Infinity) {

  if (!this.repeat || this.repeat.type === undefined) {
    if (this.date + (this.duration || 0) >= +startDate && this.date <= +endDate) {
      return n === n ? [this.date] : true;
    } else return n === n ? [] : false
  }

  if(this.repeat.until) {
    if (this.repeat.until < +startDate)
      return n === n ? [] : false;

    endDate = Math.min(endDate, this.repeat.until);
  }

  startDate = new Date(startDate);

  const TICKS_IN_DAY = 8.67e7;
  let occured = false;
  let r = [];
  switch (this.repeat.type) {
    case REPEAT_DAILY:
    {
      // set to the first occurrence
      const riv = this.getRepeatInterval();
      if(this.date >= startDate) {
        startDate = new Date(this.date);
      } else {
        let elapsedDays = Math.floor(+startDate / TICKS_IN_DAY) - Math.floor(this.date / TICKS_IN_DAY);
        startDate.addDays(elapsedDays % riv);
      }

      for(;startDate < endDate;startDate.addDays(riv)) {
        if(!(--n >= 0)) {
          occured = true;
          break;
        }

        r.push(+startDate);

      }

    }
      break;
    case REPEAT_WEEKLY:

      if(this.date >= startDate) {
        startDate = new Date(this.date);
      } else {
        //startDate = new Date(this.date);
        // TODO
      }

      startDate = startDate.getFirstDayOfWeek().addDays(-1);

      const rd = this.getRepeatDays(), rid = this.getRepeatInterval() * 7;

      weekLoop: for(;startDate < endDate;startDate.addDays(rid)) {

        for(let i = 0;i < 7;++i) {
          if(!(rd & (1 << i))) continue;

          const currDate = +startDate + i * TICKS_IN_DAY;
          if(currDate > endDate) break weekLoop;

          if(!(--n >= 0)) {
            occured = true;
            break;
          }

          r.push(currDate);

        }

      }

      break;
    case REPEAT_MONTHLY:
// TODO
      break;
    case REPEAT_YEARLY:
// TODO
      break;
  }

  return n === n ? r : occured;

};

if (typeof module !== "undefined") module.exports = Event;

/* vim:set ts=2 sw=2 et: */
