import { makeStandardActionCreator } from '../action-helpers';
import { LOANS_FETCHED, LOAN_REQUESTED, LOAN_DELETED } from './constants';
import { addLoanRequest, getLoanRequests, deleteLoanRequest } from '../../services/loan';
import { WarningMessageType } from '../../components/shared/types';

const requestLoan = makeStandardActionCreator(LOAN_REQUESTED);
export const loanRequest = (idOwner, idStuff, idRequestor) => dispatch => {
  return addLoanRequest(idOwner, idStuff, idRequestor)
  .then(res => {
    dispatch(requestLoan(res.data, idOwner));
    Promise.resolve(res.data);
  })
  .catch(error => Promise.reject(error));
}

export const loanRequestHook = (idOwner, idStuff, idRequestor, setMessage, setType) => dispatch => {
  return addLoanRequest(idOwner, idStuff, idRequestor)
  .then(res => {
    dispatch(requestLoan(res.data, idOwner));
    setMessage('Loan request successfully');
    setType(WarningMessageType.SUCCESSFUL);
  })
  .catch(() => {
    setMessage('Loan request failed');
    setType(WarningMessageType.FAILURE);
  });
}


const fetchLoans = makeStandardActionCreator(LOANS_FETCHED);
export const fetchLoanRequests = userId => dispatch => {
  return getLoanRequests(userId)
  .then(res => {
    dispatch(fetchLoans(res.data, userId));
    Promise.resolve(res.data);
  })
  .catch(error => Promise.reject(error));
}

const requestDeleteLoan = makeStandardActionCreator(LOAN_DELETED);
export const deleteRequestLoan = _id => dispatch => {
  return deleteLoanRequest(_id)
  .then(res => {
    const result = res.data.result[0];
    dispatch(requestDeleteLoan(result))
    Promise.resolve(result);
  })
  .catch(error => Promise.reject(error));
}
