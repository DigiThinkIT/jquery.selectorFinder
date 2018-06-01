# A jquery based selector path finder

This small lib aims to implement a jquery based css selector path solver.

This lib supports the following features:

- Find selectors based on nth-of-type selectors (excluding classes)
- Find selectors based on classes and nth-of-type selectors
- Blacklisting classes
- Blacklisting Ids
- Prioritizing classes over others when building unique selectors
- AMD and CommonJS style importing(for server side use and testing)
- Includes tests based on mocha + jsdom 

## Usage

Given the following html:

```html
<body>
  <div></div>
  <div></div>
  <div class="outter">
    <div class="inner">
      <div class="content">Target Element</div>
    </div>
  </div>
</body>
```

You can find the selector of an element either through a click or element referecen as follows:

```javascript
var myElement = $('body > div:last > div > div');
var result = myElement.selectorFinder();

//or through a click, assuming you click on the above element
$('body').click(function(e) {
    var result = $(e.target).selectorFinder()    
})
```

Result:

```json
[{
    "$el": <element reference>,
    "selector": "body > div:nth-of-type(3) > div div"
}]
```

Similarly, if you enable class usage:

```javascript
var myElement = $('body > div:last > div > div');
var result = myElement.selectorFinder({
    useClasses: true
})
```

Result:

```json
[{
    "$el": <element reference>,
    "selector": "body > .outter > .inner > .content"
}]
```

## Options

 - classBlacklist: Array of classes to ignore while building path.
 - idBlacklist: Array of ids to ignore while building path.
 - baseElement: String of the base element, defaults to 'body'.
 - searchDepth: The number of elements to iterate through before giving up. Usefull to avoid really deep selectors.
 - useClasses: Set to true to use classes when building paths. Defaults to false.
 - testSelector: debug option, prints selector per element as its beeing built.
 - classImportanceOrder: An array of classes to priorityze when building path.

 ## Result

 The plugin will return an array of elements found + selectors so that you can query multiple elements in one call.
 The result array is of the form:

 ```json
[{
    "$el": <jquery element reference>,
    "selector": <string selector>
}, ...]
 ```

# Development

To setup your dev environment:

```bash
yarn install
```

To run tests:

```bash
yarn test
```
