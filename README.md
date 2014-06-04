# ng-storekit

AngularJS Cordova wrapper for the iOS Cordova In App Purchases plugin

## Install

Install the cordova [iOS In App Purchases Plugin](https://github.com/j3k0/PhoneGap-InAppPurchase-iOS):

    $ cordova plugin add git://github.com/j3k0/PhoneGap-InAppPurchase-iOS.git

Install with bower

    $ bower install ng-storekit

Include the file from the bower library

    <script src="bower_components/ng-storekit/ng-storekit.js"></script>

## Usage

Include as a dependency in your angular module

    angular.module('myApp', ['ngStorekit'])

Load storekit when the device is ready

    .run(function($ionicPlatform, $storekit) {
        $ionicPlatform.ready(function() {
            $storekit
                .setLogging(true)
                .load(['com.yourcompany.inapppurchase.id'])
                .then(function (products) {
                    console.log('products loaded');
                })
                .catch(function () {
                    console.log('no products loaded');
                });
        });
    });

Make and restore purchases

    module.controller('MyCtrl', function($scope, $storekit) {
    
        // get products:
        var products = $storekit.getProducts();
    
        // make a purchase:
        $storekit.purchase('com.yourcompany.inapppurchase.id');
    
        // restore purchases:
        $storekit.restore();
    
        // watch for purchases
        $storekit
            .watchPurchases()
            .then(function () {
                // Not currently used
            }, function (error) {
                // An error occured. Show a message to the user
            }, function (purchase) {
                if (purchase.productId === 'com.yourcompany.inapppurchase.id') {
                    if (purchase.type === 'purchase') {
                        // Your product was purchased
                    } else if (purchase.type === 'purchase') {
                        // Your product was restored
                    }
                }
            });
    
    });

## License

MIT
