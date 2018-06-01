// Uses CommonJS, AMD or browser globals

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function (root, jQuery) {
            if (jQuery === undefined) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if (typeof window !== 'undefined') {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {

    function selectorSearch($el, config) {
        var path = [];
        var depth = 0;
        var $curEl = $el;
        var $parent = null;
        var index = 0;
        var classes = null;
        var id = null;
        var childSelector = null;
        var earlyExit = false;
        while($curEl && !$curEl.is($(config.baseElement)) && depth <= config.searchDepth && !earlyExit) {

            /////////////////////////////////////////////////////////////////////////////
            // -- Discovery phase

            // get element parent to figure out simplest css selector
            $parent = $curEl.parent();

            // 1) element name
            name = $curEl.get(0).nodeName.toLowerCase();

            // 2) sibling position
            index = $parent.children(name).index($curEl) + 1;

            // 3) id
            id = $curEl.attr('id');

            // remove blacklisted ids
            if ( config.idBlacklist !== undefined && 
                config.idBlacklist.length > 0 && 
                config.idBlacklist.indexOf(id) > -1 ) {
                id = null;
            }

            // 4) classes
            if ( config.useClasses ) {
                if ( $curEl.get(0).classList !== undefined ) {
                    classes = Array.from($curEl.get(0).classList);
                } else {
                    classes = $curEl.attr('class').replace(/\s+|\t+|((\s|\t)*(\n\r*|\r\n*)(\s|\t)*)+/gm, ' ').split(' ');
                }
            
                
                if ( classes && config.classImportanceOrder !== undefined ) {
                    if ( typeof config.classImportanceOrder == 'function' ) {
                        classes.sort(config.classImportanceOrder);
                    } else if(config.classImportanceOrder.length > 0) {
                        classes.sort(function(a, b) {
                            // the idea here is to sort by the classImportanceOrder array so that we can
                            // order classes based on what the client thinks are the most important
                            // classes to target first.
                            // If a class isn't on the list, then we just use their found location on the
                            // class attribute + 1000 padding so we can prioritize our importance order
                            var idxA = config.classImportanceOrder.indexOf(a);
                            var idxB = config.classImportanceOrder.indexOf(b);
                            if ( idxA < 0 ) {
                                idxA = 1000 + classes.indexOf(a);
                            }
                            if ( idxB < 0 ) {
                                idxB = 1000 + classes.indexOf(b);
                            }
                            return idxA - idxB;
                        })
                    }
                }
            

                // remove blacklisted classes
                if ( config.classBlacklist !== undefined && config.classBlacklist.length > 0 ) {
                    $.each(config.classBlacklist, function(i,v) {
                        var idx = classes.indexOf(v);
                        if ( idx > -1 ) {
                            classes.splice(idx, 1);
                        }
                    })
                }
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////
            // -- path building phase -- lets prioritize selector order from most accurate to least accurate

            // check for id first so we may stop here
            if ( id ) {
                path.unshift('#'+id);
                //path.unshift('>');
                earlyExit = true; // we are done
            } else {
                // check if we can match classes uniquely
                var useClasses = false;

                if ( config.useClasses && classes.length > 0  ) {
                    // lets figure out if we have multiple matches per class, and drop those
                    var firstUniqueMatch = null;
                    for(var i=0; i < classes.length; i++) {
                        var c = classes[i];
                        if ( $parent.find('> .' + c).length == 1 ) {
                            firstUniqueMatch = c;
                            break;
                        }
                    }

                    if ( firstUniqueMatch ) {
                        path.unshift('.' + firstUniqueMatch);
                        path.unshift('>');
                        useClasses = true;  // we have a unique class match, use this
                    }
                }
                
                if ( !useClasses ) { // if not using classes, target by child type and index
                    if ( $parent.children().length == 1 ) {
                        path.unshift(name)
                        path.unshift('>');
                    } else {
                        path.unshift(name + ':nth-of-type(' + index + ')');
                        path.unshift('>');
                    }
                }
            }

            if ( config.testSelector ) {
                var selector = path.join(" ");
                var $test = $parent.find(selector);
                console.log("TEST: ", config.baseElement + " " + selector, " Match? ", $test.is($curEl));
            }

            $curEl = $parent;
            depth++;

        }

        return config.baseElement + ' ' + path.join(' ');
    }

    /* SelectorFinder plugin */
    $.fn.selectorFinder = function() {

        var config = $.extend({
            classBlacklist: [],
            idBlacklist: [],
            baseElement: 'body',
            searchDepth: 100,
            useClasses: false,
            testSelector: false,
            classImportanceOrder: []
        }, arguments[0]);

        var result = [];

        $(this).each(function() {
            result.push({
                $el: $(this),
                selector: selectorSearch($(this), config)
            });
        })

        return result;
    };

}));