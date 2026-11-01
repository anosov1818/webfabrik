<?php
$name = $_POST['name'];
$email = $_POST['email'];
$phonenumb = $_POST['phonenumb'];
$email = htmlspecialchars($email);
$name = htmlspecialchars($name);
$phonenumb = htmlspecialchars($phonenumb);
$name = urldecode($name);
$email = urldecode($email);
$phonenumb = urldecode($phonenumb);
$name = trim($name);
$email = trim($email);
$phonenumb = trim($phonenumb);

if (empty($email) && empty($phonenumb)) {
    exit();
}

if(mail("anosov1818@gmail.com", "Заявка с сайта", "Имя:".$name.". E-mail: ".$email." Номер телефона: ".$phonenumb ,"From: anosov1818@gmail.com \r\r")){
    echo "Сообщение успешно отправлено";
} else {
    echo "При отправке возникли ошибки";
}
?>