angular.module('ngStorekit', [])

/* global storekit */

/**
 * 'storekit' is a global variable provided by the cordova plugin https://github.com/j3k0/PhoneGap-InAppPurchase-iOS
 * for installation instructions see https://github.com/j3k0/PhoneGap-InAppPurchase-iOS/blob/master/README.md
 */

.factory('$storekit', function($q) {

    /**
     * @var {Array}
     */
    var _productIds = [];

    /**
     * @var {Array}
     */
    var _products = [];

    /**
     * @var {Bool}
     */
    var _debug = true;

    /**
     * @var {Object}
     */
    var _storekit;

    /**
     * @var {Object}
     */
    var fakeStorekit = {};

    /**
     * @var {Object}
     */
    var $storekit = {};

    /**
     *
     */
    var _onPurchase;

    /**
     *
     */
    var _onRestore;

    /**
     *
     */
    var _onError;

    /**
     *
     * @param {String} productId
     */
    fakeStorekit.purchase = function (productId) {
        window.setTimeout(function () {
            _onPurchase('', productId, '');
        }, 300);
    };

    /**
     *
     */
    fakeStorekit.restore = function () {
        _productIds.forEach(function (el) {
            _onRestore('', el, '');
        });
    };

    /**
     * 
     * @param {Bool}
     * @return {Object}
     */
    $storekit.setLogging = function (debug) {
        _debug = debug;
        return this;
    };

    /**
     *
     * @param {String} productId
     */
    $storekit.purchase = function (productId) {
        _storekit.purchase(productId);
    };

    /**
     *
     */
    $storekit.restore = function () {
        _storekit.restore();
    };

    /**
     * @return {Promise}
     */
    $storekit.watchPurchases = function () {
        var deferred = $q.defer();
        var purchase = {};
        _onRestore = function (transactionId, productId, transactionReceipt) {
            purchase = {
                transactionId      : transactionId,
                productId          : productId,
                transactionReceipt : transactionReceipt,
                type               : 'restore'
            };
            deferred.notify(purchase);
        };
        _onPurchase = function (transactionId, productId, transactionReceipt) {
            purchase = {
                transactionId      : transactionId,
                productId          : productId,
                transactionReceipt : transactionReceipt,
                type               : 'purchase'
            };
            deferred.notify(purchase);
        };
        /**
         * List of error codes:
         * https://github.com/j3k0/PhoneGap-InAppPurchase-iOS/blob/master/README.md#documentation
         */
        _onError = function (errorCode, errorMessage) {
            deferred.reject('Error ' + errorCode + ':' + errorMessage);
        };
        return deferred.promise;
    };

    /**
     *
     * @return {Array}
     */
    $storekit.getProducts = function () {
        // TODO: make sure webkit and the products already loaded
        return _products;
    };

    /**
     * @param {Array}
     */
    $storekit.load = function (productIds) {
        // check platform and exit if not iOS
        var isEmulator = false;
        if (window.device && !device.model.match(/(iPhone|iPod)/)) {
            isEmulator = true;
        }
        _productIds = productIds;
        var deferred = $q.defer();
        if (!window.storekit || isEmulator) {
            if (_debug) {
                console.log("In-App Purchases not available - Using a fake object to emulate in app purchases");
                products = [];
                _productIds.forEach(function (el) {
                    products.push({id : el, price : '$999'});
                });
                _storekit = fakeStorekit;
                _products = products;
                deferred.resolve(products);
            } else {
                deferred.reject('In-App Purchases not available');
            }
        } else {
            storekit.init({
                debug : _debug, // Enable IAP messages on the console
                ready : function () {
                    storekit.load(_productIds, function (products, invalidIds) {
                        _products = products;
                        if (invalidIds.length && _debug) {
                            for (var i = 0; i < invalidIds.length; ++i) {
                                console.log("Error: could not load " + invalidIds[i]);
                            }
                        }
                        if (products.length) {
                            deferred.resolve(products);
                        } else {
                            deferred.reject();
                        }
                    });
                },
                purchase : function (transactionId, productId, transactionReceipt) {
                    _onPurchase(transactionId, productId, transactionReceipt);
                },
                restore : function (transactionId, productId, transactionReceipt) {
                    _onRestore(transactionId, productId, transactionReceipt);
                },
                error : function (errorCode, errorMessage) {
                    _onError(errorCode, errorMessage);
                }
            });
            _storekit = storekit;
        }
        return deferred.promise;
    };


    return $storekit;


});
