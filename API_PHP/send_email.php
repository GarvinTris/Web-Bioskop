<?php
// send_email.php - Kirim email MFA menggunakan PHPMailer

// Load autoload (pilih salah satu)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} else {
    require_once __DIR__ . '/PHPMailer/src/Exception.php';
    require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
    require_once __DIR__ . '/PHPMailer/src/SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendMfaEmail($to, $name, $code) {
    $mail = new PHPMailer(true);
    
    try {
        // Konfigurasi SMTP (Ganti dengan data Anda)
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';        // SMTP server
        $mail->SMTPAuth   = true;
        $mail->Username   = 'garvintriskie15@gmail.com';  // GANTI INI
        $mail->Password   = 'lgkw gqzt pavu hdvd';     // GANTI INI (App Password)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // Pengirim dan penerima
        $mail->setFrom('noreply@bioskop.com', 'Bioskop System');
        $mail->addAddress($to, $name);
        
        // Konten email
        $mail->isHTML(true);
        $mail->Subject = 'Kode Verifikasi MFA - Login Admin Bioskop';
        $mail->Body    = "Halo $name,\n\nKode verifikasi MFA Anda: $code\n\nKode ini berlaku 5 menit.\n\nJangan bagikan kode ini kepada siapapun.\n\n- Sistem Bioskop";
        $mail->AltBody = "Halo $name,\n\nKode verifikasi MFA Anda: $code\n\nKode ini berlaku 5 menit.\n\nJangan bagikan kode ini kepada siapapun.\n\n- Sistem Bioskop";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("Email failed: {$mail->ErrorInfo}");
        return false;
    }
}
?>