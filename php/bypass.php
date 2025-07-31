<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
// =============== RATE LIMITER ===============
function rate_limit($limit, $window_seconds) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $rate_limit_file = sys_get_temp_dir() . "/rate_limit_" . md5($ip) . ".json";

    $now = time();
    $data = [
        "window_start" => $now,
        "count" => 0
    ];

    if (file_exists($rate_limit_file)) {
        $raw = file_get_contents($rate_limit_file);
        $data = json_decode($raw, true);

        if ($now - $data['window_start'] > $window_seconds) {
            $data['window_start'] = $now;
            $data['count'] = 0;
        }
    }

    $data['count']++;
    file_put_contents($rate_limit_file, json_encode($data));

    if ($data['count'] > $limit) {
        http_response_code(429);
        echo json_encode([
            "limit_reached" => true,
            "message_limit" => "⏳ Rate limit exceeded. Max $limit requests per 15 minutes.",
            "retry_after" => $data['window_start'] + $window_seconds - $now
        ]);
        exit;
    }
}
rate_limit(20, 15 * 60); // <= Panggil rate limiter
// ============================================

// Set header untuk JSON response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // CORS
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Tangani hanya POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Only POST method is allowed."]);
    exit;
}

// Ambil dan decode input JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validasi input
if (!isset($input['url']) || empty($input['url'])) {
    http_response_code(400);
    echo json_encode(["error" => "No URL provided."]);
    exit;
}

$url = $input['url'];
$api_url = '';
$type = '';

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid URL format."]);
    exit;
}


// Deteksi apakah URL file (/u/) atau list (/l/)
if (preg_match('/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/', $url, $matches)) {
    $id = $matches[1];
    $type = 'file';
    $api_url = "https://pixeldrain.com/api/file/{$id}/info";
} elseif (preg_match('/pixeldrain\.com\/l\/([a-zA-Z0-9]+)/', $url, $matches)) {
    $id = $matches[1];
    $type = 'list';
    $api_url = "https://pixeldrain.com/api/list/{$id}";
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid Pixeldrain URL."]);
    exit;
}

// Fetch data dari API Pixeldrain
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 10 detik timeout
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5); // 5 detik timeout koneksi

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Error handling
if ($http_code !== 200 || !$response) {
    http_response_code(502);
    echo json_encode(["error" => "Failed to contact Pixeldrain API."]);
    exit;
}

$data = json_decode($response, true);

// Siapkan response
if ($type === 'file') {
    $result = [
        "viewerData" => [
            "type" => "file",
            "api_response" => [
                "name" => $data['name'],
                "id"   => $data['id'], // sertakan id untuk URL
                "size" => $data['size'],
                "url"  => "https://pixeldrain.com/api/file/{$id}"
            ]
        ]
    ];
} elseif ($type === 'list') {
    $files = array_map(function ($item) {
        return [
            "name" => $item['name'],
            "size" => $item['size'],
            "id"   => $item['id'], // jangan lupa sertakan id jika ingin digunakan untuk URL
        ];
    }, $data['files']);

    $result = [
        "viewerData" => [
            "type" => "list",
            "api_response" => [
                "title" => $data['title'],
                "id" => $data['id'], // sertakan id untuk URL
                "name" => $data['name'] ?? '',
                "files" => $files
            ]
        ]
    ];
}

echo json_encode($result);
