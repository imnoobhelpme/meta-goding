<?php

    $id = $_POST['username'];
    $bd = $_POST['birthday'];

    if($id == 'admin' && $bd == 'admin1234')
    {
        echo "<script>alert(\"환영합니다.\")</script>";
    }

    else
    {
        echo "<script>alert(\"다시 시도해주세요.\")</script>";
    }
?>