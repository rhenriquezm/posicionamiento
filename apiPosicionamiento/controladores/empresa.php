<?php

class empresa
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
            return self::obtenerEmpresas();
        } else if ($peticion[0] == "datos") {
            return self::obtenerEmpresa($peticion[1]);
        } else {
            return self::obtenerEmpresas($peticion[0]);
        }
    }

    public static function put($peticion)
    {
        if ($peticion[0] != "crear") {
            $body    = file_get_contents('php://input');
            $empresa = json_decode($body);

            if (self::actualizar($empresa, $peticion[0]) > 0) {
                http_response_code(200);
                return [
                    "estado"  => self::CODIGO_EXITO,
                    "mensaje" => "Registro actualizado correctamente",
                ];
            } else {
                throw new ExcepcionApi(self::ESTADO_NO_ENCONTRADO,
                    "El contacto al que intentas acceder no existe", 404);
            }
        } else if ($peticion[0] == "crear") {
            $body    = file_get_contents('php://input');
            $empresa = json_decode($body);

            if (self::ingresarEmpresa($empresa) == self::CODIGO_EXITO) {
                http_response_code(200);
                return [
                    "estado"  => self::CODIGO_EXITO,
                    "mensaje" => "Registro ingresado correctamente",
                ];
            } else {
                throw new ExcepcionApi(self::ESTADO_NO_ENCONTRADO,
                    "No se pudo ingresar correctamente", 404);
            }
        } else {
            throw new ExcepcionApi(self::ESTADO_ERROR_PARAMETROS, "Falta id", 422);
        }
    }

    private static function obtenerEmpresas($ciudad = null)
    {
        try {
            if (!$ciudad) {
                $comando = "SELECT * FROM " . self::NOMBRE_TABLA;

                // Preparar sentencia
                $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);

            } else {
                $comando = "SELECT * FROM " . self::NOMBRE_TABLA .
                " WHERE " . self::COD_CIUDAD . "=:ciudad";

                // Preparar sentencia
                $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
                // Ligar idContacto e idUsuario
                $sentencia->bindParam("ciudad", $ciudad, PDO::PARAM_INT);
            }

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

    private static function actualizar($empresa, $id)
    {
        try {
            $consulta = "UPDATE " . self::NOMBRE_TABLA .
            " SET " . self::ESTADO . "=:estado" .
            " WHERE " . self::ID . "=:id";

            // Preparar la sentencia
            $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($consulta);

            //echo $consulta;

            $estado = $empresa->estado;

            $sentencia->bindParam("estado", $estado);
            $sentencia->bindParam("id", $id, PDO::PARAM_INT);
            // Ejecutar la sentencia
            $sentencia->execute();

            return $sentencia->rowCount();

        } catch (PDOException $e) {
            throw new ExcepcionApi(self::ESTADO_ERROR_BD, $e->getMessage());
        }
    }

    private static function obtenerEmpresa($idEmpresa)
    {
        try {

            $comando = "SELECT * FROM " . self::NOMBRE_TABLA . " WHERE " . self::ID . "=:idEmpresa";

            $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);
            $sentencia->bindParam("idEmpresa", $idEmpresa, PDO::PARAM_INT);

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

    private static function ingresarEmpresa($empresa)
    {
        try {

            $comando = "INSERT INTO " . self::NOMBRE_TABLA . "(" .
            self::NOMBRE . "," .
            self::CIUDAD . "," .
            self::PAIS . "," .
            self::DIRECCION . "," .
            self::ESTADO . "," .
            self::COD_CIUDAD . "," .
            self::LAT . "," .
            self::LNG . ")" . " VALUES (" . ":nombre, :ciudad, 'Chile', :direccion, :estado, :cod_ciudad, :lat, :lng" . ")";

            $sentencia = ConexionBD::obtenerInstancia()->obtenerBD()->prepare($comando);

            switch ($empresa->cod_ciudad) {
                case 1:
                    $lat    = "-33.015348";
                    $lng    = "-71.550028";
                    $ciudad = "Viña del Mar";
                    break;
                case 2:
                    $lat    = "-33.050631";
                    $lng    = "-71.6460682";
                    $ciudad = "Valparaíso";
                    break;
                case 3:
                    $lat    = "-32.929947";
                    $lng    = "-71.518606";
                    $ciudad = "Concón";
                    break;
                case 4:
                    $lat    = "-32.9683024";
                    $lng    = "-71.5552846";
                    $ciudad = "Reñaca";
                    break;
                default:
                    break;
            }

            $nombre     = $empresa->nombre;
            $direccion  = $empresa->direccion;
            $estado     = $empresa->estado;
            $cod_ciudad = $empresa->cod_ciudad;

            $sentencia->bindParam("nombre", $nombre);
            $sentencia->bindParam('ciudad', $ciudad);
            $sentencia->bindParam('direccion', $direccion);
            $sentencia->bindParam('estado', $estado);
            $sentencia->bindParam('cod_ciudad', $cod_ciudad);
            $sentencia->bindParam('lat', $lat);
            $sentencia->bindParam('lng', $lng);

            // Ejecutar sentencia preparada

            if ($sentencia->execute()) {
                return self::CODIGO_EXITO;
            } else {
                return self::ESTADO_ERROR;
            }

        } catch (PDOException $e) {
            throw new ExcepcionApi(self::ESTADO_ERROR_BD, $e->getMessage());
        }
    }
}
