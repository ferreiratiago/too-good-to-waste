angular.module('ToGoodToWaste', ['ngMaterial', 'ngSanitize', 'btford.socket-io'])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('lime');
    })
    .service('helper', function Helper() {
        var DAY_MILLIS = 1000 * 3600 * 24;
        this.daysLeft = function (expirationDate) {
            return Math.floor((new Date(expirationDate) - new Date()) / DAY_MILLIS);
        };

        this.isExpiringToday = function (item) {
            var today = new Date();
            var itemExpirationDate = (new Date(item.expirationDate)).setHours(0,0,0,0);
            var isToday = (new Date()).setHours(0,0,0,0) === itemExpirationDate;

            return isToday;
        };

        this.isExpiringAfterToday = function (item) {
            var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            var itemExpirationDate = new Date(item.expirationDate);
            var isExpiringAfterToday = (itemExpirationDate.getTime() >= tomorrow.getTime());

            return isExpiringAfterToday;
        };

        this.translate = function (text) {
            switch (text) {
                case 'Tomates':
                    return 'Tomatoes';
                case 'Iogurtes':
                    return 'Yogurts';
                case 'Queijo Fresco':
                    return 'Fresh Cheese';
                case 'Batatas':
                    return 'Potatoes';
                case 'Mirtilos':
                    return 'Blueberries';
                case 'Cebolas':
                    return 'Onions';
                case 'Alface':
                    return 'Lettuces';
                case 'Alho':
                    return 'Garlics';
                case 'Cenouras':
                    return 'Carrots';
            }
        };

        this.getRandomIntInclusive = function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
    })
    .controller('AppCtrl', function ($scope, $mdDialog, $http, $interval, orderByFilter, helper) {


        $scope.showAdvanced = function (ev, item) {
            $mdDialog.show({
                templateUrl: 'dialog-template.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    item: item
                },
                controller: function DialogController($scope, $mdDialog, item, helper) {
                    $scope.item = item;

                    // get recipe
                    $http({
                        url: 'http://toogoodtowaste.us:80/api/search?key=4d651dcc83384a4a4b981b83a787a418&q=' + item.name,
                        method: 'GET'
                    }).then(function (r) {
                        var randomRecipeIndex = helper.getRandomIntInclusive(0, r.data.count);
                        var recipe = r.data.recipes[randomRecipeIndex];

                        $scope.recipe = {
                            title: recipe.title,
                            image: recipe.image_url,
                            url: recipe.source_url
                        };
                    });

                    $scope.hide = function () {
                        $mdDialog.hide();
                    };

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };

                    $scope.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };
                }
            });
        };

        $scope.goToItem = function (item, event) {
            $mdDialog.show(
                $mdDialog.alert()
                .title(item.name)
                .htmlContent('Quantidade: ' + item.quantity)
                .ok('Done!')
                .targetEvent(event)
            );
        };

        $scope.navigateTo = function (to, event) {
            $mdDialog.show(
                $mdDialog.alert()
                .title('Navigating')
                .textContent('Imagine being taken to ' + to)
                .ok('Neat!')
                .targetEvent(event)
            );
        };

        $scope.doPrimaryAction = function (event) {
            $mdDialog.show(
                $mdDialog.alert()
                .title('Recipes')
                .textContent('Here will be a list of recipes')
                .ok('Awesome!')
                .targetEvent(event)
            );
        };

        $scope.deleteItem = function (event, item) {
            $mdDialog.show(
                $mdDialog.confirm()
                .title('Remove?')
                .textContent('Have you used it already? Nice! No waste. Well done mate.')
                .ok('We are done here!')
                .cancel('Not yet...')
                .targetEvent(event)
            ).then(() => {
                removeItem(item._id);
            });
        };

        $scope.getItemImage = function (item) {
            var itemImages = {
                'Tomatoes': 'images/tomato.jpg',
                'Yogurts': 'images/iogurte.jpg',
                'Fresh Cheese': 'images/queijo_fresco.jpeg',
                'Potatoes': 'images/batatas.png',
                'Blueberries': 'images/mirtilo.jpg',
                'Onions': 'images/cebola.jpeg',
                'Lettuces': 'images/alface.jpg',
                'Garlics': 'images/alho.jpeg',
                'Carrots': 'images/carrots.jpg'
            };

            return itemImages[item];
        }

        var socket = io.connect('http://toogoodtowaste.us:9000/');

        socket.on('connect', function (data) {
            console.log('Just connected');

            updateProducts();
        })

        socket.on('newProduct', function (data) {
            console.log(`NEW PRODUCTSSSSS ${data}`);

            updateProducts();
        });

        function updateProducts() {
            $http({
                // url: 'http://localhost:3000/expiring/aristides@pixels.camp?range=10',
                url: 'http://toogoodtowaste.us:3000/expiring/aristides@pixels.camp?range=10',
                method: 'GET'
            }).then(function successCallback(response) {
                items = response.data;

                items = items.map(i => {
                    i.name = helper.translate(i.name);
                    i.daysLeft = helper.daysLeft(i.expirationDate);
                    return i;
                });

                $scope.nextExpiringItems = items.filter(helper.isExpiringAfterToday);
                $scope.todaysItems = items.filter(helper.isExpiringToday);
            }, function errorCallback(response) {
                $scope.nextExpiringItems = [];
                $scope.todaysItems = [];
            })
        }

        function removeItem(itemId) {
            $http({
                // url: 'http://localhost:3000/products/' + itemId,
                url: 'http://toogoodtowaste.us:3000/products/' + itemId,
                method: 'DELETE'
            }).then(function () {
                updateProducts();
            })
        }
    });
