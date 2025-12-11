```php
<?php
/**
 * login_db.php

class LoginDB {

    /** Buscar usuário pelo email */
    public static function BUSCAR_USUARIO_EMAIL() {
        return "
            SELECT id, nome, email, senha
            FROM Usuarios
            WHERE email = ?
            LIMIT 1
        ";
    }
}
?>
```
