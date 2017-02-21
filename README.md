# seven-boom
A decorator around [Boom](https://github.com/hapijs/boom) (HTTP-friendly error objects) to empower it

This library is fully tested with 100% coverage

[![CircleCI](https://circleci.com/gh/GiladShoham/seven-boom/tree/master.svg?style=svg&circle-token=56ee1bfc2964727d5d468cc2f2b2216054cee97f)](https://circleci.com/gh/GiladShoham/seven-boom/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/GiladShoham/seven-boom/badge.svg)](https://coveralls.io/github/GiladShoham/seven-boom)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CYFBUDM226DLS&lc=IL&item_name=seven%2dboom&item_number=github%2dnpm&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)
<!-- toc -->

- [seven-boom](#seven-boom)
  * [Why do I need this?](#why-do-i-need-this)
  * [What do i get with this library?](#what-do-i-get-with-this-library)
  * [What include out of the box?](#what-include-out-of-the-box)
  * [Boom compatability](#boom-compatability)
  * [How does it work?](#how-does-it-work)
  * [Configure](#configure)
  * [Usage](#usage)
    + [Before](#before)
      - [Code](#code)
      - [Error result:](#error-result)
    + [After](#after)
      - [Code](#code-1)
      - [Error result:](#error-result-1)
  * [Real example](#real-example)
  * [Source of the name](#source-of-the-name)
  * [License](#license)
  * [Contribute](#contribute)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>
<!-- tocstop -->

## Why do I need this
The reason beyond this library is to have more cusomize errors.
Boom provide very cool interface and functions to create new errors, yet most of the errors are only get message(String) and data(Object) as arguments.
Then boom will add some more keys to the error object like isServer, isBoom and so on.
Most of the hard work are done by Boom guys, so they should get a proper credit.

In a lot of apps the errors contain more data on the root level. some common examples are:
* guid of the error (as id in database or for better look for it in the db / log)
* a name / code of the error (usually for client usage, because checking the error type by the message is very wrong)
* timeThrown for analytical purposes

## What do i get with this library
SevenBoom give you an ability to init the SevenBoom object with your desired error format.
* You can add new root fields which from now will be an args for any of your error.
* You can add functions which will called any time you create new error (pass a guid generator / or time (now) generator is great example for this feature.

## What include out of the box
* A guid generator (by uuid.v4) which will add guid field for any of your errors
* timeThrown generator (date.isoString) which will add timeThrown for any of your errors

## Boom compatability
In order to make the transition from Boom easier, the SevenBoom args will be in the same order as the default Boom args.
So you can simply replace all of your Boom.XXX with SevenBoom.XXX and everything should work just fine.
Then you can start change your usage every place you want (if you added more args).

## How does it work
Under the hood, SevenBoom is pretty simple, it just going over all Boom function and wrap them with new functions with the same name.
Then when you call the SevenBoom function it will internally call Boom then add your new args, and run your functions

## Configure
you should import the SevenBoom class by
```js
import SevenBoom from 'seven-boom';
```
Then you should create an args definitions array:
```js
const argsDefs = [
  {
    name : 'errorName',
    order: 1
  }, {
    name : 'timeThrown',
    order: 2,
    default: null
  }, {
    name : 'guid',
    order: 3,
    default: null
  }
];
```
finally you should call init
```js
SevenBoom.init(argsDefs);
```

Arg definition contains the following keys:
* name - the name will be the key inside the result.output.payload
* order - the order of the arg in the new function (i just sort by this order before pass the args on, so you can make skip for example order 1 then order 5 then order 10)
* default - default can be either a value like 'myDefaultVal' or a function which return a value for example
```js
function _defaultTimeThrown() {
  return (new Date()).toISOString();
}
```
The default will be used only in case you didn't pass an actual value. so you can always override it when calling the function.
If you want to use the default value for an arg which is not the last one you can just pass undefined and the default will be used.

There is special case for the timeThrown and guid defaults.
If you specify them as an args with a falsy default (null, undefined etc), it will create a default default uses those functions:
```js
function _defaultTimeThrown() {
  return (new Date()).toISOString();
}

function _defaultGenerateGuid() {
  return uuid.v4();
}
```
If you don't specify them as an args at all they won't be used.

## Usage
You should start by reading Boom docs, it's very easy and intuitive.
For more examples you can just look on the sevenBoom.spec.js file.

### Before
#### Code
```js
function getUserById(userId) {
 const errorMessage = `User with id: ${userId} not found`;
 const errorData = { userId };
 throw Boom.notFound(errorMessage, errorData);
}
```
#### Error result
```js
{
  isBoom: true,
  isServer: false,
  message: 'User with id: 123 not found.',
  data: {userId: '123'},
  output: {
    statusCode: '404',
    payload: {
      statusCode: '404',
      error: 'Not Found',
      message: 'User with id: 123 not found.',
      data: {userId: '123'}
    }
  }
}
```

### After
#### Code
```js
import SevenBoom from 'seven-boom';
const argsDefs = [
  {
    name : 'errorName',
    order: 1
  }, {
    name : 'timeThrown',
    order: 2,
    default: null
  }, {
    name : 'guid',
    order: 3,
    default: null
  }
];
SevenBoom.init(argsDefs);

function getUserById(userId) {
 const errorMessage = `User with id: ${userId} not found`;
 const errorData = { userId };
 const errorName = 'USER_NOT_FOUND';
 throw SevenBoom.notFound(errorMessage, errorData, errorName);
 }
```
#### Error result
```js
{
  isBoom: true,
  isServer: false,
  message: 'User with id: 123 not found.',
  data: {userId: '123'},
  output: {
    statusCode: '404',
    payload: {
      statusCode: '404',
      error: 'Not Found',
      message: 'User with id: 123 not found.',
      errorName: 'USER_NOT_FOUND',
      timeThrown: "2017-01-16T21:25:58.536Z",
      guid: 'b6c44655-0aae-486a-8d28-533db6c6c343',
      data: {userId: '123'}
    }
  }
}
```

## Real example
The best way to understand is always look on some real code.
Therefore you can take a look on [graphql-apollo-errors](https://github.com/GiladShoham/graphql-apollo-errors) which use SevenBoom internally to handle graphql / apollo errors in a better way.
Or you can look at the spec files.

## Source of the name
The name seven-boom is a wordplay - it's a combination of the boom (as the base library) and seven boom which is a simple game.
See more about seven-boom game [here](https://play.google.com/store/apps/details?id=com.krembo.seven)

## License
MIT - Do what ever you want

## Contribute
I'm open to hear any feedback - new ideas, bugs, needs.
Feel free to open issues / PR

## Support on Paypal
Hey dude! Help me out for a couple of :beers:!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CYFBUDM226DLS&lc=IL&item_name=seven%2dboom&item_number=github%2dnpm&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)
