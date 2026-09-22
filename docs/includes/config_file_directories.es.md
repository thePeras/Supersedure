!!! note "Ubicaciones de Archivos de Configuracion"

    Supersedure Studio busca archivos especificos en ubicaciones especificas. Esto no es configurable. Ten en cuenta que los archivos de usuario y administrador tienen nombres diferentes

    === "MacOS"
        | Config | Ubicacion |
        | ---- | ------ |
        | Usuario | ~/Library/Application Support/supersedure-studio/user.config.ini |
        | Admin | /Library/Application Support/supersedure-studio/system.config.ini |

    === "Linux"
        | Config | Ubicacion |
        | ---- | ----- |
        | Usuario | ~/.config/supersedure-studio/user.config.ini |
        | Admin | /etc/supersedure-studio/system.config.ini |

    === "Windows"
        | Config | Ubicacion |
        | ---- | ----- |
        | Usuario | %APPDATA%\supersedure-studio\user.config.ini |
        | Admin | C:\ProgramData\supersedure-studio\system.config.ini |

    === "Desarrollo Local"

        Coloca un `local.config.ini` en la raiz del directorio del proyecto de Supersedure Studio. Esto se usa solo durante el desarrollo de la aplicacion y toma el lugar de los archivos de usuario y admin.
