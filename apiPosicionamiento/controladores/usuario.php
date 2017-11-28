<?php

class usuario
{
    const NOMBRE_TABLA = "usuario";
    const ID           = "id";
    const NOMBRE       = "nombre";
    const CONTRASENNA  = "contrasenna";
	const NOM_USUARIO = "nom_usuario";
	const AP_USUARIO = "ap_usuario";

    const CODIGO_EXITO            = 1;
    const ESTADO_EXITO            = 1;
    const ESTADO_ERROR            = 2;
    const ESTADO_ERROR_BD         = 3;
    const ESTADO_ERROR_PARAMETROS = 4;
    const ESTADO_NO_ENCONTRADO    = 5;
	const ESTADO_URL_INCORRECTA = 4;
	const ESTADO_PARAMETROS_INCORRECTOS = 5;
const ESTADO_FALLA_DESCONOCIDA = 3; //le puse numeros al azar no mas
	

    public static function post($peticion)
    {
        // HTTP - Metodos Rest (post, get, put, delete)
        if ($peticion[0] == 'login') {

            return self::loguear(); //

        } else {
            throw new ExcepcionApi(self::ESTADO_URL_INCORRECTA, "Url mal formada", 400);
        }
    }

    public static function loguear()
    {
        $respuesta = array();

        $body = file_get_contents('php://input');

        $usuario = json_decode($body);

        $nombre      = $usuario->nombre;
        $contrasenna = $usuario->contrasenna;

        if (self::autenticar($nombre, $contrasenna)) {
            $usuarioBD = self::obtenerUsuario($nombre, $contrasenna);

            if ($usuarioBD != null) {
                http_response_code(200);

                $respuesta["id"]          = $usuarioBD["id"];
                $respuesta["nombre"]      = $usuarioBD["nombre"];
				$respuesta["nom_usuario"] = $usuarioBD["nom_usuario"];
				$respuesta["ap_usuario"]  = $usuarioBD["ap_usuario"];
				$respuesta["avatar"]  = $usuarioBD["avatar"];
				

                return ["estado" => 1, "usuario" => $respuesta];
            } else {
                throw new ExcepcionApi(self::ESTADO_FALLA_DESCONOCIDA,
                    "Ha ocurrido un error");
            }
        } else {
            throw new ExcepcionApi(self::ESTADO_PARAMETROS_INCORRECTOS,
                utf8_encode("Usuario o contrasenna incorrectos"));
        }
    }
	
	
    public static function obtenerUsuario($nombre, $contrasenna)
    {
        $comando = "SELECT *" .
        " FROM " . self::NOMBRE_TABLA .
        " WHERE " . self::NOMBRE . " =:nombre" .
        " AND " . self::CONTRASENNA . " =:contrasenna";

        $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);

        $sentencia->bindParam("nombre", $nombre);
        $sentencia->bindParam("contrasenna", $contrasenna);
        if ($sentencia->execute()) {
            return $sentencia->fetch(PDO::FETCH_ASSOC);
        } else {
            return null;
        }
    }
	
	public static function autenticar($nombre, $contrasenna)
    {
        $comando = "SELECT " . self::CONTRASENNA .
        " FROM " . self::NOMBRE_TABLA .
        " WHERE " . self::NOMBRE . " =:nombre";

        try {

            $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);

            $sentencia->bindParam('nombre', $nombre);

            $sentencia->execute();

            if ($sentencia) {

                $resultado = $sentencia->fetch();

                if ($contrasenna == $resultado['contrasenna']) {
                    return true;
                } else {
                    return false;
                }

            } else {
                return false;
            }
        } catch (PDOException $e) {
            throw new ExcepcionApi(self::ESTADO_ERROR_BD, $e->getMessage());
        }

    }

}
