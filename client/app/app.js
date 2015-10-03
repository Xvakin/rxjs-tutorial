import Rx from 'rx';
import jQuery from 'jquery';

let requestStream = Rx.Observable.just('https://api.github.com/users');

let responseStream = requestStream.flatMap(requestUrl =>
    Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
);

responseStream.subscribe(response => {
    console.log(response)
});

