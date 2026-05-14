import { Client } from 'ssh2';

const connections = {}; // 활성 SSH 연결을 저장하는 캐시

/**
 * SSH 연결을 가져오거나 새로 생성하여 반환합니다.
 * @param {object} connInfo - 연결 정보 (host, port, username, password)
 * @returns {Promise<Client>} SSH 클라이언트 인스턴스
 */
export function getSshConnection({ host, port = 22, username, password }) {
    const connKey = `${username}@${host}:${port}`;
    if (connections[connKey]) {
        return Promise.resolve(connections[connKey]);
    }

    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            connections[connKey] = conn;
            resolve(conn);
        }).on('error', (err) => {
            reject(err);
        }).on('close', () => {
            delete connections[connKey];
        }).connect({
            host,
            port,
            username,
            password,
            readyTimeout: 20000,
        });
    });
}

/**
 * SSH 연결을 통해 명령어를 실행하고 결과를 반환합니다.
 * @param {Client} sshConn - SSH 클라이언트 인스턴스
 * @param {string} command - 실행할 명령어
 * @returns {Promise<{output: string, code: number, signal: any}>} 명령어 실행 결과
 */
export function executeSshCommand(sshConn, command) {
    return new Promise((resolve, reject) => {
        sshConn.exec(command, (err, stream) => {
            if (err) return reject(err);

            let output = '';
            stream.on('close', (code, signal) => {
                resolve({ output, code, signal });
            }).on('data', (data) => {
                output += data.toString();
            }).stderr.on('data', (data) => {
                output += data.toString();
            });
        });
    });
}

/**
 * 활성 SSH 연결을 종료합니다.
 */
export function disconnectSsh({ host, port = 22, username }) {
    const connKey = `${username}@${host}:${port}`;
    const existingConn = connections[connKey];

    if (existingConn) {
        existingConn.end();
        return true;
    }
    return false;
}
