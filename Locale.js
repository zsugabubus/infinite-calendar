const DICT = {
  'hu': {
    'firstDayOfWeek': 1,
    'days': ["Vasárnap", "Héftő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"],
    'months': ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"],
    'next-year-prefix': 'Jövő ',
    'prev-year-prefix': 'Tavaly '
  },
  'en': {
    'firstDayOfWeek': 0,
    'days': ["Sunday", "Monday", "Thursday", "Wednesday", "Tuesday", "Friday", "Saturday"],
    'months': ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    'next-year-prefix': 'Next ',
    'prev-year-prefix': 'Prev '
  }
};

const userLang = navigator.language || navigator.userLanguage;
const T = DICT[userLang] || DICT[userLang.split('-')[0]] || DICT['en'];

/* vim:set ts=2 sw=2 et: */
