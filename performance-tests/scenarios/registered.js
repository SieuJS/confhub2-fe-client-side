// performance-tests/scenarios/registered.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import exec from 'k6/execution';
import { users } from '../data/index.js';

export function registeredUserJourney(data) {
    const API_URL = data.API_URL;

    if (users.length === 0) {
        console.error("User data is empty. Skipping registered user journey.");
        return;
    }

    const userIndex = (exec.vu.idInTest - 1) % users.length;
    const user = users[userIndex];

    if (!user) {
        console.error(`VU ${exec.vu.idInTest}: Could not find a user for index ${userIndex}. Skipping iteration.`);
        return;
    }

    let token = null;

    group('Registered User Journey', () => {
        group('Login', () => {
            const payload = JSON.stringify({
                email: user.email,
                password: user.password,
                mode: 'user'
            });

            const params = { headers: { 'Content-Type': 'application/json' } };
            const res = http.post(`${API_URL}/api/v1/auth/login`, payload, params);

            // ĐIỀU CHỈNH 1: Mong đợi status 201 khi đăng nhập thành công
            const loginSuccess = check(res, { 'Login status is 201': (r) => r.status === 201 });

            // ĐIỀU CHỈNH 2: Lấy token từ key "token" ở cấp cao nhất
            if (loginSuccess && res.json('token')) {
                token = res.json('token');
            } else {
                // Log này sẽ chỉ xuất hiện nếu status không phải 201 hoặc không có token trong body
                console.error(`VU ${exec.vu.idInTest}: Login failed for user ${user.email}. Status: ${res.status}, Body: ${res.body}`);
            }
        });

        if (!token) {
            return; // Dừng kịch bản nếu không lấy được token
        }

        // Đổi tên biến cookie cho nhất quán với body response
        const authParams = { headers: { 'Authorization': `Bearer ${token}` } };
        sleep(2);

        group('Get Profile', () => {
            const res = http.get(`${API_URL}/api/v1/user/me`, authParams);
            check(res, { 'Get profile status is 200': (r) => r.status === 200 });
        });
        sleep(2);

       
        // Khối hành động Follow và Unfollow
        if (data.conferenceIds && data.conferenceIds.length > 0) {
            // ĐIỀU CHỈNH: Khai báo randomConfId ở đây để cả 2 group đều dùng được
            const randomConfId = randomItem(data.conferenceIds);

            // Hành động 1: Follow a Conference
            group('Follow a Conference', () =>  {
                const payload = JSON.stringify({ conferenceId: randomConfId });
                const followParams = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                };
                const res = http.post(`${API_URL}/api/v1/follow-conference/add`, payload, followParams);
                check(res, { 'Follow conference status is 201': (r) => r.status === 201 });
            });

            sleep(3); // Dừng một chút

            // Hành động 2: Unfollow the SAME Conference
            group('Unfollow a Conference', () => {
                // Bây giờ group này có thể "nhìn thấy" randomConfId
                const payload = JSON.stringify({ conferenceId: randomConfId });
                const unfollowParams = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                };
                // Giả sử endpoint unfollow là 'remove'
                const res = http.post(`${API_URL}/api/v1/follow-conference/remove`, payload, unfollowParams);
                check(res, { 'Unfollow conference status is 201': (r) => r.status === 201 }); // Giả sử unfollow trả về 201
            });
        }

        sleep(2);

        // Hành động cuối: Logout
        group('Logout', () => {
            const res = http.post(`${API_URL}/api/v1/auth/logout`, null, authParams);
            check(res, { 'Logout status is 201': (r) => r.status === 201 });
        });
    });
}