import { makeStandardActionCreator } from '../action-helpers';
import { EXCHANGES_FETCHED, EXCHANGE_REQUESTED } from './constants';
import { addExchangeRequest, getExchangeRequests } from '../../services/exchange';

const requestExchange = makeStandardActionCreator(EXCHANGE_REQUESTED);
export const exchangeRequest = (idOwner, idStuff, idRequestor, idRequestorStuff) => dispatch => {
  return addExchangeRequest(idOwner, idStuff, idRequestor, idRequestorStuff)
  .then(res => {
    dispatch(requestExchange(res.data, idOwner));
    Promise.resolve(res.data);
  })
  .catch(error => Promise.reject(error));
}

const requestExchanges = makeStandardActionCreator(EXCHANGES_FETCHED);
export const fetchExchangeRequests = userId => dispatch => {
  return getExchangeRequests(userId)
  .then(res => {
    dispatch(requestExchanges(res.data, userId));
    Promise.resolve(res.data);
  })
  .catch(error => Promise.reject(error));
}
