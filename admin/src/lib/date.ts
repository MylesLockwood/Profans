import moment from 'moment';

export function formatDate(date: Date, format = 'DD/MM/YYYY') {
  return moment(date).format(format);
}

export function formatDateNoTime(date: Date, format = 'DD MMM YYYY') {
  return moment(date).format(format);
}
