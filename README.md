# seven-boom
A decorator around [Boom](https://github.com/hapijs/boom) (HTTP-friendly error objects) to empower it

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
  * [License](#license)
  * [Contribute](#contribute)


<!-- tocstop -->

## Why do I need this
The reason beyond this library is to have more cusomize errors.
Boom provide very cool interface and function to create new errors, yet most of the errors are only get message(String) and data(Object) as arguments.
Then boom will add some other cool keys to the error object like isServer, isBoom and so on.

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
In order to make the transition from Boom easiear, the SevenBoom args will be in the same order as the default Boom args. 
So you can simply replace all of your Boom.XXX with SevenBoom.XXX and everything should work just fine.
Then you can start change your usage every place you want (if you added more args).

## How does it work
Under the hood, SevenBoom is preety simple, it just going over all Boom function and wrap them with new functions with the same name.
Then when you call the SevenBoom function it will internally call Boom then add your new args, and run your functions

## Configure
Coming soon

## Usage
### Before
#### Code
```js
const errorMessage = `User with id: ${userId} not found`;
const errorData = { userId };
throw Boom.notFound(errorMessage, errorData);	
```
#### Error result
```js
{
  isBoom: true,
  isServer: false, 
  message: 'User with id: 123 not found.'
  output: {
    statusCode: '404'
    payload: {
      statusCode: '404'
      error: 'Not Found'
      message: 'User with id: 123 not found.'
    }
  }
}
```

### After
#### Code
```js
const errorMessage = `User with id: ${userId} not found`;
const errorData = { userId };
const errorName = 'USER_NOT_FOUND';
throw Boom.notFound(errorMessage, errorData, errorName);
```
#### Error result
```js
{
  isBoom: true,
  isServer: false, 
  message: 'User with id: 123 not found.'
  output: {
    statusCode: '404'
    payload: {
      statusCode: '404'
      error: 'Not Found'
      message: 'User with id: 123 not found.'
      code: 'USER_NOT_FOUND'
      timeThrown: "2017-01-16T21:25:58.536Z"
      guid: 'b6c44655-0aae-486a-8d28-533db6c6c343'
    }
  }
}
```

## Real example
The best way to understand is always look on some real code.
Therefore you can take a look on [graphql-apollo-errors](https://github.com/GiladShoham/graphql-apollo-errors) which use SevenBoom internally to handle graphql / apollo errors in a better way.

## License
MIT - Do what ever you want

## Contribute
I'm open to hear any feedback - new ideas, bugs, needs.
Feel free to open issues / PR
