import Rx from 'rx';
import jQuery from 'jquery';

let refreshButton = document.querySelector('.refresh');
let closeButton1 = document.querySelector('.close1');
let closeButton2 = document.querySelector('.close2');
let closeButton3 = document.querySelector('.close3');

let refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');
let close1ClickStream = Rx.Observable.fromEvent(closeButton1, 'click');
let close2ClickStream = Rx.Observable.fromEvent(closeButton2, 'click');
let close3ClickStream = Rx.Observable.fromEvent(closeButton3, 'click');

let startupRequestStream = Rx.Observable.just('https://api.github.com/users');

let requestOnStartupStream = refreshClickStream
    .map(ev => {
        let randomOffset = Math.floor(Math.random() * 500);
        return 'https://api.github.com/users?since=' + randomOffset;
    });

let responseStream = requestOnStartupStream
    .merge(startupRequestStream)
    .flatMap(requestUrl => Rx.Observable.fromPromise(jQuery.getJSON(requestUrl)))
    .shareReplay(1);

function getRandomUser(listUser) {
    return listUser[Math.floor(Math.random() * listUser.length)];
}

function createSuggestionStream(responseStream, closeClickStream) {
    return responseStream.map(listUser =>
            listUser[Math.floor(Math.random() * listUser.length)]
    )
        .startWith(null)
        .merge(refreshClickStream.map(ev => null))
        .merge(closeClickStream.withLatestFrom(responseStream, (x, R) => getRandomUser(R)));
}

function renderSuggestion(suggestedUser, selector) {
    var el = document.querySelector(selector);
    var usernameEl = el.querySelector('.username');
    var imgEl = el.querySelector('img');

    if (suggestedUser === null) {
        el.style.visibility = 'hidden';
    } else {
        el.style.visibility = 'visible';
        usernameEl.href = suggestedUser.html_url;
        usernameEl.textContent = suggestedUser.login;
        imgEl.src = '';
        imgEl.src = suggestedUser.avatar_url;
    }
}

var suggestion1Stream = createSuggestionStream(responseStream, close1ClickStream);
var suggestion2Stream = createSuggestionStream(responseStream, close2ClickStream);
var suggestion3Stream = createSuggestionStream(responseStream, close3ClickStream);

suggestion1Stream.subscribe(user => {
    renderSuggestion(user, '.user1');
});

suggestion2Stream.subscribe(user => {
    renderSuggestion(user, '.user2');
});

suggestion3Stream.subscribe(user => {
    renderSuggestion(user, '.user3');
});