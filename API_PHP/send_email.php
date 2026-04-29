<?php
// send_email.php - Kirim email MFA menggunakan PHPMailer

// Load autoload (pilih salah satu)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} elseif (file_exists(__DIR__ . '/PHPMailer/src/PHPMailer.php')) {
    require_once __DIR__ . '/PHPMailer/src/Exception.php';
    require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
    require_once __DIR__ . '/PHPMailer/src/SMTP.php';
} else {
    // Fallback jika PHPMailer tidak ada
    error_log("PHPMailer not found, using mail() fallback");
    function sendMfaEmail($to, $name, $code) {
        $subject = "Kode Verifikasi MFA - Login Admin Bioskop";
        $message = "Halo $name,\n\nKode verifikasi MFA Anda: $code\n\nKode ini berlaku 5 menit.\n\nJangan bagikan kode ini kepada siapapun.\n\n- Sistem Bioskop";
        $headers = "From: noreply@bioskop.com\r\n";
        return mail($to, $subject, $message, $headers);
    }
    return;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendMfaEmail($to, $name, $code) {
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'garvintriskie15@gmail.com';
        $mail->Password   = 'lgkwgqztpavuhdvd'; // Tanpa spasi
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        $mail->setFrom('garvintriskie15@gmail.com', 'Bioskop System'); // Email sama
        $mail->addAddress($to, $name);
        
        $mail->isHTML(true);
        $mail->Subject = 'Kode Verifikasi MFA - Login Admin Bioskop';
        $mail->Body    = "<h2>Kode Verifikasi MFA</h2>
                         <p>Halo <strong>$name</strong>,</p>
                         <p>Kode verifikasi MFA Anda: <strong style='font-size:24px'>$code</strong></p>
                         <p>Kode ini berlaku <strong>5 menit</strong>.</p>
                         <p>Jangan bagikan kode ini kepada siapapun.</p>
                         <hr><p>- Sistem Bioskop</p>";
        $mail->AltBody = "Halo $name,\n\nKode verifikasi MFA Anda: $code\n\nKode ini berlaku 5 menit.\n\nJangan bagikan kode ini kepada siapapun.\n\n- Sistem Bioskop";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("Email failed: " . $mail->ErrorInfo);
        return false;
    }
}
?>