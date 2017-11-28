var app = angular.module('controllers', ['LocalStorageModule']);
app.service('anchorSmoothScroll', function() {
    this.scrollTo = function(eID) {
        // This scrolling function 
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY);
            return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 500) speed = 500;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for (var i = startY; i < stopY; i += step) {
                setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
                leapY += step;
                if (leapY > stopY) leapY = stopY;
                timer++;
            }
            return;
        }
        for (var i = startY; i > stopY; i -= step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY -= step;
            if (leapY < stopY) leapY = stopY;
            timer++;
        }

        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }

        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            }
            return y;
        }
    };
});
app.controller('loginCtrl', function($scope, $http, localStorageService, $location, $mdDialog) {
    //Login stuff
    $scope.usuario = {};
    $scope.usuario.nombre = '';
    $scope.usuario.contrasenna = '';
    $scope.test = function() {
        console.log("aaaaaaaaaaa");
    }
    $scope.loguear = function() {
        $scope.logueado = true;
        console.log($scope.usuario);
        if ($scope.usuario.nombre != '' && $scope.usuario.contrasenna != '') {
            $http.post("http://www.soluciondual.cl/apiPosicionamiento/usuario/login", {
                'nombre': $scope.usuario.nombre,
                'contrasenna': $scope.usuario.contrasenna
            }).then(function(res) {
                console.log(res);
                var estado = res.data.estado;
                if (estado == 1) {
                    localStorageService.set("usuario", res.data.usuario);
                    //$state.go("");
                    //$window.location.href = '/infoplace_prueba/index.html';
                    $scope.logueado = false;
                    $location.url("nav");
                }
            }, function(res) {
                $scope.logueado = false;
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Lo sentimos').textContent('Usuario o contraseña incorrectos').ariaLabel('Algo mas').ok('OK').targetEvent());
            }); //wait dame un segundo
        } else {
            $scope.logueado = false;
            $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Error').textContent('Debes ingresar usuario y contraseña').ariaLabel('Algo mas').ok('OK').targetEvent());
        }
    }
    // fin login stuff
})
app.controller('indexCtrl', function($scope, $filter, $http, $timeout, NgMap, $mdDialog, localStorageService, $window, anchorSmoothScroll, $location) {
    $scope.usuarioBD = localStorageService.get('usuario');
	
	$scope.abrirRutas = function(){
		$location.url('/rutas');
	}
    // Inicializamos ciudadSel que es la ciudad a seleccionar dentro del Select
    $scope.ciudadSel = "";//inicio Reporte
	var tipoReporte = ""; // (General o Nombre Ciudad)
	var tipoReporte = ""; // (General o Nombre Ciudad)
    var base64Img = new Image();
    base64Img.src = 'img/pdf/reporte.jpg';
    var fecha = $filter('date')(new Date(), 'd MMM, y');
	
	var cleanPdf = function(){
		tipoReporte = "";
		$scope.empresasPdf = [];
	}
	
	
	var generarPdf = function() {
        var doc = new jsPDF();
        var totalPagesExp = "{total_pages_count_string}";
        // doc.text("Reporte #InfoPlace", 14, 16);
        var elem = document.getElementById("pdf");
        var res = doc.autoTableHtmlToJson(elem);
        var pageContent = function(data) {
            // HEADER
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.setFontStyle('normal');
            if (base64Img) {
                doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 7, 10, 10);
            }
            doc.text("Reporte " + tipoReporte, data.settings.margin.left + 18, 15);
            doc.setFontSize(9);
            doc.text("#InfoPlace", data.settings.margin.left + 155, 20);
            doc.text(fecha, data.settings.margin.left + 19, 20);
            // FOOTER
            var str = "Pagina " + data.pageCount;
            // Total paginas
            if (typeof doc.putTotalPages === 'function') {
                str = str + " de " + totalPagesExp;
            }
            doc.setFontSize(10);
            doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        };
        doc.autoTable(res.columns, res.data, {
            startY: 23,
            addPageContent: pageContent,
            margin: {}
        });
        // Total paginas put
        if (typeof doc.putTotalPages === 'function') {
            doc.putTotalPages(totalPagesExp);
        }
		
        doc.save("Reporte "+tipoReporte+" "+ fecha +".pdf");
    }
    $scope.descargaPdf = function() {
  
		$http.get("http://www.soluciondual.cl/apiPosicionamiento/empresa").then(function(res) {
            $scope.empresasPdf = res.data.datos;
        })
		
        $timeout(function() {
			tipoReporte = "General";
            generarPdf();
        }, 1000)
		cleanPdf();
		
    }
   
    $scope.descargaPdfCiudad = function() {
        
		$http.get("http://www.soluciondual.cl/apiPosicionamiento/empresa/" + $scope.ciudadSel.cod_ciudad).then(function(res) {
            $scope.empresasPdf = res.data.datos;
        })
        
        if ($scope.ciudadSel.cod_ciudad != null) {
			
            $timeout(function() {
				tipoReporte = $scope.ciudadSel.ciudad;
                generarPdf();
            }, 1000)
			cleanPdf();
			
        } else {
            $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Lo sentimos').textContent('Para descargar un reporte por ciudad debes seleccionar una en la pagina principal').ariaLabel('Algo mas').ok('OK').targetEvent());
        }
    }
    //FIN REPORTE
	//console.log(localStorageService.get("usuario"));
    //if (localStorageService.get("usuario") == null) {
    //    $window.location.href = '/infoplace/'; //veeamos
    //} //the real problema here es que ocupamos el mismocontrolador por eso se carga a cada rato separemoslo oka
    $scope.posicionMapa = 'current-position';
    console.log($scope.posicionMapa);
    //Cargamos las ciudades en el select de Ciudades
    $http.get("http://www.soluciondual.cl/apiPosicionamiento/ciudad").then(function(res) {
        $scope.ciudades = res.data.datos;
    });
    $scope.estado1 = true;
    $scope.estado2 = true;
    $scope.estado3 = true;
    limpiarEstados = function() {
        $scope.estado1 = true;
        $scope.estado2 = true;
        $scope.estado3 = true;
    }

    //Inicializamos en un arreglo vacio las posiciones de empresas por Cargar
    //$scope.posiciones = [];
    //Se selecciona una ciudad y se carga esta funcion para obtener todas las empresaas de esa ciudad
    $scope.disponible = "true";
    limpiarFormulario = function() {
        $scope.id = "";
        $scope.empresa = ""
        $scope.direccion = "";
        $scope.pais = "";
        $scope.ciudad = "";
        $scope.estado = "";
        $scope.disponible = "true";
    }
    $scope.$watch('disponible', function() {
        console.log($scope.disponible);
    });
    $scope.activo = false;
    $scope.fnSeleccion = function() {
        $scope.posicionMapa = [$scope.ciudadSel.lat, $scope.ciudadSel.lng];
        $http.get("http://www.soluciondual.cl/apiPosicionamiento/empresa/" + $scope.ciudadSel.cod_ciudad).then(function(res) {
            var resp = res.data.datos;
            $scope.empresas = [];
            angular.forEach(resp, function(value, key) {
                var direccion = value.direccion.replace(/\s+/g, '+') + "," + value.ciudad.replace(/\s+/g, '+') + "," + value.pais.replace(/\s+/g, '+');
                var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURI(direccion) + "&region=cl&key=AIzaSyBa-Ztle_KZE2iJCYkTnom3lSfSzUKCI-w";
                var empresa = {};
                $http.get(url).then(function(res) {
                    switch (value.estado) {
                        case '1':
                            empresa.estado = "yellow";
                            break;
                        case '2':
                            empresa.estado = "red";
                            break;
                        case '3':
                            empresa.estado = "blue";
                            break;
                        default:
                            break;
                    }
                    empresa.nom_empresa = value.nombre;
                    empresa.id_empresa = value.id;
                    //aca metemos los puntos geograficos en el json
                    console.log(res.data.results[0].geometry.location);
                    empresa.lat = res.data.results[0].geometry.location.lat;
                    empresa.lng = res.data.results[0].geometry.location.lng;
                    empresa.visible = true;
                    //$scope.posiciones.push(res);
                    $scope.empresas.push(empresa);
                    $scope.activo = false;
                });
            });
        });
        limpiarFormulario();
        limpiarEstados();
    }
    //Esta funcion sirve para mostrar los datos de alguna empresa dentro del mapa
    $scope.customFullscreen = false;
    $scope.verEmpresa = function() {
        console.log(this.data);
        var empresa = {};
        $http.get("http://www.soluciondual.cl/apiPosicionamiento/empresa/datos/" + this.data).then(function(res) {
            empresa = res.data.datos[0];
            $scope.id = empresa.id;
            $scope.empresa = empresa.nombre;
            $scope.direccion = empresa.direccion
            $scope.pais = empresa.pais;
            $scope.ciudad = empresa.ciudad;
            $scope.estado = empresa.estado;
            $scope.disponible = "false";
            //scroll hasta form datos empresa
            $scope.activo = true; //aviso al ngshow
            //scroll testing
            $timeout(function() {
                anchorSmoothScroll.scrollTo('datosEmpresa');
            }, 100)
            //var content = "<html><h1> Direcci�n: " + empresa.direccion + "</h1><h2>Ciudad: " + empresa.ciudad + "</h2><h2> Lat: " + empresa.lat + "</h2><h2>Lng: " + empresa.lng + "</h2></html>";
            //console.log(empresa);
            //$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('[' + empresa.id + '] ' + empresa.nombre).htmlContent(content).ariaLabel('Algo mas').ok('OK').targetEvent());
        })
    };
    $scope.modificar = function() {
        console.log($scope.id);
        if ($scope.id != undefined) {
            $http.put("http://www.soluciondual.cl/apiPosicionamiento/empresa/" + $scope.id, {
                'estado': $scope.estado
            }).then(function(res) {
                console.log(res.data.estado);
                angular.forEach($scope.empresas, function(value, key) {
                    if (value.id_empresa == $scope.id) {
                        switch ($scope.estado) {
                            case '1':
                                $scope.empresas[key].estado = "yellow";
                                break;
                            case '2':
                                $scope.empresas[key].estado = "red";
                                break;
                            case '3':
                                $scope.empresas[key].estado = "blue";
                                break;
                            default:
                                break;
                        }
                    }
                });
                anchorSmoothScroll.scrollTo('aers');
                $timeout(function() {
                    $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Correcto').textContent('Estado Cambiado con éxito').ariaLabel('Algo mas').ok('OK').targetEvent());
                }, 100);
            }, function(res) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Lo sentimos').textContent('Debe seleccionar un estado distinto').ariaLabel('Algo mas').ok('OK').targetEvent());
            })
        } else {
            $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Lo sentimos').textContent('Debe seleccionar una ciudad').ariaLabel('Algo mas').ok('OK').targetEvent());
        }
    }
    $scope.cambioEstado1 = function() {
        angular.forEach($scope.empresas, function(value, key) {
            if (value.estado == "yellow") {
                $scope.empresas[key].visible = $scope.estado1;
            }
        });
    }
    $scope.cambioEstado2 = function() {
        angular.forEach($scope.empresas, function(value, key) {
            if (value.estado == "red") {
                $scope.empresas[key].visible = $scope.estado2;
            }
        });
    }
    $scope.cambioEstado3 = function() {
        angular.forEach($scope.empresas, function(value, key) {
            if (value.estado == "blue") {
                $scope.empresas[key].visible = $scope.estado3;
            }
        });
    }
    //Variables del Registro Nueva Empresa
    $scope.newEmpresa = {};
    $scope.newEmpresa.nombre;
    $scope.newEmpresa.estado;
    $scope.newEmpresa.pais;
    $scope.newEmpresa.ciudad;
    $scope.newEmpresa.direccion;
    //Muestra el form flotante
    $scope.mostrarDialogo = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'editor.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false
        })
    }
    //controlador del form flotante
    function DialogController($scope, $mdDialog, $mdToast) {
        //Regresa al home
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.guardar = function() {
            console.log($scope.newEmpresa);
            $scope.isLoading = true;
            $http.put("http://www.soluciondual.cl/apiPosicionamiento/empresa/crear", {
                "nombre": $scope.newEmpresa.nombre,
                "direccion": $scope.newEmpresa.direccion,
                "estado": $scope.newEmpresa.estado,
                "cod_ciudad": $scope.newEmpresa.ciudad
            }).then(function(res) {
                if (res.data.estado == 1) {
                    $mdDialog.hide();
                    $mdToast.show($mdToast.simple().textContent('Datos registrados con éxito').theme("success-toast"));
                    $scope.isLoading = false;
                } else {
                    $mdDialog.hide();
                    $mdToast.show($mdToast.simple().textContent('No se pudo registrar').theme("success-toast"));
                    $scope.isLoading = false;
                }
                //algo
            })
        }
    }
    $scope.logout = function() {
        localStorageService.set('usuario', null);
        $location.url("/");
    }
})
app.controller('rutasCtrl', function($scope, localStorageService, $http, $mdDialog, $location, $timeout) {
    $scope.usuarioBD = localStorageService.get('usuario');
    $scope.posicionMapa = 'current-position';
	$scope.rutas = [];
    $http.get("http://www.soluciondual.cl/apiPosicionamiento/ciudad").then(function(res) {
        $scope.ciudades = res.data.datos;
		
    });
    $scope.fnSeleccion = function() {
        $scope.posicionMapa = [$scope.ciudadSel.lat, $scope.ciudadSel.lng];
        $http.get("http://www.soluciondual.cl/apiPosicionamiento/empresa/" + $scope.ciudadSel.cod_ciudad).then(function(res) {
            var resp = res.data.datos;
            $scope.empresas = [];
            angular.forEach(resp, function(value, key) {
                var direccion = value.direccion.replace(/\s+/g, '+') + "," + value.ciudad.replace(/\s+/g, '+') + "," + value.pais.replace(/\s+/g, '+');
                var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURI(direccion) + "&region=cl&key=AIzaSyBa-Ztle_KZE2iJCYkTnom3lSfSzUKCI-w";
                var empresa = {};
                $http.get(url).then(function(res) {
                    switch (value.estado) {
                        case '1':
                            empresa.estado = "yellow";
                            break;
                        case '2':
                            empresa.estado = "red";
                            break;
                        case '3':
                            empresa.estado = "blue";
                            break;
                        default:
                            break;
                    }
                    empresa.nom_empresa = value.nombre;
                    empresa.id_empresa = value.id;
                    //aca metemos los puntos geograficos en el json
                    console.log(res.data.results[0].geometry.location);
                    empresa.lat = res.data.results[0].geometry.location.lat;
                    empresa.lng = res.data.results[0].geometry.location.lng;
                    empresa.visible = true;
                    //$scope.posiciones.push(res);
                    $scope.empresas.push(empresa);
                    $scope.activo = false;
                });
            });
        });
		$scope.empresasSeleccionadas = [];
		$scope.rutas = [];
    }
    $scope.empresasSeleccionadas = [];
    $scope.agregarEmpresa = function() {
        var idEmpresa = this.data;
        function estado(){
			var estadoConsulta = true;
			angular.forEach($scope.empresasSeleccionadas, function(value, key) {
				if (idEmpresa == value.id) {
					estadoConsulta = false;
					
				}
			})
		    return estadoConsulta;
		};
		console.log(estado());
        if (estado()) {
            $http.get("http://www.soluciondual.cl/apiPosicionamiento/empresa/datos/" + this.data).then(function(res) {
                $scope.empresasSeleccionadas.push(res.data.datos[0]);
            })
        }else{
			$mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Lo sentimos').textContent('Empresa ya seleccionada').ariaLabel('Algo mas').ok('OK').targetEvent());
		}
    }
    $scope.crearRutas = function() {
        if ($scope.empresasSeleccionadas.length > 1) {
            $scope.rutas = [];
            $scope.ruta = [];
            var rutaAnterior = "";
            var tam = $scope.empresasSeleccionadas.length - 1;
            for (var i = 0; i < tam; i++) {
                $scope.ruta.push($scope.empresasSeleccionadas[i]);
                $scope.ruta.push($scope.empresasSeleccionadas[i + 1]);
                $scope.rutas.push($scope.ruta);
                $scope.ruta = [];
            }
        } else {
            $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true).title('Lo sentimos').textContent('Debe seleccionar al menos dos empresas').ariaLabel('Algo mas').ok('OK').targetEvent());
        }
    }
	$scope.logout = function() {
        localStorageService.set('usuario', null);
        $location.url("/");
    }
	
	$scope.abrirNav = function(){
		$location.url('/nav');
	}

})