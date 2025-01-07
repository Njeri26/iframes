

<?php
//esomakids.com backend for the postMessage and authentication(account verification)

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

class UserAuthHandler {
    private $db;
    
    public function __construct() {
        try {
            $this->db = new PDO(
                'mysql:host=localhost;dbname=checurkt_cca_user_data',
                'root',
                '',
                array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'latin1'")
            );
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            die(json_encode(['error' => 'Connection failed: ' . $e->getMessage()]));
        }
    }
    
    public function checkUser($userID) {
        try {
            // Check if user exists and is active
            $stmt = $this->db->prepare('
                SELECT 
                    i.userID,
                    i.user_names,
                    i.iframe_user_id,
                    a.active_user
                FROM user_info i
                JOIN user_auth a ON i.userID = a.userID
                WHERE i.userID = ? AND a.active_user = "YES"
            ');
            $stmt->execute([$userID]);
            $userInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userInfo) {
                return ['error' => 'User not found or inactive'];
            }
            
            // Check if user already has an iframe_user_id
            if ($userInfo['iframe_user_id']) {
                return [
                    'status' => 'existing',
                    'iframeUserId' => $userInfo['iframe_user_id'],
                    'userName' => $userInfo['user_names'],
                    'redirectUrl' => 'https://esomakids.com/user/account/?u=' . $userInfo['iframe_user_id']
                ];
            }
            
            // Generate new iframe_user_id for user
            $iframeUserId = $this->generateIframeUserId($userID);
            
            // Update user record with new iframe_user_id
            $stmt = $this->db->prepare('
                UPDATE user_info 
                SET iframe_user_id = ?
                WHERE userID = ?
            ');
            $stmt->execute([$iframeUserId, $userID]);
            
            return [
                'status' => 'new',
                'iframeUserId' => $iframeUserId,
                'userName' => $userInfo['user_names'],
                'redirectUrl' => 'https://esomakids.com/user/account/?u=' . $iframeUserId
            ];
            
        } catch(PDOException $e) {
            return ['error' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    private function generateIframeUserId($userID) {
        // Extract the numeric part from userID (e.g., "1" from "cheche-1-17032023")
        preg_match('/\-(\d+)\-/', $userID, $matches);
        $userNumber = $matches[1] ?? '1';
        
        // Generate ESK ID format
        $year = date('Y');
        $uniqueId = "ESK-{$userNumber}-{$year}";
        return base64_encode($uniqueId);
    }
}

// Handle incoming requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['hostingUserId'])) {
        $auth = new UserAuthHandler();
        $result = $auth->checkUser($data['hostingUserId']);
        echo json_encode($result);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing hostingUserId parameter']);
    }
}