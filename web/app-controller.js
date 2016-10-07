angular.module('ToGoodToWaste', ['ngMaterial', 'ngSanitize'])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('lime');
    })
    .controller('AppCtrl', function ($scope, $mdDialog) {
        function DialogController($scope, $mdDialog, item) {
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
                var recipes = {
                    'Tomates': 'Tomato and Basil Pasta. With garden-ripened tomatoes and fragrant fresh basil, this pasta dish ' +
                        'needs very little enhancement to taste divine. Just add some sliced garlic, extra-virgin olive oil, ' +
                        'and burrata or mozzarella cheese, and dinner is ready.',
                    'Iogurtes': 'Don\'t forget to use the milk in your breakfast!',
                    'Queijo Fresco': 'Why don\'t you try an omelette?'
                }

                return recipes[item]
            }
        }

        $scope.showAdvanced = function (ev, item) {
            $mdDialog.show({
                templateUrl: 'web/dialog-template.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    item: item
                },
                controller: DialogController
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

        $scope.doSecondaryAction = function (event) {
            $mdDialog.show(
                $mdDialog.alert()
                .title('Remove')
                .textContent('Have you used it already? Nice!')
                .ok('We are done here!')
                .targetEvent(event)
            );
        };

        function isExpiringToday(item) {
            var today = new Date();
            var itemExpirationDate = new Date(item.expirationDate);
            var isToday = (today.toDateString() === itemExpirationDate.toDateString());

            return isToday;
        }

        function isExpiringAfterToday(item) {
            var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            var itemExpirationDate = new Date(item.expirationDate);
            var isExpiringAfterToday = (tomorrow.toDateString() === itemExpirationDate.toDateString());

            return isExpiringAfterToday;
        }

        // REQUEST
        var mockItems = {
            "date": "2016-10-07T10:00:00+00:00",
            "userId": "aristides@pixels.camp",
            "items": [{
                "name": "Tomates",
                "quantity": 2000,
                "expirationDate": "2016-10-07T20:03:19+00:00",
                "packageDate": "2016-10-06T20:03:19+00:00"
            }, {
                "name": "Iogurtes",
                "quantity": 2000,
                "expirationDate": "2016-10-08T20:03:19+00:00",
                "packageDate": "2016-10-06T20:03:19+00:00"
            }, {
                "name": "Queijo Fresco",
                "quantity": 2000,
                "expirationDate": "2016-10-08T20:03:19+00:00",
                "packageDate": "2016-10-06T20:03:19+00:00"
            }]
        };

        $scope.getItemImage = function (item) {
            var itemImages = {
                'Tomates': 'web/images/tomato.jpg',
                'Iogurtes': 'web/images/milk.jpg',
                'Queijo Fresco': 'web/images/eggs.jpg'
            };

            return itemImages[item];
        }

        $scope.nextExpiringItems = mockItems.items.filter(isExpiringAfterToday);
        $scope.todaysItems = mockItems.items.filter(isExpiringToday);
    });