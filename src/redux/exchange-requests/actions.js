import { makeStandardActionCreator } from '../action-helpers';
import { EXCHANGES_FETCHED, EXCHANGE_REQUESTED, EXCHANGE_DELETED } from './constants';
import { addExchangeRequest, getExchangeRequests, deleteExchangeRequest } from '../../services/exchange';

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

const requestDelete = makeStandardActionCreator(EXCHANGE_DELETED);
export const deleteRequest = _id => dispatch => {
  return deleteExchangeRequest(_id)
  .then(res => {
    const result = res.data.result[0];
    dispatch(requestDelete(result))
    Promise.resolve(result);
  })
  .catch(error => Promise.reject(error));
}
