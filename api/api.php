<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$db = new PDO('mysql:host=your_host;dbname=your_db_name', 'your_user_name', 'your_password');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$action = $_GET['action'] ?? '';

switch($action) {
    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($data['password'], $user['password'])) {
            unset($user['password']);
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неправильні дані для входу']);
        }
        break;

    case 'register':
        $data = json_decode(file_get_contents('php://input'), true);
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
        $stmt->execute([$data['name'], $data['email'], $hashedPassword]);
        
        echo json_encode(['success' => true, 'message' => 'Реєстрація успішна']);
        break;

    case 'createsession':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $db->prepare('INSERT INTO sessions (title, description, start_time, end_time, work_minutes, break_minutes, creator_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['start_time'],
            $data['end_time'],
            $data['work_minutes'],
            $data['break_minutes'],
            $data['creator_id']
        ]);
        
        echo json_encode(['success' => true, 'session_id' => $db->lastInsertId()]);
        break;

    case 'joinsession':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $db->prepare('INSERT INTO session_participants (session_id, user_id) VALUES (?, ?)');
        $stmt->execute([$data['session_id'], $data['user_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Ви успішно приєдналися до сесії']);
        break;

    case 'sessions':
        $stmt = $db->query('SELECT * FROM sessions ORDER BY created_at DESC');
        echo json_encode(['success' => true, 'sessions' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;

    case 'fetchSessions':
        $userId = $_GET['user_id'] ?? null;
    
        if ($userId) {
            $stmt = $db->prepare('
                SELECT s.*, 
                       (SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = s.id) AS participant_count 
                FROM sessions s 
                JOIN session_participants sp ON s.id = sp.session_id 
                WHERE sp.user_id = ? 
                ORDER BY s.created_at DESC
            ');
            $stmt->execute([$userId]);
            $joinedSessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            $stmt = $db->prepare('
                SELECT s.*, 
                       (SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = s.id) AS participant_count 
                FROM sessions s 
                WHERE id NOT IN (SELECT session_id FROM session_participants WHERE user_id = ?) 
                ORDER BY created_at DESC
            ');
            $stmt->execute([$userId]);
            $notJoinedSessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            echo json_encode(['success' => true, 'joined_sessions' => $joinedSessions, 'not_joined_sessions' => $notJoinedSessions]);
        } else {
            $stmt = $db->query('
                SELECT s.*, 
                       (SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = s.id) AS participant_count 
                FROM sessions s 
                ORDER BY created_at DESC
            ');
            echo json_encode(['success' => true, 'sessions' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
    break;

    case 'editSession':
        $data = json_decode(file_get_contents('php://input'), true);
        $sessionId = $data['session_id'] ?? null;
        $creatorId = $data['creator_id'] ?? null;

        if (!$sessionId || !$creatorId) {
            echo json_encode(['success' => false, 'message' => 'ID сесії або ID творця не вказано']);
            break;
        }

        $stmt = $db->prepare('SELECT creator_id FROM sessions WHERE id = ?');
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session || $session['creator_id'] != $creatorId) {
            echo json_encode(['success' => false, 'message' => 'Ви не маєте прав для редагування цієї сесії']);
            break;
        }

        $stmt = $db->prepare('UPDATE sessions SET title = ?, description = ?, start_time = ?, end_time = ?, work_minutes = ?, break_minutes = ? WHERE id = ?');
        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['start_time'],
            $data['end_time'],
            $data['work_minutes'],
            $data['break_minutes'],
            $sessionId
        ]);

        echo json_encode(['success' => true, 'message' => 'Сесію успішно оновлено']);
        break;

    case 'session':
        $sessionId = $_GET['id'] ?? null;
        if (!$sessionId) {
            echo json_encode(['success' => false, 'message' => 'ID сесії не вказано']);
            break;
        }

        $stmt = $db->prepare('SELECT s.*, u.name as creator_name 
                             FROM sessions s 
                             JOIN users u ON s.creator_id = u.id 
                             WHERE s.id = ?');
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($session) {
            $stmt = $db->prepare('SELECT u.id, u.name 
                                 FROM session_participants sp 
                                 JOIN users u ON sp.user_id = u.id 
                                 WHERE sp.session_id = ?');
            $stmt->execute([$sessionId]);
            $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $session['participants'] = $participants;
            echo json_encode(['success' => true, 'session' => $session]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Сесію не знайдено']);
        }
        break;

    case 'profile':
        $userId = $_GET['id'] ?? null;
        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'ID користувача не вказано']);
            break;
        }

        $stmt = $db->prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $stmt = $db->prepare('SELECT COUNT(*) as created_sessions FROM sessions WHERE creator_id = ?');
            $stmt->execute([$userId]);
            $createdSessions = $stmt->fetch(PDO::FETCH_ASSOC)['created_sessions'];

            $stmt = $db->prepare('SELECT COUNT(*) as joined_sessions FROM session_participants WHERE user_id = ?');
            $stmt->execute([$userId]);
            $joinedSessions = $stmt->fetch(PDO::FETCH_ASSOC)['joined_sessions'];

            $stmt = $db->prepare('SELECT * FROM sessions WHERE creator_id = ? ORDER BY created_at DESC');
            $stmt->execute([$userId]);
            $createdSessionsList = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $db->prepare('SELECT s.* 
                                 FROM sessions s 
                                 JOIN session_participants sp ON s.id = sp.session_id 
                                 WHERE sp.user_id = ? 
                                 ORDER BY sp.joined_at DESC');
            $stmt->execute([$userId]);
            $joinedSessionsList = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $profile = [
                'user' => $user,
                'stats' => [
                    'created_sessions' => $createdSessions,
                    'joined_sessions' => $joinedSessions
                ],
                'created_sessions_list' => $createdSessionsList,
                'joined_sessions_list' => $joinedSessionsList
            ];

            echo json_encode(['success' => true, 'profile' => $profile]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Користувача не знайдено']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Невідома дія']);
        break;
} 