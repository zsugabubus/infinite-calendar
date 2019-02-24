'use strict';

Date.prototype.getUTCDaysInMonth = function() {
  return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth() + 1, 0)).getUTCDate();
};

Date.prototype.getFirstDayOfMonth = function() {
  return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), 1));
};

Date.prototype.getFirstDayOfNextMonth = function() {
  return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth() + 1, 1));
};

Date.prototype.getLastDayOfMonth = function() {
  return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth() + 1, 0));
};

Date.prototype.getFirstDayOfWeek = function() {
  const _this = new Date(this);
  const day = this.getUTCDay();
  _this.setUTCDate(this.getUTCDate() - day + (day === 0 ? -6 : 1));
  return _this;
};


Date.prototype.getLastDayOfWeek = function() {
  const _this = new Date(this);
  const day = this.getUTCDay();
  _this.setUTCDate(this.getUTCDate() - day + (day === 0 ? 0 : 7));
  return _this;
};

Date.prototype.clone = function() {
  return new Date(this);
};

Date.prototype.addDays = function (n = 1) {
  this.setUTCDate(this.getUTCDate() + n);
  return this;
};

Date.prototype.addMonths = function (n = 1) {
  this.setUTCMonth(this.getUTCMonth() + n);
  return this;
};

Date.localNowAsUTC = function() {
  const date = new Date();
  date.setTime(date.getTime() - date.getTimezoneOffset() * 6e4);
  return date;
};

Date.prototype.getFullDays = function() {
  return Math.floor(this.getUTCMilliseconds() / 8.67e5)
};

Date.prototype.isLeapYear = function() {
  const y = this.getUTCFullYear();
  return (!(y & 0xf) && (y % 100)) || !(y % 400);
};

Date.prototype.isSameDateUTC = function (other) {
  return this.getUTCDate() == other.getUTCDate() &&
    this.getUTCMonth() == other.getUTCMonth() &&
    this.getUTCFullYear() == other.getUTCFullYear();
};

Date.prototype.isSameDate = function (other) {
  return this.getUTCDate() == other.getDate() &&
    this.getUTCMonth() == other.getMonth() &&
    this.getUTCFullYear() == other.getFullYear();
};

Date.prototype.isSameMonth = function (other) {
  return this.getUTCMonth() == other.getUTCMonth() &&
    this.getUTCFullYear() == other.getUTCFullYear();
};

Date.prototype.getDayOfYear = function() {
  return Math.floor((this - new Date(this.getFullYear(), 0, 0)) / 8.64e7);
};

/* http://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php */
Date.prototype.getWeekNumber = function() {
  const d = new Date(+this);
  d.setHours(0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};

Date.prototype.getElapsedDays = function (other) {
  const a = new Date(other);
  a.setUTCHours(0, 0, 0, 0);
  const b = new Date(this);
  b.setUTCHours(0, 0, 0, 0);

  return Math.round((+a - +b) / 8.64e7);
};

Date.prototype.compare = function (other) {
  return +this - +other;
};

Date.prototype.compareDate = function (other) {
  return this.getUTCMonth() - other.getMonth() || this.getUTCDate() - other.getUTCDate();
};

/* vim:set ts=2 sw=2 et: */
