var app = angular.module('routes', ['ngRoute']);
app.config(function($routeProvider) {
    $routeProvider
	.when("/", {
        templateUrl: "templates/login.html",
        controller: "loginCtrl"
    })
	.when("/nav", {
        templateUrl: "templates/nav.html",
        controller: "indexCtrl"
    }).when("/rutas", {
        templateUrl: "templates/rutas.html",
        controller: "rutasCtrl"
    })
	.otherwise({
        redirect: '/'
    });
});
app.run(function($rootScope, localStorageService, $location)
{
    //al cambiar de rutas
     $rootScope.$on('$routeChangeStart', function() {
        if (localStorageService.get("usuario") == null) {
            $location.url('/');
        } 
    })
})