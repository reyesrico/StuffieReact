// Review https://stackoverflow.com/questions/46577130/implementing-promise-class-in-javascript
class PromiseT { 
	constructor(f) {
    let _this = this;

    let res = function resolve(resolveValue) {
      _this.value = resolveValue;
    };

    let rej = function reject(rejectValue) {
      _this.value = rejectValue;
    };

     f(res, rej);
	}
  
  then(tFunc) {
		return new PromiseT((res, rej) => tFunc(this.value));
  }
  
  catch(cFunc) {
    cFunc(this.value);
  }
  
  executeCallbacks() {
  	let _this3 = this;
    console.log('executeCB');
    this.callbacks.forEach(callBack => callBack(_this3.value));
  }
}

// eslint-disable-next-line no-native-reassign
export default test = () => {
  let p = new PromiseT((x, y) => x('hi'));
  p.then(res => console.log(res));   
};

const p = new Promise((res, rej) => res(true));

p.then(res => console)
