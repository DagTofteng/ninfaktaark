require([
    "dojo/topic",
    "js/dojoconfig"
],
    function (
        topic,
        appconfig
    ) {
        ko = window.ko;

        ko.bindingHandlers.init = {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var callback = valueAccessor();
                if (callback) {
                    callback.call(viewModel, element);
                }
            }
        };

        ko.bindingHandlers.enterkey = {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var callback = valueAccessor();
                $(element).keypress(function (event) {
                    var keyCode = (event.which ? event.which : event.keyCode);
                    if (keyCode === 13) {
                        callback.call(viewModel);
                        return false;
                    }
                    return true;
                });
            }
        };

        ko.bindingHandlers.select2 = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var options = ko.unwrap(valueAccessor());
                ko.unwrap(allBindings.get('selectedOptions'));

                $(element).select2(options);
                console.log('init');
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var options = ko.unwrap(valueAccessor());
                ko.unwrap(allBindings.get('selectedOptions'));

                $(element).select2(options);
                console.log('update');
            }
        };

        ko.bindingHandlers.preventBubble = {
            init: function (element, valueAccessor) {
                var eventName = ko.utils.unwrapObservable(valueAccessor());
                ko.utils.registerEventHandler(element, eventName, function (event) {
                    event.cancelBubble = true;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    }
                });
            }
        };

        ko.bindingHandlers.clickAndStop = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
                var handler = ko.utils.unwrapObservable(valueAccessor()),
                    newValueAccessor = function () {
                        return function (data, event) {
                            handler.call(viewModel, data, event);
                            event.cancelBubble = true;
                            if (event.stopPropagation) event.stopPropagation();
                        };
                    };

                ko.bindingHandlers.click.init(element, newValueAccessor, allBindingsAccessor, viewModel, context);
            }
        };

        ko.extenders.sort = function (target, dir) {
            function sortFunction(a, b) {
                var result = a > b ? 1 : -1;
                return dir === "desc" ? -result : result;
            }

            target.subscribe(function (newValue) {
                if (newValue) {
                    newValue.sort(sortFunction);
                }
            });

            return target;
        };

        ko.subscribable.fn.subscribeChanged = function (callback) {
            var oldValue;
            this.subscribe(function (_oldValue) {
                oldValue = _oldValue;
            }, this, 'beforeChange');

            this.subscribe(function (newValue) {
                callback(newValue, oldValue);
            });
        };


        String.prototype.toFloatFromStringWithComma = function () {
            return parseFloat(this.replace(/,(\d+)$/, '.$1'));
        };

        //usage
        //'7,75'.toFloat()

        ko.components.register("maincontent", { require: "js/maincontent" });

        //Felleskomponenter "common"        
        //ko.components.register("util", { require: "components/common/util/util" });            
        //ko.components.register("alertbox", { require: "components/common/alertbox/alertbox" });


        ko.applyBindings();


        topic.subscribe("setPageHeight", function () {
            //util.setPageHeight();
        });

        ////Hente alle kodene ved oppstart
        //appconfig.kodeverk.init(); //(appconfig.env.path.webAPIurl);


    });