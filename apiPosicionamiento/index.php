<?php

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}
// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
 
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         
 
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
 
}

require 'datos/ConexionBD.php';

require 'controladores/usuario.php';
require 'controladores/empresa.php';
require 'controladores/ciudad.php';
require 'vistas/VistaXML.php';
require 'vistas/VistaJson.php';
require 'utilidades/ExcepcionApi.php';

// Constantes de estado
const ESTADO_URL_INCORRECTA      = 2;
const ESTADO_EXISTENCIA_RECURSO  = 3;
const ESTADO_METODO_NO_PERMITIDO = 4;

// Preparar manejo de excepciones
$formato = isset($_GET['formato']) ? $_GET['formato'] : 'json';

switch ($formato) {
    case 'xml':
        $vista = new VistaXML();
        break;
    case 'json':
    default:
        $vista = new VistaJson();
}

set_exception_handler(function ($exception) use ($vista) {
    $cuerpo = array(
        "estado"  => $exception->estado,
        "mensaje" => $exception->getMessage(),
    );
    if ($exception->getCode()) {
        $vista->estado = $exception->getCode();
    } else {
        $vista->estado = 500;
    }

    $vista->imprimir($cuerpo);
}
);

// Extraer segmento de la url
if (isset($_GET['PATH_INFO'])) {
    $peticion = explode('/', $_GET['PATH_INFO']);
} else {
    throw new ExcepcionApi(ESTADO_URL_INCORRECTA, utf8_encode("No se reconoce la petición"));
}

// Obtener recurso
$recurso             = array_shift($peticion);
$recursos_existentes = array('empresa', 'ciudad', 'usuario');

// Comprobar si existe el recurso
if (!in_array($recurso, $recursos_existentes)) {
    throw new ExcepcionApi(ESTADO_EXISTENCIA_RECURSO,
        "No se reconoce el recurso al que intentas acceder");
}

$metodo = strtolower($_SERVER['REQUEST_METHOD']);

if ($recurso == 'empresa') {
// Filtrar método
    switch ($metodo) {
        case 'get':
            $vista->imprimir(empresa::get($peticion));
        case 'post':
        case 'put':
            $vista->imprimir(empresa::put($peticion));
        case 'delete':
        default:
            // Método no aceptado
            $vista->estado = 405;
            $cuerpo        = [
                "estado"  => ESTADO_METODO_NO_PERMITIDO,
                "mensaje" => utf8_encode("Método no permitido"),
            ];
            $vista->imprimir($cuerpo);
    }
} else if ($recurso == 'usuario') {
    switch ($metodo) {
        case 'get':
        case 'post':
            $vista->imprimir(usuario::post($peticion));
        case 'put':
        case 'delete':
        default:
            // Método no aceptado
            $vista->estado = 405;
            $cuerpo        = [
                "estado"  => ESTADO_METODO_NO_PERMITIDO,
                "mensaje" => utf8_encode("Método no permitido"),
            ];
            $vista->imprimir($cuerpo);
    }
} else {
    switch ($metodo) {
        case 'get':
            $vista->imprimir(ciudad::get($peticion));
        case 'post':
        case 'put':
        case 'delete':
        default:
            // Método no aceptado
            $vista->estado = 405;
            $cuerpo        = [
                "estado"  => ESTADO_METODO_NO_PERMITIDO,
                "mensaje" => utf8_encode("Método no permitido"),
            ];
            $vista->imprimir($cuerpo);
    }
}
