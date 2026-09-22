!!! note "Configuration File Locations"

    Supersedure Studio looks for specific files in specific locations. This is not configurable. Note that the user and admin files have different names

    === "MacOS"
        | Config | Location |
        | ---- | ------ |
        | User | ~/Library/Application Support/supersedure-studio/user.config.ini |
        | Admin | /Library/Application Support/supersedure-studio/system.config.ini |

    === "Linux"
        | Config | Location |
        | ---- | ----- |
        | User | ~/.config/supersedure-studio/user.config.ini |
        | Admin | /etc/supersedure-studio/system.config.ini |

    === "Windows"
        | Config | Location |
        | ---- | ----- |
        | User | %APPDATA%\supersedure-studio\user.config.ini |
        | Admin | C:\ProgramData\supersedure-studio\system.config.ini |

    === "Local Development"

        Put a `local.config.ini` in the root of the Supersedure Studio project directory. This is used only during app development and takes the place of both user and admin files.