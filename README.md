# seven-boom
A decorator around [Boom](https://github.com/hapijs/boom) (HTTP-friendly error objects) to empower it

## Why do I need this?
The reason beyond this library is to have more cusomize errors.
Boom provide very cool interface and function to create new errors, yet most of the errors are only get message(String) and data(Object) as arguments.
Then boom will add some other cool keys to the error object like isServer, isBoom and so on.

In a lot of apps the errors contain more data on the root level. some common examples are:
* guid of the error (as id in database or for better look for it in the db / log)
* a name / code of the error (usually for client usage, because checking the error type by the message is very wrong)
* timeThrown for analytical purposes

## What do i get with this library?
SevenBoom give you an ability to init the SevenBoom object with your desired error format. 
* You can add new root fields which from now will be an args for any of your error.
* You can add functions which will called any time your create new error (pass a guid generator / or time (now) generator is great example for this feature.

## What include out of the box?
* A guid generator (by uuid.v4) which will add guid field for any of your errors
* timeThrown generator (date.isoString) which will add timeThrown for any of your errors

## Boom compatability
In order to make the transition from Boom easiear, the SevenBoom args will be in the same order as the default Boom args. 
So you can simply replace all of your Boom.XXX with SevenBoom.XXX and everything should work just fine.
Then you can start change your usage every place you want (if you added more args).

## How does it work?
Under the hood, SevenBoom is preety simple, it just going over all Boom function and wrap them with new functions with the same name.
Then when you call the SevenBoom function it will internally call Boom then add your new args, and run your functions
