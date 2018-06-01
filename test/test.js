const fs = require('fs');
const path = require('path');
const assert = require('assert');

const testHTML = fs.readFileSync(path.join(__dirname, 'test.html')).toString();

const { JSDOM } = require('jsdom');
const jsdom = new JSDOM(testHTML);

const { window } = jsdom;
const { document } = window;
global.window = window;
global.document = document;

const $ = global.jQuery = require('jquery');
require('../jquery.selectorFinder.js')(window, $);

describe('Default Base Element(body)', function () {
    it('Selector should return body > div:nth-of-type(1)', function () {
        var selector = $('body > div:first').selectorFinder();
        assert.equal(selector[0].selector, 'body > div:nth-of-type(1)');
        assert.equal($(selector[0].selector).length, 1);
    });
    
    it('Selector should return body > div:nth-of-type(2) > div', function () {
        var selector = $('body > div:nth-of-type(2) > div:first').selectorFinder();
        assert.equal(selector[0].selector, 'body > div:nth-of-type(2) > div');
        assert.equal($(selector[0].selector).length, 1);
    });
    
    it('Selector should return body > div:nth-of-type(3)', function () {
        var selector = $('body > div:nth-of-type(3)').selectorFinder();
        assert.equal(selector[0].selector, 'body > div:nth-of-type(3)');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('Selector should return body #test4', function () {
        var selector = $('#test4').selectorFinder();
        assert.equal(selector[0].selector, 'body #test4');
        assert.equal($(selector[0].selector).length, 1);
    });

});

describe('Custom Base Element', function () {
    it('Selector should return #test5 > div', function () {
        var selector = $('#test5 > div').selectorFinder({
            baseElement: '#test5'
        });
        assert.equal(selector[0].selector, '#test5 > div');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('Selector should return #test6 > div:nth-of-type(3)', function () {
        var selector = $('#test6 > div:nth-of-type(3)').selectorFinder({
            baseElement: '#test6'
        });
        assert.equal(selector[0].selector, '#test6 > div:nth-of-type(3)');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('Selector should return #test7 #test7-inner', function () {
        var selector = $('#test7-inner').selectorFinder({
            baseElement: '#test7'
        });
        assert.equal(selector[0].selector, '#test7 #test7-inner');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('Selector should return #test8 > div > div > div > ul > li:nth-of-type(20) > a > div:nth-of-type(2)', function () {
        var selector = $('#test8 > div > div > div > ul > li:nth-of-type(20) > a > div:nth-of-type(2)').selectorFinder({
            baseElement: '#test8'
        });
        assert.equal(selector[0].selector, '#test8 > div > div > div > ul > li:nth-of-type(20) > a > div:nth-of-type(2)');
        assert.equal($(selector[0].selector).length, 1);
    });
});

describe('Class selector tests', function() {
    it('Selector should return body > .test9 | Imediate child test', function () {
        var selector = $('body > .test9').selectorFinder({
            useClasses: true
        });
        assert.equal(selector[0].selector, 'body > .test9');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('Selector should return body > .test10 > .inner | depth 2 test', function () {
        var selector = $('body > .test10 > .inner').selectorFinder({
            useClasses: true
        });
        assert.equal(selector[0].selector, 'body > .test10 > .inner');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('Selector should return body > .test10-2 > .inner | Importance test', function () {
        var selector = $('body > .test10-2 > div').selectorFinder({
            useClasses: true,
            classImportanceOrder: ['inner', 'low-priority']
        });
        assert.equal(selector[0].selector, 'body > .test10-2 > .inner');
        assert.equal($(selector[0].selector).length, 1);
    });

});

describe('Blacklisting tests', function() {
    it('blacklist .ignore : Selector should return body > .test11 > div > .inner | single blacklist test', function () {
        var selector = $('body > .test11 > div > .inner').selectorFinder({
            useClasses: true,
            classBlacklist: ['ignore']
        });
        assert.equal(selector[0].selector, 'body > .test11 > div > .inner');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('blacklist .ignore, .ignore2 : Selector should return body > .test12 > .keep > .inner | multiple blacklist test', function () {
        var selector = $('body > .test12 > .keep > .inner').selectorFinder({
            useClasses: true,
            classBlacklist: ['ignore', 'ignore2']
        });
        assert.equal(selector[0].selector, 'body > .test12 > .keep > .inner');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('blacklist .ignore, .ignore2 : Selector should return body > .test13 > div:nth-of-type(2) > .inner | multiple blacklist and multiple class match test', function () {
        var selector = $('body > .test13 > div:nth-of-type(2) > .inner').selectorFinder({
            useClasses: true,
            classBlacklist: ['ignore', 'ignore2']
        });
        assert.equal(selector[0].selector, 'body > .test13 > div:nth-of-type(2) > .inner');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('blacklist #ignore-test14 : Selector should return body > .test14 > div > .inner | id blacklist test with class support', function () {
        var selector = $('body > .test14 > div > .inner').selectorFinder({
            useClasses: true,
            idBlacklist: ['ignore-test14']
        });
        assert.equal(selector[0].selector, 'body > .test14 > div > .inner');
        assert.equal($(selector[0].selector).length, 1);
    });

    it('blacklist #ignore-test14 : Selector should return body > div:nth-of-type(15) > div > div | id blacklist test without class support', function () {
        var selector = $('body > div:nth-of-type(15) > div > .inner').selectorFinder({
            useClasses: false,
            idBlacklist: ['ignore-test14']
        });
        assert.equal(selector[0].selector, 'body > div:nth-of-type(15) > div > div');
        assert.equal($(selector[0].selector).length, 1);
    });
});