<?php
/**
 * お問い合わせフォームの送信処理
 * Xserver などの PHP が動くサーバーで動作します（GitHub Pages では動きません）
 *
 * 公開前に下の2つを設定してください:
 *   TO_ADDRESS   … お問い合わせを受け取るアドレス
 *   FROM_ADDRESS … 送信元。迷惑メール判定を避けるため「このサイトのドメインのアドレス」にする
 *                  （例: info@michi-kaitai.jp。Xserver のメール設定で作成）
 */
const TO_ADDRESS   = 't.y.takayama@outlook.jp';
const FROM_ADDRESS = 'no-reply@example.com';
const SITE_NAME    = '株式会社MICHI';

header('Content-Type: application/json; charset=UTF-8');

function respond(bool $ok, string $message = '', int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method Not Allowed', 405);
}

// スパム対策（人間には見えない欄に入力があれば、送ったふりをして終了）
if (!empty($_POST['website'])) {
    respond(true);
}

function field(string $key, int $max = 200): string {
    $v = trim((string)($_POST[$key] ?? ''));
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    return mb_substr($v, 0, $max);
}
function oneLine(string $v): string {
    return str_replace(["\n", "\r"], ' ', $v);
}

$name    = oneLine(field('name', 100));
$tel     = oneLine(field('tel', 30));
$email   = oneLine(field('email', 200));
$type    = oneLine(field('type', 50));
$address = oneLine(field('address', 200));
$message = field('message', 5000);

if ($name === '' || $tel === '' || $message === '') {
    respond(false, '必須項目が入力されていません。', 422);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $email = '';
}

date_default_timezone_set('Asia/Tokyo');
mb_language('Japanese');
mb_internal_encoding('UTF-8');

$subject = '【' . SITE_NAME . "】ホームページからお問い合わせ（{$name} 様）";
$sentAt  = date('Y-m-d H:i');
$body = <<<TXT
ホームページのお問い合わせフォームから送信がありました。

■お名前　　　：{$name}
■電話番号　　：{$tel}
■メール　　　：{$email}
■ご相談の種類：{$type}
■物件の所在地：{$address}

■ご相談内容
{$message}

――――――――――――
送信日時：{$sentAt}
TXT;

$headers = 'From: ' . mb_encode_mimeheader(SITE_NAME . ' ホームページ') . ' <' . FROM_ADDRESS . '>';
if ($email !== '') {
    $headers .= "\r\nReply-To: {$email}";
}

if (!mb_send_mail(TO_ADDRESS, $subject, $body, $headers, '-f' . FROM_ADDRESS)) {
    respond(false, '送信に失敗しました。', 500);
}

// 自動返信（メールアドレスが入力されたときだけ）
if ($email !== '') {
    $replyBody = <<<TXT
{$name} 様

このたびは株式会社MICHIへお問い合わせいただき、誠にありがとうございます。
以下の内容で受け付けました。内容を確認のうえ、担当者よりご連絡いたします。

■ご相談の種類：{$type}
■物件の所在地：{$address}
■ご相談内容
{$message}

――――――――――――
株式会社MICHI
〒544-0001 大阪府大阪市生野区新今里5-8-6
TEL 06-6736-5522
TXT;
    $replyHeaders = 'From: ' . mb_encode_mimeheader(SITE_NAME) . ' <' . FROM_ADDRESS . '>';
    mb_send_mail($email, '【' . SITE_NAME . '】お問い合わせありがとうございます', $replyBody, $replyHeaders, '-f' . FROM_ADDRESS);
}

respond(true);
