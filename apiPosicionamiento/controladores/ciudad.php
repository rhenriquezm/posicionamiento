<?php

class ciudad
{
    const NOMBRE_TABLA = "empresa";
    const ID           = "id";
    const NOMBRE       = "nombre";
    const COD_CIUDAD   = "cod_ciudad";
    const CIUDAD       = "ciudad";
    const PAIS         = "pais";
    const DIRECCION    = "direccion";
    const ESTADO       = "estado";
    const LAT          = "lat";
    const LNG          = "lng";

    const CODIGO_EXITO            = 1;
    const ESTADO_EXITO            = 1;
    const ESTADO_ERROR            = 2;
    const ESTADO_ERROR_BD         = 3;
    const ESTADO_ERROR_PARAMETROS = 4;
    const ESTADO_NO_ENCONTRADO    = 5;

    public static function get($peticion)
    {
        if (empty($peticion[0])) {
            return self::obtenerCiudades();
        }

    }

    private static function obtenerCiudades()
    {
        try {

            $comando = "SELECT " . "distinct(" . self::COD_CIUDAD . "), " . self::CIUDAD . ", " . self::LAT . ", " . self::LNG . " FROM " . self::NOMBRE_TABLA;

            // Preparar sentencia
            $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);

            // Ejecutar sentencia preparada
            if ($sentencia->execute()) {
                http_response_code(200);
                return
                    [
                    "estado" => self::ESTADO_EXITO,
                    "datos"  => $sentencia->fetchAll(PDO::FETCH_ASSOC),
                ];
            } else {
                throw new ExcepcionApi(self::ESTADO_ERROR, "Se ha producido un error");
            }

        } catch (PDOException $e) {
            throw new ExcepcionApi(self::ESTADO_ERROR_BD, $e->getMessage());
        }
    }
}
