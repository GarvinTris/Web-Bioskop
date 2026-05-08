<?php
// contact_us.php - Dengan tema MERAH (bioskop)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Method tidak diizinkan"]);
    exit;
}

// ============ AMBIL DATA ============
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

// ============ VALIDASI ============
$errors = [];
if (empty($name)) $errors[] = "Nama harus diisi";
if (empty($email)) $errors[] = "Email harus diisi";
if (empty($subject)) $errors[] = "Subjek harus diisi";
if (empty($message)) $errors[] = "Pesan harus diisi";

if (!empty($errors)) {
    echo json_encode(["success" => false, "error" => implode(", ", $errors)]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "error" => "Format email tidak valid"]);
    exit;
}

// ============ CEK PHPMailer ============
$phpmailer_found = false;

$possible_paths = [
    __DIR__ . '/PHPMailer/src/Exception.php',
    __DIR__ . '/PHPMailer/Exception.php',
    __DIR__ . '/vendor/autoload.php',
    __DIR__ . '/../vendor/autoload.php'
];

foreach ($possible_paths as $path) {
    if (file_exists($path)) {
        if (strpos($path, 'autoload.php') !== false) {
            require_once $path;
            $phpmailer_found = true;
            break;
        } elseif (strpos($path, 'Exception.php') !== false) {
            require_once $path;
            require_once dirname($path) . '/PHPMailer.php';
            require_once dirname($path) . '/SMTP.php';
            $phpmailer_found = true;
            break;
        }
    }
}

// Jika PHPMailer tidak ditemukan, gunakan mail() biasa
if (!$phpmailer_found) {
    $to = "garvintriskie15@gmail.com";
    $email_subject = "[CONTACT US] $subject";
    $email_body = "Pesan baru dari Contact Us\n\n";
    $email_body .= "Nama: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Subjek: $subject\n\n";
    $email_body .= "Pesan:\n$message\n";
    
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    
    $sent = @mail($to, $email_subject, $email_body, $headers);
    
    $user_body = "Halo $name,\n\nTerima kasih telah menghubungi Cinema XXI.\n\nKami akan merespon dalam 1x24 jam.\n\nSalam hangat,\nTim Cinema XXI";
    @mail($email, "Terima kasih telah menghubungi Cinema XXI", $user_body, "From: noreply@cinema-xxi.com\r\n");
    
    echo json_encode(["success" => $sent, "message" => $sent ? "Pesan berhasil dikirim!" : "Gagal mengirim email"]);
    exit;
}

// ============ JIKA PHPMailer ADA, GUNAKAN ============
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendEmail($to, $subject, $body, $altBody = '', $replyTo = null, $replyToName = null) {
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'garvintriskie15@gmail.com';
        $mail->Password   = 'lgkwgqztpavuhdvd';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        $mail->SMTPDebug  = 0;
        
        $mail->setFrom('garvintriskie15@gmail.com', 'Cinema XXI');
        $mail->addAddress($to);
        
        if ($replyTo) {
            $mail->addReplyTo($replyTo, $replyToName);
        }
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = $altBody ?: strip_tags($body);
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("Email failed: " . $mail->ErrorInfo);
        return false;
    }
}

// ============ EMAIL KE ADMIN (TEMA MERAH) ============
$admin_body = "
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #8B0000, #DC143C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h2 { margin: 0; font-size: 24px; }
    .content { background: #fff; padding: 20px; }
    .info-box { background: #fef2f2; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #DC143C; }
    .info-box p { margin: 5px 0; }
    .message-box { background: #fff5f5; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #DC143C; }
    .message-box p { margin: 5px 0; line-height: 1.6; }
    .label { font-weight: bold; color: #8B0000; }
    .footer { background: #1a1a2e; color: #888; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
    hr { border: none; height: 2px; background: linear-gradient(90deg, #DC143C, #ff4d4d, #DC143C); margin: 20px 0; }
</style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>🎬 Filmout</h2>
            <p style='margin: 5px 0 0; opacity: 0.9;'>Pesan Baru dari Contact Us</p>
        </div>
        <div class='content'>
            <div class='info-box'>
                <p><span class='label'>👤 Nama:</span> " . htmlspecialchars($name) . "</p>
                <p><span class='label'>📧 Email:</span> " . htmlspecialchars($email) . "</p>
                <p><span class='label'>📅 Tanggal:</span> " . date('d-m-Y H:i:s') . "</p>
            </div>
            
            <div class='info-box'>
                <p><span class='label'>📌 Subjek:</span> " . htmlspecialchars($subject) . "</p>
            </div>
            
            <div class='message-box'>
                <p><span class='label'>💬 Pesan:</span></p>
                <p>" . nl2br(htmlspecialchars($message)) . "</p>
            </div>
            
            <hr>
            <p style='font-size: 12px; color: #666; text-align: center;'>Email ini dikirim otomatis dari sistem Cinema XXI<br>Balas email ini untuk membalas pesan dari " . htmlspecialchars($name) . "</p>
        </div>
        <div class='footer'>
            <p>© " . date('Y') . " Cinema XXI. All rights reserved.</p>
            <p>Jl. Sudirman No. 123, Jakarta Selatan, Indonesia</p>
        </div>
    </div>
</body>
</html>
";

$admin_alt = "Pesan baru dari Contact Us\n\n";
$admin_alt .= "Nama: $name\n";
$admin_alt .= "Email: $email\n";
$admin_alt .= "Subjek: $subject\n\n";
$admin_alt .= "Pesan:\n$message\n";

// ============ EMAIL KONFIRMASI KE PENGIRIM (TEMA MERAH) ============
$user_body = "
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #8B0000, #DC143C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h2 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.9; }
    .content { background: #fff; padding: 20px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .message-preview { background: #fff5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #DC143C; }
    .message-preview p { margin: 5px 0; line-height: 1.6; }
    .btn { display: inline-block; background: linear-gradient(135deg, #DC143C, #8B0000); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; }
    .footer { background: #1a1a2e; color: #888; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
    hr { border: none; height: 2px; background: linear-gradient(90deg, #DC143C, #ff4d4d, #DC143C); margin: 20px 0; }
    .contact-info { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 13px; color: #555; }
</style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>🎬 Cinema XXI</h2>
            <p>Terima kasih telah menghubungi kami</p>
        </div>
        <div class='content'>
            <div class='greeting'>
                <strong>Halo " . htmlspecialchars($name) . ",</strong>
            </div>
            
            <p>Kami telah menerima pesan Anda dan akan merespon dalam waktu <strong>1x24 jam</strong>.</p>
            
            <div class='message-preview'>
                <p><strong>📌 Subjek:</strong> " . htmlspecialchars($subject) . "</p>
                <p><strong>💬 Pesan Anda:</strong></p>
                <p>" . nl2br(htmlspecialchars($message)) . "</p>
            </div>
            
            <p>Atau Anda dapat menghubungi kami langsung di:</p>
            <div style='background: #fef2f2; padding: 12px; border-radius: 8px; margin: 10px 0;'>
                <p style='margin: 3px 0;'>📞 Telepon: +62 812-3456-7890</p>
                <p style='margin: 3px 0;'>📧 Email: info@cinema-xxi.com</p>
            </div>
            
            <hr>
            
            <p style='text-align: center;'>Salam hangat,<br>
            <strong style='color: #DC143C;'>Tim Cinema XXI</strong></p>
        </div>
        <div class='footer'>
            <p>© " . date('Y') . " Cinema XXI. All rights reserved.</p>
            <p>Jl. Sudirman No. 123, Jakarta Selatan, Indonesia</p>
        </div>
    </div>
</body>
</html>
";

$user_alt = "Terima kasih $name,\n\n";
$user_alt .= "Kami telah menerima pesan Anda dan akan merespon dalam waktu 1x24 jam.\n\n";
$user_alt .= "Subjek: $subject\n\n";
$user_alt .= "Pesan Anda:\n$message\n\n";
$user_alt .= "Atau hubungi kami:\n";
$user_alt .= "Telepon: +62 812-3456-7890\n";
$user_alt .= "Email: info@cinema-xxi.com\n\n";
$user_alt .= "Salam hangat,\nTim Cinema XXI";

// ============ KIRIM EMAIL ============
$admin_sent = sendEmail("garvintriskie15@gmail.com", "[CONTACT US] $subject", $admin_body, $admin_alt, $email, $name);
$user_sent = sendEmail($email, "Terima kasih telah menghubungi Cinema XXI", $user_body, $user_alt);

if ($admin_sent && $user_sent) {
    echo json_encode(["success" => true, "message" => "Pesan berhasil dikirim! Kami akan merespon segera."]);
} elseif ($admin_sent) {
    echo json_encode(["success" => true, "message" => "Pesan terkirim, namun email konfirmasi gagal dikirim."]);
} else {
    echo json_encode(["success" => false, "error" => "Gagal mengirim email. Silakan coba lagi."]);
}
?>