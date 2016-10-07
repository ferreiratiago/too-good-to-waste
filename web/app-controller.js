angular.module('ToGoodToWaste', ['ngMaterial', 'ngSanitize'])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('lime');
    })
    .controller('AppCtrl', function ($scope, $mdDialog, $http, $timeout, orderByFilter) {
        $scope.showAdvanced = function (ev, item) {
            $mdDialog.show({
                templateUrl: 'dialog-template.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    item: item
                },
                controller: function DialogController($scope, $mdDialog, item) {
                    $scope.item = item;

                    $scope.hide = function () {
                        $mdDialog.hide();
                    };

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };

                    $scope.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };

                    $scope.getRecipe = function (item) {
                        // console.log(item);

                        // $http({
                        //     url: 'http://food2fork.com/api/search?key=4d651dcc83384a4a4b981b83a787a418&q='+item,
                        //     method: 'GET'
                        // }).then(function(r) {
                        //     console.log(r);
                        // });

                        // var recipes = {
                        //     'Tomates': 'Tomato and Basil Pasta. With garden-ripened tomatoes and fragrant fresh basil, this pasta dish ' +
                        //         'needs very little enhancement to taste divine. Just add some sliced garlic, extra-virgin olive oil, ' +
                        //         'and burrata or mozzarella cheese, and dinner is ready.',
                        //     'Iogurtes': 'Don\'t forget to use the milk in your breakfast!',
                        //     'Queijo Fresco': 'Why don\'t you try an omelette?'
                        // }

                        // return recipes[item]
                    }
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

        function isExpiringToday(item) {
            var today = new Date();
            var itemExpirationDate = new Date(item.expirationDate);
            var isToday = (today.getTime() === itemExpirationDate.getTime());

            return isToday;
        }

        function isExpiringAfterToday(item) {
            var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            var itemExpirationDate = new Date(item.expirationDate);
            var isExpiringAfterToday = (itemExpirationDate.getTime() >= tomorrow.getTime());

            return isExpiringAfterToday;
        }

        function translate(text) {
            switch(text) {
                case 'Tomates': return 'Tomatoes';
                case 'Iogurtes': return 'Yogurts';
                case 'Queijo Fresco': return 'Fresh Cheese';
                case 'Batatas': return 'Potatoes';
                case 'Mirtilos': return 'Blueberries';
                case 'Cebolas': return 'Onions';
                case 'Alface': return 'Lettuces';
                case 'Alho': return 'Garlics';
                case 'Cenouras': return 'Carrots';
            }
        }

        var poller = function () {
            $http({
                url: 'http://toogoodtowaste.us:3000/expiring/aristides@pixels.camp?range=10',
                method: 'GET'
            }).then(function successCallback(response) {
                items = response.data;

                items = orderByFilter(items, 'item.expirationDate', true) || [];
                items = items.map(i => {
                    i.name = translate(i.name);
                    return i;
                });

                $scope.nextExpiringItems = items.filter(isExpiringAfterToday);
                $scope.todaysItems = items.filter(isExpiringToday);

                $timeout(poller, 1000)
            }, function errorCallback(response) {})
        }

        function removeItem(itemId) {
            $http({
                url: 'http://toogoodtowaste.us:3000/products/'+itemId,
                method: 'DELETE'
            });
        }

        poller();
    });
