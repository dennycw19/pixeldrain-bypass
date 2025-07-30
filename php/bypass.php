<?php
// Tangani hanya request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Only POST method is allowed."]);
    exit;
}

// Ambil input JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validasi URL
if (!isset($input['url']) || empty($input['url'])) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "No URL provided."]);
    exit;
}

$url = $input['url'];

// Ekstrak ID dari URL Pixeldrain
if (preg_match('/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/', $url, $matches)) {
    $file_id = $matches[1];
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid Pixeldrain URL."]);
    exit;
}

// Ambil info file dari API Pixeldrain
$api_url = "https://pixeldrain.com/api/file/{$file_id}/info";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Jika gagal ambil data dari API
if ($http_code !== 200 || !$response) {
    http_response_code(502); // Bad Gateway
    echo json_encode(["error" => "Failed to contact Pixeldrain API."]);
    exit;
}

// Decode response JSON
$file_info = json_decode($response, true);

// Siapkan hasil bypass
$result = [
    "viewerData" => [
        "type" => "file",
        "api_response" => [
            "name" => $file_info['name'],
            "size" => $file_info['size'],
            "url"  => "https://pixeldrain.com/api/file/{$file_id}"
        ]
    ]
];

// Kirim hasil
header("Content-Type: application/json");
echo json_encode($result);
