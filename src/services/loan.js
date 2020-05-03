import axios from 'axios';
import routes from './routes';
import config from './config';

export const addLoanRequest = (id_stuffier, id_stuff, id_friend) => (
  axios.post(routes.loan.request(), { id_stuffier, id_friend, id_stuff }, { headers: config.headers })
);

export const getLoanRequests = id_stuffier => (
  axios.get(routes.loan.list(id_stuffier), { headers: config.headers })
);

export const deleteLoanRequest = _id => (
  axios.delete(routes.loan.deleteRequest(_id), { headers: config.headers })
);
